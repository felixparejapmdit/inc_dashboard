// Controller: Get personnels with associated users (Active)
exports.getPersonnelsWithUsers = async (req, res) => {
    try {
        const personnels = await Personnel.findAll({
            attributes: ["personnel_id", "personnel_type"], // Only fetch necessary fields
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "username"],
                    required: true, // Inner Join: Only return personnel who have an associated user
                },
            ],
            where: {
                deleted_at: null, // Ensure not deleted
            },
        });
        res.status(200).json(personnels);
    } catch (error) {
        console.error("Error fetching active personnels:", error);
        res.status(500).json({
            message: "Error fetching active personnels",
            error: error.message,
        });
    }
};
