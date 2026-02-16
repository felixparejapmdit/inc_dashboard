const { FaceRecognition, FaceRecognitionLog, Personnel, User } = require("../models");

// Helper function to calculate Euclidean distance between two descriptors
function getEuclideanDistance(descriptor1, descriptor2) {
    if (!descriptor1 || !descriptor2 || descriptor1.length !== descriptor2.length) {
        return Infinity;
    }

    let sum = 0;
    for (let i = 0; i < descriptor1.length; i++) {
        sum += Math.pow(descriptor1[i] - descriptor2[i], 2);
    }
    return Math.sqrt(sum);
}

// Enroll face for a personnel
exports.enrollFace = async (req, res) => {
    try {
        const { personnel_id, face_descriptor } = req.body;

        if (!personnel_id || !face_descriptor) {
            return res.status(400).json({
                success: false,
                message: "Personnel ID and face descriptor are required",
            });
        }

        // Verify personnel exists
        const personnel = await Personnel.findOne({
            where: { personnel_id },
        });

        if (!personnel) {
            return res.status(404).json({
                success: false,
                message: "Personnel not found",
            });
        }

        // Check if face already enrolled
        const existing = await FaceRecognition.findOne({
            where: { personnel_id },
        });

        let faceRecord;
        if (existing) {
            // Update existing record
            faceRecord = await existing.update({
                face_descriptor: JSON.stringify(face_descriptor),
                is_enabled: true,
                enrolled_at: new Date(),
            });
        } else {
            // Create new record
            faceRecord = await FaceRecognition.create({
                personnel_id,
                face_descriptor: JSON.stringify(face_descriptor),
                is_enabled: true,
            });
        }

        // Log the enrollment
        await FaceRecognitionLog.create({
            personnel_id,
            action: existing ? "update" : "enrollment",
            success: true,
            ip_address: req.ip,
            user_agent: req.get("user-agent"),
        });

        res.json({
            success: true,
            message: "Face enrolled successfully",
            data: {
                id: faceRecord.id,
                personnel_id: faceRecord.personnel_id,
                is_enabled: faceRecord.is_enabled,
                enrolled_at: faceRecord.enrolled_at,
            },
        });
    } catch (error) {
        console.error("Error enrolling face:", error);
        res.status(500).json({
            success: false,
            message: "Failed to enroll face",
            error: error.message,
        });
    }
};

// Verify face for login
exports.verifyFace = async (req, res) => {
    try {
        const { face_descriptor } = req.body;

        if (!face_descriptor || !Array.isArray(face_descriptor)) {
            return res.status(400).json({
                success: false,
                message: "Valid face descriptor is required",
            });
        }

        // Get all enrolled faces
        const enrolledFaces = await FaceRecognition.findAll({
            where: { is_enabled: true },
            include: [
                {
                    model: Personnel,
                    as: "personnel",
                    include: [
                        {
                            model: User,
                            as: "User",
                        },
                    ],
                },
            ],
        });

        if (enrolledFaces.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No enrolled faces found",
            });
        }

        // Find best match
        let bestMatch = null;
        let bestDistance = Infinity;
        const THRESHOLD = 0.6; // Face-api.js typical threshold

        for (const enrolledFace of enrolledFaces) {
            const storedDescriptor = JSON.parse(enrolledFace.face_descriptor);
            const distance = getEuclideanDistance(face_descriptor, storedDescriptor);

            if (distance < bestDistance) {
                bestDistance = distance;
                bestMatch = enrolledFace;
            }
        }

        // Check if match is good enough
        if (bestDistance > THRESHOLD) {
            // Log failed attempt
            await FaceRecognitionLog.create({
                personnel_id: bestMatch ? bestMatch.personnel_id : null,
                action: "login",
                confidence_score: 1 - bestDistance,
                success: false,
                ip_address: req.ip,
                user_agent: req.get("user-agent"),
                error_message: "Face match confidence too low",
            });

            return res.status(401).json({
                success: false,
                message: "Face not recognized",
                confidence: 1 - bestDistance,
            });
        }

        // Update last used timestamp
        await bestMatch.update({
            last_used_at: new Date(),
        });

        // Log successful verification
        await FaceRecognitionLog.create({
            personnel_id: bestMatch.personnel_id,
            action: "login",
            confidence_score: 1 - bestDistance,
            success: true,
            ip_address: req.ip,
            user_agent: req.get("user-agent"),
        });

        res.json({
            success: true,
            message: "Face verified successfully",
            confidence: 1 - bestDistance,
            data: {
                personnel_id: bestMatch.personnel_id,
                user: bestMatch.personnel.User,
                personnel: {
                    givenname: bestMatch.personnel.givenname,
                    surname_husband: bestMatch.personnel.surname_husband,
                },
            },
        });
    } catch (error) {
        console.error("Error verifying face:", error);
        res.status(500).json({
            success: false,
            message: "Failed to verify face",
            error: error.message,
        });
    }
};

// Get face recognition status for a personnel
exports.getFaceStatus = async (req, res) => {
    try {
        const { personnel_id } = req.params;

        const faceRecord = await FaceRecognition.findOne({
            where: { personnel_id },
        });

        if (!faceRecord) {
            return res.json({
                success: true,
                enrolled: false,
                is_enabled: false,
            });
        }

        res.json({
            success: true,
            enrolled: true,
            is_enabled: faceRecord.is_enabled,
            enrolled_at: faceRecord.enrolled_at,
            last_used_at: faceRecord.last_used_at,
        });
    } catch (error) {
        console.error("Error getting face status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get face status",
            error: error.message,
        });
    }
};

// Toggle face recognition on/off
exports.toggleFaceRecognition = async (req, res) => {
    try {
        const { personnel_id } = req.params;
        const { is_enabled } = req.body;

        const faceRecord = await FaceRecognition.findOne({
            where: { personnel_id },
        });

        if (!faceRecord) {
            return res.status(404).json({
                success: false,
                message: "Face not enrolled yet",
            });
        }

        await faceRecord.update({ is_enabled });

        res.json({
            success: true,
            message: `Face recognition ${is_enabled ? "enabled" : "disabled"}`,
            is_enabled,
        });
    } catch (error) {
        console.error("Error toggling face recognition:", error);
        res.status(500).json({
            success: false,
            message: "Failed to toggle face recognition",
            error: error.message,
        });
    }
};

// Delete face data
exports.deleteFaceData = async (req, res) => {
    try {
        const { personnel_id } = req.params;

        const faceRecord = await FaceRecognition.findOne({
            where: { personnel_id },
        });

        if (!faceRecord) {
            return res.status(404).json({
                success: false,
                message: "Face data not found",
            });
        }

        await faceRecord.destroy();

        res.json({
            success: true,
            message: "Face data deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting face data:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete face data",
            error: error.message,
        });
    }
};

// Get face recognition logs
exports.getFaceLogs = async (req, res) => {
    try {
        const { personnel_id } = req.params;
        const { limit = 50 } = req.query;

        const logs = await FaceRecognitionLog.findAll({
            where: { personnel_id },
            order: [["timestamp", "DESC"]],
            limit: parseInt(limit),
        });

        res.json({
            success: true,
            data: logs,
        });
    } catch (error) {
        console.error("Error getting face logs:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get face logs",
            error: error.message,
        });
    }
};
