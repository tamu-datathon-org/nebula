import React from 'react';
import { Redirect } from 'react-router-dom';
import { Icon, message } from 'antd';
import Cookie from 'js-cookie';
import { logoutAdmin } from '../login/login-helper';

import './navbar.css';

class Navbar extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            powerOff: false,
        }

        this.powerOff = this.powerOff.bind(this);
        this.reauthenticate = this.reauthenticate.bind(this);
    }

    async powerOff() {
        message.success(`Logging out!`, 2);
        logoutAdmin();
        Cookie.remove('td_token');
        this.setState({
            powerOff: true,
        })
    }

    redirectIfPowerOff() {
        if (this.state.powerOff) return <Redirect to='/'/>
    }

    reauthenticate() {
        message.error('Your access token expired. Please log in again.', 1.5);
        this.setState({
            powerOff: true
        })
    }

    render() {
        return (
            <div className="container-fluid">
                {this.redirectIfPowerOff()}
                <div className="navbar-poweroff">
                    <Icon type="export" className="navbar-icon" onClick={this.powerOff} style={{
                        fontSize: '20px',
                    }}/>
                </div>
                <div className="w-30" id="brand-div">
                    <p className="brand text-center">Voyager</p>
                </div>
                <div className="navbar-links">
                    <a href="/selection">
                        <Icon type="solution" className="navbar-icon" style={{
                            fontSize: '20px',
                            marginRight: '10px',
                        }}/>
                    </a>
                    {/*
                    <ApplicantDataModal reauthenticate={this.reauthenticate}/>
                    <a href="/search">
                        <Icon type="search" className="navbar-icon" style={{
                            fontSize: '20px',
                        }}/>
                    </a>
                    */}
                </div>
            </div>
        )
    }
}

export default Navbar;