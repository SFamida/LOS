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
    const variants: { [key: string]: string } = {
      'draft': 'secondary',
      'pending': 'warning',
      'in-progress': 'info',
      'approved': 'success',
      'rejected': 'danger',
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getFlowTypeBadge = (flowType: string) => {
    return (
      <Badge bg={flowType === 'customer-led' ? 'info' : 'secondary'}>
        {flowType === 'customer-led' ? 'Customer Led' : 'Contractor Led'}
      </Badge>
    );
  };

  const content = (
    <>
      <div className="mb-4">
        <h2>Dashboard</h2>
        <p className="text-muted">Review and manage loan applications</p>
      </div>

      <Row className="mb-4">
        <Col md={3}>
          <Card>
            <Card.Body>
              <h5>Total Applications</h5>
              <h2 className="text-primary">{applications.length}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <h5>Pending Review</h5>
              <h2 className="text-warning">
                {applications.filter(a => a.status === 'pending').length}
              </h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <h5>Approved</h5>
              <h2 className="text-success">
                {applications.filter(a => a.status === 'approved').length}
              </h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <h5>Rejected</h5>
              <h2 className="text-danger">
                {applications.filter(a => a.status === 'rejected').length}
              </h2>
            </Card.Body>
          </Card>
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
                    <th>Action</th>
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
                      <td>
                        <div className="d-flex gap-2">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => router.push(`/application/${app.applicationToken}`)}
                          >
                            View Details
                          </Button>
                          {app.status === 'pending' && (
                            <>
                              <Button 
                                variant="success" 
                                size="sm"
                                onClick={() => handleApprove(app.id)}
                                disabled={approving === app.id}
                              >
                                {approving === app.id ? 'Approving...' : 'Approve'}
                              </Button>
                              <Button 
                                variant="danger" 
                                size="sm"
                                onClick={() => handleReject(app.id)}
                                disabled={approving === app.id}
                              >
                                {approving === app.id ? 'Rejecting...' : 'Reject'}
                              </Button>
                            </>
                          )}
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
