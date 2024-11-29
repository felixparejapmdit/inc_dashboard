const express = require("express");
const router = express.Router();
const eventsController = require("../controllers/eventsController");

// Get all events
router.get("/api/events", eventsController.getAllEvents);

// Get a single event by ID
router.get("/api/events/:id", eventsController.getEventById);

// Create a new event
router.post("/api/events", eventsController.createEvent);

// Update an existing event
router.put("/api/events/:id", eventsController.updateEvent);

// Delete an event
router.delete("/api/events/:id", eventsController.deleteEvent);

module.exports = router;
