const ROLES = Object.freeze({
  ADMIN: 'admin',
  TECHNICIAN: 'technician',
  REPORTER: 'reporter',
  SUPERVISOR: 'supervisor',
});

const ALL_ROLES = Object.values(ROLES);

module.exports = { ROLES, ALL_ROLES };
