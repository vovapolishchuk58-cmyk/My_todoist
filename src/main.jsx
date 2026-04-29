// Triggering Vercel deployment
import * as ReactModule from 'react';
const React = ReactModule.default || ReactModule;
import * as ReactDOMModule from 'react-dom/client';
const ReactDOM = ReactDOMModule.default || ReactDOMModule;

import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
)
