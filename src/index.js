import React from 'react';
import ReactDOM from 'react-dom';
import '@shopify/polaris/build/esm/styles.css';
import App from './App';
import { AppProvider, Button } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <AppProvider i18n={enTranslations}>
      <App />
    </AppProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
