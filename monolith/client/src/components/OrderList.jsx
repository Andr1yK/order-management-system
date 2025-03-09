import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Spinner, Pagination, Alert, Badge, Form, Col, Row } from 'react-bootstrap';
import { getOrders, deleteOrder, updateOrderStatus } from '../api/orders';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const OrderList = ({ userId }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    user_id: userId || ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0
  });

  // Load orders on component mount and when pagination or filters change
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, filters, userId]);

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    setError('');

    try {
      // If userId is provided, override the filter
      const currentFilters = userId ? { ...filters, user_id: userId } : filters;

      const response = await getOrders(currentFilters, pagination.page, pagination.limit);
      setOrders(response.data.data);
      setPagination({
        ...pagination,
        totalItems: response.data.pagination.totalItems,
        totalPages: response.data.pagination.totalPages
      });
    } catch (error) {
      setError('Failed to load orders. Please try again.');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle order deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrder(id);
        toast.success('Order deleted successfully');
        fetchOrders(); // Refresh the list
      } catch (error) {
        toast.error('Failed to delete order');
        console.error('Error deleting order:', error);
      }
    }
  };

  // Handle status change
  const handleStatusChange = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      toast.success('Order status updated successfully');
      fetchOrders(); // Refresh the list
    } catch (error) {
      toast.error('Failed to update order status');
      console.error('Error updating order status:', error);
    }
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });

    // Reset to first page when changing filters
    setPagination({
      ...pagination,
      page: 1
    });
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setPagination({
      ...pagination,
      page
    });
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
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

  // Show loading spinner
  if (loading && orders.length === 0) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  // Show error message
  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div className="order-list">
      {/* Filters */}
      {!userId && (
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Filter by Status</Form.Label>
              <Form.Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Form.Group>
          </Col>

          {user?.role === 'admin' && (
            <Col md={4}>
              <Form.Group>
                <Form.Label>Filter by User ID</Form.Label>
                <Form.Control
                  type="text"
                  name="user_id"
                  value={filters.user_id}
                  onChange={handleFilterChange}
                  placeholder="Enter User ID"
                />
              </Form.Group>
            </Col>
          )}
        </Row>
      )}

      <div className="d-flex justify-content-end mb-3">
        <Button
          as={Link}
          to="/orders/new"
          variant="success"
        >
          Create New Order
        </Button>
      </div>

      {orders.length > 0 ? (
        <>
          <Table striped bordered hover responsive>
            <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Status</th>
              <th>Total</th>
              <th>Items</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>
                  {order.user_name}<br/>
                  <small className="text-muted">{order.user_email}</small>
                </td>
                <td>
                  <Badge bg={getStatusBadge(order.status)}>
                    {order.status}
                  </Badge>
                </td>
                <td>${parseFloat(order.total_amount).toFixed(2)}</td>
                <td>{order.items.length} items</td>
                <td>{new Date(order.created_at).toLocaleString()}</td>
                <td>
                  <div className="d-flex flex-column gap-1">
                    <Button
                      as={Link}
                      to={`/orders/${order.id}`}
                      variant="info"
                      size="sm"
                    >
                      View
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(order.id)}
                    >
                      Delete
                    </Button>

                    {/* Status update dropdown */}
                    <Form.Select
                      size="sm"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      <option disabled>Change Status</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </Form.Select>
                  </div>
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
        <Alert variant="info">No orders found.</Alert>
      )}
    </div>
  );
};

export default OrderList;
