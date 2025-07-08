const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Employee = require('../models/Employee');
const STRINGS = require('../strings');

function generateEmployeeId() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post('/register', async (req, res) => {
  const { email, name, password } = req.body;

  try {
    const existing = await Employee.findOne({ email });
    if (existing) 
      return res.status(400).json({ mesaj: STRINGS.EMAIL_ALREADY_REGISTERED });

    let employeeId;
    let idExists = true;
    while (idExists) {
      employeeId = generateEmployeeId();
      const existingId = await Employee.findOne({ employeeId });
      if (!existingId) idExists = false;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const employee = new Employee({ employeeId, email, name, passwordHash });
    await employee.save();

    res.json({ employeeId });
  } catch (err) {
    res.status(500).json({ mesaj: STRINGS.SERVER_ERROR });
  }
});

router.post('/login', async (req, res) => {
  const { employeeId, name, password } = req.body;

  try {
    const employee = await Employee.findOne({ employeeId, name });
    if (!employee) 
      return res.status(400).json({ mesaj: STRINGS.INVALID_LOGIN });

    const valid = await bcrypt.compare(password, employee.passwordHash);
    if (!valid) 
      return res.status(400).json({ mesaj: STRINGS.INVALID_LOGIN });

    res.json({ mesaj: STRINGS.LOGIN_SUCCESS });
  } catch (err) {
    res.status(500).json({ mesaj: STRINGS.SERVER_ERROR });
  }
});

router.post('/check-admin-password', (req, res) => {
  const { password } = req.body;

  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ accessGranted: true });
  } else {
    res.status(401).json({ accessGranted: false });
  }
});

module.exports = router;
