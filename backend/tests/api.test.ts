import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/server';

describe('LifeLink REST API Endpoints', () => {
  it('GET /api/health should return 200 OK and system status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ONLINE');
    expect(res.body.project).toBe('LifeLink – Smart Blood Donor Network');
  });

  it('GET /api/directory/hospitals should return list of hospitals', async () => {
    const res = await request(app).get('/api/directory/hospitals');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.hospitals)).toBe(true);
  });

  it('GET /api/directory/blood-banks should return list of blood banks', async () => {
    const res = await request(app).get('/api/directory/blood-banks');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.bloodBanks)).toBe(true);
  });

  it('GET /api/requests/emergency should return emergency requests feed with safety notice', async () => {
    const res = await request(app).get('/api/requests/emergency');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.emergencyNotice).toContain('112 / 108');
  });

  it('GET /api/directory/public-stats should return actual DB counts', async () => {
    const res = await request(app).get('/api/directory/public-stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats).toBeDefined();
    expect(typeof res.body.stats.totalDonors).toBe('number');
    expect(typeof res.body.stats.activeRequests).toBe('number');
  });

  it('GET /api/donors/search should filter compatible donors and compute ranking', async () => {
    const res = await request(app).get('/api/donors/search?bloodGroup=A%2B');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.donors)).toBe(true);
    if (res.body.donors.length > 0) {
      const first = res.body.donors[0];
      expect(first.rankingScore).toBeDefined();
      expect(first.rankingExplanation).toBeDefined();
      // Ensure phone and email are not exposed publicly in search
      expect(first.phone).toBeUndefined();
      expect(first.email).toBeUndefined();
    }
  });

  it('GET /api/donors/search should not imply compatibility when all groups are requested', async () => {
    const res = await request(app).get(
      '/api/donors/search?bloodGroup=ALL&latitude=12.9716&longitude=77.5946&sortBy=distance'
    );
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.meta.compatibleGroups).toHaveLength(8);
    expect(res.body.donors.every((donor: { compatibilityType: string }) =>
      donor.compatibilityType === 'UNASSESSED'
    )).toBe(true);
  });

  it('GET /api/admin/analytics should reject unauthorized requests with 401', async () => {
    const res = await request(app).get('/api/admin/analytics');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/donors/analytics should reject unauthorized requests with 401', async () => {
    const res = await request(app).get('/api/donors/analytics');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
