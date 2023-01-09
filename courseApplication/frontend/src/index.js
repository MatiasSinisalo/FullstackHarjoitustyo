import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import client from './client';
import {  ApolloProvider } from '@apollo/client'
import {
  BrowserRouter as Router,
} from "react-router-dom"
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
   <ApolloProvider client={client}>
    <Router>
        <App />
    </Router>
  </ApolloProvider>
);
