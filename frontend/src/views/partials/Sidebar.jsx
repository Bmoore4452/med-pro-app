import { useEffect, useState } from 'react';
import '../../App.css'; // Adjust this path if needed
import { Link } from 'react-router-dom';
import Cookie from 'js-cookie';
import ATFLogo from '../../assets/med_pro logo.png'; // Adjust this path if needed
import useAxios from '../../utils/useAxios';

const Sidebar = () => {
    const axios = useAxios;
    const [isSidebarClosed, setIsSidebarClosed] = useState(true);
    const [isStaff, setIsStaff] = useState(false);

    const isAuthenticated = !!Cookie.get('access_token');

    useEffect(() => {
        if (!isAuthenticated) {
            setIsStaff(false);
            return;
        }

        const loadUser = async () => {
            try {
                const res = await axios.get('/user/');
                setIsStaff(Boolean(res.data?.is_staff));
            } catch (error) {
                console.error('Unable to load user role for sidebar:', error);
                setIsStaff(false);
            }
        };

        loadUser();
    }, [isAuthenticated, axios]);

    const toggleSidebar = () => {
        setIsSidebarClosed(!isSidebarClosed);
    };

    return (
        <>
            <aside
                className={`sidebar ${isSidebarClosed ? 'close' : ''}`}
                id="sidebar"
            >
                <nav>
                    <ul>
                        {!isAuthenticated ? (
                            <>
                                <li>
                                    <span className="logo">
                                        <img
                                            src={ATFLogo}
                                            alt="ATF Logo"
                                            className="sidebar-logo"
                                            width={75}
                                        />
                                    </span>
                                    <button
                                        onClick={toggleSidebar}
                                        id="toggle-btn"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            height="24px"
                                            viewBox="0 -960 960 960"
                                            width="24px"
                                            fill="#e3e3e3"
                                        >
                                            <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
                                        </svg>
                                    </button>
                                </li>

                                <li className="active">
                                    <Link to="/">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            height="24px"
                                            viewBox="0 -960 960 960"
                                            width="24px"
                                            fill="#e3e3e3"
                                        >
                                            <path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Z" />
                                        </svg>
                                        <span>Home</span>
                                    </Link>
                                </li>
                                <li className="active">
                                    <Link to="/about-us">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            height="24px"
                                            viewBox="0 -960 960 960"
                                            width="24px"
                                            fill="#e3e3e3"
                                        >
                                            <path d="M480-400q33 0 56.5-23.5T560-480q0-33-23.5-56.5T480-560q-33 0-56.5 23.5T400-480q0 33 23.5 56.5T480-400ZM320-240h320v-23q0-24-13-44t-36-30q-26-11-53.5-17t-57.5-6q-30 0-57.5 6T369-337q-23 10-36 30t-13 44v23ZM720-80H240q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80Zm0-80v-446L526-800H240v640h480Zm-480 0v-640 640Z" />
                                        </svg>
                                        <span>About Us</span>
                                    </Link>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <span className="logo">
                                        <img
                                            src={ATFLogo}
                                            alt="ATF Logo"
                                            className="sidebar-logo"
                                            width={150}
                                        />
                                    </span>
                                    <button
                                        onClick={toggleSidebar}
                                        id="toggle-btn"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            height="24px"
                                            viewBox="0 -960 960 960"
                                            width="24px"
                                            fill="#e3e3e3"
                                        >
                                            <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
                                        </svg>
                                    </button>
                                </li>

                                <li>
                                    <Link to="/">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            height="24px"
                                            viewBox="0 -960 960 960"
                                            width="24px"
                                            fill="#e3e3e3"
                                        >
                                            <path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Z" />
                                        </svg>
                                        <span>Home</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/assessment">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            height="24px"
                                            viewBox="0 -960 960 960"
                                            width="24px"
                                            fill="#e3e3e3"
                                        >
                                            <path d="M520-600v-240h320v240H520ZM120-440v-400h320v400H120Zm400 320v-400h320v400H520Zm-400 0v-240h320v240H120Z" />
                                        </svg>
                                        <span>Assessment</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/about-us">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            height="24px"
                                            viewBox="0 -960 960 960"
                                            width="24px"
                                            fill="#e3e3e3"
                                        >
                                            <path d="M480-400q33 0 56.5-23.5T560-480q0-33-23.5-56.5T480-560q-33 0-56.5 23.5T400-480q0 33 23.5 56.5T480-400ZM320-240h320v-23q0-24-13-44t-36-30q-26-11-53.5-17t-57.5-6q-30 0-57.5 6T369-337q-23 10-36 30t-13 44v23ZM720-80H240q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80Zm0-80v-446L526-800H240v640h480Zm-480 0v-640 640Z" />
                                        </svg>
                                        <span>About Us</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/profile">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            height="24px"
                                            viewBox="0 -960 960 960"
                                            width="24px"
                                            fill="#e3e3e3"
                                        >
                                            <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z" />
                                        </svg>
                                        <span>Profile</span>
                                    </Link>
                                </li>
                                {isStaff && (
                                    <li>
                                        <Link to="/staff">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                height="24px"
                                                viewBox="0 -960 960 960"
                                                width="24px"
                                                fill="#e3e3e3"
                                            >
                                                <path d="M400-480q33 0 56.5-23.5T480-560q0-33-23.5-56.5T400-640q-33 0-56.5 23.5T320-560q0 33 23.5 56.5T400-480Zm0 240q139 0 243.5-91T760-560q-12-31-29.5-57T689-662l57-58q20 15 37 34t31 42q22 44 34 91t12 93q0 167-117 283.5T460-60v-101q95-11 170.5-72T740-400q-43 76-121 118t-179 42q-80 0-151.5-29T160-351v-130q0-29 15.5-53t40.5-36q54-25 90-37.5t94-12.5Zm160 180v-200h320v200H560Zm80-80h160v-40H640v40ZM120-760v-120h320v120H120Z" />
                                            </svg>
                                            <span>Staff Dashboard</span>
                                        </Link>
                                    </li>
                                )}
                            </>
                        )}
                    </ul>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
