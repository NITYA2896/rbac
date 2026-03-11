import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users');
      if (err.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = async (userId, permType, value) => {
    if (currentUser?.role !== 'admin') {
      setError('Action forbidden: You must be an admin to edit permissions.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const updatedUsers = users.map(u => 
      u._id === userId ? { 
        ...u, 
        permissions: { ...u.permissions, [permType]: value }
      } : u
    );
    setUsers(updatedUsers);

    try {
      await api.patch(`/users/${userId}/permissions`, { 
        permissions: { [permType]: value } 
      });
    } catch (err) {
      fetchUsers();
      setError(err.response?.data?.message || 'Failed to update user permissions');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="permissions-layout">
      <div className="top-nav">
         <span className="current-user-info">Logged in as: <strong>{currentUser.username}</strong> ({currentUser.role})</span>
         <button className="btn-logout" onClick={handleLogout}>Logout</button>
      </div>

      <div className="permissions-container">
        <h2>User Permissions Management</h2>
        
        {error && <div className="error-message">{error}</div>}

        <div className="table-card">
          <table className="permissions-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Read</th>
                <th>Write</th>
                <th>Read/Write</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="col-user">{user.username}</td>
                  <td className="col-role">{user.role}</td>
                  <td className="col-check">
                    <input
                      type="checkbox"
                      className="perm-checkbox"
                      checked={user.permissions?.read || false}
                      onChange={(e) => handleTogglePermission(user._id, 'read', e.target.checked)}
                      disabled={currentUser?.role !== 'admin'}
                    />
                  </td>
                  <td className="col-check">
                    <input
                      type="checkbox"
                      className="perm-checkbox"
                      checked={user.permissions?.write || false}
                      onChange={(e) => handleTogglePermission(user._id, 'write', e.target.checked)}
                      disabled={currentUser?.role !== 'admin'}
                    />
                  </td>
                  <td className="col-check">
                    <input
                      type="checkbox"
                      className="perm-checkbox"
                      checked={user.permissions?.readWrite || false}
                      onChange={(e) => handleTogglePermission(user._id, 'readWrite', e.target.checked)}
                      disabled={currentUser?.role !== 'admin'}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
