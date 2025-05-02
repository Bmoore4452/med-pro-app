import React from 'react';
import { Link } from 'react-router-dom';


function Hero() {
    return (
        <section className="hero d-flex flex-sm{shrink}-2 flex-column justify-content-left align-items-left">
            <div className="hero-content text-center">
                <div className="hero-text">
                    <h1>Welcome to Med Pro</h1>
                    <p>Professionalism Assesment</p>
                    <Link to="/register" className="btn">
                        Get Started
                    </Link>
                </div>
                <div className="hero-image">

                </div>
            </div>
        </section>
    );
}

export default Hero;
