import React from 'react';
import { Tag, Badge } from 'antd';
import { Button, Card as SemanticCard } from 'semantic-ui-react';
import ResumeModalLink from '../resume-modal/resume-modal';

import './participant-info.css';

const applicationStatusColorMap = {
    "Not Coming (RSVP'ed No)": "#F79F1F",
    "Rejected": "#ED4C67",
    "Accepted (Didn't RSVP)": "#2db7f5",
    "RSVP'ed": "#009432"
}

const getTrackInfo = (info) => {
    if (info === "Learner") {
        return <Tag color="#f0932b">Learner</Tag>
    } else {
        return <Tag color="#4834d4">Competitor</Tag>
    }
}

const getDietInfo = (info) => {
    if (info === "" || info === undefined) {
        return <Badge status="error" text="No Data" className="ml-3"/>
    }
    return info
}

const getApplicationStatusInfo = (info) => {
    return <Tag color={applicationStatusColorMap[info]}>{info}</Tag>
}

class ParticipantInfo extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            applicant: props.applicant,
            signInType: props.signInType,
            loading: false,
        }

        this.changeSignInStatus = this.changeSignInStatus.bind(this);
    }

    componentWillReceiveProps(props) {
        this.setState({
            applicant: props.applicant,
            signInType: props.signInType,
            loading: false,
        })
    }

    changeSignInStatus(email, status, type) {
        if (status == this.state.applicant.signInStatus[type]) {
            return;
        }
        this.props.changeSignInStatus(email, status, type)
        this.setState({loading: true})
    }

    render = () => {
        const applicantInfo = this.state.applicant;
        return (
            <div className="row justify-content-center my-5">
                <SemanticCard>
                    <SemanticCard.Content>
                        <SemanticCard.Header>{`${applicantInfo.firstName} ${applicantInfo.lastName}`}</SemanticCard.Header>
                        <SemanticCard.Meta className="my-2">{getApplicationStatusInfo(applicantInfo.applicationStatus)} {getTrackInfo(applicantInfo.track)}</SemanticCard.Meta>
                        <hr/>
                        <SemanticCard.Description className="mt-4">
                            <p className="participant-info-li my-3">{applicantInfo.university}</p>
                            <p className="participant-info-li my-3">{applicantInfo.major}</p>
                            {<p className="participant-info-li my-3"><b>Dietary Restriction:</b> {getDietInfo()}</p>}
                        </SemanticCard.Description>
                    </SemanticCard.Content>
                    <SemanticCard.Content extra>
                        <div className='ui'>
                        <Button 
                            basic={applicantInfo.signInStatus[this.state.signInType]} 
                            color='green' className="w-100" 
                            loading={this.state.loading}
                            onClick={() => this.changeSignInStatus(applicantInfo.email, true, this.state.signInType)}
                        >
                            {(applicantInfo.signInStatus[this.state.signInType]) ? 'Checked in!' : 'Check In'}
                        </Button>
                        </div>
                    </SemanticCard.Content>
                </SemanticCard>
            </div>
        );
    }
};

export default ParticipantInfo;