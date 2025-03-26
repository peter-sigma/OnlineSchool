import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Navbar from './Navbar';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }
    
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get('http://127.0.0.1:8000/api/courses/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(response.data);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }
    };

    const fetchEnrolledCourses = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get('http://127.0.0.1:8000/api/enrollments/my_courses/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEnrolledCourses(response.data.map((course) => course.id));
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
      }
    };

    fetchCourses();
    
    // If the user is a student, fetch enrolled courses.
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.role === 'student') {
          fetchEnrolledCourses();
        }
      } catch (error) {
        console.error('Failed to decode token for enrolled courses:', error);
      }
    }
  }, []);

  const enrollInCourse = async (courseId) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        'http://127.0.0.1:8000/api/enrollments/',
        { course: courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh enrolled courses after enrollment
      const response = await axios.get('http://127.0.0.1:8000/api/enrollments/my_courses/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEnrolledCourses(response.data.map((course) => course.id));
      alert('Enrolled successfully!');
    } catch (error) {
      console.error('Enrollment failed:', error);
      alert(error.response?.data?.error || 'Enrollment failed.');
    }
  };

  return (
    <> 
      <Navbar />
      <div className="container mt-5">
      <h2>Courses</h2>
      
      {/* Create button for instructors and admins */}
      {(userRole === 'instructor' || userRole === 'admin') && (
        <div className="mb-3">
          <Link to="/create-course" className="btn btn-success">
            Create New Course
          </Link>
        </div>
      )}
      
      <div className="row">
        {courses.map((course) => (
          <div key={course.id} className="col-md-4 mb-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{course.title}</h5>
                <p className="card-text">{course.description}</p>
                <Link to={`/courses/${course.id}`} className="btn btn-primary me-2">
                  View Course
                </Link>
                {userRole === 'student' && (
                  enrolledCourses.includes(course.id) ? (
                    <span className="badge bg-success">Enrolled</span>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => enrollInCourse(course.id)}
                    >
                      Enroll
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
};

export default CourseList;