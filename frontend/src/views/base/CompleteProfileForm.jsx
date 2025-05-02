import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAxios from '../../utils/useAxios';
import Sidebar from '../partials/Sidebar';
import BaseHeader from '../partials/BaseHeader';
import { useAuthStore } from '../../store/auth';

function CompleteProfileForm() {
    const axiosInstance = useAxios;
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.allUserData); // ✅ this gives you the real decoded token data

    const [formData, setFormData] = useState(() => ({
        image: user?.image || '', // this now grabs it correctly on first render
        full_name: user?.full_name || '', // this now grabs it correctly on first render
        age: user?.age || '',
        weight: user?.weight || '',
        occupation: user?.occupation || '',
        phone_number: user?.phone_number || '',
        emergency_contact: user?.emergency_contact || '',
        emergency_contact_name: user?.emergency_contact_name || '',
        address: user?.address || '',
        medical_history: user?.medical_history || '',
        status: user?.status || ''
    }));

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();

        // Append basic fields
        for (const key in formData) {
            if (key !== 'image') {
                data.append(key, formData[key]);
            }
        }

        if (
            formData.image instanceof File ||
            (formData.image && formData.image[0] instanceof File)
        ) {
            data.append(
                'image',
                formData.image instanceof File
                    ? formData.image
                    : formData.image[0]
            );
        }

        try {
            const res = await axiosInstance.put('/user/profile/', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('✅ Profile updated!', res.data);
            navigate('/profile'); // or wherever you'd like to redirect
        } catch (err) {
            console.error(
                '❌ Error submitting profile:',
                err.response?.data || err.message
            );
        }
    };

    document.title = 'Complete Profile | Med Pro Assesments';

    return (
        <div className="container-fluid d-flex flex-sm-row">
            <Sidebar />
            <div className="main-content">
                <BaseHeader />
                <section className="container d-flex flex-column vh-100">
                    <h2>Complete Your Profile</h2>
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        <div className="mb-3">
                            <label className="form-label">
                                <strong>Profile Image;</strong>
                            </label>
                            <input
                                type="file"
                                name="image"
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">
                                <strong>Full Name:</strong>
                            </label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                className="form-control"
                                readOnly // 👈 optional
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">
                                <strong>Age:</strong>
                            </label>
                            <input
                                type="number"
                                name="age"
                                placeholder="Age"
                                value={formData.age}
                                onChange={handleChange}
                                onWheel={(e) => e.target.blur()}
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">
                                <strong>Weight:</strong>
                            </label>
                            <input
                                type="number"
                                name="weight"
                                placeholder="Weight (lbs)"
                                value={formData.weight}
                                onChange={handleChange}
                                onWheel={(e) => e.target.blur()}
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">
                                <strong>Occupation:</strong>
                            </label>
                            <input
                                type="text"
                                name="occupation"
                                placeholder="Occupation"
                                value={formData.occupation}
                                onChange={handleChange}
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">
                                <strong>Phone Number:</strong>
                            </label>
                            <input
                                type="text"
                                name="phone_number"
                                placeholder="Phone Number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">
                                <strong>Emergency Contact Name:</strong>
                            </label>
                            <input
                                type="text"
                                name="emergency_contact_name"
                                placeholder="Emergency Contact Name"
                                value={formData.emergency_contact_name}
                                onChange={handleChange}
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">
                                <strong>Emergency Contact Phone:</strong>
                            </label>
                            <input
                                type="text"
                                name="emergency_contact"
                                placeholder="Emergency Contact Phone"
                                value={formData.emergency_contact}
                                onChange={handleChange}
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">
                                <strong>Address:</strong>
                            </label>
                            <textarea
                                name="address"
                                placeholder="Address"
                                value={formData.address}
                                onChange={handleChange}
                                className="form-control"
                                required
                            ></textarea>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">
                                <strong>Medical History:</strong>
                            </label>
                            <textarea
                                name="medical_history"
                                placeholder="Medical History"
                                value={formData.medical_history}
                                onChange={handleChange}
                                className="form-control"
                                required
                            ></textarea>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">
                                <strong>Current Status:</strong>
                            </label>
                            <textarea
                                name="status"
                                placeholder="Current Status"
                                value={formData.status}
                                onChange={handleChange}
                                className="form-control"
                                required
                            ></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary">
                            Save Profile
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}

export default CompleteProfileForm;
