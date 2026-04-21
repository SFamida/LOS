'use client';

import { useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import AdminLayout from '@/components/AdminLayout';
import ApplicationFlow from '@/components/ApplicationFlow';

export default function CreateApplicationPage() {
  const [selectedFlow, setSelectedFlow] = useState<'customer-led' | 'contractor-led' | null>(null);

  const handleSelectFlow = (flow: 'customer-led' | 'contractor-led') => {
    setSelectedFlow(flow);
  };

  const handleBack = () => {
    setSelectedFlow(null);
  };

  if (selectedFlow) {
    return (
      <AdminLayout platformName="Merchant">
        <ApplicationFlow flow={selectedFlow} onBack={handleBack} />
      </AdminLayout>
    );
  }

  const content = (
    <div className="py-4">
      <Row className="g-4">
        <Col lg={5} md={6}>
          <div className="selection-card blue" onClick={() => handleSelectFlow('customer-led')}>
            <div className="selection-icon-box">
              <i className="fa-regular fa-paper-plane"></i>
            </div>
            <div className="selection-title">Customer Led Flow</div>
            <p className="selection-desc">
              Ideal for remote onboarding. Enter basic details and we'll send a secure link 
              directly to your customer to complete their own application.
            </p>
            <button className="selection-btn">
              <span>Start Customer Flow</span>
              <i className="fa-solid fa-arrow-right-long"></i>
            </button>
          </div>
        </Col>

        <Col lg={5} md={6}>
          <div className="selection-card green" onClick={() => handleSelectFlow('contractor-led')}>
            <div className="selection-icon-box">
              <i className="fa-regular fa-pen-to-square"></i>
            </div>
            <div className="selection-title">Contractor Led Flow</div>
            <p className="selection-desc">
              Best for in-person sales. Use this option to fill out the complete 
              application yourself while sitting with the customer.
            </p>
            <button className="selection-btn">
              <span>Start Full Onboarding</span>
              <i className="fa-solid fa-arrow-right-long"></i>
            </button>
          </div>
        </Col>
      </Row>
    </div>
  );

  return <AdminLayout platformName="Merchant">{content}</AdminLayout>;
}
