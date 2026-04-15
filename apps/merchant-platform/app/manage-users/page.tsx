'use client';

import { Card } from 'react-bootstrap';
import AdminLayout from '@/components/AdminLayout';

export default function ManageUsersPage() {
  const content = (
    <>
      <div className="mb-4">
        <h2>Manage Users</h2>
        <p className="text-muted">Manage user accounts and permissions</p>
      </div>

      <Card>
        <Card.Body>
          <p className="text-muted">User management features coming soon...</p>
        </Card.Body>
      </Card>
    </>
  );

  return <AdminLayout platformName="Merchant">{content}</AdminLayout>;
}
