import React from 'react'
import ReactDOM from 'react-dom'
// import pureRender from 'pure-render-decorator'
import Dragger from '../../common/Dragger'
import { hslToRgb, hsvToRgb, rgbToHsv } from '../../common/colorConvert'
import throttle from '../../common/throttle'
const PI = Math.PI
const PI2 = PI * 2
const sqrt3 = Math.sqrt(3)
let moveTs = 0;
let upTs = 0;
function setHue(monitor, component) {
    let { x, y } = monitor.getClientOffset()
    const { centerX, centerY } = monitor.getData()
    x -= centerX
    y -= centerY
    let rad = Math.atan2(y, x)
    rad = rad < 0 ? PI2 + rad : rad
    const h = rad2h(rad)
    component.setState({ h })
}

function setSaturationValue(props, monitor, component) {
    let { x, y } = monitor.getClientOffset()
    const { h } = component.state
    const { centerX, centerY } = monitor.getData()
    x -= centerX
    y -= centerY
    const dist = Math.sqrt(x * x + y * y)
    // const baseRad = h2rad(h)
    const baseRad = -PI2 / 6;
    const mouseRad = Math.atan2(y, x)
    const diffRad = mouseRad - baseRad//radDiff(baseRad, mouseRad)
    x = dist * Math.cos(diffRad)
    y = dist * Math.sin(diffRad)
    const innerRadius = props.radius - props.width
    x /= innerRadius;
    y /= innerRadius;

    let v = (x + 1) / 1.5;
    v = Math.max(0, Math.min(1, v));
    let s = y / v / sqrt3 + 0.5;
    s = Math.max(0, Math.min(1, s));

    component.setState({
        v: v,
        s: s
    })
}
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
let onDragHandler = throttle((props, monitor, component) => {
    var { edit } = monitor.getData()

    if (edit === 'h') {
        setHue(monitor, component)
    }
    else {
        setSaturationValue(props, monitor, component)
    }
}, 30)
const customDragOptions = {
    onDown(props, monitor, component) {
        const { radius, width } = props
        const clientOffset = monitor.getClientOffset()
        const sourceClientOffset = monitor.getSourceClientOffset()
        const left = clientOffset.x - sourceClientOffset.x
        const top = clientOffset.y - sourceClientOffset.y
        const centerX = left + radius
        const centerY = top + radius
        const x = clientOffset.x - centerX
        const y = clientOffset.y - centerY
        const distanceFromCenter = Math.sqrt(x ** 2 + y ** 2)
        let edit

        if (distanceFromCenter < radius) {
            edit = distanceFromCenter > radius - width ? 'h' : 'sv'
        }

        if (!edit) {
            //bail dragging
            return false
        }

        component.setState({ focus: true })

        monitor.setData({
            edit,
            centerX,
            centerY
        })

        if (edit === 'h') {
            setHue(monitor, component)
        }
        else {
            setSaturationValue(props, monitor, component)
        }
    },
    onDrag: (props, monitor, component) => {
        onDragHandler(props, monitor, component)
    },

    onUp(props, monitor, component) {
        component.setState({
            focus: false
        })
        let { h, s, v } = component.state;
        props.onChange({ h, s, v },true);
    }
}

@Dragger(customDragOptions)
// @pureRender
export default class ColorPickerWheel extends React.Component {
    // static propTypes = {
    //   radius: PropTypes.number,
    //   width: PropTypes.number,
    //   h: PropTypes.number,
    //   s: PropTypes.number,
    //   l: PropTypes.number,
    //   onChange: PropTypes.func,
    // }

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
            },true)
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
            let start = hsvToRgb(h,pos,1);
            let end = hsvToRgb(h,1,pos);

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

    renderControlls() {
        const { radius, width } = this.props
        const { h, s, v } = this.state
        const rad = h2rad(h);
        const innerRadius = radius - width
        const smallAltitude = Math.sin(PI / 6) * innerRadius
        let x = 1.5 * v - 1;
        let y = (s - 0.5) * sqrt3 * v;
        let dist = Math.sqrt(x * x + y * y) * innerRadius;
        let triRad = Math.atan2(y, x) - PI2 / 6;
        x = radius + dist * Math.cos(triRad);
        y = radius + dist * Math.sin(triRad);

        const edge = Math.sqrt(innerRadius ** 2 - smallAltitude ** 2) * 2
        const altitude = innerRadius + smallAltitude
        let cx = (altitude * s) - smallAltitude
        let cy = edge * (s - 1) * (-v + 0.5)
        const cRad = Math.atan2(cy, cx)
        const cDist = Math.sqrt(cx ** 2 + cy ** 2)
        cx = radius + Math.cos(cRad) * cDist
        cy = radius - Math.sin(cRad) * cDist

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
                cx={radius + Math.cos(rad) * (innerRadius + radius) / 2}
                cy={radius + Math.sin(rad) * (innerRadius + radius) / 2}
                fill='none'
                stroke='#fff'
                strokeWidth={1} />
            <circle
                r={width / 3 + 1}
                cx={radius + Math.cos(rad) * (innerRadius + radius) / 2}
                cy={radius + Math.sin(rad) * (innerRadius + radius) / 2}
                fill='none'
                stroke='#000'
                strokeWidth={1} />
        </svg>
    }

    renderTriangle() {
        const { radius } = this.props
        const { h } = this.state
        const rotate = 0;

        return <div style={{
            position: 'absolute',
            width: radius * 2,
            height: radius * 2,
            left: 0,
            top: 0,
            transform: rotate
        }}>
            <canvas ref='tri' style={{ position: 'absolute', left: 0 }} />
        </div>
    }

    render() {
        const { draggerRef, style } = this.props

        return <div className="color-wheel" ref={draggerRef} style={{ position: 'relative', ...style }}>
            <canvas ref='range' />
            {this.renderTriangle()}
            {this.renderControlls()}
        </div>
    }
}
