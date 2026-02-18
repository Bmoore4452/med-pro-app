import { useState } from 'react';
import BaseHeader from '../partials/BaseHeader';
import BaseFooter from '../partials/BaseFooter';
import apiInstance from '../../utils/axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

function CreateNewPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const [searchParam] = useSearchParams();
    const otp = searchParam.get('otp');
    const uuidb64 = searchParam.get('uuidb64');
    const refresh_token = searchParam.get('refresh_token');

    const handleCreatePassword = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        } else {
            const formData = new FormData();
            formData.append('password', password);
            formData.append('otp', otp);
            formData.append('uuidb64', uuidb64);
            formData.append('refresh_token', refresh_token);

            try {
                await apiInstance
                    .post(`user/password-change/`, formData)
                    .then((res) => {
                        console.log(res.data);
                        alert(res.data.message);
                        setIsLoading(false);
                        navigate('/login/');
                    });
            } catch (error) {
                console.log(error);
                setIsLoading(false);
            }
        }

        console.log('Password Created');
    };

    return (
        <>
            <BaseHeader />

            <section
                className="container d-flex flex-column vh-100"
                style={{ marginTop: '150px' }}
            >
                <div className="row align-items-center justify-content-center g-0 h-lg-100 py-8">
                    <div className="col-lg-5 col-md-8 py-8 py-xl-0">
                        <div className="card shadow">
                            <div className="card-body p-6">
                                <div className="mb-4">
                                    <h1 className="mb-1 fw-bold">
                                        Create New Password
                                    </h1>
                                    <span>
                                        Choose a new password for your account
                                    </span>
                                </div>
                                <form
                                    className="needs-validation"
                                    noValidate=""
                                    onSubmit={handleCreatePassword}
                                >
                                    <div className="mb-3">
                                        <label
                                            htmlFor="password"
                                            className="form-label"
                                        >
                                            Enter New Password
                                        </label>
                                        <input
                                            type="password"
                                            id="password"
                                            className="form-control"
                                            name="password"
                                            placeholder="**************"
                                            required=""
                                            onChange={(event) =>
                                                setPassword(event.target.value)
                                            }
                                        />
                                        <div className="invalid-feedback">
                                            Please enter valid password.
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label
                                            htmlFor="password"
                                            className="form-label"
                                        >
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            id="password"
                                            className="form-control"
                                            name="password"
                                            placeholder="**************"
                                            required=""
                                            onChange={(event) =>
                                                setConfirmPassword(
                                                    event.target.value
                                                )
                                            }
                                        />
                                        <div className="invalid-feedback">
                                            Please enter valid password.
                                        </div>
                                    </div>

                                    <div>
                                        <div className="d-grid">
                                            {isLoading === true && (
                                                <button
                                                    disabled
                                                    type="submit"
                                                    className="btn btn-primary"
                                                >
                                                    Processing{' '}
                                                    <i className="fas fa-spinner fa-spin"></i>
                                                </button>
                                            )}
                                            {isLoading === false && (
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary"
                                                >
                                                    Save New Password{' '}
                                                    <i className="fas fa-check-circle"></i>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <BaseFooter />
        </>
    );
}

export default CreateNewPassword;
