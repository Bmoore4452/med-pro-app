import React, { useCallback, useEffect, useState } from 'react';

import Sidebar from '../partials/Sidebar';
import BaseHeader from '../partials/BaseHeader';
import { useAuthStore } from '../../store/auth';
import useAxios from '../../utils/useAxios';

const ProfilePage = () => {
    const axios = useAxios;
    const user = useAuthStore((state) => state.allUserData);
    const firstName = user?.full_name?.split(' ')[0] || 'User';

    const [results, setResults] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [ariaStatusMessage, setAriaStatusMessage] = useState('');

    const fetchResults = useCallback(async () => {
        try {
            setLoading(true);
            setLoadError(null);
            const [resultsRes, historyRes] = await Promise.all([
                axios.get('/assessment/results/'),
                axios.get('/assessment/history/')
            ]);

            setResults(resultsRes.data.results || []);
            setHistory(historyRes.data.history || []);
        } catch (error) {
            console.error('Failed to fetch assessment results:', error);
            setResults([]);
            setHistory([]);
            setLoadError(
                'Unable to load assessment data right now. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    }, [axios]);

    useEffect(() => {
        fetchResults();
    }, [fetchResults]);

    useEffect(() => {
        if (loading) {
            setAriaStatusMessage(
                'Loading assessment results and quiz history.'
            );
            return;
        }

        if (loadError) {
            setAriaStatusMessage(loadError);
            return;
        }

        if (!results.length && !history.length) {
            setAriaStatusMessage('No assessment results available yet.');
            return;
        }

        setAriaStatusMessage(
            `Loaded ${results.length} current result levels and ${history.length} previous attempts.`
        );
    }, [loading, loadError, results.length, history.length]);

    document.title = `${firstName}'s Assessment Profile | Med Pro Assessments`;

    return (
        <div className="container-fluid d-flex flex-sm-row">
            <Sidebar />
            <div className="main-content">
                <BaseHeader />
                <div className="p-4 space-y-6">
                    <div
                        className="visually-hidden"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        {ariaStatusMessage}
                    </div>

                    {loadError && (
                        <div
                            className="alert alert-danger d-flex justify-content-between align-items-center"
                            role="alert"
                        >
                            <span>{loadError}</span>
                            <button
                                className="btn btn-sm btn-outline-danger"
                                aria-label="Retry loading assessment results"
                                onClick={fetchResults}
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    <h1 className="text-2xl font-bold mb-4">
                        {firstName}'s Assessment Results
                    </h1>

                    <section aria-labelledby="current-results-heading">
                        <h2 id="current-results-heading" className="h4 mb-3">
                            Current Results
                        </h2>
                        <div className="row">
                            {loading ? (
                                <p>Loading assessment results...</p>
                            ) : results.length > 0 ? (
                                results.map((result, index) => (
                                    <div className="col-md-4 mb-4" key={index}>
                                        <div className="card shadow h-100">
                                            <div className="card-body">
                                                <h3 className="h5 card-title">
                                                    Level {result.level} -{' '}
                                                    {result.level === '1'
                                                        ? 'Soft Skills'
                                                        : result.level === '2'
                                                          ? 'Teamwork'
                                                          : 'Ethics'}
                                                </h3>
                                                <p className="card-text">
                                                    <strong>Score:</strong>{' '}
                                                    {result.score}%
                                                </p>
                                                {result.date && (
                                                    <p className="card-text">
                                                        <strong>Date:</strong>{' '}
                                                        {new Date(
                                                            result.date
                                                        ).toLocaleString()}
                                                    </p>
                                                )}
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
                                                        <strong>
                                                            Feedback:
                                                        </strong>{' '}
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
                    </section>

                    <section
                        aria-labelledby="previous-attempts-heading"
                        className="mt-5"
                    >
                        <h2
                            id="previous-attempts-heading"
                            className="text-xl font-bold mb-3"
                        >
                            Previous Quiz Attempts
                        </h2>
                        {loading ? (
                            <p>Loading quiz history...</p>
                        ) : history.length > 0 ? (
                            history.map((attempt) => (
                                <div
                                    className="card shadow mb-4"
                                    key={attempt.assessment_id}
                                >
                                    <div className="card-body">
                                        <h3 className="h5 card-title mb-2">
                                            Attempt #{attempt.assessment_id}
                                        </h3>
                                        <p className="card-text mb-3">
                                            <strong>Started:</strong>{' '}
                                            {new Date(
                                                attempt.started_at
                                            ).toLocaleString()}
                                            <br />
                                            <strong>Completed:</strong>{' '}
                                            {attempt.completed_at
                                                ? new Date(
                                                      attempt.completed_at
                                                  ).toLocaleString()
                                                : 'In Progress'}
                                        </p>

                                        <div className="row mb-3">
                                            {attempt.level_results?.map(
                                                (levelResult, index) => (
                                                    <div
                                                        className="col-md-4 mb-3"
                                                        key={`${attempt.assessment_id}-${levelResult.level}-${index}`}
                                                    >
                                                        <div className="border rounded p-3 h-100">
                                                            <h6>
                                                                Level{' '}
                                                                {
                                                                    levelResult.level
                                                                }
                                                            </h6>
                                                            <p className="mb-1">
                                                                <strong>
                                                                    Score:
                                                                </strong>{' '}
                                                                {
                                                                    levelResult.score
                                                                }
                                                                %
                                                            </p>
                                                            <p className="mb-1">
                                                                <strong>
                                                                    Status:
                                                                </strong>{' '}
                                                                {levelResult.passed
                                                                    ? 'Passed'
                                                                    : 'Failed'}
                                                            </p>
                                                            {levelResult.date && (
                                                                <p className="mb-0">
                                                                    <strong>
                                                                        Date:
                                                                    </strong>{' '}
                                                                    {new Date(
                                                                        levelResult.date
                                                                    ).toLocaleString()}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>

                                        <details>
                                            <summary
                                                aria-label={`Review questions and answers for attempt ${attempt.assessment_id}`}
                                            >
                                                Review Questions & Answers
                                            </summary>
                                            <div className="mt-3">
                                                {attempt.question_review
                                                    ?.length > 0 ? (
                                                    attempt.question_review.map(
                                                        (item) => (
                                                            <div
                                                                className="border rounded p-3 mb-2"
                                                                key={`${attempt.assessment_id}-${item.question_id}`}
                                                            >
                                                                <p className="mb-1">
                                                                    <strong>
                                                                        Level{' '}
                                                                        {
                                                                            item.level
                                                                        }
                                                                    </strong>{' '}
                                                                    -{' '}
                                                                    {
                                                                        item.question
                                                                    }
                                                                </p>
                                                                <p className="mb-1">
                                                                    <strong>
                                                                        Your
                                                                        Answer:
                                                                    </strong>{' '}
                                                                    {item.selected_answer ||
                                                                        'N/A'}
                                                                </p>
                                                                <p className="mb-1">
                                                                    <strong>
                                                                        Correct
                                                                        Answer:
                                                                    </strong>{' '}
                                                                    {item.correct_answer ||
                                                                        'N/A'}
                                                                </p>
                                                                <p className="mb-0">
                                                                    <strong>
                                                                        Result:
                                                                    </strong>{' '}
                                                                    {item.is_correct
                                                                        ? 'Correct'
                                                                        : 'Incorrect'}
                                                                </p>
                                                            </div>
                                                        )
                                                    )
                                                ) : (
                                                    <p>
                                                        No question review data
                                                        available.
                                                    </p>
                                                )}
                                            </div>
                                        </details>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No previous quiz attempts available.</p>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
