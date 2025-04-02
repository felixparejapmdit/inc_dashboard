const express = require("express");
const router = express.Router();
const housingController = require("../controllers/housingController");

router.get("/", housingController.getAllHousing);
router.post("/", housingController.createHousing);
router.put("/:id", housingController.updateHousing);
router.delete("/:id", housingController.deleteHousing);

module.exports = router;
