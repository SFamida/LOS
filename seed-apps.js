const { getConnection } = require('./services/api/src/db/connection');

async function seedApplications() {
  try {
    const pool = await getConnection();
    const request = pool.request();

    console.log('Seeding applications...');

    const apps = [
      {
        id: 'APP-SEED-1',
        token: 'APP-TOKEN-1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        amount: 25000,
        flow: 'contractor-led',
        status: 'pending'
      },
      {
        id: 'APP-SEED-2',
        token: 'APP-TOKEN-2',
        name: 'Bob Miller',
        email: 'bob@example.com',
        amount: 15000,
        flow: 'customer-led',
        status: 'submitted'
      },
      {
        id: 'APP-SEED-3',
        token: 'APP-TOKEN-3',
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        amount: 50000,
        flow: 'contractor-led',
        status: 'approved'
      }
    ];

    for (const app of apps) {
      await pool.request()
        .input('id', null, app.id)
        .input('token', null, app.token)
        .input('name', null, app.name)
        .input('email', null, app.email)
        .input('amount', null, app.amount)
        .input('flow', null, app.flow)
        .input('status', null, app.status)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM applications WHERE id = @id)
          INSERT INTO applications (id, application_token, customer_name, customer_email, loan_amount, flow_type, status)
          VALUES (@id, @token, @name, @email, @amount, @flow, @status)
        `);
      console.log(`- Seeded application: ${app.name}`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedApplications();
