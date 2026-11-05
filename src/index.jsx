import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import './index.css';
import App from './connect-App';
import configureAppStore from './modules/store';
import { defaultState } from './app/reducers';
import { pruneCache } from './app/cache';

// Drop expired API responses saved on earlier visits
pruneCache();

const initialState = {
  app: {
    ...defaultState,
  },
};
const store = configureAppStore(initialState);

const root = createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <Router basename="/">
      <App />
    </Router>
  </Provider>
);
