import React from 'react';
import ReactDOM from 'react-dom';
import LoginPage from './routes/login/login';
import SelectionPage from './routes/selection/selection';
import SearchPage from './routes/search/search';
import * as serviceWorker from './serviceWorker';
import { Route, BrowserRouter as Router } from 'react-router-dom';

import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const routing = (
    <Router>
      <div>
        <Route exact path="/" component={LoginPage} />
        <Route path="/selection" component={SelectionPage} />
        <Route path="/search" component={SearchPage} />
      </div>
    </Router>
  )

ReactDOM.render(routing, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
