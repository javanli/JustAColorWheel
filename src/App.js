import React, { Component } from 'react';
import './App.less';
import ColorWheel from './components/ColorPickerWheel'
import Tabs, { TabPane } from 'rc-tabs';
import TabContent from 'rc-tabs/lib/TabContent';
import ScrollableInkTabBar from 'rc-tabs/lib/ScrollableInkTabBar';
import SliderPanel from './components/SliderPanel/SliderPanel'
import { hsvToRgb, rgbToHsv } from './common/colorConvert';
import { inject, observer } from "mobx-react";
import colorString from 'color-string'
import './styles/tabs.css';
import './styles/switch.less'
import ConfigPanel from './components/ConfigPanel/ConfigPanel'
let forbidSize = false;
let appW = 300;
let appH = 600;
@inject('configStore')
@observer
class App extends Component {
  constructor(props) {
    super(props)
    let wheelWidth = forbidSize ? appW * 0.75 : window.innerWidth * 0.75;
    this.state = {
      tmpHSV: {
        h: 0,
        s: 1,
        v: 1
      },
      h: 0,
      s: 1,
      v: 1,
      wheelWidth
    }
    this.lastChangeTime = 0;
    if (!forbidSize) {
      window.addEventListener("resize", () => {
        this.setState({
          wheelWidth: window.innerWidth * 0.75
        })
      });
    }
    if (window.__adobe_cep__) {
      let cs = new window.CSInterface();
      var event = new window.CSEvent("com.adobe.PhotoshopRegisterEvent", "APPLICATION");
      event.extensionId = cs.getExtensionID();
      event.data = "1936028772"; // setd
      cs.dispatchEvent(event);
      cs.addEventListener("com.adobe.PhotoshopJSONCallback" + cs.getExtensionID(), (event) => {
        event.data = event.data.replace("ver1,{", "{");
        let data = JSON.parse(event.data);
        let {blue,grain,red} = data.eventData.to;
        blue = Math.round(blue);
        grain = Math.round(grain);
        red = Math.round(red);
        if(this.igonreList){
          let index = this.igonreList.findIndex(({r,g,b}) => {return blue === b && grain === g && red === r})
          console.log(this.igonreList,data.eventData.to,index)
          if(index >= 0){
            this.igonreList.splice(0,index + 1);
            return;
          }
          else{
            this.igonreList = []
          }
        }
        this.onChange({
          r:red,
          g:grain,
          b:blue
        },true,true);
      });
    }
  }
  onChange = (color, isSave, forbidEvent) => {
    let { h, s, v } = color;
    if (h === undefined) {
      let { r, g, b } = color;
      let hsv = rgbToHsv(r, g, b)
      h = hsv.h;
      s = hsv.s;
      v = hsv.v;
    }
    this.setState({
      tmpHSV: { h, s, v }
    })
    if (isSave) {
      this.setState({
        h, s, v
      })
      let { r, g, b } = hsvToRgb(h, s, v);
      if (window.__adobe_cep__ && !forbidEvent) {
        if(!this.igonreList){
          this.igonreList = []
        }
        this.igonreList.push({r,g,b})
        let cs = new window.CSInterface();
        let script = `setForegroundColorRGB(${r},${g},${b})`;
        cs.evalScript(script);
      }
    }
  }
  render() {
    let { h, s, v, wheelWidth, tmpHSV } = this.state;
    let tmpRGB = hsvToRgb(tmpHSV.h, tmpHSV.s, tmpHSV.v);
    let appStyle = forbidSize ? { width: appW, height: appH } : {};
    let indicator = colorString.to.hex([tmpRGB.r, tmpRGB.g, tmpRGB.b]);
    // debugger;
    let { configStore } = this.props;
    return (
      <div className="App" style={appStyle}>
        <div id="display-circle" style={{ backgroundColor: `rgb(${tmpRGB.r},${tmpRGB.g},${tmpRGB.b}` }}></div>
        <div id="color-indicator">{indicator}</div>
        <ColorWheel
          className="color-wheel"
          radius={wheelWidth / 2}
          width={wheelWidth / 12}
          onChange={this.onChange}
          {...{ h, s, v }}>
        </ColorWheel>
        <Tabs
          defaultActiveKey="RGB"
          tabBarPosition="bottom"
          renderTabBar={() => <ScrollableInkTabBar />}
          renderTabContent={() => <TabContent />}
        >
          <TabPane tab='RGB' key="RGB">
            <SliderPanel
              type='rgb'
              onChange={this.onChange}
              rgb={tmpRGB}>
            </SliderPanel>
          </TabPane>
          <TabPane tab='HSV' key="HSV">
            <SliderPanel
              type='hsv'
              onChange={this.onChange}
              hsv={tmpHSV}>
            </SliderPanel>
          </TabPane>
          <TabPane tab="Config" key="Config">
            <ConfigPanel/>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default App;
