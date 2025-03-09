import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Spinner, Row, Col, Alert, ListGroup } from 'react-bootstrap';
import { getUserById, updateUser, createUser } from '../api/users';
import { toast } from 'react-toastify';
import UserForm from '../components/UserForm';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(isNew);

  // Initialize default form values for new user
  const initialValues = {
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'customer'
  };

  // Load user data on component mount if editing existing user
  useEffect(() => {
    if (!isNew) {
      fetchUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Fetch user data from API
  const fetchUser = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getUserById(id);
      setUser(response.data.data.user);
    } catch (error) {
      setError('Failed to load user data. Please try again.');
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    setError('');

    try {
      if (isNew) {
        await createUser(values);
        toast.success('User created successfully');
        navigate('/users');
      } else {
        const { password, ...updateData } = values;
        await updateUser(id, updateData);
        toast.success('User updated successfully');
        setIsEditing(false);
        fetchUser(); // Refresh the data
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save user. Please try again.');
      console.error('Error saving user:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete button click
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await require('../api/users').deleteUser(id);
        toast.success('User deleted successfully');
        navigate('/users');
      } catch (error) {
        toast.error('Failed to delete user');
        console.error('Error deleting user:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error && !isEditing) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div className="user-detail">
      <h1 className="mb-4">{isNew ? 'Create New User' : isEditing ? 'Edit User' : 'User Details'}</h1>

      {isEditing ? (
        <UserForm
          initialValues={isNew ? initialValues : {
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            address: user.address || '',
            role: user.role,
            password: '' // Empty for editing
          }}
          isNew={isNew}
          onSubmit={handleSubmit}
          error={error}
        />
      ) : (
        <Card>
          <Card.Body>
            <Row>
              <Col md={6}>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <strong>Name:</strong> {user.name}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Email:</strong> {user.email}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Phone:</strong> {user.phone || 'N/A'}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Address:</strong> {user.address || 'N/A'}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Role:</strong> {user.role}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Created:</strong> {new Date(user.created_at).toLocaleString()}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Last Updated:</strong> {new Date(user.updated_at).toLocaleString()}
                  </ListGroup.Item>
                </ListGroup>
              </Col>
            </Row>

            <div className="mt-3 d-flex">
              <Button
                variant="primary"
                onClick={() => setIsEditing(true)}
                className="me-2"
              >
                Edit
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
              >
                Delete
              </Button>
              <Button
                variant="secondary"
                className="ms-auto"
                onClick={() => navigate('/users')}
              >
                Back to Users
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default UserDetail;
