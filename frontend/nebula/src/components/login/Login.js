import React from 'react';
import { Input, Button, message } from 'antd';
import { loginAdmin } from './login-helper.js';
import { Redirect } from 'react-router-dom';

import './login.css';

class LoginPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loggedIn: false,
        };

        this.handleLogin = this.handleLogin.bind(this);
    }

    async handleLogin() {
        const loginKey = this.loginInputObj.state.value.toLowerCase();
        const adminData = await loginAdmin(loginKey);
        if (adminData.authorized) {
            message.success(`Hey ${adminData.firstName}, welcome to Nebula.`, 2)
            this.setState({
                loggedIn: true,
            });
        } else {
            message.error("The credentials you provided are incorrect.", 2)
        }
    }

    redirectOnLogin() {
        if (this.state.loggedIn) {
            return <Redirect to='attendance'/>
        }
    }

    render() {
        return (
            <div className="container-fluid">
                {this.redirectOnLogin()}
                <h1 id="mainLogo" className="text-center">Nebula</h1>
                <div className="row justify-content-around">
                    <div className="" id="loginForm">
                        <Input size="large" placeholder="Enter your key" id="loginInput" 
                            ref={(inputObj) => this.loginInputObj = inputObj}/>
                        <Button id="loginBtn" onClick={this.handleLogin}>Login</Button>
                    </div>
                </div>
            </div>
        )
    }
}

export default LoginPage;