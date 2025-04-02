const express = require("express");
const router = express.Router();
const housingController = require("../controllers/housingController");

router.get("/api/housing", housingController.getAllHousing);
//router.get("/api/housing/:id", housingController.getHousingById);
router.post("/api/housing", housingController.createHousing);
router.put("/api/housing/:id", housingController.updateHousing);
router.delete("/api/housing/:id", housingController.deleteHousing);

module.exports = router;
