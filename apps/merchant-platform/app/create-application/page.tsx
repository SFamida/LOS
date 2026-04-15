'use client';

import { useState } from 'react';
import { Button, Card, Row, Col } from 'react-bootstrap';
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
    return <ApplicationFlow flow={selectedFlow} onBack={handleBack} />;
  }

  const content = (
    <>
      <div className="mb-4">
        <h2>Create New Application</h2>
        <p className="text-muted">Choose how you want to create this application</p>
      </div>

      <Row>
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <div style={{ textAlign: 'center' }}>
                <i
                  className="fas fa-envelope"
                  style={{
                    fontSize: '48px',
                    color: '#3b82f6',
                    marginBottom: '16px',
                    display: 'block',
                  }}
                ></i>
                <h4>Customer Led Flow</h4>
                <p className="text-muted" style={{ marginBottom: '20px' }}>
                  Fill basic details and send a link to your customer to complete the application
                </p>
                <Button
                  variant="primary"
                  onClick={() => handleSelectFlow('customer-led')}
                  className="w-100"
                >
                  Start Customer Led Flow
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <div style={{ textAlign: 'center' }}>
                <i
                  className="fas fa-user-tie"
                  style={{
                    fontSize: '48px',
                    color: '#10b981',
                    marginBottom: '16px',
                    display: 'block',
                  }}
                ></i>
                <h4>Contractor Led Flow</h4>
                <p className="text-muted" style={{ marginBottom: '20px' }}>
                  Fill the complete application on behalf of your customer
                </p>
                <Button
                  variant="success"
                  onClick={() => handleSelectFlow('contractor-led')}
                  className="w-100"
                >
                  Start Contractor Led Flow
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );

  return <AdminLayout platformName="Merchant">{content}</AdminLayout>;
}
