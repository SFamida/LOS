const http = require('http');

const testData = {
  basicDetails: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNumber: '(555) 123-4567',
    ssn: '123-45-6789',
    dateOfBirth: '1990-01-15',
    requestedAmount: '50000',
  },
  flowType: 'customer-led',
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 3003,
  path: '/applications',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
  },
};

const req = http.request(options, (res) => {
  let data = '';

  console.log(`\nStatus Code: ${res.statusCode}\n`);

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('Response:', JSON.stringify(response, null, 2));
    } catch (e) {
      console.log('Response:', data);
    }
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
  process.exit(1);
});

req.write(postData);
req.end();

console.log('Submitting test application...');
console.log('Payload:', JSON.stringify(testData, null, 2));
