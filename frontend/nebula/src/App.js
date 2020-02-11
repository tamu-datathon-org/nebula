import React from 'react';
import LoginPage from './components/login/Login';
import AttendancePage from './components/attendance/AttendancePage';
import { Route, BrowserRouter as Router } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

class App extends React.Component {
  render() {
    return (  
    <Router>
      <Route exact path="/" component={LoginPage} />
      <Route exact path="/attendance" component={AttendancePage} />
    </Router>
    );
  }
};
  

export default App;
