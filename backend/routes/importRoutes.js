const express = require("express");
const router = express.Router();
const districtController = require("../controllers/districtController");
const localCongregationController = require("../controllers/localCongregationController");

// District Import Route
router.post("/import-districts", districtController.importDistricts);

// Local Congregation Import Route
router.post("/import/local-congregations", localCongregationController.importLocalCongregations);


// District API
router.get("/districts", districtController.getAllDistricts);

// Local Congregation API
router.get("/local-congregations", localCongregationController.getAllLocalCongregations);


module.exports = router;
