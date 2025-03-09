import React, {useState, useEffect, useCallback} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Spinner, Badge, Table, Alert, Row, Col } from 'react-bootstrap';
import { getOrderById, createOrder, updateOrderStatus, deleteOrder } from '../api/orders';
import { toast } from 'react-toastify';
import OrderForm from '../components/OrderForm';
import { useAuth } from '../context/AuthContext';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = id === 'new';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(isNew);

  // Initialize default form values for new order
  const initialValues = {
    user_id: user?.id || '',
    status: 'pending',
    items: [
      {
        product_name: '',
        quantity: 1,
        price: ''
      }
    ]
  };

  // Load order data on component mount if viewing existing order
  useEffect(() => {
    if (!isNew) {
      fetchOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Fetch order data from API
  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getOrderById(id);
      setOrder(response.data.data.order);
    } catch (error) {
      setError('Failed to load order data. Please try again.');
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    setError('');

    try {
      if (isNew) {
        await createOrder(values);
        toast.success('Order created successfully');
        navigate('/orders');
      } else {
        await updateOrderStatus(id, values.status);
        toast.success('Order status updated successfully');
        setIsEditing(false);
        fetchOrder(); // Refresh the data
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save order. Please try again.');
      console.error('Error saving order:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete button click
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrder(id);
        toast.success('Order deleted successfully');
        navigate('/orders');
      } catch (error) {
        toast.error('Failed to delete order');
        console.error('Error deleting order:', error);
      }
    }
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
    <div className="order-detail">
      <h1 className="mb-4">{isNew ? 'Create New Order' : `Order #${id}`}</h1>

      {isEditing || isNew ? (
        <OrderForm
          initialValues={isNew ? initialValues : {
            user_id: order.user_id,
            status: order.status,
            items: order.items
          }}
          onSubmit={handleSubmit}
          error={error}
        />
      ) : (
        <Card>
          <Card.Body>
            <Row className="mb-4">
              <Col md={6}>
                <h5>Order Information</h5>
                <p>
                  <strong>Order ID:</strong> {order.id}<br />
                  <strong>Date:</strong> {new Date(order.created_at).toLocaleString()}<br />
                  <strong>Status:</strong>{' '}
                  <Badge bg={getStatusBadge(order.status)}>
                    {order.status}
                  </Badge><br />
                  <strong>Total Amount:</strong> ${parseFloat(order.total_amount).toFixed(2)}
                </p>
              </Col>

              <Col md={6}>
                <h5>Customer Information</h5>
                <p>
                  <strong>Name:</strong> {order.user_name}<br />
                  <strong>Email:</strong> {order.user_email}<br />
                </p>
              </Col>
            </Row>

            <h5>Order Items</h5>
            <Table striped bordered hover responsive>
              <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
              </thead>
              <tbody>
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.product_name}</td>
                  <td>{item.quantity}</td>
                  <td>${parseFloat(item.price).toFixed(2)}</td>
                  <td>${parseFloat(item.total).toFixed(2)}</td>
                </tr>
              ))}
              </tbody>
              <tfoot>
              <tr>
                <th colSpan="3" className="text-end">Total:</th>
                <th>${parseFloat(order.total_amount).toFixed(2)}</th>
              </tr>
              </tfoot>
            </Table>

            <div className="mt-3 d-flex">
              <Button
                variant="warning"
                onClick={() => setIsEditing(true)}
                className="me-2"
              >
                Update Status
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
                onClick={() => navigate('/orders')}
              >
                Back to Orders
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default OrderDetail;
