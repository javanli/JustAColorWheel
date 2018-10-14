import React, { Component } from 'react';
import { inject, observer } from "mobx-react";
import Switch from 'rc-switch';
import Slider from 'rc-slider';
import InputNumber from 'rc-input-number'
import './index.less'
import './slider.less'
@inject('configStore')
@observer
class ConfigPanel extends Component {
  render() {
    let { configStore } = this.props;
    const upHandler = (<div className='arrow-up'></div>);
    const downHandler = (<div className='arrow-down'></div>);
    return (
      <div className="config-panel">
        <div className="config-item">
          flip◉
              <Switch
            onChange={(isOn) => { configStore.setSwapWheel(isOn) }}
            checked={configStore.swapWheel}
          />
        </div>
        <div className="config-item flex-container">
          <div className="title">scroll◉</div>
          <Slider
            min={0}
            max={359}
            value={configStore.scrollWheel}
            onChange={(value) => { configStore.setScrollWheel(value) }}></Slider>
          <InputNumber
            min={0}
            max={359}
            value={configStore.scrollWheel}
            style={{ width: 45, marginLeft: 10 }}
            readOnly={false}
            onChange={(value) => {
              configStore.setScrollWheel(value)
            }}
            disabled={false}
            upHandler={upHandler}
            downHandler={downHandler}
          />
        </div>
        <div className="config-item">
          flip▲
              <Switch
            onChange={(isOn) => { configStore.setSwapTriangle(isOn) }}
            checked={configStore.swapTriangle}
          />
        </div>
        <div className="config-item flex-container">
          <div className="title">scroll▲</div>
          <Slider
            min={0}
            max={359}
            value={configStore.scrollTriangle}
            onChange={(value) => { configStore.setScrollTriangle(value) }}></Slider>
          <InputNumber
            min={0}
            max={359}
            value={configStore.scrollTriangle}
            style={{ width: 45, marginLeft: 10 }}
            readOnly={false}
            onChange={(value) => {
              configStore.setScrollTriangle(value)
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
export default ConfigPanel;