'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Badge, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import AdminLayout from '@/components/AdminLayout';
import apiClient from '@/lib/api';

interface ApplicationDetail {
  id: string;
  applicationToken: string;
  flowType: string;
  status: string;
  basicDetails: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    ssn: string;
    dateOfBirth: string;
    requestedAmount: string;
  };
  projectDetails?: {
    expectedFinancingAmount: string;
    projectType: string;
    projectAddress: string;
    sameAsApplicantAddress: boolean;
    applicantAddress: string;
  };
  financialDetails?: {
    annualIncome: string;
    monthlyIncome: string;
    hasSpecialIncome: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ApplicationDetail() {
  const params = useParams();
  const router = useRouter();
  const appId = params.id as string;

  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    fetchApplicationDetail();
  }, [appId]);

  const fetchApplicationDetail = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/applications/${appId}`);
      setApplication(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch application details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setApproving(true);
      await apiClient.patch(`/applications/${application?.id}`, { status: 'approved' });
      await fetchApplicationDetail();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve application');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    try {
      setApproving(true);
      await apiClient.patch(`/applications/${application?.id}`, { status: 'rejected' });
      await fetchApplicationDetail();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject application');
    } finally {
      setApproving(false);
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

  if (loading) {
    return (
      <AdminLayout platformName="Lender">
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </AdminLayout>
    );
  }

  if (error || !application) {
    return (
      <AdminLayout platformName="Lender">
        <Button variant="secondary" onClick={() => router.back()} className="mb-3">
          ← Back
        </Button>
        <Alert variant="danger">
          {error || 'Application not found'}
        </Alert>
      </AdminLayout>
    );
  }

  const content = (
    <>
      <button className="back-btn" onClick={() => router.back()}>
        <i className="fa-regular fa-circle-left"></i> Back to Applications
      </button>

      <div className="details-header-card">
        <div className="header-info-group">
          <div className="header-icon">
            <i className="fa-regular fa-user"></i>
          </div>
          <div>
            <div className="header-label">Applicant Name</div>
            <div className="header-value">
              {application.basicDetails?.firstName} {application.basicDetails?.lastName}
            </div>
            <div className="header-subvalue">Application ID: {application.id}</div>
          </div>
        </div>
        <div className="d-flex gap-4 align-items-center">
          <div className="text-end">
            <div className="header-label">Flow Type</div>
            <div className="header-value" style={{ fontSize: '14px' }}>
              {application.flowType === 'customer-led' ? 'Customer Led' : 'Contractor Led'}
            </div>
          </div>
          <div className="text-end">
            <div className="header-label">Status</div>
            <div className="mt-1">{getStatusBadge(application.status)}</div>
          </div>
        </div>
      </div>

      <div className="details-grid">
        <div className="left-column">
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <i className="fa-regular fa-id-card"></i> Personal Information
              </div>
            </div>
            <div className="data-section">
              <div className="data-item">
                <div className="data-label">First Name</div>
                <div className="data-value">{application.basicDetails?.firstName}</div>
              </div>
              <div className="data-item">
                <div className="data-label">Last Name</div>
                <div className="data-value">{application.basicDetails?.lastName}</div>
              </div>
              <div className="data-item">
                <div className="data-label">Email Address</div>
                <div className="data-value">{application.basicDetails?.email}</div>
              </div>
              <div className="data-item">
                <div className="data-label">Phone Number</div>
                <div className="data-value">{application.basicDetails?.phoneNumber}</div>
              </div>
              <div className="data-item">
                <div className="data-label">SSN</div>
                <div className="data-value">{application.basicDetails?.ssn}</div>
              </div>
              <div className="data-item">
                <div className="data-label">Date of Birth</div>
                <div className="data-value">{application.basicDetails?.dateOfBirth ? new Date(application.basicDetails.dateOfBirth).toLocaleDateString() : ''}</div>
              </div>
            </div>
          </div>

          {application.projectDetails && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <i className="fa-regular fa-map"></i> Project Details
                </div>
              </div>
              <div className="data-section">
                <div className="data-item">
                  <div className="data-label">Expected Financing</div>
                  <div className="data-value">
                    ${parseFloat(application.projectDetails.expectedFinancingAmount || '0').toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div className="data-item">
                  <div className="data-label">Project Type</div>
                  <div className="data-value">{application.projectDetails.projectType}</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="data-label">Project Address</div>
                <div className="data-value">{application.projectDetails.projectAddress}</div>
              </div>
            </div>
          )}

          {application.financialDetails && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <i className="fa-regular fa-credit-card"></i> Financial Information
                </div>
              </div>
              <div className="data-section">
                <div className="data-item">
                  <div className="data-label">Annual Income</div>
                  <div className="data-value">
                    ${parseFloat(application.financialDetails.annualIncome || '0').toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div className="data-item">
                  <div className="data-label">Monthly Income</div>
                  <div className="data-value">
                    ${parseFloat(application.financialDetails.monthlyIncome || '0').toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div className="data-item">
                  <div className="data-label">Special Income</div>
                  <div className="data-value">
                    {application.financialDetails.hasSpecialIncome ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="right-column">
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <i className="fa-regular fa-clipboard"></i> Summary
              </div>
            </div>
            <div className="mb-4">
              <div className="data-label">Requested Amount</div>
              <div className="data-value" style={{ fontSize: '24px', color: 'var(--primary-color)' }}>
                ${parseFloat(application.basicDetails?.requestedAmount || application.projectDetails?.expectedFinancingAmount || '0').toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>
            <div className="mb-4">
              <div className="data-label">Created At</div>
              <div className="data-value">{new Date(application.createdAt).toLocaleString()}</div>
            </div>
            <div className="mb-4">
              <div className="data-label">Last Updated</div>
              <div className="data-value">{new Date(application.updatedAt).toLocaleString()}</div>
            </div>

            {application.status === 'pending' && (
              <div className="d-flex flex-column gap-3 mt-4 pt-4 border-top">
                <Button 
                  className="btn-primary-custom w-100" 
                  onClick={handleApprove}
                  disabled={approving}
                >
                  {approving ? 'Processing...' : 'Approve Application'}
                </Button>
                <Button 
                  className="btn-danger-custom w-100" 
                  onClick={handleReject}
                  disabled={approving}
                >
                  {approving ? 'Processing...' : 'Reject Application'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return <AdminLayout platformName="Lender">{content}</AdminLayout>;
}
