import React from 'react';
import BaseHeader from '../partials/BaseHeader';
import BaseFooter from '../partials/BaseFooter';
import { Link } from 'react-router-dom';
import Sidebar from '../partials/Sidebar';
import Hero from '../partials/Hero';
import '../../App.css';

document.title = 'Home | Med Pro Assesments';

function Index() {
    return (
        <>
            <div className="container-fluid d-flex flex-sm-row">
                <Sidebar />
                <div className="main-content">
                    <BaseHeader />
                    <Hero />
                </div>
            </div>
        </>
    );
}

export default Index;
