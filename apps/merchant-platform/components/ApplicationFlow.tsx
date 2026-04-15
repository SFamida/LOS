'use client';

import { useState } from 'react';
import { Container, Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import apiClient from '@/lib/api';

interface ApplicationFlowProps {
  flow: 'customer-led' | 'contractor-led';
  onBack: () => void;
}

export default function ApplicationFlow({ flow, onBack }: ApplicationFlowProps) {
  const [formData, setFormData] = useState({
    // Personal Details
    firstName: '',
    lastName: '',
    phoneNumber: '', // for customer-led
    mobileNumber: '', // for contractor-led
    email: '',
    ssn: '',
    dateOfBirth: '',
    requestedAmount: '', // for customer-led
    
    // Project Details
    expectedFinancingAmount: '',
    projectType: '',
    projectAddressLine: '',
    projectCity: '',
    projectState: '',
    projectZipCode: '',
    applicantAddressLine: '',
    applicantCity: '',
    applicantState: '',
    applicantZipCode: '',
    sameAsApplicantAddress: false,
    
    // Financial Details
    annualIncome: '',
    hasSpecialIncome: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [applicationLink, setApplicationLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailNotification, setEmailNotification] = useState<any>(null);

  const monthlyIncome = formData.annualIncome ? (parseFloat(formData.annualIncome) / 12).toFixed(2) : '0.00';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleReviewAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (flow === 'customer-led') {
      // For customer-led, submit directly
      handleSubmit();
    } else {
      // For contractor-led, show preview
      // Validation
      if (!formData.firstName || !formData.lastName || !formData.mobileNumber || 
          !formData.email || !formData.ssn || !formData.dateOfBirth ||
          !formData.expectedFinancingAmount || !formData.projectType || 
          !formData.projectAddressLine || !formData.projectCity || !formData.projectState || !formData.projectZipCode ||
          !formData.annualIncome) {
        setError('Please fill in all required fields');
        return;
      }
      
      if (!formData.sameAsApplicantAddress && (!formData.applicantAddressLine || !formData.applicantCity || !formData.applicantState || !formData.applicantZipCode)) {
        setError('Please fill in all applicant address fields');
        return;
      }
      
      setError(null);
      setShowPreview(true);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    setLoading(true);
    setError(null);

    try {
      // For customer-led, use phoneNumber; for contractor-led, use mobileNumber
      const phoneField = flow === 'customer-led' ? formData.phoneNumber || formData.mobileNumber : formData.mobileNumber;
      
      const payload: any = {
        basicDetails: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: phoneField,
          email: formData.email,
          ssn: formData.ssn,
          dateOfBirth: formData.dateOfBirth,
          requestedAmount: flow === 'customer-led' ? formData.requestedAmount : formData.expectedFinancingAmount,
        },
        flowType: flow,
      };

      // For contractor-led flow, add complete application details
      if (flow === 'contractor-led') {
        payload.projectDetails = {
          expectedFinancingAmount: formData.expectedFinancingAmount,
          projectType: formData.projectType,
          projectAddressLine: formData.projectAddressLine,
          projectCity: formData.projectCity,
          projectState: formData.projectState,
          projectZipCode: formData.projectZipCode,
          applicantAddressLine: formData.sameAsApplicantAddress ? formData.projectAddressLine : formData.applicantAddressLine,
          applicantCity: formData.sameAsApplicantAddress ? formData.projectCity : formData.applicantCity,
          applicantState: formData.sameAsApplicantAddress ? formData.projectState : formData.applicantState,
          applicantZipCode: formData.sameAsApplicantAddress ? formData.projectZipCode : formData.applicantZipCode,
          sameAsApplicantAddress: formData.sameAsApplicantAddress,
        };
        payload.financialDetails = {
          annualIncome: formData.annualIncome,
          monthlyIncome: monthlyIncome,
          hasSpecialIncome: formData.hasSpecialIncome,
        };
      }

      console.log('Submitting payload:', payload);
      console.log('[FORM] sameAsApplicantAddress flag value:', formData.sameAsApplicantAddress);
      const response = await apiClient.post('/applications', payload);
      console.log('Response:', response);

      if (response.status === 201) {
        setApplicationLink(response.data.applicationLink);
        setEmailNotification(response.data.emailNotification);
        setShowPreview(false);
        setSubmitted(true);
      }
    } catch (err: any) {
      console.error('Error details:', err);
      console.error('Response data:', err.response?.data);
      setError(err.response?.data?.message || err.message || 'Failed to create application');
    } finally {
      setLoading(false);
    }
  };

  // Preview Screen for Contractor-Led Flow
  if (showPreview && flow === 'contractor-led') {
    return (
      <Container className="py-5">
        <Row>
          <Col md={10} className="mx-auto">
            <Button variant="secondary" onClick={() => setShowPreview(false)} className="mb-3">
              ← Edit Application
            </Button>

            <Card>
              <Card.Header>
                <Card.Title className="mb-0">Application Preview</Card.Title>
              </Card.Header>
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}

                {/* Personal Details Preview */}
                <div className="mb-4">
                  <h5 className="text-primary border-bottom pb-2 mb-3">Personal Details</h5>
                  <Row className="mb-3">
                    <Col md={6}>
                      <div>
                        <strong>First Name:</strong>
                        <p className="text-muted">{formData.firstName}</p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div>
                        <strong>Last Name:</strong>
                        <p className="text-muted">{formData.lastName}</p>
                      </div>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md={6}>
                      <div>
                        <strong>Mobile Number:</strong>
                        <p className="text-muted">{formData.mobileNumber}</p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div>
                        <strong>Email Address:</strong>
                        <p className="text-muted">{formData.email}</p>
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <div>
                        <strong>SSN:</strong>
                        <p className="text-muted">{formData.ssn}</p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div>
                        <strong>Date of Birth:</strong>
                        <p className="text-muted">{formData.dateOfBirth}</p>
                      </div>
                    </Col>
                  </Row>
                </div>

                {/* Project Details Preview */}
                <div className="mb-4">
                  <h5 className="text-success border-bottom pb-2 mb-3">Project Details</h5>
                  <Row className="mb-3">
                    <Col md={6}>
                      <div>
                        <strong>Expected Financing Amount:</strong>
                        <p className="text-muted">${parseFloat(formData.expectedFinancingAmount || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div>
                        <strong>Project Type:</strong>
                        <p className="text-muted">{formData.projectType}</p>
                      </div>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md={12}>
                      <div>
                        <strong>Project Address:</strong>
                        <p className="text-muted">
                          {formData.projectAddressLine}, {formData.projectCity}, {formData.projectState} {formData.projectZipCode}
                        </p>
                      </div>
                    </Col>
                  </Row>
                  {!formData.sameAsApplicantAddress && (
                    <Row>
                      <Col md={12}>
                        <div>
                          <strong>Applicant Address:</strong>
                          <p className="text-muted">
                            {formData.applicantAddressLine}, {formData.applicantCity}, {formData.applicantState} {formData.applicantZipCode}
                          </p>
                        </div>
                      </Col>
                    </Row>
                  )}
                  {formData.sameAsApplicantAddress && (
                    <Row>
                      <Col md={12}>
                        <div>
                          <strong>Applicant Address (Same as Project):</strong>
                          <p className="text-muted">
                            {formData.projectAddressLine}, {formData.projectCity}, {formData.projectState} {formData.projectZipCode}
                          </p>
                        </div>
                      </Col>
                    </Row>
                  )}
                </div>

                {/* Financial Information Preview */}
                <div className="mb-4">
                  <h5 className="text-info border-bottom pb-2 mb-3">Financial Information</h5>
                  <Row className="mb-3">
                    <Col md={6}>
                      <div>
                        <strong>Applicant's Income (Annual):</strong>
                        <p className="text-muted">${parseFloat(formData.annualIncome || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div>
                        <strong>Monthly Income:</strong>
                        <p className="text-muted">${parseFloat(monthlyIncome).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={12}>
                      <div>
                        <strong>Special Income:</strong>
                        <p className="text-muted">{formData.hasSpecialIncome ? '✓ Income contains Retirement, Child Support, or Alimony' : '✗ No special income'}</p>
                      </div>
                    </Col>
                  </Row>
                </div>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <Button variant="secondary" onClick={() => setShowPreview(false)}>
                    ← Edit
                  </Button>
                  <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  if (submitted) {
    return (
      <Container className="min-vh-100 d-flex align-items-center">
        <Row className="w-100">
          <Col md={8} className="mx-auto">
            <Alert variant="success" className="mb-4">
              <Alert.Heading>✓ Application Created Successfully!</Alert.Heading>
              <p>
                {flow === 'customer-led'
                  ? 'Your customer has been sent an email with a link to complete their application.'
                  : 'Your application has been submitted successfully.'}
              </p>
              {flow === 'customer-led' && emailNotification && (
                <p className="mb-0">
                  {emailNotification.sent
                    ? `✉ Application link emailed to ${formData.email}`
                    : `⚠ Email could not be sent to ${formData.email}. Please share the link manually below.`}
                </p>
              )}
            </Alert>

            {/* Email Notification Status Card (for customer-led only) */}
            {flow === 'customer-led' && emailNotification && (
              <Card className={`mb-4 shadow-sm ${emailNotification.sent ? 'border-success' : 'border-warning'}`}>
                <Card.Header className={emailNotification.sent ? 'bg-success text-white' : 'bg-warning text-dark'}>
                  <Card.Title className="mb-0">
                    {emailNotification.sent ? '✓ Email Sent Successfully' : '⚠ Email Status'}
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  {emailNotification.sent ? (
                    <>
                      <p className="mb-2">
                        <strong>Email sent to:</strong> {formData.email}
                      </p>
                      <p className="mb-3 text-muted">
                        {formData.firstName} will receive an email with instructions to complete their loan application. The link will be valid for 7 days.
                      </p>
                      {emailNotification.previewUrl && (
                        <a 
                          href={emailNotification.previewUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-success"
                        >
                          👁️ Preview Email (Ethereal)
                        </a>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="mb-2">
                        <strong>Status:</strong> {emailNotification.mode === 'dev-no-send' ? 'Development Mode (No Email Sent)' : 'Error Occurred'}
                      </p>
                      <p className="mb-0 text-muted">
                        However, the application link below can still be manually shared with the customer.
                      </p>
                    </>
                  )}
                </Card.Body>
              </Card>
            )}

            {flow === 'customer-led' && applicationLink && (
              <Card className="mb-4 shadow-sm">
                <Card.Header className="bg-primary text-white">
                  <Card.Title className="mb-0">🔗 Customer Application Link</Card.Title>
                </Card.Header>
                <Card.Body>
                  <p className="mb-3 text-muted">
                    Copy this link and send it to the customer. When they click it, they'll be taken through a 4-step verification process.
                  </p>
                  <div 
                    style={{
                      backgroundColor: '#f8f9fa',
                      padding: '15px',
                      borderRadius: '6px',
                      border: '1px solid #dee2e6',
                      marginBottom: '15px',
                      wordBreak: 'break-all',
                      fontFamily: 'monospace',
                      fontSize: '13px',
                    }}
                  >
                    {applicationLink}
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      variant="primary"
                      onClick={() => {
                        navigator.clipboard.writeText(applicationLink);
                        alert('Link copied to clipboard!');
                      }}
                    >
                      📋 Copy Link
                    </Button>
                    <a 
                      href={applicationLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary"
                    >
                      🔍 Test Link
                    </a>
                  </div>
                </Card.Body>
              </Card>
            )}

            <div className="d-grid gap-2">
              <Button onClick={onBack} variant="primary" size="lg">
                Create Another Application
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col md={flow === 'contractor-led' ? 10 : 8} className="mx-auto">
          <Button variant="secondary" onClick={onBack} className="mb-3">
            ← Back
          </Button>

          <Card>
            <Card.Header>
              <Card.Title className="mb-0">
                {flow === 'customer-led' ? 'Customer Led Flow - Basic Details' : 'Contractor Led Flow - Complete Application'}
              </Card.Title>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleReviewAndSubmit}>
                {flow === 'customer-led' ? (
                  // CUSTOMER-LED FLOW (Basic Details Only)
                  <>
                    {/* Customer Name Fields */}
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>First Name *</Form.Label>
                          <Form.Control
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Last Name *</Form.Label>
                          <Form.Control
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Email and Phone */}
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email Address *</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                          <Form.Text className="text-muted">
                            An "Apply Now" link will be sent to this email
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Phone Number *</Form.Label>
                          <Form.Control
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            placeholder="(123) 456-7890"
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* SSN and DOB */}
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Social Security Number *</Form.Label>
                          <Form.Control
                            type="text"
                            name="ssn"
                            value={formData.ssn}
                            onChange={handleInputChange}
                            placeholder="XXX-XX-XXXX"
                            maxLength={11}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Date of Birth *</Form.Label>
                          <Form.Control
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Requested Amount */}
                    <Form.Group className="mb-3">
                      <Form.Label>Requested Amount *</Form.Label>
                      <Form.Control
                        type="number"
                        name="requestedAmount"
                        value={formData.requestedAmount}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        step="0.01"
                        required
                      />
                    </Form.Group>
                  </>
                ) : (
                  // CONTRACTOR-LED FLOW (3 Sections)
                  <>
                    {/* ===== SECTION 1: PERSONAL DETAILS ===== */}
                    <Card className="mb-4 border-primary">
                      <Card.Header className="bg-primary text-white">
                        <Card.Title className="mb-0">1. Personal Details</Card.Title>
                      </Card.Header>
                      <Card.Body>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>First Name *</Form.Label>
                              <Form.Control
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Last Name *</Form.Label>
                              <Form.Control
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                required
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Mobile Number *</Form.Label>
                              <Form.Control
                                type="tel"
                                name="mobileNumber"
                                value={formData.mobileNumber}
                                onChange={handleInputChange}
                                placeholder="(123) 456-7890"
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Email Address *</Form.Label>
                              <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>SSN *</Form.Label>
                              <Form.Control
                                type="text"
                                name="ssn"
                                value={formData.ssn}
                                onChange={handleInputChange}
                                placeholder="XXX-XX-XXXX"
                                maxLength={11}
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>DOB *</Form.Label>
                              <Form.Control
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleInputChange}
                                required
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>

                    {/* ===== SECTION 2: PROJECT DETAILS ===== */}
                    <Card className="mb-4 border-success">
                      <Card.Header className="bg-success text-white">
                        <Card.Title className="mb-0">2. Project Details</Card.Title>
                      </Card.Header>
                      <Card.Body>
                        <Form.Group className="mb-3">
                          <Form.Label>Expected Financing Amount *</Form.Label>
                          <Form.Control
                            type="number"
                            name="expectedFinancingAmount"
                            value={formData.expectedFinancingAmount}
                            onChange={handleInputChange}
                            placeholder="0.00"
                            step="0.01"
                            required
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Project Type *</Form.Label>
                          <Form.Control
                            as="select"
                            name="projectType"
                            value={formData.projectType}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select project type</option>
                            <option value="residential">Residential</option>
                            <option value="commercial">Commercial</option>
                            <option value="renovation">Renovation</option>
                            <option value="new-construction">New Construction</option>
                            <option value="other">Other</option>
                          </Form.Control>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Project Address *</Form.Label>
                          <Row>
                            <Col md={12}>
                              <Form.Control
                                type="text"
                                name="projectAddressLine"
                                value={formData.projectAddressLine}
                                onChange={handleInputChange}
                                placeholder="Street address"
                                className="mb-2"
                                required
                              />
                            </Col>
                            <Col md={6}>
                              <Form.Control
                                type="text"
                                name="projectCity"
                                value={formData.projectCity}
                                onChange={handleInputChange}
                                placeholder="City"
                                className="mb-2"
                                required
                              />
                            </Col>
                            <Col md={3}>
                              <Form.Control
                                type="text"
                                name="projectState"
                                value={formData.projectState}
                                onChange={handleInputChange}
                                placeholder="State"
                                maxLength={2}
                                className="mb-2"
                                required
                              />
                            </Col>
                            <Col md={3}>
                              <Form.Control
                                type="text"
                                name="projectZipCode"
                                value={formData.projectZipCode}
                                onChange={handleInputChange}
                                placeholder="Zip Code"
                                maxLength={10}
                                className="mb-2"
                                required
                              />
                            </Col>
                          </Row>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Check
                            type="checkbox"
                            name="sameAsApplicantAddress"
                            label="Same as Applicant Address"
                            checked={formData.sameAsApplicantAddress}
                            onChange={handleInputChange}
                          />
                        </Form.Group>

                        {!formData.sameAsApplicantAddress && (
                          <Form.Group className="mb-3">
                            <Form.Label>Applicant Address *</Form.Label>
                            <Row>
                              <Col md={12}>
                                <Form.Control
                                  type="text"
                                  name="applicantAddressLine"
                                  value={formData.applicantAddressLine}
                                  onChange={handleInputChange}
                                  placeholder="Street address"
                                  className="mb-2"
                                  required={!formData.sameAsApplicantAddress}
                                />
                              </Col>
                              <Col md={6}>
                                <Form.Control
                                  type="text"
                                  name="applicantCity"
                                  value={formData.applicantCity}
                                  onChange={handleInputChange}
                                  placeholder="City"
                                  className="mb-2"
                                  required={!formData.sameAsApplicantAddress}
                                />
                              </Col>
                              <Col md={3}>
                                <Form.Control
                                  type="text"
                                  name="applicantState"
                                  value={formData.applicantState}
                                  onChange={handleInputChange}
                                  placeholder="State"
                                  maxLength={2}
                                  className="mb-2"
                                  required={!formData.sameAsApplicantAddress}
                                />
                              </Col>
                              <Col md={3}>
                                <Form.Control
                                  type="text"
                                  name="applicantZipCode"
                                  value={formData.applicantZipCode}
                                  onChange={handleInputChange}
                                  placeholder="Zip Code"
                                  maxLength={10}
                                  className="mb-2"
                                  required={!formData.sameAsApplicantAddress}
                                />
                              </Col>
                            </Row>
                          </Form.Group>
                        )}
                      </Card.Body>
                    </Card>

                    {/* ===== SECTION 3: FINANCIAL INFORMATION ===== */}
                    <Card className="mb-4 border-info">
                      <Card.Header className="bg-info text-white">
                        <Card.Title className="mb-0">3. Financial Information</Card.Title>
                      </Card.Header>
                      <Card.Body>
                        <Form.Group className="mb-3">
                          <Form.Label>Applicant's Income (Annual Income before taxes) *</Form.Label>
                          <Form.Control
                            type="number"
                            name="annualIncome"
                            value={formData.annualIncome}
                            onChange={handleInputChange}
                            placeholder="0.00"
                            step="0.01"
                            required
                          />
                        </Form.Group>

                        <div className="bg-light p-3 rounded mb-3">
                          <p className="mb-0">
                            <strong>Monthly Income:</strong> ${parseFloat(monthlyIncome).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>

                        <Form.Group className="mb-3">
                          <Form.Check
                            type="checkbox"
                            name="hasSpecialIncome"
                            label="Check this box if Income contains Retirement, Child Support or Alimony"
                            checked={formData.hasSpecialIncome}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Card.Body>
                    </Card>
                  </>
                )}

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <Button variant="secondary" onClick={onBack}>
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : (flow === 'contractor-led' ? 'Review and Submit' : 'Submit Application')}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
