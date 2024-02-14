import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import client from './client';
import store from './store';
import {Provider} from 'react-redux';
import {ApolloProvider} from '@apollo/client';
import {
  Route,
  BrowserRouter as Router, Routes,
} from 'react-router-dom';
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <ApolloProvider client={client}>
      <Router>
        <Provider store={store}>
          <App />
        </Provider>
      </Router>
    </ApolloProvider>,
);
