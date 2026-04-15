'use client';

import { useState } from 'react';
import { Form, Button, Alert, Row, Col } from 'react-bootstrap';
import apiClient from '@/lib/api';

interface OTPVerificationStepProps {
  token: string;
  phoneNumber: string;
  onOTPVerified: () => void;
}

export default function OTPVerificationStep({
  token,
  phoneNumber,
  onOTPVerified,
}: OTPVerificationStepProps) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post(`/applications/${token}/verify-otp`, {
        otp: otp.trim(),
      });

      if (response.data.success) {
        onOTPVerified();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4 className="mb-4">Step 2: Verify OTP</h4>
      <p className="text-muted">
        Enter the 6-digit code sent to{' '}
        <strong>{phoneNumber}</strong>
      </p>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleVerifyOTP}>
        <Form.Group className="mb-3">
          <Form.Label>One-Time Password (OTP) *</Form.Label>
          <Form.Control
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            inputMode="numeric"
            className="text-center"
            style={{ fontSize: '24px', letterSpacing: '8px' }}
            required
          />
          <Form.Text className="text-muted">
            6-digit code from your SMS message
          </Form.Text>
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-100"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </Button>
      </Form>

      <Alert variant="info" className="mt-3">
        <small>Didn't receive the code? Check your spam folder or request a new code.</small>
      </Alert>
    </div>
  );
}
