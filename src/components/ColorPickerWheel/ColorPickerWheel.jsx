import React from 'react'
import ReactDOM from 'react-dom'
// import pureRender from 'pure-render-decorator'
import { hslToRgb, hsvToRgb, rgbToHsv } from '../../common/colorConvert'
import { inject, observer } from "mobx-react";
import throttle from '../../common/throttle'
const PI = Math.PI
const PI2 = PI * 2
const sqrt3 = Math.sqrt(3)

function rad2h(rad) {
  let rad2 = rad - (PI2 / 12 * 7);
  if (rad2 < 0) {
    rad2 = rad2 + PI2;
  }
  return rad2 / PI2;
}
function h2rad(h) {
  let rad = h * PI2 + (PI2 / 12 * 7);
  if (rad > PI2) {
    rad -= PI2;
  }
  return rad;
}
function rad2rgb(rad) {
  let h = rad2h(rad)
  return hslToRgb(h, 1.0, 0.5);
}


@inject('configStore')
@observer
class ColorPickerWheel extends React.Component {

  static defaultProps = {
    radius: 134,
    width: 32,
    r: 255,
    g: 0,
    b: 0,
  }

  constructor(props) {
    super(props)
    let { h, s, v } = props;
    this.state = {
      h, s, v
    }
  }

