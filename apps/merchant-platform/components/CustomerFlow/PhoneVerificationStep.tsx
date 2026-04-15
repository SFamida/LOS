'use client';

import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import apiClient from '@/lib/api';

interface PhoneVerificationStepProps {
  token: string;
  phoneNumber: string;
  onOTPRequested: () => void;
}

export default function PhoneVerificationStep({
  token,
  phoneNumber,
  onOTPRequested,
}: PhoneVerificationStepProps) {
  const [phone, setPhone] = useState(phoneNumber);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '').slice(0, 10);
    
    // Format as (XXX) XXX-XXXX
    if (digits.length === 0) {
      return '';
    } else if (digits.length <= 3) {
      return `(${digits}`;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate phone number - max 10 digits
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.post(`/applications/${token}/request-otp`, {
        phoneNumber: phone,
      });

      if (response.data.success) {
        setOtpSent(true);
        onOTPRequested();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4 className="mb-4">Step 1: Verify Phone Number</h4>
      <p className="text-muted">Enter your mobile number to receive an OTP for verification.</p>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleRequestOTP}>
        <Form.Group className="mb-3">
          <Form.Label>Mobile Number * (10 digits)</Form.Label>
          <Form.Control
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="(123) 456-7890"
            maxLength={14}
            required
          />
          <Form.Text className="text-muted">
            We will send a verification code to this number. Max 10 digits.
          </Form.Text>
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
          disabled={loading}
          className="w-100"
        >
          {loading ? 'Sending OTP...' : 'Send OTP'}
        </Button>
      </Form>

      {otpSent && (
        <Alert variant="info" className="mt-3">
          OTP has been sent to your mobile number. Please check your messages.
        </Alert>
      )}
    </div>
  );
}
