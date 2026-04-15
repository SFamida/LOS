'use client';

import { Card } from 'react-bootstrap';
import AdminLayout from '@/components/AdminLayout';

export default function CustomersPage() {
  const content = (
    <>
      <div className="mb-4">
        <h2>Customers</h2>
        <p className="text-muted">Manage customer information</p>
      </div>

      <Card>
        <Card.Body>
          <p className="text-muted">Customer management features coming soon...</p>
        </Card.Body>
      </Card>
    </>
  );

  return <AdminLayout platformName="Lender">{content}</AdminLayout>;
}
