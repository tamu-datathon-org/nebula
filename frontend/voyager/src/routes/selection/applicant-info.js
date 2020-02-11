import React from 'react';
import { Descriptions, Badge, Select } from 'antd';
import ResumeModalLink from './resume-modal/resume-modal';

import './applicant-info.css';

const DISPLAY_ID_SIZE = 6;

const getLinksOrNone = (links) => {
    if (links === undefined || links.length === 0) {
        return <Badge status="warning" text="No Data" />;
    } else {
        return links.map((link) => <a
            href={link} rel="noopener noreferrer" target="_blank"
            style={{ display: 'block' }} key={link}
        >{link}</a>);
    }
}

const getBooleanInfoOrNone = (info) => {
    if (info === "TRUE" || info === "Yes") {
        return <Badge status="success" text="Yes" />
    } else if (info === "FALSE" || info === "No") {
        return <Badge status="error" text="No" />
    } else {
        return <Badge status="warning" text="No Data" />
    }
}

const getTrackInfo = (info) => {
    if (info === "Learner") {
        return <Badge status="orange" text="Learner" />
    } else {
        return <Badge status="geekblue" text="Competitor" />
    }
}

const getReviewStatusBadge = (status) => {
    const badgeStatus = (status) ? "success" : "warning";
    const badgeText = (status) ? "Reviewed" : "Review Pending";
    return <Badge id="application-status-badge" status={badgeStatus} text={badgeText} />;
}

const getResumeOrNone = (resumeLink, firstName) => {
    if (resumeLink === "") {
        return <Badge status="warning" text="No Data" />
    } else {
        return <ResumeModalLink resumeUrl={resumeLink} applicantFirstName={firstName} />
    }
}

const getApplicantDisplayID = (info) => {
    return '#' + info._id.substring(info._id.length - DISPLAY_ID_SIZE).toUpperCase();
}

class ApplicantInfo extends React.Component {
    constructor(props) {
        super(props);

        this.fields = ['Track', 'University', 'Classification', 'Major', 'Links', 'Resume', 'DS Experience', 'Expectation'];
        this.state = {
            applicantInfo: props.applicantInfo,
            selectedFields: JSON.parse(localStorage.getItem('voyagerSelectedFields')) || this.fields,
        }

        this.handleFieldsChange = this.handleFieldsChange.bind(this);
    }

    componentWillReceiveProps(props) {
        this.setState({
            ...this.state,
            applicantInfo: props.applicantInfo,
        })
    }

    applicationInfoForLayout(info) {
        const infoMap = {
            Track: getTrackInfo(info.track),
            University: info.university,
            Classification: info.classification,
            Major: info.major,
            'Links': getLinksOrNone(info.links),
            Resume: getResumeOrNone(info.resumeLink, getApplicantDisplayID(info)),
            'DS Experience': info.experience,
            Expectation: info.expectation,
        };
        return Object.keys(infoMap).map(key => {
            if (this.state.selectedFields.includes(key)) {
                return <Descriptions.Item label={key} key={key}>{infoMap[key]}</Descriptions.Item>
            }
        });
    }

    applicantInfoBox(info) {
        return (
            <div id="applicant-info-div" className="col-9">
                <div id="applicant-info-header">
                    <h1 className="application-name">{getApplicantDisplayID(info)}</h1>
                    {getReviewStatusBadge(info.reviewed)}
                </div>
                <Descriptions bordered>
                    {this.applicationInfoForLayout(info)}
                </Descriptions>
            </div>
        );
    }

    handleFieldsChange(selectedFields) {
        localStorage.setItem('voyagerSelectedFields', JSON.stringify(selectedFields));
        this.setState({
            ...this.state,
            selectedFields,
        })
    }

    fieldSelectionBox() {
        const filteredOptions = this.fields.filter(item => !this.state.selectedFields.includes(item));
        return (
            <div id='field-selection' className="col-2 justify-content-center">
                <h4 className='text-center mb-4'>Fields Shown</h4>
                <div>
                    <Select
                        mode="multiple"
                        size="default"
                        placeholder="Please select fields to show"
                        defaultValue={this.state.selectedFields}
                        style={{ width: '100%' }}
                        onChange={this.handleFieldsChange}
                    >
                        {filteredOptions.map(field => <Select.Option key={field}>{field}</Select.Option>)}
                    </Select>
                </div>
            </div>
        );
    }

    render() {
        const info = this.state.applicantInfo;
        return (
            <div id="applicant-info" className="row">
                {this.applicantInfoBox(info)}
                {this.fieldSelectionBox()}
            </div>
        );
    }
}

export default ApplicantInfo;