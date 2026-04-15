'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Table, Badge } from 'react-bootstrap';
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

export default function ActiveApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await apiClient.get('/applications');
      const activeApps = response.data.filter((app: Application) => 
        app.status === 'in-progress' || app.status === 'pending'
      );
      setApplications(activeApps);
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

  const content = (
    <>
      <div className="mb-4">
        <h2>Active Applications</h2>
        <p className="text-muted">Applications currently in progress</p>
      </div>

      <Card>
        <Card.Body className="p-0">
          {applications.length === 0 ? (
            <p className="p-3 text-muted mb-0">No active applications</p>
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
