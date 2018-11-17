import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'mobx-react';
import './index.css';
import App from './App';
import ConfigStore from './store/configStore'
let configStore = new ConfigStore();
let stores = {
  configStore
}
ReactDOM.render(
  <Provider {...stores}>
    <App />
  </Provider>, document.getElementById('root'));
