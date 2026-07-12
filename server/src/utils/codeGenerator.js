const crypto = require('crypto');

// AST-A1B2C3 style code. Uniqueness is enforced by a DB unique index on
// Asset.assetCode; this generator retries on collision at the service layer.
function generateAssetCode() {
  const random = crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
  return `AST-${random}`;
}

// ISS-2026-000123 style: year-scoped, zero-padded sequence-like random suffix.
// Uniqueness enforced via unique index; collisions are effectively impossible
// given the random space, but the service retries defensively.
function generateIssueNumber() {
  const year = new Date().getFullYear();
  const random = crypto.randomInt(0, 999999).toString().padStart(6, '0');
  return `ISS-${year}-${random}`;
}

module.exports = { generateAssetCode, generateIssueNumber };
