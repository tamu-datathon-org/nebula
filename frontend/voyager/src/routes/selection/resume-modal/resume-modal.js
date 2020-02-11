import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Modal, Icon } from 'antd';

import './resume-modal.css';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

class ResumeModalLink extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            numPages: null,
            pageNumber: 1,
            fileObj: {
                url: this.props.resumeUrl
            }
        }

        this.showModal = this.showModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.onDocumentLoadSuccess = this.onDocumentLoadSuccess.bind(this);
        this.prevPage = this.prevPage.bind(this);
        this.nextPage = this.nextPage.bind(this);
    }

    closeModal() {
        this.setState({
            visible: false,
        });
    }
 
    onDocumentLoadSuccess = ({ numPages }) => {
        this.setState({numPages})
    }

    showModal(e) {
        e.preventDefault();
        this.setState({
            visible: true,
        });
    }

    nextPage() {
        let pageNumber = this.state.pageNumber % this.state.numPages + 1;
        pageNumber = (pageNumber > 0) ? pageNumber : 1;
        this.setState({pageNumber});
    }

    prevPage() {
        let pageNumber = (this.state.pageNumber - 1) % this.state.numPages;
        pageNumber = (pageNumber > 0) ? pageNumber : 1;
        this.setState({pageNumber});
    }
    
    render() {
        const { numPages, pageNumber } = this.state;
        return (
            <span>
                <a href={this.props.resumeUrl} onClick={this.showModal}>Here</a>
                <Modal
                    visible={this.state.visible}
                    title={`${this.props.applicantFirstName}'s Resume`}
                    onCancel={this.closeModal}
                    footer={null}
                    width='650px'
                >
                    <Document
                        file= {this.state.fileObj}
                        style = {{
                            margin: 'auto',
                        }}
                        error={
                            <p>
                                Seems like the resume isn't a pdf. Please download it <a href={this.props.resumeUrl}>here</a>.
                            </p>
                        }
                        loading='Loading resume...'
                        onLoadSuccess={this.onDocumentLoadSuccess}
                    >
                        <Page pageNumber={this.state.pageNumber} width={600}/>
                    </Document>
                    <div 
                        style={{
                            marginLeft: '270px',
                            display: (numPages != null) ? 'inline-block' : 'none'
                        }}
                    >
                    <p>
                        Page {pageNumber || (numPages ? 1 : '--')} of {numPages || '--'}
                    </p>
                    <Icon 
                        type="left" 
                        onClick={this.prevPage}
                        className='pageBtn'
                    />
                    <Icon 
                        type="right" 
                        onClick={this.nextPage}
                        className='pageBtn'
                        style={{
                            marginLeft: '45px'
                        }}
                    />
                    </div>
                </Modal>
            </span>
        );
    }
}

export default ResumeModalLink;