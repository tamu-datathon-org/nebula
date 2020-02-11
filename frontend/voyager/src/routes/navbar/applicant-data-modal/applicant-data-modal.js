import React from 'react';
import { Modal, Icon, Button, Select, message } from 'antd';
import axios from 'axios';
import { serverCredentials } from '../../../credentials';
import { saveAs } from 'file-saver';

import './applicant-data-modal.css';
const serverEndpoint = serverCredentials.endpoint;

const toCamelCase = (value) => 
    value.toLowerCase().replace(/\s+(.)/g, function(match, group1) {
        return group1.toUpperCase();
    });

class ApplicantDataModal extends React.Component {
    constructor(props) {
        super(props);

        this.options = ['First Name', 'Last Name', 'Email', 'Gender', 'University', 'Classification', 'Major', 'First Gen Student', 'Ethnicity', 'Track', 'Experience', 'Expectation', 'Is In Team', 'Resume Link', 'Application Status'];

        this.state = {
            visible: false,
            selectedOptions: this.options,
        }

        this.showModal = this.showModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.handleOptionsChange = this.handleOptionsChange.bind(this);
        this.downloadData = this.downloadData.bind(this);
    }

    closeModal() {
        this.setState({
            visible: false,
        });
    }

    showModal() {
        this.setState({
            visible: true,
        });
    }

    handleOptionsChange(selectedOptions) {
        this.setState({
            ...this.state,
            selectedOptions,
        })
    }

    async downloadData() {
        try {
            message.warning('The request for download has been sent. It\'ll take a minute though. I would recommend closing this modal and reviewing more applicants.', 5)
            const fieldsToDownload = this.state.selectedOptions.map(item => encodeURIComponent(toCamelCase(item)));
            const csvResponse = await axios.get(serverEndpoint+'/applicants/csv', {
                params: { fields: fieldsToDownload },
                withCredentials: true,
                responseType: 'blob',
            });
            if (csvResponse.data) {
                saveAs(csvResponse.data, 'TAMU Datathon Applicants.csv');
            }
        } catch (err) {
            if (err.response && err.response.status === 401) {
                this.props.reauthenticate();
            }

        }
    }

    render() {
        const filteredOptions = this.options.filter(item => !this.state.selectedOptions.includes(item));
        return (
            <span>
                <span id='applicant-data-modal'
                    onClick={this.showModal}
                >
                    <Icon type="download" className="navbar-icon" style={{
                        fontSize: '20px',
                        marginRight: '10px',
                    }}/>
                </span>
                <Modal
                    visible={this.state.visible}
                    title="Download Applicant Data"
                    onCancel={this.closeModal}
                    footer={null}
                    width='42vw'
                >
                    <div className='container-fluid modal-data-div'>
                        <h6 id='field-choose-text'>Please choose the fields to download:</h6>
                        <Select
                            mode="multiple"
                            size="default"
                            placeholder="Please select fields to download"
                            defaultValue={this.state.selectedOptions}
                            style={{ width: '100%' }}
                            onChange={this.handleOptionsChange}
                        >
                            {filteredOptions.map(field => <Select.Option key={field}>{field}</Select.Option>)}
                        </Select>
                        <span id='download-data-btn-span'>
                            <Button id='download-data-btn' 
                                onClick={this.downloadData}
                                type='primary'
                            >
                                Download
                            </Button>
                        </span>
                    </div>
                </Modal>
            </span>
        );
    }
}

export default ApplicantDataModal;