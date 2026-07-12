const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const assetRoutes = require('./assetRoutes');
const issueRoutes = require('./issueRoutes');
const maintenanceRoutes = require('./maintenanceRoutes');
const dashboardRoutes = require('./dashboardRoutes');

const router = express.Router();

router.get('/health', (req, res) => res.json({ success: true, message: 'MaintainIQ API is running' }));

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/assets', assetRoutes);
router.use('/issues', issueRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
