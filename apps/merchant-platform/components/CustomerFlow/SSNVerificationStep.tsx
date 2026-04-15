'use client';

import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import apiClient from '@/lib/api';

interface SSNVerificationStepProps {
  token: string;
  ssn: string;
  onSSNVerified: () => void;
}

export default function SSNVerificationStep({
  token,
  ssn,
  onSSNVerified,
}: SSNVerificationStepProps) {
  const [enteredSSN, setEnteredSSN] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerifySSN = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate SSN has exactly 9 digits
    const ssnDigits = enteredSSN.replace(/\D/g, '');
    if (ssnDigits.length !== 9) {
      setError('SSN must be exactly 9 digits');
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.post(`/applications/${token}/verify-ssn`, {
        ssn: enteredSSN.trim(),
      });

      if (response.data.success) {
        onSSNVerified();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify SSN');
    } finally {
      setLoading(false);
    }
  };

  const formatSSN = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as XXX-XX-XXXX
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 5) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else {
      return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`;
    }
  };

  const handleSSNChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSSN(e.target.value);
    setEnteredSSN(formatted);
  };

  return (
    <div>
      <h4 className="mb-4">Step 3: Verify Social Security Number</h4>
      <p className="text-muted">
        Enter your Social Security Number to verify your identity and check for existing applications.
      </p>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleVerifySSN}>
        <Form.Group className="mb-3">
          <Form.Label>Social Security Number (SSN) * (9 digits)</Form.Label>
          <Form.Control
            type="text"
            value={enteredSSN}
            onChange={handleSSNChange}
            placeholder="XXX-XX-XXXX"
            maxLength={11}
            required
          />
          <Form.Text className="text-muted">
            This will be used to verify your identity. Max 9 digits.
          </Form.Text>
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
          disabled={loading || enteredSSN.replace(/\D/g, '').length !== 9}
          className="w-100"
        >
          {loading ? 'Verifying...' : 'Verify SSN'}
        </Button>
      </Form>

      <Alert variant="warning" className="mt-3">
        <small>
          <strong>Privacy Notice:</strong> Your SSN is encrypted and only used for identity verification and fraud prevention.
        </small>
      </Alert>
    </div>
  );
}
