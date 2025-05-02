import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookie from 'js-cookie';
import { logout } from '../../utils/auth';
import { useAuthStore } from '../../store/auth';
import ATFLogo from '../../assets/med_pro logo.png'; // Adjust this path if needed

function BaseHeader() {
    const navigate = useNavigate();
    const isAuthenticated = !!Cookie.get('access_token');
    const user = useAuthStore((state) => state.allUserData); // ✅ this gives you the real decoded token data

    const handleLogout = () => {
        logout();
        useAuthStore.getState().setUser(null);
        navigate('/logout/');
    };

    return (
        <header className="top-bar d-flex justify-content-between align-items-center px-4 py-2 shadow-sm">
            <h4 className="logo m-0">
                <a href="/">
                    <img
                        src={ATFLogo}
                        alt="ATF Logo"
                        className="sidebar-logo"
                        width={75}
                    />
                </a>
            </h4>
            <div className="auth-links">
                {isAuthenticated ? (
                    <>
                        <span className="me-3">
                            Hello, {user?.full_name || user?.email}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="btn btn-primary me-2"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="btn btn-white me-2">
                            Login
                        </Link>
                        <Link to="/register" className="btn btn-primary">
                            Register
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
}

export default BaseHeader;
