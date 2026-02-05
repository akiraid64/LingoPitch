import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';
import { TranslationProvider } from './contexts/TranslationContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <TranslationProvider>
            <App />
        </TranslationProvider>
    </React.StrictMode>
);
