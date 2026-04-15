'use client';

import { Card } from 'react-bootstrap';
import AdminLayout from '@/components/AdminLayout';

export default function MerchantAppsPage() {
  const content = (
    <>
      <div className="mb-4">
        <h2>Merchant Apps</h2>
        <p className="text-muted">View all merchant applications</p>
      </div>

      <Card>
        <Card.Body>
          <p className="text-muted">Merchant applications list coming soon...</p>
        </Card.Body>
      </Card>
    </>
  );

  return <AdminLayout platformName="Lender">{content}</AdminLayout>;
}
