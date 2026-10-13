import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/server';

describe('Emergency Blood Requests Workflow & Safety Controls', () => {
  let authToken: string;

  it('registers a dedicated test requester to obtain bearer token', async () => {
    const testEmail = `test.requester.${Date.now()}@lifelink.demo`;
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Test Requester User',
      email: testEmail,
      password: 'DemoPatient@123',
      role: 'PATIENT',
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    authToken = res.body.token;
  });

  it('rejects unauthenticated request creation with 401', async () => {
    const res = await request(app).post('/api/requests/create').send({
      patientName: 'Test Patient',
      bloodGroup: 'O+',
      hospitalName: 'Apollo Hospital',
      city: 'Bengaluru',
      requiredBy: new Date(Date.now() + 86400000).toISOString(),
    });
    expect(res.status).toBe(401);
  });

  it('validates required fields and future required-by timestamp', async () => {
    const res = await request(app)
      .post('/api/requests/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        patientName: 'P',
        bloodGroup: 'INVALID',
        hospitalName: '',
        city: '',
        requiredBy: new Date(Date.now() - 10000).toISOString(), // in the past
      });
    expect(res.status).toBe(400);
  });

  it('allows authenticated requester to create an emergency blood request', async () => {
    const randomSuffix = Math.floor(Math.random() * 10000);
    const res = await request(app)
      .post('/api/requests/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        patientName: `[DEMO] Ramesh Patel ${randomSuffix}`,
        bloodGroup: 'B+',
        unitsRequired: 2,
        hospitalName: `Manipal Hospital ${randomSuffix}`,
        city: 'Bengaluru',
        pincode: '560038',
        latitude: 12.9592,
        longitude: 77.6534,
        requiredBy: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        urgency: 'CRITICAL',
        contactPreference: 'IN_APP',
        note: 'Emergency bypass surgery requirement',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.bloodRequest.bloodGroup).toBe('B+');
    expect(res.body.bloodRequest.status).toBe('OPEN');
    expect(res.body.matchedDonorsCount).toBeGreaterThanOrEqual(0);
  });

  it('detects and prevents duplicate open emergency requests', async () => {
    const fixedPatient = `[DEMO] Duplicate Test ${Date.now()}`;
    const fixedHospital = 'Fortis Hospital';

    // 1st request
    const res1 = await request(app)
      .post('/api/requests/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        patientName: fixedPatient,
        bloodGroup: 'AB-',
        unitsRequired: 1,
        hospitalName: fixedHospital,
        city: 'Bengaluru',
        requiredBy: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        urgency: 'HIGH',
      });
    expect(res1.status).toBe(201);

    // 2nd identical request within 1 hour -> should be rejected with 409
    const res2 = await request(app)
      .post('/api/requests/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        patientName: fixedPatient,
        bloodGroup: 'AB-',
        unitsRequired: 1,
        hospitalName: fixedHospital,
        city: 'Bengaluru',
        requiredBy: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        urgency: 'HIGH',
      });
    expect(res2.status).toBe(409);
    expect(res2.body.error).toContain('duplicate open request');
  });
});
