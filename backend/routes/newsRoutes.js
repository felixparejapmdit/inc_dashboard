const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
// const verifyToken = require("../middlewares/authMiddleware"); // Optional authenticaton

router.get('/api/news', newsController.getAllNews);
router.post('/api/news', newsController.createNews); // Add verifyToken if restricted
router.delete('/api/news/:id', newsController.deleteNews);

module.exports = router;
