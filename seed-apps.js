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
        status: 'pending',
        phoneVerified: 1,
        ssnVerified: 0,
        city: 'Seattle',
        state: 'WA'
      },
      {
        id: 'APP-SEED-2',
        token: 'APP-TOKEN-2',
        name: 'Bob Miller',
        email: 'bob@example.com',
        amount: 15000,
        flow: 'customer-led',
        status: 'submitted',
        phoneVerified: 1,
        ssnVerified: 1,
        city: 'Austin',
        state: 'TX'
      },
      {
        id: 'APP-SEED-3',
        token: 'APP-TOKEN-3',
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        amount: 50000,
        flow: 'contractor-led',
        status: 'approved',
        phoneVerified: 1,
        ssnVerified: 1,
        city: 'Denver',
        state: 'CO'
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
        .input('phoneVerified', null, app.phoneVerified)
        .input('ssnVerified', null, app.ssnVerified)
        .input('city', null, app.city)
        .input('state', null, app.state)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM applications WHERE id = @id)
          INSERT INTO applications (id, application_token, customer_name, customer_email, loan_amount, flow_type, status, phone_verified, ssn_verified, project_city, project_state)
          VALUES (@id, @token, @name, @email, @amount, @flow, @status, @phoneVerified, @ssnVerified, @city, @state)
          ELSE
          UPDATE applications SET phone_verified = @phoneVerified, ssn_verified = @ssnVerified, project_city = @city, project_state = @state WHERE id = @id
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
