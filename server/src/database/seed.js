// Seeds demo credentials + a handful of assets so the evaluator can log in
// and see a populated dashboard immediately. Safe to re-run: it upserts by
// email/assetCode rather than blindly inserting duplicates.
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Asset = require('../models/Asset');
const { ROLES } = require('../constants/roles');
const { generateAssetCode } = require('../utils/codeGenerator');
const { buildPublicAssetUrl } = require('../services/qrService');

const DEMO_USERS = [
  { name: 'Ayesha Admin', email: 'admin@maintainiq.dev', password: 'Admin@12345', role: ROLES.ADMIN },
  { name: 'Talha Technician', email: 'tech@maintainiq.dev', password: 'Tech@12345', role: ROLES.TECHNICIAN },
  { name: 'Sara Supervisor', email: 'supervisor@maintainiq.dev', password: 'Super@12345', role: ROLES.SUPERVISOR },
  { name: 'Reporter Reza', email: 'reporter@maintainiq.dev', password: 'Report@12345', role: ROLES.REPORTER },
];

const DEMO_ASSETS = [
  { name: 'Classroom Projector 01', category: 'Electronics', location: 'Block A - Room 101', condition: 'Good' },
  { name: 'Central AC Unit - Lobby', category: 'HVAC', location: 'Main Lobby', condition: 'Fair' },
  { name: 'Fire Extinguisher - Floor 2', category: 'Safety', location: 'Block B - Floor 2', condition: 'Excellent' },
  { name: 'Server Room UPS', category: 'Electrical', location: 'Server Room', condition: 'Good' },
  { name: 'Cafeteria Water Cooler', category: 'Appliance', location: 'Cafeteria', condition: 'Fair' },
];

async function seedUsers() {
  const created = {};
  for (const u of DEMO_USERS) {
    const passwordHash = await bcrypt.hash(u.password, 12);
    const user = await User.findOneAndUpdate(
      { email: u.email },
      { name: u.name, email: u.email, passwordHash, role: u.role, isActive: true },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    created[u.role] = user;
    console.log(`[seed] user ready: ${u.email} / ${u.password} (${u.role})`);
  }
  return created;
}

async function seedAssets(adminUser, technicianUser) {
  for (const a of DEMO_ASSETS) {
    const existing = await Asset.findOne({ name: a.name });
    if (existing) {
      console.log(`[seed] asset already exists: ${a.name} (${existing.assetCode})`);
      continue;
    }
    const assetCode = generateAssetCode();
    const asset = await Asset.create({
      ...a,
      assetCode,
      qrPublicUrl: buildPublicAssetUrl(assetCode),
      assignedTechnician: technicianUser._id,
      createdBy: adminUser._id,
      nextServiceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    console.log(`[seed] asset created: ${asset.name} (${asset.assetCode})`);
  }
}

async function run() {
  await connectDB();
  const users = await seedUsers();
  await seedAssets(users[ROLES.ADMIN], users[ROLES.TECHNICIAN]);
  await disconnectDB();
  console.log('[seed] done.');
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed] failed:', err);
  mongoose.disconnect().finally(() => process.exit(1));
});
