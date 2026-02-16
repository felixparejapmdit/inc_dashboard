import * as faceapi from "face-api.js";

let modelsLoaded = false;

// Load face-api.js models
export const loadModels = async () => {
    if (modelsLoaded) return true;

    try {
        const MODEL_URL = "/models"; // Models will be in public/models folder

        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
            faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        ]);

        modelsLoaded = true;
        console.log("✅ Face-API models loaded successfully");
        return true;
    } catch (error) {
        console.error("❌ Error loading face-api models:", error);
        return false;
    }
};

// Detect face and get descriptor from video element
export const detectFaceFromVideo = async (videoElement) => {
    try {
        // Use SsdMobilenetv1 for better accuracy
        const detection = await faceapi
            .detectSingleFace(videoElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!detection) {
            return { success: false, message: "No face detected" };
        }

        return {
            success: true,
            descriptor: Array.from(detection.descriptor),
            detection: detection,
        };
    } catch (error) {
        console.error("Error detecting face:", error);
        return { success: false, message: error.message };
    }
};

// Detect face from image element
export const detectFaceFromImage = async (imageElement) => {
    try {
        const detection = await faceapi
            .detectSingleFace(imageElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!detection) {
            return { success: false, message: "No face detected in image" };
        }

        return {
            success: true,
            descriptor: Array.from(detection.descriptor),
            detection: detection,
        };
    } catch (error) {
        console.error("Error detecting face from image:", error);
        return { success: false, message: error.message };
    }
};

// Calculate face match distance
export const getFaceDistance = (descriptor1, descriptor2) => {
    return faceapi.euclideanDistance(descriptor1, descriptor2);
};

// Check if models are loaded
export const areModelsLoaded = () => modelsLoaded;
