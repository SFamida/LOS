'use client';

import { useState, useEffect } from 'react';
import { Card, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import AdminLayout from '@/components/AdminLayout';
import apiClient from '@/lib/api';

interface Application {
  id: string;
  customerName: string;
  customerEmail: string;
  loanAmount: number;
  flowType: string;
  status: string;
  createdAt: string;
}

export default function MerchantAppsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await apiClient.get('/applications');
        if (response.data.success) {
          setApplications([]);
        } else {
          setError(response.data.message || 'Failed to fetch applications');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusBadge = (status: string) => {
    return (
      <span className={`status-badge status-${status.toLowerCase()}`}>
        {status}
      </span>
    );
  };

  const content = (
    <div className="py-4">
      {error && <Alert variant="danger" className="border-0 shadow-sm mb-4">{error}</Alert>}

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="p-5 text-center">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-3 text-muted">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-5 text-center">
              <p className="text-muted fs-5">No applications found.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table className="align-middle border-0 mb-0">
                <thead>
                  <tr>
                    <th>Customer Details</th>
                    <th>Email Address</th>
                    <th className="text-end">Requested</th>
                    <th className="text-center">Flow Type</th>
                    <th className="text-center">Status</th>
                    <th className="text-end px-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <div className="fw-bold">{app.customerName}</div>
                      </td>
                      <td className="text-muted">{app.customerEmail}</td>
                      <td className="text-end fw-bold">
                        ${Number(app.loanAmount).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="text-center">
                        <span className="flow-badge">
                          {app.flowType === 'contractor-led' ? 'Contractor' : 'Customer'}
                        </span>
                      </td>
                      <td className="text-center">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="text-end px-4 text-muted">
                        <small>{new Date(app.createdAt).toLocaleDateString()}</small>
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

  return <AdminLayout platformName="Lender">{content}</AdminLayout>;
}
