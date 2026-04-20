'use client';

import { useState, useEffect } from 'react';
import { Button, Modal, Form, Table, Card, Alert } from 'react-bootstrap';
import AdminLayout from '@/components/AdminLayout';
import apiClient from '@/lib/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  level: string;
  role: string;
  createdAt: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  level: string;
  role: string;
  password?: string;
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    level: 'L1',
    role: 'Read-Only',
    password: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/users');
      setUsers(response.data.data || []);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }

    if (!editingId && !formData.password) {
      setError('Password is required for new users');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      if (editingId) {
        // Update existing user
        await apiClient.patch(`/users/${editingId}`, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          level: formData.level,
          role: formData.role,
        });
      } else {
        // Create new user
        await apiClient.post('/users', {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          level: formData.level,
          role: formData.role,
          password: formData.password,
        });
      }
      
      await fetchUsers();
      setShowModal(false);
      setEditingId(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        level: 'L1',
        role: 'Read-Only',
        password: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      level: user.level,
      role: user.role,
      password: '',
    });
    setShowModal(true);
  };

  const handleDeleteClick = (userId: string) => {
    setDeleteUserId(userId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (deleteUserId) {
        await apiClient.delete(`/users/${deleteUserId}`);
        await fetchUsers();
        setShowDeleteConfirm(false);
        setDeleteUserId(null);
        setError(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      level: 'L1',
      role: 'Read-Only',
      password: '',
    });
    setError(null);
  };

  const getLevelInfo = (level: string) => {
    switch (level) {
      case 'L1': return { color: 'emerald', label: 'Level 1' };
      case 'L2': return { color: 'amber', label: 'Level 2' };
      case 'L3': return { color: 'rose', label: 'Level 3' };
      default: return { color: 'blue', label: level };
    }
  };

  const getRoleInfo = (role: string) => {
    return role === 'Admin' 
      ? { color: 'purple', label: 'Administrator' } 
      : { color: 'blue', label: 'Read-Only' };
  };

  const content = (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-end mb-5">
        <div>
          <h2 className="fw-bold mb-1">Manage Users</h2>
          <p className="text-muted">Maintain team access and permission levels</p>
        </div>
        <Button 
          className="btn-primary-custom"
          onClick={() => {
            setEditingId(null);
            setFormData({
              firstName: '',
              lastName: '',
              email: '',
              level: 'L1',
              role: 'Read-Only',
              password: '',
            });
            setShowModal(true);
          }}
        >
          <i className="fa-solid fa-plus me-2"></i>
          Create New User
        </Button>
      </div>

      {error && <Alert variant="danger" className="border-0 shadow-sm" onClose={() => setError(null)} dismissible>{error}</Alert>}

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="p-5 text-center">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-3 text-muted">Loading user accounts...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-5 text-center">
              <p className="text-muted fs-5">No user accounts found.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table className="align-middle border-0 mb-0">
                <thead>
                  <tr>
                    <th>User Details</th>
                    <th>Email Address</th>
                    <th>Level</th>
                    <th>Role</th>
                    <th>Created</th>
                    <th className="text-end px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => {
                    const level = getLevelInfo(user.level);
                    const role = getRoleInfo(user.role);
                    return (
                      <tr key={user.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar me-3" style={{ width: '32px', height: '32px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: 'var(--primary-color)' }}>
                              {user.firstName[0]}{user.lastName[0]}
                            </div>
                            <div>
                              <div className="fw-bold">{user.firstName} {user.lastName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-muted">{user.email}</td>
                        <td>
                          <div className="dot-label">
                            <div className={`dot-indicator ${level.color}`}></div>
                            <span>{level.label}</span>
                          </div>
                        </td>
                        <td>
                          <div className="dot-label">
                            <div className={`dot-indicator ${role.color}`}></div>
                            <span>{role.label}</span>
                          </div>
                        </td>
                        <td className="text-muted">
                          <small>{new Date(user.createdAt).toLocaleDateString()}</small>
                        </td>
                        <td className="text-end px-4">
                          <div className="d-flex gap-2 justify-content-end">
                            <button 
                              className="action-btn-circle edit" 
                              title="Edit User"
                              onClick={() => handleEdit(user)}
                            >
                              <i className="fa-regular fa-pen-to-square"></i>
                            </button>
                            <button 
                              className="action-btn-circle delete" 
                              title="Delete User"
                              onClick={() => handleDeleteClick(user.id)}
                            >
                              <i className="fa-regular fa-trash-can"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Create/Edit User Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? 'Edit User' : 'Create New User'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>First Name *</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Enter first name"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Last Name *</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Enter last name"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email ID *</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                required
              />
            </Form.Group>

            {!editingId && (
              <Form.Group className="mb-3">
                <Form.Label>Password * {editingId ? '(leave blank to keep current)' : ''}</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  required={!editingId}
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Level *</Form.Label>
              <Form.Select
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                required
              >
                <option value="L1">L1</option>
                <option value="L2">L2</option>
                <option value="L3">L3</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Role *</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
              >
                <option value="Admin">Admin</option>
                <option value="Read-Only">Read-Only</option>
              </Form.Select>
            </Form.Group>

            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <Button 
                variant="secondary" 
                onClick={handleCloseModal}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : editingId ? 'Update User' : 'Create User'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this user? This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowDeleteConfirm(false)}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleConfirmDelete}
          >
            Delete User
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );

  return <AdminLayout platformName="Lender">{content}</AdminLayout>;
}
