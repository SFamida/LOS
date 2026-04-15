'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Badge, Card } from 'react-bootstrap';
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

export default function PendingApprovalsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(false);
      const response = await apiClient.get('/applications');
      const pendingApps = response.data.filter((app: Application) => app.status === 'pending');
      setApplications(pendingApps);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch applications');
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
        <h2>Pending Approvals</h2>
        <p className="text-muted">Applications awaiting your approval</p>
      </div>

      <Card>
        <Card.Body className="p-0">
          {error && <p className="p-3 text-danger">Error: {error}</p>}
          {applications.length === 0 && (
            <p className="p-3 text-muted">No pending applications</p>
          )}
          {applications.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Customer Name</th>
                    <th>Requested Amount</th>
                    <th>Flow Type</th>
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
