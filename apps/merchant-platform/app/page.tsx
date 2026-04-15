'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Row, Col, Card, Table, Badge } from 'react-bootstrap';
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

  useEffect(() => {
    fetchApplications();
    const interval = setInterval(fetchApplications, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await apiClient.get('/applications');
      setApplications(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      setLoading(false);
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

  const approvedApplications = applications.filter(app => app.status === 'approved');

  const content = (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Dashboard</h2>
          <p className="text-muted">Welcome to the Merchant Platform</p>
        </div>
        <Button 
          variant="primary" 
          size="lg" 
          onClick={() => router.push('/create-application')}
        >
          + Create Application
        </Button>
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
              <h5>Approved</h5>
              <h2 className="text-success">{approvedApplications.length}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <Card.Title className="mb-0">All Applications</Card.Title>
        </Card.Header>
        <Card.Body className="p-0">
          {applications.length === 0 ? (
            <p className="p-3 text-muted mb-0">No applications yet</p>
          ) : (
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
                      <td>
                        <Badge bg={app.flowType === 'customer-led' ? 'info' : 'secondary'}>
                          {app.flowType === 'customer-led' ? 'Customer Led' : 'Contractor Led'}
                        </Badge>
                      </td>
                      <td>{getStatusBadge(app.status)}</td>
                      <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => router.push(`/application/${app.applicationToken}`)}
                        >
                          View Details
                        </Button>
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

  return <AdminLayout platformName="Merchant">{content}</AdminLayout>;
}
