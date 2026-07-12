const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const { adminCreateUserValidator } = require('../validators/userValidators');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.use(protect);

router.post('/', authorize(ROLES.ADMIN), adminCreateUserValidator, validate, userController.createUser);
router.get('/', authorize(ROLES.ADMIN), userController.listUsers);
router.get(
  '/technicians',
  authorize(ROLES.ADMIN, ROLES.SUPERVISOR),
  userController.listTechnicians,
);

module.exports = router;
