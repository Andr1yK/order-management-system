import React from 'react';
import OrderList from '../components/OrderList';

const Orders = () => {
  return (
    <div className="orders-page">
      <h1 className="mb-4">Orders</h1>
      <OrderList />
    </div>
  );
};

export default Orders;
