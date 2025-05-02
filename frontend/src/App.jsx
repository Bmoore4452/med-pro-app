import { Route, Routes, BrowserRouter } from 'react-router-dom';
import MainWrapper from './layouts/MainWrapper';
import PrivateRoute from './layouts/PrivateRoute';

import Register from '../src/views/auth/Register';
import Login from '../src/views/auth/Login';
import Logout from './views/auth/Logout';
import ForgotPassword from './views/auth/ForgotPassword';
import CreateNewPassword from './views/auth/CreateNewPassword';
import Index from '../src/views/base/Index';
import AssessmentInterface from './views/assessment/AssessmentInterface';
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
                        path="/assessment"
                        element={<AssessmentInterface />}
                    />
                </Routes>
            </MainWrapper>
        </BrowserRouter>
    );
}

export default App;