  componentDidMount() {
    this.renderRange()
    this.renderTri()
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.focus) {
      let { h, s, v } = nextProps;
      this.setState({
        h, s, v
      })
    }
  }
  componentDidUpdate(prevProps, prevState) {
    var { radius, width } = this.props

    if (prevProps.radius !== radius || prevProps.width !== width) {

      this.renderRange()
    }

    this.renderTri()

    const hsvChanged = (a, b) => {
      return a.h !== b.h || a.s !== b.s || a.v !== b.v
    }

    if (
      hsvChanged(this.state, prevState) &&
      hsvChanged(this.state, this.props) &&
      this.props.onChange
    ) {
      let { h, s, v } = this.state;
      this.props.onChange({
        h, s, v
      }, true)
    }
  }

  renderRange() {
    var canvas = ReactDOM.findDOMNode(this.refs.range),
      ctx = canvas.getContext('2d'),
      r0 = this.props.radius - this.props.width,
      r1 = this.props.radius,
      step = PI2 / (2 * r1 * PI)

    canvas.width = r1 * 2
    canvas.height = r1 * 2

    ctx.translate(r1, r1)
    ctx.lineWidth = 2
    for (let rad = 0; rad < PI2; rad += step) {
      let { r, g, b } = rad2rgb(rad);
      const color = 'rgb(' + r + ',' + g + ',' + b + ')'

      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.moveTo(Math.cos(rad) * r0, Math.sin(rad) * r0)
      ctx.lineTo(Math.cos(rad) * r1, Math.sin(rad) * r1)
      ctx.stroke()
    }
    ctx.beginPath();
    ctx.arc(0, 0, r0, 0, PI2);
    ctx.fillStyle = 'rgb(50,50,50)';
    ctx.fill();
  }

  renderTri() {
    const canvas = ReactDOM.findDOMNode(this.refs.tri)
    const ctx = canvas.getContext('2d')
    const { radius, width } = this.props
    const innerRadius = radius - width
    const a = {
      x: Math.cos(-PI2 / 3) * innerRadius,
      y: Math.sin(-PI2 / 3) * innerRadius
    }
    const b = {
      x: Math.cos(0) * innerRadius,
      y: Math.sin(0) * innerRadius
    }
    const c = {
      x: Math.cos(PI2 / 3) * innerRadius,
      y: Math.sin(PI2 / 3) * innerRadius
    }
    const triangleHeight = c.y - a.y
    const triangleWidth = b.x - a.x

    canvas.width = radius * 2
    canvas.height = radius * 2
    ctx.translate(radius + a.x, radius + a.y)
    let h = this.state.h;
    for (let i = 0; i < triangleWidth; i += 1) {
      const pos = i / triangleWidth
      const alpha = 1 - pos
      const gap = (triangleHeight * pos) / 2
      const grd = ctx.createLinearGradient(0, gap, 0, triangleHeight - gap)
      let start = hsvToRgb(h, pos, 1);
      let end = hsvToRgb(h, 1, pos);

      grd.addColorStop(0, `rgb(${start.r},${start.g},${start.b})`)
      grd.addColorStop(1, `rgb(${end.r},${end.g},${end.b})`)

      ctx.beginPath()
      ctx.moveTo(i, gap)
      ctx.lineTo(i, triangleHeight - gap)
      ctx.strokeStyle = grd
      ctx.stroke()
      ctx.closePath()
    }
  }

  // 渲染小圆圈
  renderControlls() {
    const { radius, width, configStore } = this.props
    const { h, s, v } = this.state
    const innerRadius = radius - width
    const smallAltitude = Math.sin(PI / 6) * innerRadius
    // 计算三角形里的小圆圈位置
    let x = 1.5 * v - 1;
    let y = (s - 0.5) * sqrt3 * v;
    let dist = Math.sqrt(x * x + y * y) * innerRadius;
    let triRad = Math.atan2(y, x) - PI2 / 6;
    triRad -= configStore.scrollTriangle / 180 * PI;
    let flipFactor = configStore.swapTriangle ? -1 : 1;
    x = radius + dist * Math.cos(triRad);
    y = radius + flipFactor * dist * Math.sin(triRad);

    // 计算圆环上的小圆圈
    flipFactor = configStore.swapWheel ? -1 : 1;
    let rad = h2rad(h);
    rad -= configStore.scrollWheel / 180 * PI;
    let x2 = radius + flipFactor * Math.cos(rad) * (innerRadius + radius) / 2
    let y2 = radius + Math.sin(rad) * (innerRadius + radius) / 2
    return <svg style={{
      position: 'absolute',
      left: 0,
      overflow: 'visible',
      pointerEvents: 'none',
      width: '100%',
      height: '100%'
    }}>
      <circle
        r={width / 5}
        cx={x}
        cy={y}
        fill='none'
        stroke='#fff'
        strokeWidth={1} />
      <circle
        r={width / 5 + 1}
        cx={x}
        cy={y}
        fill='none'
        stroke='#000'
        strokeWidth={1} />
      <circle
        r={width / 3}
        cx={x2}
        cy={y2}
        fill='none'
        stroke='#fff'
        strokeWidth={1} />
      <circle
        r={width / 3 + 1}
        cx={x2}
        cy={y2}
        fill='none'
        stroke='#000'
        strokeWidth={1} />
    </svg>
  }

  renderTriangle() {
    const { radius, configStore } = this.props
    const { h } = this.state
    const rotate = 0;

    return <div style={{
      position: 'absolute',
      width: radius * 2,
      height: radius * 2,
      left: 0,
      top: 0,
      transform: `scaleY(${configStore.swapTriangle ? -1 : 1}) rotate(-${configStore.scrollTriangle}deg)`
    }}>
      <canvas ref='tri' style={{ position: 'absolute', left: 0 }} />
    </div>
  }

  /**
   * 拖拽事件相关
   */
  // 更新H
  setHue = (e) => {
    let { clientX, clientY } = e
    let { centerX, centerY } = this.state;
    let x = clientX - centerX
    let y = clientY - centerY
    let rad = Math.atan2(y, x)
    let {configStore} = this.props;
    if (configStore.swapWheel) {
      rad = PI2 - rad + PI;
    }
    rad += configStore.scrollWheel / 180 * PI;
    rad = rad < 0 ? PI2 + rad : rad
    const h = rad2h(rad)
    // debugger;
    this.setState({ h })
  }
  // 更新SV
  setSaturationValue = (e) => {
    let { clientX, clientY } = e
    let { centerX, centerY } = this.state;
    let { props } = this
    const { h } = this.state
    let x = clientX - centerX
    let y = clientY - centerY
    const dist = Math.sqrt(x * x + y * y)
    // const baseRad = h2rad(h)
    const baseRad = -PI2 / 6;
    const mouseRad = Math.atan2(y, x)
    let diffRad = mouseRad - baseRad
    let {configStore} = this.props;
    if (configStore.swapTriangle) {
      diffRad = PI2 - diffRad + PI / 3 * 2;
    }
    diffRad += configStore.scrollTriangle / 180 * PI;
    x = dist * Math.cos(diffRad)
    y = dist * Math.sin(diffRad)
    const innerRadius = props.radius - props.width
    x /= innerRadius;
    y /= innerRadius;

    let v = (x + 1) / 1.5;
    v = Math.max(0, Math.min(1, v));
    let s = y / v / sqrt3 + 0.5;
    s = Math.max(0, Math.min(1, s));

    this.setState({
      v: v,
      s: s
    })
  }
  onMove = (e) => {
    var { edit } = this.state
    if (edit === 'h') {
      this.setHue(e)
    }
    else {
      this.setSaturationValue(e)
    }
  }
  onUp = () => {
    window.removeEventListener('mousemove', this.onMove)
    window.removeEventListener('mouseup', this.onUp)
    window.removeEventListener('mouseleave', this.onUp)
    this.setState({
      focus: false
    })
    let { h, s, v } = this.state;
    this.props.onChange({ h, s, v }, true);
  }
  handleMouseDown = (e) => {
    const { radius, width } = this.props
    let { clientX, clientY } = e
    const sourceClientOffset = e.target.getBoundingClientRect();
    const left = sourceClientOffset.left
    const top = sourceClientOffset.top
    const centerX = left + radius
    const centerY = top + radius
    const x = clientX - centerX
    const y = clientY - centerY
    const distanceFromCenter = Math.sqrt(x ** 2 + y ** 2)
    // debugger;
    let edit
    if (distanceFromCenter < radius) {
      edit = distanceFromCenter > radius - width ? 'h' : 'sv'
    }

    if (!edit) {
      //bail dragging
      return false
    }
    window.addEventListener('mousemove', this.onMove)
    window.addEventListener('mouseup', this.onUp)
    window.addEventListener('mouseleave', this.onUp)
    this.setState({ focus: true, edit, centerX, centerY }, () => {
      if (edit === 'h') {
        this.setHue({ clientX, clientY })
      }
      else {
        this.setSaturationValue({ clientX, clientY })
      }
    })
  }
  render() {
    const { style, configStore } = this.props
    return <div
      className="color-wheel"
      style={{ position: 'relative', ...style }}
      onMouseDown={this.handleMouseDown}
    >
      <canvas
        ref='range'
        style={{
          transform: `scaleX(${configStore.swapWheel ? -1 : 1}) rotate(-${configStore.scrollWheel}deg)`
        }} />
      {this.renderTriangle()}
      {this.renderControlls()}
    </div>
  }
}
export default ColorPickerWheel;