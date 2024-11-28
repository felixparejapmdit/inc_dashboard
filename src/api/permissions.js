const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Adjust path to your DB connection

router.get(`${process.env.REACT_APP_API_URL}/api/permissions_access/:groupId`, (req, res) => {
  const { groupId } = req.params;

  const query = `
    SELECT 
      pc.id AS category_id,
      pc.name AS category_name,
      pd.id AS permission_id,
      pd.name AS permission_name,
      pd.description AS permission_description,
      COALESCE(gpm.accessrights, 0) AS accessrights
    FROM permission_categories pc
    LEFT JOIN permission_category_mappings pcm ON pcm.category_id = pc.id
    LEFT JOIN permission_definitions pd ON pd.id = pcm.permission_id
    LEFT JOIN group_permission_mappings gpm 
      ON gpm.permission_id = pd.id 
      AND gpm.group_id = ?
    ORDER BY pc.id ASC, pd.id ASC;
  `;

  db.query(query, [groupId], (err, results) => {
    if (err) {
      console.error("Error fetching permissions:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
});

module.exports = router;
