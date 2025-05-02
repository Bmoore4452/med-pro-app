import React, { useEffect, useState } from 'react';
import useAxios from '../../utils/useAxios';
import Sidebar from '../../views/partials/Sidebar';
import BaseHeader from '../../views/partials/BaseHeader';

function ProfilePage() {
    const axiosInstance = useAxios;
    const [profile, setProfile] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    const handleImageClick = (imageSrc) => {
        setPreviewImage(imageSrc); // Set the clicked image as the preview
    };

    const closePreview = () => {
        setPreviewImage(null); // Close the preview
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axiosInstance.get('/user/profile/');
                setProfile(res.data);
            } catch (err) {
                console.error('Error fetching profile', err);
            }
        };

        fetchProfile();
    }, [axiosInstance]);

    console.log('Profile:', profile);

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(`Field: ${name}, Value: ${value}`);
        setProfile((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();

        if (profile) {
            console.log('Submitting profile:', profile);

            for (const key in profile) {
                if (
                    key !== 'image' &&
                    profile[key] !== null &&
                    profile[key] !== undefined &&
                    profile[key] !== ''
                ) {
                    let value = profile[key];
                    if (key === 'weight') {
                        value = parseFloat(value); // Convert weight to a number
                    } else if (key === 'age') {
                        value = parseInt(value, 10); // Convert age to an integer
                    }

                    data.append(key, value);
                }
            }
        }

        // Handle image (as File, not string or object)
        if (
            profile.image instanceof File ||
            (profile.image && profile.image[0] instanceof File)
        ) {
            data.append(
                'image',
                profile.image instanceof File ? profile.image : profile.image[0]
            );
        }

        setIsSaving(true);
        try {
            const res = await axiosInstance.put('/user/profile/', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('✅ Profile updated!', res.data);
            setProfile(res.data);
            setIsEditing(false);
        } catch (err) {
            console.error(
                '❌ Error submitting profile:',
                err.response?.data || err.message
            );
        } finally {
            setIsSaving(false);
        }
    };

    document.title = 'My Profile | Med Pro Assesments';

    return (
        <>
            <div className="container-fluid d-flex flex-sm-row">
                <Sidebar />
                <div className="main-content">
                    <BaseHeader />
                    <div className="content p-4">
                        <h2>My Profile</h2>
                        {!profile ? (
                            <p>Loading...</p>
                        ) : (
                            <div>
                                <img
                                    src={`http://localhost:8000${profile.image}`}
                                    alt="Profile"
                                    width={300}
                                    className="profile-picture rounded shadow mb-3"
                                    onClick={() =>
                                        handleImageClick(
                                            `http://localhost:8000/${profile.image}`
                                        )
                                    }
                                />
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

                                {isEditing ? (
                                    <>
                                        <div className="mb-3">
                                            <label
                                                htmlFor="image"
                                                className="form-label"
                                            >
                                                <strong>
                                                    Change Profile Image:
                                                </strong>
                                            </label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                id="image"
                                                name="image"
                                                accept="image/*"
                                                onChange={(e) =>
                                                    setProfile((prev) => ({
                                                        ...prev,
                                                        image: e.target.files
                                                    }))
                                                }
                                            />
                                            <label
                                                className="form-label"
                                                htmlFor="full_name"
                                            >
                                                <strong>Full Name:</strong>
                                            </label>
                                            <input
                                                type="text"
                                                id="full_name"
                                                name="full_name"
                                                value={profile.full_name}
                                                onChange={handleChange}
                                                className="form-control"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label
                                                className="form-label"
                                                htmlFor="age"
                                            >
                                                <strong>Age:</strong>
                                            </label>
                                            <input
                                                type="number"
                                                id="age"
                                                name="age"
                                                placeholder="Age"
                                                value={profile.age || ''}
                                                onWheel={(e) => e.target.blur()}
                                                onChange={handleChange}
                                                className="form-control"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label
                                                className="form-label"
                                                htmlFor="weight"
                                            >
                                                <strong>Weight:</strong>
                                            </label>
                                            <input
                                                type="number"
                                                id="weight"
                                                name="weight"
                                                value={profile.weight || ''}
                                                onWheel={(e) => e.target.blur()}
                                                onChange={handleChange}
                                                className="form-control"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label
                                                className="form-label"
                                                htmlFor="occupation"
                                            >
                                                <strong>Occupation:</strong>
                                            </label>
                                            <input
                                                type="text"
                                                id="occupation"
                                                name="occupation"
                                                value={profile.occupation}
                                                onChange={handleChange}
                                                className="form-control"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label
                                                className="form-label"
                                                htmlFor="emergency_contact_name"
                                            >
                                                <strong>
                                                    Emergency Contact Name:
                                                </strong>
                                            </label>
                                            <input
                                                type="text"
                                                id="emergency_contact_name"
                                                name="emergency_contact_name"
                                                value={
                                                    profile.emergency_contact_name
                                                }
                                                onChange={handleChange}
                                                className="form-control"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label
                                                className="form-label"
                                                htmlFor="emergency_contact"
                                            >
                                                <strong>
                                                    Emergency Contact:
                                                </strong>
                                            </label>
                                            <input
                                                type="text"
                                                id="emergency_contact"
                                                name="emergency_contact"
                                                value={
                                                    profile.emergency_contact
                                                }
                                                onChange={handleChange}
                                                className="form-control"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label
                                                className="form-label"
                                                htmlFor="phone_number"
                                            >
                                                <strong>Phone Number:</strong>
                                            </label>
                                            <input
                                                type="text"
                                                id="phone_number"
                                                name="phone_number"
                                                value={profile.phone_number}
                                                onChange={handleChange}
                                                className="form-control"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label
                                                className="form-label"
                                                htmlFor="address"
                                            >
                                                <strong>Address:</strong>
                                            </label>
                                            <textarea
                                                id="address"
                                                name="address"
                                                value={profile.address}
                                                onChange={handleChange}
                                                className="form-control"
                                            ></textarea>
                                        </div>
                                        <div className="mb-3">
                                            <label
                                                className="form-label"
                                                htmlFor="medical_history"
                                            >
                                                <strong>
                                                    Medical History:
                                                </strong>
                                            </label>
                                            <textarea
                                                id="medical_history"
                                                name="medical_history"
                                                value={profile.medical_history}
                                                onChange={handleChange}
                                                className="form-control"
                                            ></textarea>
                                        </div>

                                        <button
                                            className="btn btn-success me-2"
                                            onClick={handleSubmit}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? 'Saving...' : 'Save'}
                                        </button>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => setIsEditing(false)}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <p>
                                            <strong>Name:</strong>{' '}
                                            {profile.full_name}
                                        </p>
                                        <p>
                                            <strong>Age:</strong> {profile.age}
                                        </p>
                                        <p>
                                            <strong>Weight:</strong>{' '}
                                            {profile.weight} lbs
                                        </p>
                                        <p>
                                            <strong>Occupation:</strong>{' '}
                                            {profile.occupation}
                                        </p>
                                        <p>
                                            <strong>Emergency Contact:</strong>{' '}
                                            {profile.emergency_contact_name} (
                                            {profile.emergency_contact})
                                        </p>
                                        <p>
                                            <strong>Phone Number:</strong>{' '}
                                            {profile.phone_number}
                                        </p>
                                        <p>
                                            <strong>Address:</strong>{' '}
                                            {profile.address}
                                        </p>
                                        <p>
                                            <strong>Health History:</strong>{' '}
                                            {profile.medical_history}
                                        </p>

                                        <button
                                            className="btn btn-primary"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            Edit Profile
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default ProfilePage;
