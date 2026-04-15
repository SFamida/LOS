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
      <AdminLayout platformName="Merchant">
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
      <AdminLayout platformName="Merchant">
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
      <Button variant="secondary" onClick={() => router.back()} className="mb-3">
        ← Back to Applications
      </Button>

      <div className="mb-4 pb-3 border-bottom">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h2>
              {application.basicDetails.firstName} {application.basicDetails.lastName}
            </h2>
            <p className="text-muted mb-0">Application ID: {application.id}</p>
          </div>
          <div className="text-end">
            <div className="mb-2">
              {getStatusBadge(application.status)}
            </div>
            <div>
              {getFlowTypeBadge(application.flowType)}
            </div>
          </div>
        </div>
      </div>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      <Card className="mb-4">
        <Card.Header className="bg-primary text-white">
          <Card.Title className="mb-0">Personal Details</Card.Title>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <div>
                <strong>First Name:</strong>
                <p className="text-muted">{application.basicDetails.firstName}</p>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <strong>Last Name:</strong>
                <p className="text-muted">{application.basicDetails.lastName}</p>
              </div>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <div>
                <strong>Email Address:</strong>
                <p className="text-muted">{application.basicDetails.email}</p>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <strong>Mobile Number:</strong>
                <p className="text-muted">{application.basicDetails.phoneNumber}</p>
              </div>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <div>
                <strong>SSN:</strong>
                <p className="text-muted">{application.basicDetails.ssn}</p>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <strong>Date of Birth:</strong>
                <p className="text-muted">{new Date(application.basicDetails.dateOfBirth).toLocaleDateString()}</p>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {application.projectDetails && (
        <Card className="mb-4">
          <Card.Header className="bg-success text-white">
            <Card.Title className="mb-0">Project Details</Card.Title>
          </Card.Header>
          <Card.Body>
            <Row className="mb-3">
              <Col md={6}>
                <div>
                  <strong>Expected Financing Amount:</strong>
                  <p className="text-muted">
                    ${parseFloat(application.projectDetails.expectedFinancingAmount || '0').toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </Col>
              <Col md={6}>
                <div>
                  <strong>Project Type:</strong>
                  <p className="text-muted">{application.projectDetails.projectType}</p>
                </div>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={12}>
                <div>
                  <strong>Project Address:</strong>
                  <p className="text-muted">{application.projectDetails.projectAddress}</p>
                </div>
              </Col>
            </Row>
            {application.projectDetails.sameAsApplicantAddress && (
              <Row>
                <Col md={12}>
                  <div>
                    <strong>Applicant Address:</strong>
                    <p className="text-muted">{application.projectDetails.applicantAddress}</p>
                  </div>
                </Col>
              </Row>
            )}
          </Card.Body>
        </Card>
      )}

      {application.financialDetails && (
        <Card className="mb-4">
          <Card.Header className="bg-info text-white">
            <Card.Title className="mb-0">Financial Information</Card.Title>
          </Card.Header>
          <Card.Body>
            <Row className="mb-3">
              <Col md={6}>
                <div>
                  <strong>Annual Income:</strong>
                  <p className="text-muted">
                    ${parseFloat(application.financialDetails.annualIncome || '0').toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </Col>
              <Col md={6}>
                <div>
                  <strong>Monthly Income:</strong>
                  <p className="text-muted">
                    ${parseFloat(application.financialDetails.monthlyIncome || '0').toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <div>
                  <strong>Special Income (Retirement, Child Support, or Alimony):</strong>
                  <p className="text-muted">
                    {application.financialDetails.hasSpecialIncome ? '✓ Yes' : '✗ No'}
                  </p>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {!application.projectDetails && (
        <Card className="mb-4">
          <Card.Header className="bg-info text-white">
            <Card.Title className="mb-0">Loan Information</Card.Title>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <div>
                  <strong>Requested Amount:</strong>
                  <p className="text-muted">
                    ${parseFloat(application.basicDetails.requestedAmount || '0').toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      <Card className="mb-4 bg-light">
        <Card.Body>
          <Row>
            <Col md={6}>
              <small>
                <strong>Created:</strong>
                <p className="text-muted mb-0">{new Date(application.createdAt).toLocaleString()}</p>
              </small>
            </Col>
            <Col md={6}>
              <small>
                <strong>Last Updated:</strong>
                <p className="text-muted mb-0">{new Date(application.updatedAt).toLocaleString()}</p>
              </small>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <div className="text-center">
        <Button variant="outline-secondary" onClick={() => router.back()}>
          ← Back to Applications
        </Button>
      </div>
    </>
  );

  return <AdminLayout platformName="Merchant">{content}</AdminLayout>;
}
