const express = require('express');

const router = express.Router();

router.get('/', (_req, res) => {
  res.json({
    feature: 'Allergy Action Plan',
    summary: { activePlans: 12, missingSignatures: 3, epipenExpiring: 2, highRiskRooms: 2 },
    rooms: [
      { room: 'Toddlers A', allergens: 'Peanut, egg', status: 'Signature missing', action: 'Request parent and physician update' },
      { room: 'Pre-K B', allergens: 'Tree nut', status: 'EpiPen expiring', action: 'Replace before next month' },
      { room: 'Infants', allergens: 'Milk protein', status: 'Current', action: 'Maintain substitute meal flag' },
    ],
    safeguards: [
      'Verify allergy plan during morning check-in and meal service.',
      'Block menu substitutions until allergen review is complete.',
      'Notify staff when medication expiration is inside 30 days.',
    ],
  });
});

module.exports = router;
