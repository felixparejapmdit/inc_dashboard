// routes/familyMembersRoutes.js
const express = require("express");
const router = express.Router();
const FamilyMemberController = require("../controllers/FamilyMemberController");

// Get all family members
router.get("/api/family-members", FamilyMemberController.getAllFamilyMembers);

// Get a specific family member by ID
// router.get(
//   "/api/family-members/:id",
//   FamilyMemberController.getFamilyMemberById
// );

// Get family members by personnel_id
router.get(
  "/api/get-family-members",
  FamilyMemberController.getFamilyMemberById
);

// Add a new family member
router.post("/api/family-members", FamilyMemberController.createFamilyMember);

// Update an existing family member
router.put(
  "/api/family-members/:id",
  FamilyMemberController.updateFamilyMember
);

// Delete a family member
router.delete(
  "/api/family-members/:id",
  FamilyMemberController.deleteFamilyMember
);

module.exports = router;
