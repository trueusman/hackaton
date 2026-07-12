const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const User = require('../src/models/User');
const { connect, closeDatabase, clearDatabase } = require('./setup');
const { ROLES } = require('../src/constants/roles');

beforeAll(async () => connect());
afterEach(async () => clearDatabase());
afterAll(async () => closeDatabase());

async function seedUser({ name, email, password, role }) {
  const passwordHash = await bcrypt.hash(password, 4);
  await User.create({ name, email, passwordHash, role });
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return { token: res.body.data.accessToken, user: res.body.data.user };
}

describe('Asset -> Issue -> Maintenance workflow', () => {
  let adminToken;
  let technicianToken;
  let technicianId;

  beforeEach(async () => {
    const admin = await seedUser({ name: 'Admin', email: 'admin@test.com', password: 'Password123', role: ROLES.ADMIN });
    adminToken = admin.token;
    const tech = await seedUser({
      name: 'Tech',
      email: 'tech@test.com',
      password: 'Password123',
      role: ROLES.TECHNICIAN,
    });
    technicianToken = tech.token;
    technicianId = tech.user.id;
  });

  async function createAsset() {
    const res = await request(app)
      .post('/api/assets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Projector 01', category: 'Electronics', location: 'Room 101' });
    return res.body.data.asset;
  }

  it('sets asset status to "Issue Reported" when a public issue is submitted, and rejects retired assets', async () => {
    const asset = await createAsset();

    const reportRes = await request(app)
      .post('/api/issues')
      .field('assetCode', asset.assetCode)
      .field('title', 'Flickering display')
      .field('description', 'The display flickers and loses HDMI signal intermittently.');

    expect(reportRes.status).toBe(201);

    const assetRes = await request(app).get(`/api/assets/${asset._id}`).set('Authorization', `Bearer ${adminToken}`);
    expect(assetRes.body.data.asset.status).toBe('Issue Reported');

    await request(app).post(`/api/assets/${asset._id}/retire`).set('Authorization', `Bearer ${adminToken}`);

    const retiredReport = await request(app)
      .post('/api/issues')
      .field('assetCode', asset.assetCode)
      .field('title', 'Another issue')
      .field('description', 'Should be rejected because the asset is retired.');

    expect(retiredReport.status).toBe(400);
    expect(retiredReport.body.code).toBe('ASSET_RETIRED');
  });

  it('rejects an invalid issue status transition', async () => {
    const asset = await createAsset();
    const issueRes = await request(app)
      .post('/api/issues')
      .field('assetCode', asset.assetCode)
      .field('title', 'Broken switch')
      .field('description', 'The power switch does not respond.');
    const issue = issueRes.body.data.issue;

    // Reported -> Maintenance In Progress directly is not a valid transition
    const res = await request(app)
      .patch(`/api/issues/${issue._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Maintenance In Progress' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_ISSUE_STATUS_TRANSITION');
  });

  it('refuses to resolve an issue without a maintenance record, then succeeds once one exists', async () => {
    const asset = await createAsset();
    const issueRes = await request(app)
      .post('/api/issues')
      .field('assetCode', asset.assetCode)
      .field('title', 'AC leaking')
      .field('description', 'Water leakage under the unit.');
    const issue = issueRes.body.data.issue;

    await request(app)
      .patch(`/api/issues/${issue._id}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ technicianId });

    await request(app)
      .patch(`/api/issues/${issue._id}/status`)
      .set('Authorization', `Bearer ${technicianToken}`)
      .send({ status: 'Inspection Started' });

    const prematureResolve = await request(app)
      .patch(`/api/issues/${issue._id}/resolve`)
      .set('Authorization', `Bearer ${technicianToken}`)
      .send({ resolutionSummary: 'Fixed it' });

    expect(prematureResolve.status).toBe(400);
    expect(prematureResolve.body.code).toBe('MAINTENANCE_NOTE_REQUIRED');

    const maintenanceRes = await request(app)
      .post(`/api/maintenance/issues/${issue._id}`)
      .set('Authorization', `Bearer ${technicianToken}`)
      .field('workPerformed', 'Cleared blocked drain pipe')
      .field('totalCost', '25');
    expect(maintenanceRes.status).toBe(201);

    const resolveRes = await request(app)
      .patch(`/api/issues/${issue._id}/resolve`)
      .set('Authorization', `Bearer ${technicianToken}`)
      .send({ resolutionSummary: 'Cleared the drain pipe, leak stopped' });

    expect(resolveRes.status).toBe(200);
    expect(resolveRes.body.data.issue.status).toBe('Resolved');

    const assetRes = await request(app).get(`/api/assets/${asset._id}`).set('Authorization', `Bearer ${adminToken}`);
    expect(assetRes.body.data.asset.status).toBe('Operational');
  });

  it('rejects a negative maintenance cost', async () => {
    const asset = await createAsset();
    const issueRes = await request(app)
      .post('/api/issues')
      .field('assetCode', asset.assetCode)
      .field('title', 'Loose cable')
      .field('description', 'Cable keeps disconnecting.');
    const issue = issueRes.body.data.issue;

    await request(app)
      .patch(`/api/issues/${issue._id}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ technicianId });

    const res = await request(app)
      .post(`/api/maintenance/issues/${issue._id}`)
      .set('Authorization', `Bearer ${technicianToken}`)
      .field('workPerformed', 'Replaced cable')
      .field('totalCost', '-10');

    expect(res.status).toBe(400);
  });

  it('prevents a technician from updating an issue assigned to someone else', async () => {
    const asset = await createAsset();
    const otherTech = await seedUser({
      name: 'Other Tech',
      email: 'other@test.com',
      password: 'Password123',
      role: ROLES.TECHNICIAN,
    });

    const issueRes = await request(app)
      .post('/api/issues')
      .field('assetCode', asset.assetCode)
      .field('title', 'Noisy fan')
      .field('description', 'Fan makes grinding noise.');
    const issue = issueRes.body.data.issue;

    await request(app)
      .patch(`/api/issues/${issue._id}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ technicianId });

    const res = await request(app)
      .patch(`/api/issues/${issue._id}/status`)
      .set('Authorization', `Bearer ${otherTech.token}`)
      .send({ status: 'Inspection Started' });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('NOT_YOUR_ISSUE');
  });

  it('rejects duplicate asset codes at the database level', async () => {
    const Asset = require('../src/models/Asset');
    const admin = await User.findOne({ email: 'admin@test.com' });
    await Asset.create({
      assetCode: 'AST-DUPE01',
      name: 'A',
      category: 'Cat',
      location: 'Loc',
      createdBy: admin._id,
    });

    await expect(
      Asset.create({ assetCode: 'AST-DUPE01', name: 'B', category: 'Cat', location: 'Loc', createdBy: admin._id }),
    ).rejects.toThrow();
  });
});
