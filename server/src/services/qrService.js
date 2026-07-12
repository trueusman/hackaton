const QRCode = require('qrcode');
const env = require('../config/env');

// QR encodes ONLY this URL - never the Mongo _id, never metadata. The public
// route resolves by assetCode, so renaming an asset can never break the QR.
function buildPublicAssetUrl(assetCode) {
  return `${env.PUBLIC_APP_URL.replace(/\/$/, '')}/assets/public/${assetCode}`;
}

async function generateQrDataUrl(assetCode) {
  const url = buildPublicAssetUrl(assetCode);
  const dataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 400,
  });
  return { url, dataUrl };
}

async function generateQrBuffer(assetCode) {
  const url = buildPublicAssetUrl(assetCode);
  const buffer = await QRCode.toBuffer(url, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 600,
    type: 'png',
  });
  return { url, buffer };
}

module.exports = { buildPublicAssetUrl, generateQrDataUrl, generateQrBuffer };
