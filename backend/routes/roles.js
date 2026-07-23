const express = require("express");
const { ROLES } = require("../config/roles");

const router = express.Router();

// GET /api/roles -> list all selectable job roles
router.get("/", (req, res) => {
  res.json({ roles: ROLES });
});

module.exports = router;
