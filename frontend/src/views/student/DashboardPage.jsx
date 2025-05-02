import React, { useEffect, useState } from 'react';
import useAxios from '../../utils/useAxios';
import { Tabs, Tab } from 'react-bootstrap';
import { API_BASE_URL } from '../../utils/constants';
import Sidebar from '../partials/Sidebar';
import BaseHeader from '../partials/BaseHeader';
import { useAuthStore } from '../../store/auth';

const DashboardPage = () => {
    const axiosInstance = useAxios;
    const [weeklyLogs, setWeeklyLogs] = useState([]);
    const user = useAuthStore((state) => state.allUserData);
    const firstName = user?.full_name?.split(' ')[0] || 'User';
    const [previewImage, setPreviewImage] = useState(null);

    const handleImageClick = (imageSrc) => {
        setPreviewImage(imageSrc); // Set the clicked image as the preview
    };

    const closePreview = () => {
        setPreviewImage(null); // Close the preview
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axiosInstance.get('/user/profile/');
                setWeeklyLogs(res.data.weekly_logs || []);
                console.log('Weekly Logs:', res.data);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            }
        };
        fetchData();
    }, []);

    document.title = `${firstName}'s Dashboard | Med Pro Assessments`;

    return (
        <>
            <div className="container-fluid d-flex flex-sm-row">
                <Sidebar />
                <div className="main-content">
                    <BaseHeader />
                    <div className="p-4 space-y-6">
                        <h1 className="text-2xl font-bold">
                            {firstName}'s Dashboard
                        </h1>
                        <Tabs defaultActiveKey={0} id="weekly-tabs">
                            {weeklyLogs.map((week, i) => (
                                <Tab
                                    eventKey={i}
                                    title={`Week ${week.week_number}`}
                                    key={week.id}
                                >
                                    <div className="bg-white shadow rounded-xl p-4 mt-4">
                                        <h2 className="text-xl font-semibold mb-2">
                                            Measurements
                                        </h2>
                                        <p>
                                            <strong>Biceps:</strong>{' '}
                                            {week.biceps}
                                        </p>
                                        <p>
                                            <strong>Chest:</strong> {week.chest}
                                        </p>
                                        <p>
                                            <strong>Waist:</strong> {week.waist}
                                        </p>
                                        <p>
                                            <strong>Hips:</strong> {week.hips}
                                        </p>
                                        <p>
                                            <strong>Thighs:</strong>{' '}
                                            {week.thighs}
                                        </p>
                                        {week.progress_picture &&
                                            week.progress_picture.includes(
                                                '.'
                                            ) && (
                                                <div className="mt-4">
                                                    <h3 className="text-lg font-semibold">
                                                        Progress Picture
                                                    </h3>
                                                    <img
                                                        src={`http://localhost:8000${week.progress_picture}`}
                                                        alt={`Week ${week.week_number} progress`}
                                                        width={300}
                                                        className="w-30 h-30 rounded shadow"
                                                        onClick={() =>
                                                            handleImageClick(
                                                                `http://localhost:8000${week.progress_picture}`
                                                            )
                                                        }
                                                    />
                                                </div>
                                            )}
                                        {/* Modal for Full Preview */}
                                        {previewImage && (
                                            <div
                                                className="image-preview-modal"
                                                onClick={closePreview}
                                            >
                                                <img
                                                    src={previewImage}
                                                    alt="Preview"
                                                    className="full-image"
                                                />
                                            </div>
                                        )}
                                        <h2 className="text-xl font-semibold mt-4">
                                            Daily Logs
                                        </h2>
                                        {week.daily_logs &&
                                            week.daily_logs.map((log, idx) => (
                                                <div
                                                    key={idx}
                                                    className="mt-4 card p-4 mb-2 bg-gray-100 rounded shadow"
                                                >
                                                    <div className="card-body">
                                                        <div className="card-title">
                                                            <h5>
                                                                <strong>
                                                                    {log.day}:
                                                                </strong>
                                                            </h5>
                                                        </div>
                                                        <p>
                                                            Breakfast:{' '}
                                                            {log.breakfast}
                                                        </p>
                                                        <p>
                                                            Lunch: {log.lunch}
                                                        </p>
                                                        <p>
                                                            Dinner: {log.dinner}
                                                        </p>
                                                        <p>
                                                            Snack 1:{' '}
                                                            {log.snack1}
                                                        </p>
                                                        <p>
                                                            Snack 2:{' '}
                                                            {log.snack2}
                                                        </p>
                                                        <p>
                                                            Water:{' '}
                                                            {
                                                                log.water_intake_oz
                                                            }{' '}
                                                            oz
                                                        </p>
                                                        <p>
                                                            Workout:{' '}
                                                            {log.workout}
                                                        </p>
                                                        <p>
                                                            Duration:{' '}
                                                            {log.duration}
                                                        </p>
                                                        <p>
                                                            Water: {log.notes}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </Tab>
                            ))}
                        </Tabs>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardPage;
