import React from 'react';
import UserList from '../components/UserList';

const Users = () => {
  return (
    <div className="users-page">
      <h1 className="mb-4">Users</h1>
      <UserList />
    </div>
  );
};

export default Users;
