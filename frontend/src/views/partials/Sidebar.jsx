import { useState, useEffect } from 'react';
import '../../App.css'; // Adjust this path if needed
import { Link } from 'react-router-dom';
import Cookie from 'js-cookie';
import useAxios from '../../utils/useAxios'; // Adjust this path if needed
import ATFLogo from '../../assets/med_pro logo.png'; // Adjust this path if needed

const Sidebar = () => {
    const [isSidebarClosed, setIsSidebarClosed] = useState(true);
    const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
    const [hasPaid, setHasPaid] = useState(false);
    const [isStaff, setIsStaff] = useState(false);
    const axiosInstance = useAxios;
    // const user = useAuthStore((state) => state.allUserData);

    const isAuthenticated = !!Cookie.get('access_token');

    useEffect(() => {
        const fetchUserStatus = async () => {
            try {
                const response = await axiosInstance.get('/user/profile/'); // Adjust endpoint
                const user = await axiosInstance.get('/user/');

                setHasPaid(response.data.has_paid);
                setIsStaff(user.data.is_staff);
            } catch (error) {
                console.error('Failed to fetch user status:', error);
            }
        };

        if (isAuthenticated) {
            fetchUserStatus();
        }
    }, [isAuthenticated]);

    const toggleSidebar = () => {
        setIsSidebarClosed(!isSidebarClosed);
        setIsSubmenuOpen(false);
    };

    const toggleSubmenu = () => {
        setIsSubmenuOpen(!isSubmenuOpen);
        if (isSidebarClosed) setIsSidebarClosed(false);
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
                                {hasPaid && (
                                    <li>
                                        <button
                                            onClick={toggleSubmenu}
                                            className={`dropdown-btn ${isSubmenuOpen ? 'rotate' : ''}`}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                height="24px"
                                                viewBox="0 -960 960 960"
                                                width="24px"
                                                fill="#e3e3e3"
                                            >
                                                <path d="m536-84-56-56 142-142-340-340-142 142-56-56 56-58-56-56 84-84-56-58 56-56 58 56 84-84 56 56 58-56 56 56-142 142 340 340 142-142 56 56-56 58 56 56-84 84 56 58-56 56-58-56-84 84-56-56-58 56Z" />
                                            </svg>
                                            <span>All In Fitness</span>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                height="24px"
                                                viewBox="0 -960 960 960"
                                                width="24px"
                                                fill="#e3e3e3"
                                            >
                                                <path d="M480-360 280-560h400L480-360Z" />
                                            </svg>
                                        </button>
                                        <ul
                                            className={`sub-menu ${isSubmenuOpen ? 'show' : ''}`}
                                        >
                                            <div>
                                                <li>
                                                    <Link to="/weekly-log">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="16"
                                                            height="16"
                                                            fill="currentColor"
                                                            className="bi bi-fire"
                                                            viewBox="0 0 16 16"
                                                        >
                                                            <path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16m0-1c-1.657 0-3-1-3-2.75 0-.75.25-2 1.25-3C6.125 10 7 10.5 7 10.5c-.375-1.25.5-3.25 2-3.5-.179 1-.25 2 1 3 .625.5 1 1.364 1 2.25C11 14 9.657 15 8 15" />
                                                        </svg>
                                                        <span>
                                                            Ignite & Tone
                                                        </span>
                                                    </Link>
                                                </li>
                                            </div>
                                        </ul>
                                    </li>
                                )}

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
                                {hasPaid && (
                                    <li>
                                        <Link to="/dashboard">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                height="24px"
                                                viewBox="0 -960 960 960"
                                                width="24px"
                                                fill="#e3e3e3"
                                            >
                                                <path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-155.5t86-127Q252-817 325-848.5T480-880q83 0 155.5 31.5t127 86q54.5 54.5 86 127T880-480q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480-80Zm0-240q60 0 117 17.5T704-252q46-46 71-104.5T800-480q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 65 24.5 124T256-252q50-33 107-50.5T480-320Zm0 80q-41 0-80 10t-74 30q35 20 74 30t80 10q41 0 80-10t74-30q-35-20-74-30t-80-10ZM280-520q17 0 28.5-11.5T320-560q0-17-11.5-28.5T280-600q-17 0-28.5 11.5T240-560q0 17 11.5 28.5T280-520Zm120-120q17 0 28.5-11.5T440-680q0-17-11.5-28.5T400-720q-17 0-28.5 11.5T360-680q0 17 11.5 28.5T400-640Zm280 120q17 0 28.5-11.5T720-560q0-17-11.5-28.5T680-600q-17 0-28.5 11.5T640-560q0 17 11.5 28.5T680-520ZM480-400q33 0 56.5-23.5T560-480q0-13-4-25.5T544-528l54-136q7-16 .5-31.5T576-718q-15-7-30.5-.5T524-696l-54 136q-30 5-50 27.5T400-480q0 33 23.5 56.5T480-400Zm0 80Zm0-206Zm0 286Z" />
                                            </svg>
                                            <span>Dashboard</span>
                                        </Link>
                                    </li>
                                )}
                                {isStaff && (
                                    <li>
                                        <Link to="/admin">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                height="24px"
                                                viewBox="0 -960 960 960"
                                                width="24px"
                                                fill="#e3e3e3"
                                            >
                                                <path d="M480-440q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0-80q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0 440q-139-35-229.5-159.5T160-516v-244l320-120 320 120v244q0 152-90.5 276.5T480-80Zm0-400Zm0-315-240 90v189q0 54 15 105t41 96q42-21 88-33t96-12q50 0 96 12t88 33q26-45 41-96t15-105v-189l-240-90Zm0 515q-36 0-70 8t-65 22q29 30 63 52t72 34q38-12 72-34t63-52q-31-14-65-22t-70-8Z" />
                                            </svg>
                                            <span>Admin Dashboard</span>
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
