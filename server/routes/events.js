/**
 * server/routes/events.js
 * ────────────────────────
 * POST /api/events
 *
 * Logs an edit action to MySQL.
 * Security notes:
 *  - Only a fixed allowlist of action strings are accepted (no free-text injection)
 *  - The client IP is masked (last octet stripped for IPv4, last group for IPv6)
 *    before storage – no full IP is ever persisted
 *  - No PDF data, filenames, or user-identifiable info is accepted or stored
 */

'use strict';

const express = require('express');
const { getPool } = require('../db/connection');

const router = express.Router();

// Strict allowlist – reject anything not in this set
const ALLOWED_ACTIONS = new Set([
  'pdf_open',
  'text_added',
  'signature_drawn',
  'drawing_added',
  'highlight_added',
  'annotation_deleted',
  'pdf_saved',
  'ocr_run',
  'undo',
  'redo',
]);

/**
 * Masks an IP address for privacy:
 *   192.168.1.100  → 192.168.1.xxx
 *   2001:db8::1    → 2001:db8::xxx
 */
function maskIp(rawIp) {
  if (!rawIp || typeof rawIp !== 'string') return 'unknown';

  // Strip IPv6-mapped IPv4 prefix
  const ip = rawIp.replace(/^::ffff:/, '');

  if (ip.includes(':')) {
    // IPv6 – remove last group
    const parts = ip.split(':');
    parts[parts.length - 1] = 'xxx';
    return parts.join(':');
  }

  // IPv4 – remove last octet
  const parts = ip.split('.');
  if (parts.length === 4) {
    parts[3] = 'xxx';
    return parts.join('.');
  }

  return 'unknown';
}

// POST /api/events
router.post('/', async (req, res, next) => {
  try {
    const { action } = req.body ?? {};

    if (!action || !ALLOWED_ACTIONS.has(action)) {
      return res.status(400).json({ error: 'Invalid or missing action.' });
    }

    const rawIp =
      (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || '';

    const maskedIp = maskIp(rawIp);

    const db = getPool();
    await db.execute('INSERT INTO edit_events (action, masked_ip) VALUES (:action, :maskedIp)', {
      action,
      maskedIp,
    });

    return res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
