'use client';

import { Card } from 'react-bootstrap';
import AdminLayout from '@/components/AdminLayout';

export default function OfferManagementPage() {
  const content = (
    <>
      <div className="mb-4">
        <h2>Offer Management</h2>
        <p className="text-muted">Manage your loan offers and terms</p>
      </div>

      <Card>
        <Card.Body>
          <p className="text-muted">Offer management features coming soon...</p>
        </Card.Body>
      </Card>
    </>
  );

  return <AdminLayout platformName="Merchant">{content}</AdminLayout>;
}
