const express = require('express');
const router = express.Router();

router.get('/menu', (req, res) => {
  res.json([]);
});

module.exports = router;
