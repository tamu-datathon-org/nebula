import React from 'react';
import { Button, message, Input, Icon } from 'antd';
import CameraImage from '../../../img/camera.svg';

import "./email-input.css";

var qrcode = window.qrcode;

const getQrCodeDataFromFile = async (fileObj) => {
    return new Promise((resolve) => {
        var reader = new FileReader();
        reader.onload = (e) => {
            qrcode.callback = function(res) {
                if(res instanceof Error) {
                  message.error("Couldn't read the QR Code.")
                  resolve(undefined)
                } else {
                    resolve(res);
                }
            }
            qrcode.decode(reader.result)
        }
        reader.readAsDataURL(fileObj);
    });
}

class EmailInput extends React.Component {

    async processImage(imageFiles) {
        if (imageFiles.length <= 0) {
            return;
        }
        
        const qrCode = await getQrCodeDataFromFile(imageFiles[0]);
        if (qrCode !== undefined) this.props.processEmailInput(qrCode);
    }

    render() {
        return (
        <div className="row justify-content-center mt-4">
            <div className="col-lg-5 col-md-4 col-sm-12 text-center">
                <label
                    className="qr-code-input"
                >
                    <input type="file" accept="image/*" capture="environment" onChange={(e) => this.processImage(e.target.files)}/>
                    <Icon type="qrcode" className="qr-code-scan-btn" style={{ fontSize: '80px'}}/>
                </label>
            </div>
            <h3 className="col-lg-1 col-md-1 col-sm-12 my-4 text-center">
                Or
            </h3>
            <div className="col-lg-5 col-md-6 col-sm-12 text-center">
                <Input size="large" placeholder="Enter the participant's email" id="email-input" 
                        ref={(inputObj) => this.emailInput = inputObj}/>
                <Button id="email-input-btn" className="mx-3 my-4" onClick={() => this.props.processEmailInput(this.emailInput.state.value)}>Get Info</Button>
            </div>
        </div>
        );
    }
};

export default EmailInput;