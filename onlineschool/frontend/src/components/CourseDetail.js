// frontend/src/components/CourseDetail.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/courses/${id}/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        });
        setCourse(response.data);
      } catch (error) {
        console.error('Failed to fetch course:', error);
      }
    };
    fetchCourse();
  }, [id]);

  const handleEnroll = async () => {
    try {
      await axios.post(
        'http://127.0.0.1:8000/api/enrollments/',
        { student: localStorage.getItem('user_id'), course: id }, // Send student and course IDs.
        { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } }
      );
      alert('Enrolled successfully!');
      navigate('/courses');
    } catch (error) {
      console.error('Failed to enroll:', error);
      alert('Failed to enroll. Please try again.');
    }
  };

  if (!course) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-5">
      <h2>{course.title}</h2>
      <p>{course.description}</p>
      <button className="btn btn-success" onClick={handleEnroll}>Enroll</button>
    </div>
  );
};

export default CourseDetail;