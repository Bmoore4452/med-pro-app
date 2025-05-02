import React from 'react';
import BaseHeader from '../partials/BaseHeader';
import BaseFooter from '../partials/BaseFooter';
import { Link } from 'react-router-dom';
import Sidebar from '../partials/Sidebar';
import AboutUs from '../partials/AboutUs';
import '../../App.css';

document.title = 'Home | Med Pro Assessments';

function AboutUsPage() {
    return (
        <>
            <div className="container-fluid d-flex flex-sm-row">
                <Sidebar />
                <div className="main-content">
                    <BaseHeader />
                    <AboutUs />
                </div>
            </div>
        </>
    );
}

export default AboutUsPage;
