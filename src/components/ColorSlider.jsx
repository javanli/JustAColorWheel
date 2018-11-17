import React, { Component, PureComponent } from 'react'
import reactCSS from 'reactcss'

class ColorSlider extends (PureComponent || Component) {
  static defaultProps = {
    startColor: 'rgba(255,0,0,0)',
    endColor: 'rgba(255,0,0,1)',
    position: 0,
    onChange: () => { }
  }
  constructor(props) {
    super(props)
    this.state = {
      sliderPosition: props.position,
      focus: false
    }
  }
  componentWillReceiveProps(nextProps) {
    if (!this.state.focus) {
      let { position } = nextProps;
      this.setState({
        sliderPosition: position
      })
    }
  }
  componentWillUnmount() {
    this.unbindEventListeners()
  }

  handleChange = (e, skip) => {
    // debugger;
    const containerWidth = this.container.clientWidth
    const containerHeight = this.container.clientHeight
    const x = typeof e.pageX === 'number' ? e.pageX : e.touches[0].pageX
    const y = typeof e.pageY === 'number' ? e.pageY : e.touches[0].pageY
    const left = x - (this.container.getBoundingClientRect().left + window.pageXOffset)
    const top = y - (this.container.getBoundingClientRect().top + window.pageYOffset)
    let sliderPosition = 0;
    if (left < 0) {
      sliderPosition = 0
    } else if (left > containerWidth) {
      sliderPosition = 1
    } else {
      sliderPosition = Math.round((left * 100) / containerWidth) / 100
    }
    this.setState({
      sliderPosition
    })
    this.props.onChange(sliderPosition,false);
  }

  handleMouseDown = (e) => {
    this.handleChange(e, true)
    window.addEventListener('mousemove', this.handleChange)
    window.addEventListener('mouseup', this.handleMouseUp)
    this.setState({
      focus:true
    })
  }

  handleMouseUp = () => {
    this.unbindEventListeners()
    this.setState({
      focus:false
    })
    this.props.onChange(this.state.sliderPosition,true);
  }

  unbindEventListeners = () => {
    window.removeEventListener('mousemove', this.handleChange)
    window.removeEventListener('mouseup', this.handleMouseUp)
  }
  render() {
    let { startColor, endColor } = this.props;
    const styles = reactCSS({
      'default': {
        gradient: {
          absolute: '0px 0px 0px 0px',
          background: `linear-gradient(to right, ${startColor} 0%,
           ${endColor} 100%)`,
          boxShadow: this.props.shadow,
          borderRadius: this.props.radius,
        },
        container: {
          position: 'relative',
          height: '100%',
          margin: '0 3px',
        },
        pointer: {
          position: 'absolute',
          left: `${this.state.sliderPosition * 100}%`,
          border: '1px solid black',
          transform: 'translateX(-5px)',
        },
        slider: {
          width: '4px',
          borderRadius: '1px',
          border: '1px solid white',
          height: '16px',
        },
      }
    })

    return (
      <div className="color-slider">
        <div style={styles.gradient} />
        <div
          style={styles.container}
          ref={container => this.container = container}
          onMouseDown={this.handleMouseDown}
          onTouchMove={this.handleChange}
          onTouchStart={this.handleMouseDown}
          onTouchEnd={this.handleMouseUp}
        >
          <div style={styles.pointer}>
            <div style={styles.slider} />
          </div>
        </div>
      </div>
    )
  }
}

export default ColorSlider
