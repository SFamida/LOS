'use client';

import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import apiClient from '@/lib/api';
import PhoneVerificationStep from '@/components/CustomerFlow/PhoneVerificationStep';
import OTPVerificationStep from '@/components/CustomerFlow/OTPVerificationStep';
import SSNVerificationStep from '@/components/CustomerFlow/SSNVerificationStep';
import PersonalInfoStep from '@/components/CustomerFlow/PersonalInfoStep';

interface ApplicationData {
  id: string;
  applicationToken: string;
  basicDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    ssn: string;
    dateOfBirth: string;
    requestedAmount: string;
  };
  phoneVerified?: boolean;
  ssnVerified?: boolean;
  verifiedPhoneNumber?: string;
}

export default function CustomerApplicationPage({ params }: { params: { token: string } }) {
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { token } = params;

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/applications/${token}`);
        
        if (response.data.success) {
          setApplication(response.data.data);
          // Determine current step based on what's been completed
          if (response.data.data.phoneVerified && response.data.data.ssnVerified) {
            setCurrentStep(4); // Personal info
          } else if (response.data.data.phoneVerified) {
            setCurrentStep(3); // SSN verification
          } else if (response.data.data.verifiedPhoneNumber) {
            setCurrentStep(2); // OTP verification
          } else {
            setCurrentStep(1); // Phone verification
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load application');
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [token]);

  const handleOTPRequested = () => {
    setCurrentStep(2);
  };

  const handleOTPVerified = async () => {
    // Refresh application data
    try {
      const response = await apiClient.get(`/applications/${token}`);
      if (response.data.success) {
        setApplication(response.data.data);
        setCurrentStep(3);
      }
    } catch (err) {
      setError('Failed to update application');
    }
  };

  const handleSSNVerified = async () => {
    // Refresh application data
    try {
      const response = await apiClient.get(`/applications/${token}`);
      if (response.data.success) {
        setApplication(response.data.data);
        setCurrentStep(4);
      }
    } catch (err) {
      setError('Failed to update application');
    }
  };

  if (loading) {
    return (
      <Container className="min-vh-100 d-flex align-items-center justify-content-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Row>
          <Col md={8} className="mx-auto">
            <Alert variant="danger">
              <Alert.Heading>Error</Alert.Heading>
              <p>{error}</p>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!application) {
    return (
      <Container className="py-5">
        <Row>
          <Col md={8} className="mx-auto">
            <Alert variant="warning">
              <Alert.Heading>Application Not Found</Alert.Heading>
              <p>The application link may have expired or is invalid.</p>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col md={8} className="mx-auto">
          <Card>
            <Card.Header className="bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <Card.Title className="mb-0">Complete Your Application</Card.Title>
                <small className="text-muted">Step {currentStep} of 4</small>
              </div>
            </Card.Header>
            <Card.Body>
              {/* Progress indicator */}
              <div className="mb-4">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '10px',
                  }}
                >
                  {[1, 2, 3, 4].map(step => (
                    <div
                      key={step}
                      style={{
                        flex: 1,
                        height: '8px',
                        backgroundColor:
                          step <= currentStep ? '#007bff' : '#e9ecef',
                        borderRadius: '4px',
                        transition: 'background-color 0.3s',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Step 1: Phone Verification */}
              {currentStep === 1 && application && (
                <PhoneVerificationStep
                  token={token}
                  phoneNumber={application.basicDetails.phoneNumber}
                  onOTPRequested={handleOTPRequested}
                />
              )}

              {/* Step 2: OTP Verification */}
              {currentStep === 2 && application && (
                <OTPVerificationStep
                  token={token}
                  phoneNumber={application.verifiedPhoneNumber || application.basicDetails.phoneNumber}
                  onOTPVerified={handleOTPVerified}
                />
              )}

              {/* Step 3: SSN Verification */}
              {currentStep === 3 && application && (
                <SSNVerificationStep
                  token={token}
                  ssn={application.basicDetails.ssn}
                  onSSNVerified={handleSSNVerified}
                />
              )}

              {/* Step 4: Personal Information */}
              {currentStep === 4 && application && (
                <PersonalInfoStep
                  token={token}
                  basicDetails={application.basicDetails}
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
