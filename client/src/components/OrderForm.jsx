import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Table } from 'react-bootstrap';
import { Formik, FieldArray } from 'formik';
import * as Yup from 'yup';
import { getUsers } from '../api/users';
import { useAuth } from '../context/AuthContext';

// Order form validation schema
const orderSchema = Yup.object().shape({
  user_id: Yup.number()
    .required('User is required'),
  items: Yup.array()
    .of(
      Yup.object().shape({
        product_name: Yup.string()
          .required('Product name is required'),
        quantity: Yup.number()
          .required('Quantity is required')
          .min(1, 'Quantity must be at least 1'),
        price: Yup.number()
          .required('Price is required')
          .min(0.01, 'Price must be greater than 0')
      })
    )
    .min(1, 'At least one item is required')
});

const OrderForm = ({ initialValues, onSubmit, error }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState('');

  // Load users for admin selection
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    } else {
      setUserLoading(false);
    }
  }, [user]);

  // Fetch users from API (for admin)
  const fetchUsers = async () => {
    setUserLoading(true);
    setUserError('');

    try {
      const response = await getUsers(1, 100); // Get first 100 users
      setUsers(response.data.data);
    } catch (error) {
      setUserError('Failed to load users. Please try again.');
      console.error('Error fetching users:', error);
    } finally {
      setUserLoading(false);
    }
  };

  // Calculate item total
  const calculateItemTotal = (quantity, price) => {
    return (quantity * price).toFixed(2);
  };

  // Calculate order total
  const calculateOrderTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2);
  };

  // Initial empty item
  const emptyItem = {
    product_name: '',
    quantity: 1,
    price: ''
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title>Create Order</Card.Title>

        {error && <Alert variant="danger">{error}</Alert>}
        {userError && <Alert variant="warning">{userError}</Alert>}

        <Formik
          initialValues={initialValues}
          validationSchema={orderSchema}
          onSubmit={onSubmit}
        >
          {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting,
              setFieldValue
            }) => (
            <Form onSubmit={handleSubmit}>
              {/* User selection */}
              <Form.Group className="mb-3">
                <Form.Label>User</Form.Label>
                {user?.role === 'admin' ? (
                  <Form.Select
                    name="user_id"
                    value={values.user_id}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.user_id && errors.user_id}
                    disabled={userLoading}
                  >
                    <option value="">Select User</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </Form.Select>
                ) : (
                  <Form.Control
                    plaintext
                    readOnly
                    value={user?.name || 'Current User'}
                  />
                )}
                <Form.Control.Feedback type="invalid">
                  {errors.user_id}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Order items */}
              <Card className="mb-3">
                <Card.Header>Order Items</Card.Header>
                <Card.Body>
                  <FieldArray name="items">
                    {({ push, remove }) => (
                      <>
                        {values.items.length > 0 && (
                          <Table responsive>
                            <thead>
                            <tr>
                              <th>Product Name</th>
                              <th>Quantity</th>
                              <th>Price</th>
                              <th>Total</th>
                              <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {values.items.map((item, index) => (
                              <tr key={index}>
                                <td>
                                  <Form.Control
                                    type="text"
                                    name={`items.${index}.product_name`}
                                    value={item.product_name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isInvalid={
                                      touched.items?.[index]?.product_name &&
                                      errors.items?.[index]?.product_name
                                    }
                                  />
                                  <Form.Control.Feedback type="invalid">
                                    {errors.items?.[index]?.product_name}
                                  </Form.Control.Feedback>
                                </td>
                                <td>
                                  <Form.Control
                                    type="number"
                                    name={`items.${index}.quantity`}
                                    value={item.quantity}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isInvalid={
                                      touched.items?.[index]?.quantity &&
                                      errors.items?.[index]?.quantity
                                    }
                                  />
                                  <Form.Control.Feedback type="invalid">
                                    {errors.items?.[index]?.quantity}
                                  </Form.Control.Feedback>
                                </td>
                                <td>
                                  <Form.Control
                                    type="number"
                                    step="0.01"
                                    name={`items.${index}.price`}
                                    value={item.price}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isInvalid={
                                      touched.items?.[index]?.price &&
                                      errors.items?.[index]?.price
                                    }
                                  />
                                  <Form.Control.Feedback type="invalid">
                                    {errors.items?.[index]?.price}
                                  </Form.Control.Feedback>
                                </td>
                                <td>
                                  ${calculateItemTotal(item.quantity, item.price)}
                                </td>
                                <td>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => remove(index)}
                                    disabled={values.items.length === 1}
                                  >
                                    Remove
                                  </Button>
                                </td>
                              </tr>
                            ))}
                            </tbody>
                            <tfoot>
                            <tr>
                              <th colSpan="3" className="text-end">Total:</th>
                              <th>${calculateOrderTotal(values.items)}</th>
                              <th></th>
                            </tr>
                            </tfoot>
                          </Table>
                        )}

                        <Button
                          variant="secondary"
                          onClick={() => push(emptyItem)}
                          className="mt-2"
                        >
                          Add Item
                        </Button>

                        {errors.items && typeof errors.items === 'string' && (
                          <Alert variant="danger" className="mt-2">
                            {errors.items}
                          </Alert>
                        )}
                      </>
                    )}
                  </FieldArray>
                </Card.Body>
              </Card>

              {/* Status selection */}
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={values.status}
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>

              <div className="d-flex justify-content-between">
                <Button type="button" variant="secondary" onClick={() => window.history.back()}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Order'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Card.Body>
    </Card>
  );
};

export default OrderForm;
