import React from 'react';
import { Navigate, Route, Routes } from 'react-router';
import PropTypes from 'prop-types';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import { useAuthStore } from './store/authStore';


function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/" />;
}
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};


const App = () => {
  return (
    <Routes>
      
   

      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
 
    </Routes>
  );
};

export default App;