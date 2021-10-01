const express = require("express");
const router = express.Router();

const { loginUser, registerUser } = require("../controllers/auth");
const auth = require("../middleware/auth");

router.post("/login", loginUser);
router.post("/register", auth, registerUser);

module.exports = router;
