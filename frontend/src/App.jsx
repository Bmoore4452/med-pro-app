import { Route, Routes, BrowserRouter } from 'react-router-dom';
import MainWrapper from './layouts/MainWrapper';
import PrivateRoute from './layouts/PrivateRoute';

import Register from '../src/views/auth/Register';
import Login from '../src/views/auth/Login';
import Logout from './views/auth/Logout';
import ForgotPassword from './views/auth/ForgotPassword';
import CreateNewPassword from './views/auth/CreateNewPassword';
import Index from '../src/views/base/Index';
import Dashboard from './views/student/Dashboard';
import ProfilePage from './views/student/ProfilePage';

import CompleteProfileForm from './views/base/CompleteProfileForm';
import WeeklyLogPage from './views/student/WeeklyLogPage';
import DashboardPage from './views/student/DashboardPage';
import AdminDashboard from './views/instructor/AdminDashboard';
import CommunityFeed from './views/base/CommunityFeed';

function App() {
    return (
        <BrowserRouter>
            <MainWrapper>
                {/* children will be injected here */}
                <Routes>
                    <Route path="/register/" element={<Register />} />
                    <Route path="/login/" element={<Login />} />
                    <Route path="/logout/" element={<Logout />} />
                    <Route
                        path="/forgot-password/"
                        element={<ForgotPassword />}
                    />
                    <Route
                        path="/create-new-password/"
                        element={<CreateNewPassword />}
                    />
                    <Route path="/" element={<Index />} />
                    <Route
                        path="/complete-profile"
                        element={<CompleteProfileForm />}
                    />
                    <Route
                        path="/complete-profile/:id"
                        element={<CompleteProfileForm />}
                    />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/weekly-log" element={<WeeklyLogPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/community" element={<CommunityFeed />} />
                </Routes>
            </MainWrapper>
        </BrowserRouter>
    );
}

export default App;
