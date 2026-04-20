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
    return (
      <span className={`status-badge status-${status.toLowerCase()}`}>
        {status}
      </span>
    );
  };

  const content = (
    <div className="py-4">
      <div className="mb-5">
        <h2 className="fw-bold mb-1">All Applications</h2>
        <p className="text-muted">View all your loan applications in one place</p>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading && (
            <div className="p-5 text-center">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-3 text-muted">Loading applications...</p>
            </div>
          )}
          {error && (
            <div className="alert alert-danger m-3 border-0">
              {error}
            </div>
          )}
          {!loading && applications.length === 0 && (
            <div className="p-5 text-center">
              <p className="text-muted fs-5">No applications yet</p>
            </div>
          )}
          {!loading && applications.length > 0 && (
            <div className="table-responsive">
              <Table className="align-middle border-0">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Email</th>
                    <th>Requested</th>
                    <th>Flow Type</th>
                    <th>Status</th>
                    <th>Verification</th>
                    <th>Address</th>
                    <th>Date</th>
                    <th className="text-end px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app.id}>
                      <td className="fw-semibold">{app.customerName}</td>
                      <td className="text-muted" style={{ fontSize: '13px' }}>{app.customerEmail}</td>
                      <td className="fw-bold">
                        ${parseFloat(app.loanAmount || '0').toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td>
                        <span className="flow-badge">
                          {app.flowType === 'customer-led' ? 'Customer' : 'Contractor'}
                        </span>
                      </td>
                      <td>{getStatusBadge(app.status)}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <span title="Phone Verified" style={{ color: app.phoneVerified ? '#10b981' : '#e2e8f0' }}>
                            <i className="fa-solid fa-phone" style={{ fontSize: '12px' }}></i>
                          </span>
                          <span title="SSN Verified" style={{ color: app.ssnVerified ? '#10b981' : '#e2e8f0' }}>
                            <i className="fa-solid fa-id-card" style={{ fontSize: '12px' }}></i>
                          </span>
                        </div>
                      </td>
                      <td>
                        <small className="text-muted">
                          {app.projectAddress?.city || app.applicantAddress?.city || '—'}
                          {', '}
                          {app.projectAddress?.state || app.applicantAddress?.state || '—'}
                        </small>
                      </td>
                      <td>
                        <small className="text-muted">{new Date(app.createdAt).toLocaleDateString()}</small>
                      </td>
                      <td className="text-end px-4">
                        <Button 
                          className="btn-outline-custom"
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
    </div>
  );

  return <AdminLayout platformName="Merchant">{content}</AdminLayout>;
}
