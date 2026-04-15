'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Row, Col, Card, Table, Badge } from 'react-bootstrap';
import AdminLayout from '@/components/AdminLayout';
import apiClient from '@/lib/api';

interface Application {
  id: string;
  applicationToken: string;
  customerName: string;
  customerEmail: string;
  loanAmount: string;
  flowType: string;
  status: string;
  phoneVerified?: boolean;
  ssnVerified?: boolean;
  projectAddress?: {
    addressLine?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  applicantAddress?: {
    addressLine?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/applications');
      if (response.data.success && response.data.data) {
        setApplications(response.data.data);
      } else {
        setApplications([]);
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      setError('Failed to load applications');
      setApplications([]);
    } finally {
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

  const content = (
    <>
      <div className="mb-4">
        <h2>All Applications</h2>
        <p className="text-muted">View all your loan applications</p>
      </div>

      <Card>
        <Card.Body className="p-0">
          {loading && (
            <p className="p-3 text-muted mb-0">Loading applications...</p>
          )}
          {error && (
            <div className="alert alert-danger m-3">
              {error}
            </div>
          )}
          {!loading && applications.length === 0 && (
            <p className="p-3 text-muted mb-0">No applications yet</p>
          )}
          {!loading && applications.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Customer Name</th>
                    <th>Email</th>
                    <th>Requested Amount</th>
                    <th>Flow Type</th>
                    <th>Status</th>
                    <th>Verification</th>
                    <th>Address</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app.id}>
                      <td>{app.customerName}</td>
                      <td>{app.customerEmail}</td>
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
                      <td>
                        <small>
                          {app.phoneVerified ? <Badge bg="success">Phone ✓</Badge> : <Badge bg="light">Phone</Badge>}
                          {' '}
                          {app.ssnVerified ? <Badge bg="success">SSN ✓</Badge> : <Badge bg="light">SSN</Badge>}
                        </small>
                      </td>
                      <td>
                        <small className="text-muted" style={{ maxWidth: '150px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {app.projectAddress?.city && app.projectAddress?.state 
                            ? `${app.projectAddress.city}, ${app.projectAddress.state}`
                            : app.applicantAddress?.city && app.applicantAddress?.state
                            ? `${app.applicantAddress.city}, ${app.applicantAddress.state}`
                            : '—'}
                        </small>
                      </td>
                      <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => router.push(`/application/${app.id}`)}
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
