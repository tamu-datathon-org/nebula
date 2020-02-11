import React from 'react';
import Navbar from '../navbar/navbar';
import { Redirect } from 'react-router-dom';
import { Spin, Button, message, Tooltip, Empty } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import ApplicantInfo from './applicant-info';
import { getRandomApplicant, setApplicantScores, getNumReviews, getReviewStats } from './selection-helper';
import ScoringBoard from './scoring-board/scoring-board';

import './selection.css';

class SelectionPage extends React.Component {
    constructor(props) {
        super(props);

        let applicantData = undefined
        if (this.props.location.state) {
            applicantData = this.props.location.state.applicantData
        }
        this.state = {
            authorized: true,
            applicantData: applicantData,
            applicantScores: (applicantData == undefined) ? undefined : applicantData.score,
            totalReviewed: 0,
            totalAssigned: 0,
        }

        this.getApplicantInfo = this.getApplicantInfo.bind(this);
        this.submitScores = this.submitScores.bind(this);
        this.getFullReviewedStats = this.getFullReviewedStats.bind(this);

        this.scoringBoard = React.createRef();
    };

    getApplicantInfo() {
        this.setState({
            ...this.state,
            authorized: true,
            applicantData: undefined,
            applicantScores: undefined,
        })
        this.getReviewedStatistics();
        getRandomApplicant().then((applicantResponse) => {
            let authorized = true;
            let applicantData = undefined;
            if (applicantResponse.status === 200) {
                applicantData = applicantResponse.data.applicant;
            } else if (applicantResponse.status === 401) {
                authorized = false;
            } else if (applicantResponse.status === 404) {
                applicantData = null; // This means there was no data but a successful request
            }
            this.setState({
                ...this.state,
                authorized,
                applicantData,
                applicantScores: (applicantData === undefined || applicantData === null) ? undefined : applicantData.score,
            })
        })
    };

    showApplicantInfo() {
        if (this.state.authorized) {
            if (this.state.applicantData === null) return <div style={{margin: '20vh auto 20vh auto'}}><Empty/></div>;
            else if (this.state.applicantData !== undefined) return <ApplicantInfo applicantInfo={this.state.applicantData} />;
            else return <div><Spin size="large" id="application-info-loading" /></div>
        } else {
            message.error('Your access token expired. Please log in again.', 1.5);
            return <Redirect to='/' />
        }
    };

    async componentDidMount() {
        if (this.state.applicantData === undefined) await this.getApplicantInfo();
    };

    getReviewedStatistics() {
        getNumReviews().then((response) => {
            if (response.status === 401) {
                this.setState({
                    ...this.state,
                    authorized: false,
                    applicantData: undefined,
                })
            } else {
                this.setState({
                    ...this.state,
                    totalAssigned: response.data.curReviewerStats.totalAssigned,
                    totalReviewed: response.data.curReviewerStats.totalReviewed,
                    reviewStats: response.data.reviewStats,
                });
            }
        });
    };

    submitScores() {
        const applicantScores = this.scoringBoard.current.state.scores;
        setApplicantScores(applicantScores, this.state.applicantData.email)
            .then((response) => {
                if (response.status === 401) {
                    this.setState({
                        ...this.state,
                        authorized: false,
                        applicantData: undefined,
                    })
                } else if (response.status === 200) {
                    message.success('Your scores for the applicant were submitted successfully!', 1.5);
                    this.setState({
                        ...this.state,
                        authorized: true,
                        applicantData: response.data.applicant,
                        applicantScores: response.data.applicant.score,
                    });
                    this.getReviewedStatistics();
                } else if (response.status === 406) { // Not allowed, applicant isn't assigned to the reviewer
                    message.warning('This applicant is not assigned to you, thus you cannot submit scores for them. Best to move on to the next applicant.')
                    this.getApplicantInfo();
                } else {
                    message.error(`Something went wrong, here's all we know:\n'${response.message}'`);
                }
            });
    };

    // Gets review statistics for all reviewers
    getFullReviewedStats() {
        if (this.state.reviewStats === undefined) {
            return '';
        }
        // Map each review stat to a formatted line.
        let reviews = Object.keys(this.state.reviewStats).map((reviewer) =>
            <p key={reviewer}>{reviewer}: {this.state.reviewStats[reviewer].totalReviewed} / {this.state.reviewStats[reviewer].totalAssigned}</p>);
        reviews.push(<p key='total'>
            Total: {Object.values(this.state.reviewStats).reduce((total, review) => total + review.totalReviewed, 0)} / {Object.values(this.state.reviewStats).reduce((total, review) => total + review.totalAssigned, 0)}
        </p>)
        return reviews
    };

    render() {
        return (
            <div className="container-fluid">
                <Navbar />
                {this.showApplicantInfo()}
                <ScoringBoard ref={this.scoringBoard} scores={this.state.applicantScores} />
                <div className="row justify-content-center next-button-div">
                    <Button className="selection-button mx-4" style={{
                        backgroundColor: "#04BEA8",
                    }} onClick={this.submitScores}>
                        Submit Scores
                    </Button>
                    <h5 className="mt-1">
                        Reviewed: {this.state.totalReviewed} / {this.state.totalAssigned}
                        <Tooltip title={this.getFullReviewedStats()}>
                            <FontAwesomeIcon
                                icon={faQuestionCircle}
                                className="score-block-tooltip"
                            />
                        </Tooltip>
                    </h5>
                </div>
                <div className="row justify-content-center next-button-div">
                    <Button className="selection-button" style={{
                        backgroundColor: "#663399",
                    }} onClick={this.getApplicantInfo}>
                        Next Applicant
                            <FontAwesomeIcon icon={faArrowRight}
                            style={{
                                marginLeft: '10px'
                            }}
                        />
                    </Button>
                </div>
            </div>
        )
    };
}

export default SelectionPage;