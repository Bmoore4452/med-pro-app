import React from 'react';
import { Link } from 'react-router-dom';

function AboutUs() {
    return (
        <section className="hero d-flex flex-sm{shrink}-2 flex-column justify-content-left align-items-left">
            <div className="hero-content text-center">
                <div className="hero-text">
                    <h1>Welcome to Med Pro</h1>
                    <p>Professionalism Assessment</p>
                    <p>
                        At MedPro Assessments, we are committed to elevating the
                        healthcare hiring process by focusing on what truly
                        matters—professionalism, soft skills, and quality of
                        care. Our mission is to help healthcare organizations
                        make more informed hiring decisions by offering a
                        research-driven, standardized assessment platform that
                        evaluates candidates beyond technical qualificatio
                    </p>
                    <p>
                        {' '}
                        We specialize in developing tools that assess core
                        behavioral competencies like empathy, ethical reasoning,
                        communication, and teamwork—traits that are essential
                        for every nurse and medical assistant. Rooted in
                        evidence-based design and supported by feedback from
                        real healthcare professionals, our assessments are
                        designed to reflect the real-world demands of
                        patient-centered care.
                    </p>
                    <p>
                        Through innovation, integrity, and a deep respect for
                        the healthcare community, MedPro Assessments is helping
                        shape a workforce that is not only clinically competent
                        but also emotionally intelligent and ethically grounded.
                    </p>
                </div>
                <div className="hero-image"></div>
            </div>
        </section>
    );
}

export default AboutUs;
