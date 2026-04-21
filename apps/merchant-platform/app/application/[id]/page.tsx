'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
      setError(err.response?.data?.message || 'Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const statusConfig: { [key: string]: { color: string; bg: string; border: string; dot: string } } = {
    'draft':       { color: '#6c757d', bg: '#f8f9fa',   border: '#dee2e6', dot: '#adb5bd' },
    'pending':     { color: '#b45309', bg: '#fffbeb',   border: '#fde68a', dot: '#f59e0b' },
    'in-progress': { color: '#0369a1', bg: '#eff6ff',   border: '#bfdbfe', dot: '#3b82f6' },
    'approved':    { color: '#15803d', bg: '#f0fdf4',   border: '#bbf7d0', dot: '#22c55e' },
    'rejected':    { color: '#b91c1c', bg: '#fef2f2',   border: '#fecaca', dot: '#ef4444' },
  };

  const getStatusBadge = (status: string) => {
    const cfg = statusConfig[status] || statusConfig['draft'];
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '5px 14px', borderRadius: '20px',
        background: cfg.bg, color: cfg.color,
        border: '1px solid ' + cfg.border,
        fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.03em', textTransform: 'capitalize',
      }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot }} />
        {status}
      </span>
    );
  };

  const getFlowBadge = (flowType: string) => {
    const isCustomer = flowType === 'customer-led';
    return (
      <span style={{
        padding: '5px 14px', borderRadius: '20px',
        background: isCustomer ? '#eff6ff' : '#f3f4f6',
        color: isCustomer ? '#1d4ed8' : '#374151',
        border: '1px solid ' + (isCustomer ? '#bfdbfe' : '#e5e7eb'),
        fontSize: '0.8rem', fontWeight: 600,
      }}>
        {isCustomer ? 'Customer Led' : 'Contractor Led'}
      </span>
    );
  };

  const sectionCard: React.CSSProperties = {
    background: '#fff', borderRadius: '14px',
    border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    marginBottom: '20px', overflow: 'hidden',
  };
  const mkSectionHeader = (): React.CSSProperties => ({
    padding: '14px 22px', borderBottom: '1px solid #f3f4f6',
    display: 'flex', alignItems: 'center', gap: '10px',
  });
  const mkAccentBar = (color: string): React.CSSProperties => ({
    width: 4, height: 18, borderRadius: 2, background: color, flexShrink: 0,
  });
  const sectionTitle: React.CSSProperties = {
    fontSize: '0.92rem', fontWeight: 700, color: '#111827', margin: 0,
  };
  const fieldGrid: React.CSSProperties = {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '20px 28px', padding: '20px 22px',
  };
  const fieldLabel: React.CSSProperties = {
    fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.06em', color: '#9ca3af', marginBottom: '4px',
  };
  const fieldValue: React.CSSProperties = {
    fontSize: '0.95rem', color: '#111827', fontWeight: 500,
  };

  const fmt = (val: string) =>
    '$' + parseFloat(val || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (loading) {
    return (
      <AdminLayout platformName="Merchant">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, flexDirection: 'column', gap: 16 }}>
          <div style={{ width: 36, height: 36, border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Loading application...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error || !application) {
    return (
      <AdminLayout platformName="Merchant">
        <button onClick={() => router.back()} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6366f1', fontWeight: 600, cursor: 'pointer', padding: '8px 0', marginBottom: 16, fontSize: '0.9rem' }}>
          ← Back
        </button>
        <div style={{ padding: '18px 22px', borderRadius: 12, background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', fontSize: '0.9rem' }}>
          {error || 'Application not found'}
        </div>
      </AdminLayout>
    );
  }

  const content = (
    <>
      <button
        onClick={() => router.back()}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6366f1', fontWeight: 600, cursor: 'pointer', padding: '8px 0', marginBottom: 20, fontSize: '0.88rem' }}
      >
        ← Back to Applications
      </button>

      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 60%, #4f46e5 100%)',
        borderRadius: '16px', padding: '28px 32px', marginBottom: '24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        flexWrap: 'wrap', gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {application.basicDetails?.firstName?.[0]}{application.basicDetails?.lastName?.[0]}
          </div>
          <div>
            <h2 style={{ margin: 0, color: '#fff', fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.2 }}>
              {application.basicDetails?.firstName} {application.basicDetails?.lastName}
            </h2>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontFamily: 'monospace', marginTop: 4 }}>
              {application.id}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          {getStatusBadge(application.status)}
          {getFlowBadge(application.flowType)}
        </div>
      </div>

      <div style={sectionCard}>
        <div style={mkSectionHeader()}>
          <div style={mkAccentBar('#4f46e5')} />
          <h3 style={sectionTitle}>Personal Details</h3>
        </div>
        <div style={fieldGrid}>
          <div><div style={fieldLabel}>First Name</div><div style={fieldValue}>{application.basicDetails?.firstName}</div></div>
          <div><div style={fieldLabel}>Last Name</div><div style={fieldValue}>{application.basicDetails?.lastName}</div></div>
          <div><div style={fieldLabel}>Email Address</div><div style={fieldValue}>{application.basicDetails?.email}</div></div>
          <div><div style={fieldLabel}>Mobile Number</div><div style={fieldValue}>{application.basicDetails?.phoneNumber}</div></div>
          <div><div style={fieldLabel}>SSN</div><div style={fieldValue}>{application.basicDetails?.ssn}</div></div>
          <div><div style={fieldLabel}>Date of Birth</div><div style={fieldValue}>{new Date(application.basicDetails?.dateOfBirth).toLocaleDateString()}</div></div>
        </div>
      </div>

      {application.projectDetails && (
        <div style={sectionCard}>
          <div style={mkSectionHeader()}>
            <div style={mkAccentBar('#059669')} />
            <h3 style={sectionTitle}>Project Details</h3>
          </div>
          <div style={fieldGrid}>
            <div>
              <div style={fieldLabel}>Expected Financing Amount</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#059669' }}>{fmt(application.projectDetails.expectedFinancingAmount)}</div>
            </div>
            <div><div style={fieldLabel}>Project Type</div><div style={fieldValue}>{application.projectDetails.projectType}</div></div>
            <div style={{ gridColumn: '1 / -1' }}><div style={fieldLabel}>Project Address</div><div style={fieldValue}>{application.projectDetails.projectAddress}</div></div>
            {application.projectDetails.sameAsApplicantAddress && (
              <div style={{ gridColumn: '1 / -1' }}><div style={fieldLabel}>Applicant Address</div><div style={fieldValue}>{application.projectDetails.applicantAddress}</div></div>
            )}
          </div>
        </div>
      )}

      {application.financialDetails && (
        <div style={sectionCard}>
          <div style={mkSectionHeader()}>
            <div style={mkAccentBar('#0ea5e9')} />
            <h3 style={sectionTitle}>Financial Information</h3>
          </div>
          <div style={fieldGrid}>
            <div><div style={fieldLabel}>Annual Income</div><div style={fieldValue}>{fmt(application.financialDetails.annualIncome)}</div></div>
            <div><div style={fieldLabel}>Monthly Income</div><div style={fieldValue}>{fmt(application.financialDetails.monthlyIncome)}</div></div>
            <div>
              <div style={fieldLabel}>Special Income</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 500, color: application.financialDetails.hasSpecialIncome ? '#059669' : '#9ca3af' }}>
                {application.financialDetails.hasSpecialIncome ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        </div>
      )}

      {!application.projectDetails && (
        <div style={sectionCard}>
          <div style={mkSectionHeader()}>
            <div style={mkAccentBar('#0ea5e9')} />
            <h3 style={sectionTitle}>Loan Information</h3>
          </div>
          <div style={fieldGrid}>
            <div>
              <div style={fieldLabel}>Requested Amount</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#4f46e5' }}>{fmt(application.basicDetails?.requestedAmount)}</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', padding: '14px 20px', borderRadius: '10px', background: '#f9fafb', border: '1px solid #f3f4f6', marginBottom: '24px' }}>
        <div>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af' }}>Created</span>
          <div style={{ fontSize: '0.86rem', color: '#374151', fontWeight: 500, marginTop: 2 }}>{new Date(application.createdAt).toLocaleString()}</div>
        </div>
        <div>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af' }}>Last Updated</span>
          <div style={{ fontSize: '0.86rem', color: '#374151', fontWeight: 500, marginTop: 2 }}>{new Date(application.updatedAt).toLocaleString()}</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', paddingBottom: 24 }}>
        <button
          onClick={() => router.back()}
          style={{ padding: '10px 24px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}
        >
          ← Back to Applications
        </button>
      </div>
    </>
  );

  return <AdminLayout platformName="Merchant">{content}</AdminLayout>;
}
