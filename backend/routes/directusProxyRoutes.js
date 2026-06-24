const express = require("express");
const router = express.Router();
const { proxyDirectusRequest } = require("../controllers/directusProxyController");

router.use(proxyDirectusRequest);

module.exports = router;
