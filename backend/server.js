const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path"); // Added to resolve file paths
const app = express();
const PORT = 5000;

// Use __dirname to resolve the correct file paths
const suguanFilePath = path.join(__dirname, "suguan.json");
const eventsFilePath = path.join(__dirname, "events.json");
const remindersFilePath = path.join(__dirname, "reminders.json");

const userRoutes = require("./routes/userRoutes");
const appRoutes = require("./routes/appRoutes");
const personnelsRoutes = require("./routes/personnelsRoutes"); // Replace with actual route file path
const ldapRoutes = require("./routes/ldapRoutes");

app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" })); // Increased limit to handle Base64 images

// Use the user routes
app.use(userRoutes);
app.use(appRoutes);
app.use(personnelsRoutes); // Make sure this is imported correctly
app.use(ldapRoutes); // Add prefix for ldap routes

app.use(bodyParser.json());
app.use(cors());

require("dotenv").config();

// --- Suguan Endpoints ---
app.get("/api/suguan", (req, res) => {
  fs.readFile(suguanFilePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error reading file" });
    }
    const suguan = JSON.parse(data);
    res.json(suguan);
  });
});

app.post("/api/suguan", (req, res) => {
  const newSuguan = { ...req.body, id: Date.now() }; // Add a unique id based on timestamp

  fs.readFile(suguanFilePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error reading file." });
    }

    const suguan = JSON.parse(data);
    suguan.push(newSuguan);

    fs.writeFile(suguanFilePath, JSON.stringify(suguan, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ message: "Error writing file." });
      }
      res.status(201).json({ message: "Suguan added successfully." });
    });
  });
});

// --- More endpoints for Events and Reminders follow the same structure ---

// Endpoint to update a suguan (PUT)
app.put("/api/suguan/:id", (req, res) => {
  const suguanId = parseInt(req.params.id, 10);
  const updatedSuguan = req.body;

  fs.readFile(suguanFilePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error reading file" });
    }

    const suguan = JSON.parse(data);
    const updatedSuguanList = suguan.map((sugu) =>
      sugu.id === suguanId ? { ...sugu, ...updatedSuguan } : sugu
    );

    fs.writeFile(
      suguanFilePath,
      JSON.stringify(updatedSuguanList, null, 2),
      (err) => {
        if (err) {
          return res.status(500).json({ message: "Error writing file" });
        }
        res.json({ message: "Suguan updated successfully" });
      }
    );
  });
});

// Endpoint to delete a suguan
app.delete("/api/suguan/:id", (req, res) => {
  const suguanId = parseInt(req.params.id, 10);

  fs.readFile(suguanFilePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error reading file" });
    }

    let suguan = JSON.parse(data);
    const filteredSuguan = suguan.filter((sugu) => sugu.id !== suguanId);

    fs.writeFile(
      suguanFilePath,
      JSON.stringify(filteredSuguan, null, 2),
      (err) => {
        if (err) {
          return res.status(500).json({ message: "Error writing file" });
        }
        res.status(200).json({ message: "Suguan deleted successfully." });
      }
    );
  });
});

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

// --- Reminder Endpoints ---
// Get all reminders
app.get("/api/reminders", (req, res) => {
  fs.readFile(remindersFilePath, "utf-8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading file" });
    const reminders = JSON.parse(data);
    res.json(reminders);
  });
});

// Add a new reminder (POST)
app.post("/api/reminders", (req, res) => {
  const newReminder = { ...req.body, id: new Date().getTime() }; // Add unique ID to new reminder

  fs.readFile(remindersFilePath, "utf-8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading file" });

    const reminders = JSON.parse(data);
    reminders.push(newReminder);

    fs.writeFile(
      remindersFilePath,
      JSON.stringify(reminders, null, 2),
      (err) => {
        if (err) return res.status(500).json({ message: "Error writing file" });
        res.status(201).json({ message: "Reminder added successfully" });
      }
    );
  });
});

// Update a reminder (PUT)
app.put("/api/reminders/:id", (req, res) => {
  const reminderId = parseInt(req.params.id, 10);
  const updatedReminder = req.body;

  fs.readFile(remindersFilePath, "utf-8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading file" });

    let reminders = JSON.parse(data);
    const reminderIndex = reminders.findIndex(
      (reminder) => reminder.id === reminderId
    );

    if (reminderIndex === -1) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    reminders[reminderIndex] = {
      ...reminders[reminderIndex],
      ...updatedReminder,
    };

    fs.writeFile(
      remindersFilePath,
      JSON.stringify(reminders, null, 2),
      (err) => {
        if (err) return res.status(500).json({ message: "Error writing file" });
        res.status(200).json({ message: "Reminder updated successfully" });
      }
    );
  });
});

// Delete a reminder (DELETE)
app.delete("/api/reminders/:id", (req, res) => {
  const reminderId = parseInt(req.params.id, 10);

  fs.readFile(remindersFilePath, "utf-8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading file" });

    let reminders = JSON.parse(data);
    reminders = reminders.filter((reminder) => reminder.id !== reminderId);

    fs.writeFile(
      remindersFilePath,
      JSON.stringify(reminders, null, 2),
      (err) => {
        if (err) return res.status(500).json({ message: "Error writing file" });
        res.status(200).json({ message: "Reminder deleted successfully" });
      }
    );
  });
});

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server is running on http://172.18.125.134:${PORT}`);
//});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost/:${PORT}`);
});
