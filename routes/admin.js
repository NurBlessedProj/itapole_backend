const express = require("express");
const router = express.Router();

const adminUser = {
  username: "admin",
  password: "admin123",
};

// Login route
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === adminUser.username && password === adminUser.password) {
    res.json({
      success: true,
      message: "Login successful",
      user: {
        username: adminUser.username,
      },
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }
});

module.exports = router;
