const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');

router.get('/', authMiddleware, userController.getUsers);

module.exports = router;