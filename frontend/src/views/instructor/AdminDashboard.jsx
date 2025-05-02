import React, { useEffect, useState } from 'react';
import useAxios from '../../utils/useAxios';
import Sidebar from '../partials/Sidebar';
import BaseHeader from '../partials/BaseHeader';

const AdminDashboard = () => {
    const axiosInstance = useAxios;
    const [profiles, setProfiles] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);

    const handleImageClick = (imageSrc) => {
        setPreviewImage(imageSrc); // Set the clicked image as the preview
    };

    const closePreview = () => {
        setPreviewImage(null); // Close the preview
    };

    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const res = await axiosInstance.get('/admin/all-profiles/');
                setProfiles(res.data);
                console.log(
                    'Daily Logs:',
                    res.data[0].weekly_logs[0].daily_logs
                );
            } catch (err) {
                console.error('❌ Failed to load profiles:', err);
            }
        };
        fetchProfiles();
    }, []);

    document.title = 'Admin Dashboard | Med Pro Assessments';

    return (
        <div className="container-fluid d-flex flex-sm-row">
            <Sidebar />
            <div className="main-content">
                <BaseHeader />
                <div>
                    <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
                    {profiles.map((profile) => (
                        <div
                            key={profile.id}
                            className="mb-8 border p-4 rounded shadow"
                        >
                            <h2 className="admin-name text-xl font-semibold text-center">
                                {profile.full_name}
                            </h2>
                            <p className="text-center">
                                <strong>Age:</strong> {profile.age} |{' '}
                                <strong>Weight:</strong> {profile.weight} lbs |{' '}
                                <strong>Occupation:</strong>{' '}
                                {profile.occupation} |{' '}
                            </p>

                            {profile.weekly_logs.map((week) => (
                                <div
                                    key={week.id}
                                    className="ml-4 mt-4 p-3 bg-gray-100 rounded"
                                >
                                    <h3 className="font-medium text-center">
                                        Week {week.week_number}
                                    </h3>
                                    <p className="text-center">
                                        <strong>Biceps:</strong> {week.biceps} |{' '}
                                        <strong>Chest:</strong> {week.chest} |{' '}
                                        <strong>Waist:</strong> {week.waist} |{' '}
                                        <strong>Hips:</strong> {week.hips} |{' '}
                                        <strong>Thighs:</strong> {week.thighs}{' '}
                                        |{' '}
                                    </p>
                                    {week.progress_picture && (
                                        <div className="mt-2 align-items-center dashboard-progress">
                                            <div className="picture">
                                                <h4 className="text-sm font-semibold">
                                                    <span>
                                                        Progress Picture:
                                                    </span>
                                                </h4>
                                                <img
                                                    src={`http://localhost:8000${week.progress_picture}`}
                                                    alt={`Week ${week.week_number} progress`}
                                                    className="progress-picture card-content rounded shadow mb-2"
                                                    width={200}
                                                    height={250}
                                                    onClick={() =>
                                                        handleImageClick(
                                                            `http://localhost:8000${week.progress_picture}`
                                                        )
                                                    }
                                                />
                                            </div>
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

                                    <div className="border border-3 p-3 rounded">
                                        <h4 className="text-lg font-semibold mb-2 text-center">
                                            Daily Logs
                                        </h4>
                                        <div className="d-flex flex-wrap gap-3">
                                            {week.daily_logs.map((day) => (
                                                <div
                                                    key={day.id}
                                                    className="card border rounded shadow-sm p-3"
                                                    style={{ width: '18rem' }}
                                                >
                                                    <h5 className="card-title text-center">
                                                        {day.day}
                                                    </h5>
                                                    <p className="card-text">
                                                        <strong>
                                                            Workout:
                                                        </strong>{' '}
                                                        {day.workout ||
                                                            'No Workout'}
                                                    </p>
                                                    <p className="card-text">
                                                        <strong>
                                                            Duration:
                                                        </strong>{' '}
                                                        {day.duration ||
                                                            'No duration'}
                                                    </p>
                                                    <p className="card-text">
                                                        <strong>Notes:</strong>{' '}
                                                        {day.notes ||
                                                            'No Notes'}
                                                    </p>
                                                    <p className="card-text">
                                                        <strong>
                                                            Breakfast:
                                                        </strong>{' '}
                                                        {day.breakfast || 'N/A'}
                                                    </p>
                                                    <p className="card-text">
                                                        <strong>Lunch:</strong>{' '}
                                                        {day.lunch || 'N/A'}
                                                    </p>
                                                    <p className="card-text">
                                                        <strong>Dinner:</strong>{' '}
                                                        {day.dinner || 'N/A'}
                                                    </p>
                                                    <p className="card-text">
                                                        <strong>
                                                            Snack 1:
                                                        </strong>{' '}
                                                        {day.snack1 || 'N/A'}
                                                    </p>
                                                    <p className="card-text">
                                                        <strong>
                                                            Snack 2:
                                                        </strong>{' '}
                                                        {day.snack2 || 'N/A'}
                                                    </p>
                                                    <p className="card-text">
                                                        <strong>
                                                            Water Intake:
                                                        </strong>{' '}
                                                        {day.water_intake_oz
                                                            ? `${day.water_intake_oz} oz`
                                                            : 'N/A'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
