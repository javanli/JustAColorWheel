import React, { Component, PureComponent } from 'react'
import ColorSlider from '../ColorSlider'
import InputNumber from 'rc-input-number'
import './input-number.less';
import { hsvToRgb, rgbToHsv } from '../../common/colorConvert';
class SliderPanel extends (PureComponent || Component) {
    static defaultProps = {
        onChange: () => { },
        type: 'rgb',
        rgb: {
            r: 255,
            g: 0,
            b: 0
        }
    }
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render() {
        let { type, onChange } = this.props;
        const upHandler = (<div className='arrow-up'></div>);
        const downHandler = (<div className='arrow-down'></div>);
        if (type === 'rgb') {
            let { r, g, b } = this.props.rgb;
            return (
                <div className="SliderPanel">
                    <div className="slider-wrapper">
                        <div className="key">R</div>
                        <ColorSlider
                            startColor={`rgb(0,${g},${b})`}
                            endColor={`rgb(255,${g},${b})`}
                            position={r / 255}
                            onChange={
                                (position,isSave) => {
                                    onChange({ r: Math.floor(position * 255), g, b },isSave)
                                }
                            }>
                        </ColorSlider>
                        <InputNumber
                            min={0}
                            max={255}
                            value={r}
                            style={{ width: 60 }}
                            readOnly={false}
                            onChange={(value) => { onChange({ r: value, g, b },true) }}
                            disabled={false}
                            upHandler={upHandler}
                            downHandler={downHandler}
                        />
                    </div>
                    <div className="slider-wrapper">
                        <div className="key">G</div>
                        <ColorSlider
                            startColor={`rgb(${r},0,${b})`}
                            endColor={`rgb(${r},255,${b})`}
                            position={g / 255}
                            onChange={
                                (position,isSave) => {
                                    onChange({ r, g: Math.floor(position * 255), b },isSave)
                                }
                            }>
                        </ColorSlider>
                        <InputNumber
                            min={0}
                            max={255}
                            value={g}
                            style={{ width: 60 }}
                            readOnly={false}
                            onChange={(value) => { onChange({ r, g: value, b },true) }}
                            disabled={false}
                            upHandler={upHandler}
                            downHandler={downHandler}
                        />
                    </div>
                    <div className="slider-wrapper">
                        <div className="key">B</div>
                        <ColorSlider
                            startColor={`rgb(${r},${g},0)`}
                            endColor={`rgb(${r},${g},255)`}
                            position={b / 255}
                            onChange={
                                (position,isSave) => {
                                    onChange({ r, g, b: Math.floor(position * 255) },isSave)
                                }
                            }>
                        </ColorSlider>
                        <InputNumber
                            min={0}
                            max={255}
                            value={b}
                            style={{ width: 60 }}
                            readOnly={false}
                            onChange={(value) => { onChange({ r, g, b: value },true) }}
                            disabled={false}
                            upHandler={upHandler}
                            downHandler={downHandler}
                        />
                    </div>
                </div>
            )
        }
        else {
            let { h, s, v } = this.props.hsv;
            let h0vRGB = hsvToRgb(h, 0, v);
            let h1vRGB = hsvToRgb(h, 1, v);
            let hs0RGB = hsvToRgb(h, s, 0);
            let hs1RGB = hsvToRgb(h, s, 1);

            return (
                <div className="SliderPanel">
                    <div className="slider-wrapper">
                        <div className="key">H</div>
                        <ColorSlider
                            startColor={`rgb(255, 0, 0)`}
                            endColor={`rgb(255, 255, 0) 17%, rgb(0, 255, 0) 33%, rgb(0, 255, 255) 50%, rgb(0, 0, 255) 67%, rgb(255, 0, 255) 83%, rgb(255, 0, 0)`}
                            position={h}
                            onChange={
                                (position,isSave) => {
                                    onChange({h:position, s, v},isSave)
                                }
                            }>
                        </ColorSlider>
                        <InputNumber
                            min={0}
                            max={359}
                            value={Math.floor(h * 359)}
                            style={{ width: 60 }}
                            readOnly={false}
                            onChange={(value) => {
                                onChange({h:value/360, s, v},true)
                            }}
                            disabled={false}
                            upHandler={upHandler}
                            downHandler={downHandler}
                        />
                    </div>
                    <div className="slider-wrapper">
                        <div className="key">S</div>
                        <ColorSlider
                            startColor={`rgb(${h0vRGB.r},${h0vRGB.g},${h0vRGB.b})`}
                            endColor={`rgb(${h1vRGB.r},${h1vRGB.g},${h1vRGB.b})`}
                            position={s}
                            onChange={
                                (position,isSave) => {
                                    onChange({h, s:position, v },isSave)
                                }
                            }>
                        </ColorSlider>
                        <InputNumber
                            min={0}
                            max={100}
                            value={Math.floor(s*100)}
                            style={{ width: 60 }}
                            readOnly={false}
                            onChange={
                                (value) => {
                                    onChange({h, s:value/100, v},true)
                                }
                            }
                            disabled={false}
                            upHandler={upHandler}
                            downHandler={downHandler}
                        />
                    </div>
                    <div className="slider-wrapper">
                        <div className="key">V</div>
                        <ColorSlider
                            startColor={`rgb(${hs0RGB.r},${hs0RGB.g},${hs0RGB.b})`}
                            endColor={`rgb(${hs1RGB.r},${hs1RGB.g},${hs1RGB.b})`}
                            position={v}
                            onChange={
                                (position,isSave) => {
                                    onChange({ h, s, v:position },isSave)
                                }
                            }>
                        </ColorSlider>
                        <InputNumber
                            min={0}
                            max={100}
                            value={Math.floor(v*100)}
                            style={{ width: 60 }}
                            readOnly={false}
                            onChange={(value) => {
                                onChange({h, s, v:value/100},true)
                            }}
                            disabled={false}
                            upHandler={upHandler}
                            downHandler={downHandler}
                        />
                    </div>
                </div>
            )
        }
    }
}

export default SliderPanel
