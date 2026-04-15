'use client';

import { useState } from 'react';
import { Form, Button, Alert, Row, Col } from 'react-bootstrap';
import apiClient from '@/lib/api';

interface PersonalInfoStepProps {
  token: string;
  basicDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    ssn: string;
    dateOfBirth: string;
    requestedAmount: string;
  };
}

export default function PersonalInfoStep({
  token,
  basicDetails,
}: PersonalInfoStepProps) {
  const [formData, setFormData] = useState({
    firstName: basicDetails.firstName,
    lastName: basicDetails.lastName,
    email: basicDetails.email,
    confirmEmail: basicDetails.email,
    phoneNumber: basicDetails.phoneNumber,
    ssn: basicDetails.ssn,
    dateOfBirth: basicDetails.dateOfBirth,
    requestedAmount: basicDetails.requestedAmount,
    propertyStreetAddress: '',
    propertyCity: '',
    propertyState: '',
    propertyZipCode: '',
    sameAsPropertyAddress: 'yes',
    applicantStreetAddress: '',
    applicantCity: '',
    applicantState: '',
    applicantZipCode: '',
    annualIncome: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate emails match
    if (formData.email !== formData.confirmEmail) {
      setError('Email addresses do not match');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        personalInformation: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          confirmEmail: formData.confirmEmail,
          phoneNumber: formData.phoneNumber,
          ssn: formData.ssn,
          dateOfBirth: formData.dateOfBirth,
          requestedAmount: formData.requestedAmount,
        },
        propertyAddress: {
          streetAddress: formData.propertyStreetAddress,
          city: formData.propertyCity,
          state: formData.propertyState,
          zipCode: formData.propertyZipCode,
        },
        applicantAddress: {
          streetAddress: formData.sameAsPropertyAddress === 'yes' 
            ? formData.propertyStreetAddress 
            : formData.applicantStreetAddress,
          city: formData.sameAsPropertyAddress === 'yes' 
            ? formData.propertyCity 
            : formData.applicantCity,
          state: formData.sameAsPropertyAddress === 'yes' 
            ? formData.propertyState 
            : formData.applicantState,
          zipCode: formData.sameAsPropertyAddress === 'yes' 
            ? formData.propertyZipCode 
            : formData.applicantZipCode,
        },
        sameAsPropertyAddress: formData.sameAsPropertyAddress === 'yes',
        financialDetails: {
          annualIncome: formData.annualIncome,
        },
      };

      const response = await apiClient.post(`/applications/${token}/submit`, payload);

      if (response.data.success) {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Alert variant="success">
        <Alert.Heading>Application Submitted Successfully!</Alert.Heading>
        <p>
          Your application has been submitted. You will receive an email confirmation shortly.
          A lender will review your application and contact you within 2-3 business days.
        </p>
      </Alert>
    );
  }

  return (
    <div>
      <h4 className="mb-4">Step 4: Complete Your Information</h4>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        {/* Personal Information Section */}
        <h5 className="mt-4 mb-3">Personal Information</h5>

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
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Confirm Email Address *</Form.Label>
              <Form.Control
                type="email"
                name="confirmEmail"
                value={formData.confirmEmail}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Phone Number *</Form.Label>
              <Form.Control
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
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

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Social Security Number *</Form.Label>
              <Form.Control
                type="text"
                name="ssn"
                value={formData.ssn}
                disabled
                className="bg-light"
              />
              <Form.Text className="text-muted">Already verified</Form.Text>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Requested Loan Amount *</Form.Label>
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
          </Col>
        </Row>

        {/* Property Address Section */}
        <h5 className="mt-4 mb-3">Property Address</h5>

        <Form.Group className="mb-3">
          <Form.Label>Street Address *</Form.Label>
          <Form.Control
            type="text"
            name="propertyStreetAddress"
            value={formData.propertyStreetAddress}
            onChange={handleInputChange}
            required
          />
        </Form.Group>

        <Row>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>City *</Form.Label>
              <Form.Control
                type="text"
                name="propertyCity"
                value={formData.propertyCity}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>State *</Form.Label>
              <Form.Control
                type="text"
                name="propertyState"
                value={formData.propertyState}
                onChange={handleInputChange}
                placeholder="CA"
                maxLength={2}
                required
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Zip Code *</Form.Label>
              <Form.Control
                type="text"
                name="propertyZipCode"
                value={formData.propertyZipCode}
                onChange={handleInputChange}
                placeholder="90210"
                required
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Applicant Address Section */}
        <h5 className="mt-4 mb-3">Applicant's Address</h5>

        <Form.Group className="mb-3">
          <Form.Check
            type="radio"
            label="Same as Property Address"
            name="sameAsPropertyAddress"
            value="yes"
            checked={formData.sameAsPropertyAddress === 'yes'}
            onChange={handleInputChange}
          />
          <Form.Check
            type="radio"
            label="Different Address"
            name="sameAsPropertyAddress"
            value="no"
            checked={formData.sameAsPropertyAddress === 'no'}
            onChange={handleInputChange}
          />
        </Form.Group>

        {formData.sameAsPropertyAddress === 'no' && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Street Address *</Form.Label>
              <Form.Control
                type="text"
                name="applicantStreetAddress"
                value={formData.applicantStreetAddress}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>City *</Form.Label>
                  <Form.Control
                    type="text"
                    name="applicantCity"
                    value={formData.applicantCity}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>State *</Form.Label>
                  <Form.Control
                    type="text"
                    name="applicantState"
                    value={formData.applicantState}
                    onChange={handleInputChange}
                    placeholder="CA"
                    maxLength={2}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Zip Code *</Form.Label>
                  <Form.Control
                    type="text"
                    name="applicantZipCode"
                    value={formData.applicantZipCode}
                    onChange={handleInputChange}
                    placeholder="90210"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </>
        )}

        {/* Financial Details Section */}
        <h5 className="mt-4 mb-3">Financial Details</h5>

        <Form.Group className="mb-3">
          <Form.Label>Annual Income *</Form.Label>
          <Form.Control
            type="number"
            name="annualIncome"
            value={formData.annualIncome}
            onChange={handleInputChange}
            placeholder="0.00"
            step="0.01"
            required
          />
          <Form.Text className="text-muted">
            Monthly income will be calculated automatically
          </Form.Text>
        </Form.Group>

        <div className="d-grid gap-2">
          <Button variant="primary" type="submit" disabled={loading} size="lg">
            {loading ? 'Submitting Application...' : 'Submit Application'}
          </Button>
        </div>
      </Form>
    </div>
  );
}
