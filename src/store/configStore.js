import * as mobx from 'mobx'
let { observable, action, computed } = mobx;
function autoSave(store, save) {
    let firstRun = true;
    mobx.autorun(() => {
        // This code will run every time any observable property
        // on the store is updated.
        const json = JSON.stringify(mobx.toJS(store));
        if (!firstRun) {
            save(json);
        }
        firstRun = false;
    });
}
const STORE_KEY = 'JUSTACOLORWHEEL_STORE_KEY';
let store = window.localStorage;
export default class ConfigStore {
    @observable swapWheel = false;
    @observable scrollWheel = 0;
    @observable swapTriangle = false;
    @observable scrollTriangle = 0;
    constructor() {
        this.load();
        autoSave(this, this.save.bind(this));
    }
    @action
    setSwapWheel = (isOn) => {
        this.swapWheel = isOn;
    }
    @action
    setScrollWheel = (degree) => {
      this.scrollWheel = degree;
    }
    @action
    setSwapTriangle = (isOn) => {
      this.swapTriangle = isOn;
    }
    @action
    setScrollTriangle = (degree) => {
      this.scrollTriangle = degree;
    }
    load() {
        let configJson = store.getItem(STORE_KEY);
        if (configJson) {
            console.log('load',configJson);
            const data = JSON.parse(configJson);
            mobx.set(this, data);
        }
    }

    save(json) {
        console.log('save',json);
        store.setItem(STORE_KEY,json);
    }
}