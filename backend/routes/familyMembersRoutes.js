// routes/familyMembersRoutes.js
const express = require("express");
const router = express.Router();
const FamilyMemberController = require("../controllers/FamilyMemberController");

const verifyToken = require("../middlewares/authMiddleware");

// Get all family members
router.get(
  "/api/family-members",
  verifyToken,
  FamilyMemberController.getAllFamilyMembers
);

// Get a specific family member by ID
router.get(
  "/api/get-family-members/:id",
  FamilyMemberController.getFamilyMemberById
);

// Get family members by personnel_id
router.get(
  "/api/get-family-members",
  FamilyMemberController.getFamilyMemberById
);

// Add a new family member
router.post(
  "/api/family-members",
  verifyToken,
  FamilyMemberController.createFamilyMember
);

// Update an existing family member
router.put(
  "/api/family-members/:id",
  verifyToken,
  FamilyMemberController.updateFamilyMember
);

// Delete a family member
router.delete(
  "/api/family-members/:id",
  verifyToken,
  FamilyMemberController.deleteFamilyMember
);

module.exports = router;
