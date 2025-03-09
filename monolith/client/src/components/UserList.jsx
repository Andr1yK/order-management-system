import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Spinner, Pagination, Alert } from 'react-bootstrap';
import { getUsers, deleteUser } from '../api/users';
import { toast } from 'react-toastify';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0
  });

  // Load users on component mount and when pagination changes
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit]);

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getUsers(pagination.page, pagination.limit);
      setUsers(response.data.data);
      setPagination({
        ...pagination,
        totalItems: response.data.pagination.totalItems,
        totalPages: response.data.pagination.totalPages
      });
    } catch (error) {
      setError('Failed to load users. Please try again.');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle user deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
        toast.success('User deleted successfully');
        fetchUsers(); // Refresh the list
      } catch (error) {
        toast.error('Failed to delete user');
        console.error('Error deleting user:', error);
      }
    }
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setPagination({
      ...pagination,
      page
    });
  };

  // Render pagination controls
  const renderPagination = () => {
    const { page, totalPages } = pagination;

    if (totalPages <= 1) return null;

    let items = [];

    // Previous button
    items.push(
      <Pagination.Prev
        key="prev"
        disabled={page === 1}
        onClick={() => handlePageChange(page - 1)}
      />
    );

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - 1 && i <= page + 1)
      ) {
        items.push(
          <Pagination.Item
            key={i}
            active={i === page}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </Pagination.Item>
        );
      } else if (i === page - 2 || i === page + 2) {
        items.push(<Pagination.Ellipsis key={`ellipsis-${i}`} />);
      }
    }

    // Next button
    items.push(
      <Pagination.Next
        key="next"
        disabled={page === totalPages}
        onClick={() => handlePageChange(page + 1)}
      />
    );

    return <Pagination>{items}</Pagination>;
  };

  if (loading && users.length === 0) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div className="user-list">
      <div className="d-flex justify-content-end mb-3">
        <Button
          as={Link}
          to="/users/new"
          variant="success"
        >
          Add New User
        </Button>
      </div>

      {users.length > 0 ? (
        <>
          <Table striped bordered hover responsive>
            <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone || 'N/A'}</td>
                <td>{user.role}</td>
                <td>
                  <Button
                    as={Link}
                    to={`/users/${user.id}`}
                    variant="info"
                    size="sm"
                    className="me-2"
                  >
                    View
                  </Button>
                  <Button
                    as={Link}
                    to={`/users/${user.id}/edit`}
                    variant="warning"
                    size="sm"
                    className="me-2"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            </tbody>
          </Table>

          <div className="d-flex justify-content-center">
            {renderPagination()}
          </div>
        </>
      ) : (
        <Alert variant="info">No users found.</Alert>
      )}
    </div>
  );
};

export default UserList;
