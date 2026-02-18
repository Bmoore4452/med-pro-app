import { Route, Routes, BrowserRouter } from 'react-router-dom';
import MainWrapper from './layouts/MainWrapper';

import Register from '../src/views/auth/Register';
import Login from '../src/views/auth/Login';
import Logout from './views/auth/Logout';
import ForgotPassword from './views/auth/ForgotPassword';
import CreateNewPassword from './views/auth/CreateNewPassword';
import Index from '../src/views/base/Index';
import AssessmentInterface from './views/assessment/AssessmentInterface';
import AboutUsPage from '../src/views/base/AboutUsPage';
import ProfilePage from './views/student/ProfilePage';
import StaffDashboardPage from './views/staff/StaffDashboardPage';
function App() {
    return (
        <BrowserRouter>
            <MainWrapper>
                {/* children will be injected here */}
                <Routes>
                    <Route path="/register" element={<Register />} />
                    <Route path="/register/" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/login/" element={<Login />} />
                    <Route path="/logout" element={<Logout />} />
                    <Route path="/logout/" element={<Logout />} />
                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />
                    <Route
                        path="/forgot-password/"
                        element={<ForgotPassword />}
                    />
                    <Route
                        path="/create-new-password"
                        element={<CreateNewPassword />}
                    />
                    <Route
                        path="/create-new-password/"
                        element={<CreateNewPassword />}
                    />
                    <Route path="/" element={<Index />} />
                    <Route
                        path="/assessment"
                        element={<AssessmentInterface />}
                    />
                    <Route path="/about-us" element={<AboutUsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/staff" element={<StaffDashboardPage />} />
                </Routes>
            </MainWrapper>
        </BrowserRouter>
    );
}

export default App;
