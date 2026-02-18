import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from '../partials/Sidebar';
import BaseHeader from '../partials/BaseHeader';
import useAxios from '../../utils/useAxios';

const StaffDashboardPage = () => {
    const axios = useAxios;
    const [loading, setLoading] = useState(true);
    const [viewer, setViewer] = useState(null);
    const [error, setError] = useState(null);
    const [telemetrySummary, setTelemetrySummary] = useState(null);

    const fetchDashboard = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const userRes = await axios.get('/user/');
            setViewer(userRes.data || null);

            if (!userRes.data?.is_staff) {
                setTelemetrySummary(null);
                return;
            }

            const telemetryRes = await axios.get(
                '/assessment/telemetry-summary/'
            );
            setTelemetrySummary(telemetryRes.data || null);
        } catch (loadError) {
            console.error('Failed to load staff dashboard:', loadError);
            setError('Unable to load staff dashboard data right now.');
        } finally {
            setLoading(false);
        }
    }, [axios]);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    if (!loading && viewer && !viewer.is_staff) {
        return <Navigate to="/profile" replace />;
    }

    return (
        <div className="container-fluid d-flex flex-sm-row">
            <Sidebar />
            <div className="main-content">
                <BaseHeader />
                <div className="p-4">
                    <div className="d-flex align-items-center gap-2 mb-4">
                        <h1 className="h3 mb-0">Staff Dashboard</h1>
                        <span className="badge bg-secondary">Staff only</span>
                    </div>

                    {loading && <p>Loading staff dashboard...</p>}

                    {error && (
                        <div
                            className="alert alert-danger d-flex justify-content-between align-items-center"
                            role="alert"
                        >
                            <span>{error}</span>
                            <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={fetchDashboard}
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {!loading && viewer?.is_staff && telemetrySummary && (
                        <>
                            <div className="row mb-3">
                                <div className="col-md-3 mb-3">
                                    <div className="card shadow h-100">
                                        <div className="card-body">
                                            <p className="mb-1 text-muted">
                                                Total Events
                                            </p>
                                            <h2 className="h5 mb-0">
                                                {telemetrySummary.total_events}
                                            </h2>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <div className="card shadow h-100">
                                        <div className="card-body">
                                            <p className="mb-1 text-muted">
                                                Distinct Users
                                            </p>
                                            <h2 className="h5 mb-0">
                                                {
                                                    telemetrySummary.distinct_users
                                                }
                                            </h2>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <div className="card shadow h-100">
                                        <div className="card-body">
                                            <p className="mb-1 text-muted">
                                                Start Rate
                                            </p>
                                            <h2 className="h5 mb-0">
                                                {telemetrySummary.funnel
                                                    ?.start_rate_from_ready ??
                                                    'N/A'}
                                                {telemetrySummary.funnel
                                                    ?.start_rate_from_ready !==
                                                null
                                                    ? '%'
                                                    : ''}
                                            </h2>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <div className="card shadow h-100">
                                        <div className="card-body">
                                            <p className="mb-1 text-muted">
                                                Completion Rate
                                            </p>
                                            <h2 className="h5 mb-0">
                                                {telemetrySummary.funnel
                                                    ?.completion_rate_from_start ??
                                                    'N/A'}
                                                {telemetrySummary.funnel
                                                    ?.completion_rate_from_start !==
                                                null
                                                    ? '%'
                                                    : ''}
                                            </h2>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <div className="card shadow h-100">
                                        <div className="card-body">
                                            <h3 className="h6 mb-3">
                                                Drop-off Signals
                                            </h3>
                                            <p className="mb-1">
                                                <strong>
                                                    Failed Attempts:
                                                </strong>{' '}
                                                {telemetrySummary.dropoff
                                                    ?.failed || 0}
                                            </p>
                                            <p className="mb-1">
                                                <strong>Timed Out:</strong>{' '}
                                                {telemetrySummary.dropoff
                                                    ?.timed_out || 0}
                                            </p>
                                            <p className="mb-1">
                                                <strong>Exit Confirmed:</strong>{' '}
                                                {telemetrySummary.dropoff
                                                    ?.exit_confirmed || 0}
                                            </p>
                                            <p className="mb-0">
                                                <strong>
                                                    Exit Confirm Rate:
                                                </strong>{' '}
                                                {telemetrySummary.dropoff
                                                    ?.exit_confirm_rate ??
                                                    'N/A'}
                                                {telemetrySummary.dropoff
                                                    ?.exit_confirm_rate !== null
                                                    ? '%'
                                                    : ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <div className="card shadow h-100">
                                        <div className="card-body">
                                            <h3 className="h6 mb-3">
                                                Top Events
                                            </h3>
                                            {telemetrySummary.top_events
                                                ?.length > 0 ? (
                                                <ul className="mb-0">
                                                    {telemetrySummary.top_events.map(
                                                        (item) => (
                                                            <li
                                                                key={
                                                                    item.event_type
                                                                }
                                                            >
                                                                {
                                                                    item.event_type
                                                                }
                                                                : {item.count}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            ) : (
                                                <p className="mb-0">
                                                    No telemetry events captured
                                                    yet.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffDashboardPage;
