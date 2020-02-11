import React from 'react';
import Navbar from '../navbar/navbar';
import { Redirect } from 'react-router-dom';
import {Input, List, Badge, message} from 'antd';
import axios from 'axios';
import { serverCredentials } from '../../config';
import { getApplicantData } from './search-helper';

import './search.css';

const serverEndpoint = serverCredentials.endpoint;

const {Search} = Input;

const getApplicationStatusBadge = (status) => {
    const applicationColorMap = {
        Pending: "warning",
        Accepted: "success",
        Rejected: "error",
        Waitlisted: "processing",
    }
    return <Badge className="application-status-badge" status={applicationColorMap[status]} text={status}/>;
}

class SearchPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            searchResults: [],
            clickedApplicant: undefined,
            authorized: true,
        }

        this.searchClick = this.searchClick.bind(this);
    }

    async searchClick(query) {
        try {
            const searchResponse = await axios.get(serverEndpoint+'/applicants/search', {
                params: { query: query },
                withCredentials: true
            });
            this.setState({
                ...this.state,
                searchResults: searchResponse.data
            });
        } catch (err) {
            if (err.response.status === 401) {
                this.setState({
                    ...this.state,
                    authorized: false,
                })
            }
            return [];
        }
    }

    async redirectToApplicantSelection(email) {
        const response = await getApplicantData(email);
        if (response.status === 401) {
            this.setState({
                ...this.state,
                authorized: false,
            })
        } else if (response.status === 200) {
            this.setState({
                ...this.state,
                clickedApplicant: response.data.applicant,
            })
        } else if (response.status === 406) {
            message.warning('This applicant is not assigned to you, accessing their information is forbidden.', 2);
        } else {
            message.error('Something went wrong. A page reload might fix it', 2);
        }
    }

    redirectToApplicant() {
        if (this.state.clickedApplicant !== undefined) {
            return  <Redirect
                to={{
                    pathname: "/selection",
                    state: { applicantData: this.state.clickedApplicant }
                }}
            />
        }
    }

    displaySearchResults(data) {
        return (
            <div className='search-results-div'>
                <List
                    itemLayout="horizontal"
                    dataSource={data}
                    renderItem={item => (
                        <List.Item
                            onClick={() => this.redirectToApplicantSelection(item.email)}
                            className="search-result"
                        >
                            <List.Item.Meta
                                title={<p>{item.firstName + ' ' + item.lastName}</p>}
                                description= {item.email + ' | ' + item.track + ' | ' + item.classification}
                            />
                            <div>
                                {getApplicationStatusBadge(item.applicationStatus)}
                            </div>
                        </List.Item>
                    )}
                />
            </div>
        )
    }

    searchBar() {
        return (
            <div>
                <div className="search-bar-div">
                    <Search
                        placeholder="Looking for something?"
                        enterButton
                        size="large"
                        onSearch={value => this.searchClick(value)}
                        id="search-bar"
                    />
                </div>
            </div>
        )
    }

    authorizedCheck() {
        if (!this.state.authorized) {
            message.error('Your access token expired. Please log in again.', 1.5);
            return <Redirect to='/'/>
        }
    }

    render() {
        return (
            <div>
                {this.authorizedCheck()}
                <Navbar/>
                {this.searchBar()}
                {this.displaySearchResults(this.state.searchResults)}
                {this.redirectToApplicant()}
            </div>
        )
    }
}

export default SearchPage;