import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateCourse = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!title.trim() || !description.trim()) {
      setError('Title and Description are required.');
      return;
    }
    
    setLoading(true);
    setError('');
    console.log('Access Token:', localStorage.getItem('access_token'));

    try {
      await axios.post(
        'http://127.0.0.1:8000/api/courses/',
        { title, description },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            
          },
        }
      );
      console.log('Course created successfully');
      navigate('/courses'); // Redirect to courses list after creation.
    } catch (error) {
      console.error('Failed to create course:', error);
      setError(error.response?.data?.detail || 'Failed to create course.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Create Course</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create Course'}
        </button>
      </form>
    </div>
  );
};

export default CreateCourse;