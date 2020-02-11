import React from 'react';
import Navbar from '../navbar/Navbar';
import ParticipantInfo from './participant-info/ParticipantInfo';
import EmailInput from './email-input/EmailInput';
import { Redirect } from 'react-router-dom';
import { message, Empty, Icon } from 'antd';
import { getParticipantInfo, SignInTypeSelector, setParticipantSignInStatus, DEFAULT_SIGN_IN_TYPE } from './attendance-helper';

import './attendance-page.css';

class AttendancePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            authorized: true,
            applicant: undefined,
            signInType: DEFAULT_SIGN_IN_TYPE,
        };

        this.processEmailInput = this.processEmailInput.bind(this);
        this.authorizedCheck = this.authorizedCheck.bind(this);
        this.getParticipantInfo = this.getParticipantInfo.bind(this);
        this.changeSignInStatus = this.changeSignInStatus.bind(this);
        this.getApplicant = this.getApplicant.bind(this);
      }

    async processEmailInput(email) {
        if (email === undefined || email === null || email === "") return;
        this.setState({applicant: null});
        this.getApplicant(email.toLowerCase());
    }

    async getApplicant(email) {
        const {authorized, applicant} = await getParticipantInfo(email);
        if (applicant === undefined) {
            message.warn(`No participant exists with the email: ${email}`)
        }
        return this.setState({ applicant, authorized });
    }

    authorizedCheck() {
        if (!this.state.authorized) {
            message.error("Your access token expired. Please log-in to Nebula again!");
            return <Redirect to='/'/>;
        }
    }

    getParticipantInfo() {
        if (this.state.applicant === undefined) {
            return <Empty />
        } else if (this.state.applicant === null) {
            return <div className='row justify-content-center my-5'><Icon type="loading" style={{fontSize: '40px', color: '#666666'}}/></div>; 
        }
        return <ParticipantInfo applicant={this.state.applicant} signInType={this.state.signInType} changeSignInStatus={this.changeSignInStatus}/>
    }

    changeSignInStatus = async (email, newStatus, signInType) => {
        const {authorized, applicant} = await setParticipantSignInStatus(email, newStatus, signInType);
        if (!authorized) {
            return this.setState({
                ...this.state,
                authorized: false,
                applicant: undefined,
            });
        } else if (applicant === undefined) {
            return message.warn(`No participant exists with the email: ${email}`)
        } else {
            message.success(`${this.state.applicant.firstName} was successfully ${(newStatus) ? 'signed in' : 'signed out'}!`)
        }
        return this.setState({
            ...this.state,
            applicant,
        });
    }

    render() {
        return (
            <div className="container-fluid">
                {this.authorizedCheck()}
                <Navbar />
                <div className="main-div">
                    <EmailInput processEmailInput={this.processEmailInput}/>
                    <SignInTypeSelector changeSignInType={(signInType) => this.setState({...this.state, signInType})}/>
                    {this.getParticipantInfo()}
                </div>
            </div>
        )
    };
}

export default AttendancePage;