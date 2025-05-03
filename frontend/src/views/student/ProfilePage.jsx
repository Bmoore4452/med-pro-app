import React, { useEffect, useState } from 'react';

import Sidebar from '../partials/Sidebar';
import BaseHeader from '../partials/BaseHeader';
import { useAuthStore } from '../../store/auth';

const ProfilePage = () => {
    const user = useAuthStore((state) => state.allUserData);
    const firstName = user?.full_name?.split(' ')[0] || 'User';

    const [results, setResults] = useState([]);

    useEffect(() => {
        // Simulate demo/mock data instead of live API call
        const mockData = [
            {
                level: '1',
                score: 85.0,
                passed: true,
                feedback: null
            },
            {
                level: '2',
                score: 72.5,
                passed: true,
                feedback: null
            },
            {
                level: '3',
                score: 55.0,
                passed: false,
                feedback: {
                    recommendation:
                        'Review your approach to ethical scenarios and consider reattempting the ethics module.'
                }
            }
        ];
        setResults(mockData);
    }, []);

    document.title = `${firstName}'s Assessment Profile | Med Pro Assessments`;

    return (
        <div className="container-fluid d-flex flex-sm-row">
            <Sidebar />
            <div className="main-content">
                <BaseHeader />
                <div className="p-4 space-y-6">
                    <h1 className="text-2xl font-bold mb-4">
                        {firstName}'s Assessment Results
                    </h1>
                    <div className="row">
                        {results.length > 0 ? (
                            results.map((result, index) => (
                                <div className="col-md-4 mb-4" key={index}>
                                    <div className="card shadow h-100">
                                        <div className="card-body">
                                            <h5 className="card-title">
                                                Level {result.level} -{' '}
                                                {result.level === '1'
                                                    ? 'Soft Skills'
                                                    : result.level === '2'
                                                      ? 'Teamwork'
                                                      : 'Ethics'}
                                            </h5>
                                            <p className="card-text">
                                                <strong>Score:</strong>{' '}
                                                {result.score}%
                                            </p>
                                            <p className="card-text">
                                                <strong>Status:</strong>{' '}
                                                {result.passed ? (
                                                    <span className="text-success">
                                                        Passed
                                                    </span>
                                                ) : (
                                                    <span className="text-danger">
                                                        Failed
                                                    </span>
                                                )}
                                            </p>
                                            {result.feedback && (
                                                <p className="card-text">
                                                    <strong>Feedback:</strong>{' '}
                                                    {
                                                        result.feedback
                                                            .recommendation
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No assessment results available.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
