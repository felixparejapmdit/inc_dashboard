const express = require("express");
const fs = require("fs");
const app = express();

const path = require("path"); // Added to resolve file paths

const eventsFilePath = path.join(__dirname, "events.json");

// --- Event Endpoints ---

// Get all events
app.get("/api/events", (req, res) => {
  fs.readFile(eventsFilePath, "utf-8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading file" });
    const events = JSON.parse(data);
    res.json(events);
  });
});

// Add a new event (POST)
app.post("/api/events", (req, res) => {
  const newEvent = { ...req.body, id: new Date().getTime() }; // Add unique ID to new event

  fs.readFile(eventsFilePath, "utf-8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading file" });

    const events = JSON.parse(data);
    events.push(newEvent);

    fs.writeFile(eventsFilePath, JSON.stringify(events, null, 2), (err) => {
      if (err) return res.status(500).json({ message: "Error writing file" });
      res.status(201).json({ message: "Event added successfully" });
    });
  });
});

// Update an event (PUT)
app.put("/api/events/:id", (req, res) => {
  const eventId = parseInt(req.params.id, 10);
  const updatedEvent = req.body;

  fs.readFile(eventsFilePath, "utf-8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading file" });

    let events = JSON.parse(data);
    const eventIndex = events.findIndex((event) => event.id === eventId);

    if (eventIndex === -1) {
      return res.status(404).json({ message: "Event not found" });
    }

    events[eventIndex] = { ...events[eventIndex], ...updatedEvent };

    fs.writeFile(eventsFilePath, JSON.stringify(events, null, 2), (err) => {
      if (err) return res.status(500).json({ message: "Error writing file" });
      res.status(200).json({ message: "Event updated successfully" });
    });
  });
});

// Delete an event (DELETE)
app.delete("/api/events/:id", (req, res) => {
  const eventId = parseInt(req.params.id, 10);

  fs.readFile(eventsFilePath, "utf-8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading file" });

    let events = JSON.parse(data);
    events = events.filter((event) => event.id !== eventId);

    fs.writeFile(eventsFilePath, JSON.stringify(events, null, 2), (err) => {
      if (err) return res.status(500).json({ message: "Error writing file" });
      res.status(200).json({ message: "Event deleted successfully" });
    });
  });
});
