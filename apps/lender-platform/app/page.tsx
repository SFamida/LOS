'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Badge, Row, Col, Card } from 'react-bootstrap';
import AdminLayout from '@/components/AdminLayout';
import apiClient from '@/lib/api';

interface Application {
  id: string;
  customerName: string;
  businessName: string;
  loanAmount: string;
  flowType: string;
  status: string;
  createdAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
    const interval = setInterval(fetchApplications, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await apiClient.get('/applications');
      setApplications(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appId: string) => {
    try {
      setApproving(appId);
      await apiClient.patch(`/applications/${appId}`, { status: 'approved' });
      await fetchApplications();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve application');
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (appId: string) => {
    try {
      setApproving(appId);
      await apiClient.patch(`/applications/${appId}`, { status: 'rejected' });
      await fetchApplications();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject application');
    } finally {
      setApproving(null);
    }
  };

  const getStatusBadge = (status: string) => {
    return (
      <span className={`status-badge status-${status.toLowerCase()}`}>
        {status}
      </span>
    );
  };

  const getFlowTypeBadge = (flowType: string) => {
    return (
      <span className="flow-badge">
        {flowType === 'customer-led' ? 'Customer' : 'Contractor'}
      </span>
    );
  };

  const content = (
    <>
      <div className="mb-4">
        <h1 className="page-title">Overview</h1>
        <p className="page-subtitle">Analyze your lending pipeline and application statuses</p>
      </div>

      <Row className="mb-4">
        <Col md={3}>
          <div className="card stat-card">
            <div className="stat-label">Total Applications</div>
            <div className="stat-value text-primary-custom">{applications.length}</div>
            <i className="fa-regular fa-file-lines stat-icon"></i>
          </div>
        </Col>
        <Col md={3}>
          <div className="card stat-card">
            <div className="stat-label">Pending Review</div>
            <div className="stat-value text-warning-custom">
              {applications.filter(a => a.status === 'pending').length}
            </div>
            <i className="fa-regular fa-clock stat-icon"></i>
          </div>
        </Col>
        <Col md={3}>
          <div className="card stat-card">
            <div className="stat-label">Approved</div>
            <div className="stat-value text-success-custom">
              {applications.filter(a => a.status === 'approved').length}
            </div>
            <i className="fa-regular fa-circle-check stat-icon"></i>
          </div>
        </Col>
        <Col md={3}>
          <div className="card stat-card">
            <div className="stat-label">Rejected</div>
            <div className="stat-value text-danger-custom">
              {applications.filter(a => a.status === 'rejected').length}
            </div>
            <i className="fa-regular fa-circle-xmark stat-icon"></i>
          </div>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <Card.Title className="mb-0">Applications</Card.Title>
        </Card.Header>
        <Card.Body className="p-0">
          {error && <p className="p-3 text-danger">Error: {error}</p>}
          {applications.length === 0 && (
            <p className="p-3 text-muted">No applications yet</p>
          )}
          {applications.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Customer Name</th>
                    <th>Requested Amount</th>
                    <th>Flow Type</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th className="text-end px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app.id}>
                      <td>{app.customerName}</td>
                      <td>${parseFloat(app.loanAmount || '0').toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}</td>
                      <td>{getFlowTypeBadge(app.flowType)}</td>
                      <td>{getStatusBadge(app.status)}</td>
                      <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td className="text-end px-4">
                        <div className="d-flex gap-3 justify-content-end align-items-center">
                          <Button 
                            variant="link"
                            className="p-0 text-primary-custom"
                            onClick={() => router.push(`/application/${app.applicationToken}`)}
                            title="View Details"
                          >
                            <i className="fa-regular fa-eye action-icon"></i>
                          </Button>
                          
                          <Button 
                            variant="link" 
                            className={`p-0 ${app.status === 'pending' ? 'text-success-custom' : 'text-secondary opacity-25'}`}
                            onClick={() => app.status === 'pending' && handleApprove(app.id)}
                            disabled={approving === app.id || app.status !== 'pending'}
                            title={app.status === 'pending' ? 'Approve' : 'Action not available'}
                            style={{ cursor: app.status === 'pending' ? 'pointer' : 'default' }}
                          >
                            <i className="fa-solid fa-circle-check action-icon"></i>
                          </Button>
                          
                          <Button 
                            variant="link" 
                            className={`p-0 ${app.status === 'pending' ? 'text-danger-custom' : 'text-secondary opacity-25'}`}
                            onClick={() => app.status === 'pending' && handleReject(app.id)}
                            disabled={approving === app.id || app.status !== 'pending'}
                            title={app.status === 'pending' ? 'Reject' : 'Action not available'}
                            style={{ cursor: app.status === 'pending' ? 'pointer' : 'default' }}
                          >
                            <i className="fa-solid fa-circle-xmark action-icon"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  );

  return <AdminLayout platformName="Lender">{content}</AdminLayout>;
}
