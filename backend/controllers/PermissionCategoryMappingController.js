const PermissionCategoryMapping = require("../models/PermissionCategoryMapping");
const Permission = require("../models/Permission");
const PermissionCategory = require("../models/PermissionCategory");

exports.getPermissionsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const permissions = await PermissionCategoryMapping.findAll({
      where: { category_id: categoryId },
      include: [
        {
          model: Permission,
          as: "Permission",
          attributes: ["id", "name", "description"],
        },
      ],
    });

    res.status(200).json(permissions.map((mapping) => mapping.Permission));
  } catch (error) {
    console.error("Error fetching permissions by category:", error);
    res.status(500).json({ message: "Error fetching permissions", error });
  }
};
