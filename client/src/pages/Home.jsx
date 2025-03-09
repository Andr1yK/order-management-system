import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="home">
      <div className="jumbotron bg-light p-5 rounded mb-4">
        <h1>Welcome to Order Management System</h1>
        <p className="lead">
          A simple yet powerful system to manage users and their orders.
        </p>
        {!isAuthenticated && (
          <p>
            <Button as={Link} to="/auth" variant="primary" size="lg">
              Get Started
            </Button>
          </p>
        )}
      </div>

      {isAuthenticated && (
        <Row className="mt-4">
          <Col md={6} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>Orders</Card.Title>
                <Card.Text>
                  View and manage your orders. You can create new orders, update existing ones, or check their status.
                </Card.Text>
                <Button as={Link} to="/orders" variant="primary">Go to Orders</Button>
              </Card.Body>
            </Card>
          </Col>

          {user?.role === 'admin' && (
            <Col md={6} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>Users</Card.Title>
                  <Card.Text>
                    Manage users in the system. As an admin, you can view, create, update, and delete users.
                  </Card.Text>
                  <Button as={Link} to="/users" variant="primary">Manage Users</Button>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      )}

      <Row className="mt-4">
        <Col>
          <h2>About This System</h2>
          <p>
            This order management system demonstrates a monolithic architecture that is designed to be easily
            migrated to microservices. The backend is built with Node.js and Express, while the frontend uses
            React. All data is stored in a PostgreSQL database.
          </p>
          <p>
            Key features include:
          </p>
          <ul>
            <li>User authentication and authorization</li>
            <li>User management (admin only)</li>
            <li>Order creation and management</li>
            <li>RESTful API design</li>
            <li>Modular architecture for easy migration to microservices</li>
          </ul>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
