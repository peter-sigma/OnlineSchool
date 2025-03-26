import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import CourseList from './components/CourseList';
import CourseDetail from './components/CourseDetail';
import CreateCourse from './components/CreateCourse';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  const isAuthenticated = () => !!localStorage.getItem('access_token');

  const PrivateRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/courses" element={<PrivateRoute><CourseList /></PrivateRoute>} />
        <Route path="/courses/:id" element={<PrivateRoute><CourseDetail /></PrivateRoute>} />
        <Route path="/create-course" element={<PrivateRoute><CreateCourse /></PrivateRoute>} /> {/* Add this route. */}
        <Route path="/" element={<Navigate to="/courses" />} />
      </Routes>
    </Router>
  );
};

export default App;