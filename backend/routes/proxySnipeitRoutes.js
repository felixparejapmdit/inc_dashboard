const express = require("express");
const router = express.Router();
const proxyController = require("../controllers/snipeitProxyController");

const verifySnipeItToken = require("../middlewares/snipeitAuthMiddleware");

// Only the endpoint itself
router.post("/proxy-snipeit", proxyController.proxySnipeitRequest);




module.exports = router;



