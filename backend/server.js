const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json({ limit: "10mb" })); // Increased limit to handle Base64 images

const appsFilePath = "./apps.json"; // Path to apps.json file in the backend folder
const suguanFilePath = "./suguan.json"; // Path to suguan.json file in the backend folder

// --- Apps Endpoints ---

// Endpoint to get all apps
app.get("/api/apps", (req, res) => {
  fs.readFile(appsFilePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error reading file" });
    }
    const apps = JSON.parse(data);
    res.json(apps);
  });
});

// Endpoint to add a new app (POST)
app.post("/api/apps", (req, res) => {
  const newApp = req.body;

  // Basic validation
  if (!newApp.name || !newApp.url || !newApp.description) {
    return res
      .status(400)
      .json({ message: "All fields (name, url, description) are required." });
  }

  fs.readFile(appsFilePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error reading file." });
    }

    const apps = JSON.parse(data);

    // Check for duplicate app name
    const appExists = apps.some((app) => app.name === newApp.name);
    if (appExists) {
      return res
        .status(400)
        .json({ message: "App with this name already exists." });
    }

    // Add the new app to the list
    apps.push(newApp);

    // Write the updated app list back to the file
    fs.writeFile(appsFilePath, JSON.stringify(apps, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ message: "Error writing file." });
      }

      res.status(201).json({ message: "App added successfully." });
    });
  });
});

// Endpoint to update an app (PUT)
app.put("/api/apps/:name", (req, res) => {
  const appName = req.params.name;
  const updatedApp = req.body;

  fs.readFile(appsFilePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error reading file" });
    }

    const apps = JSON.parse(data);
    const updatedApps = apps.map((app) => {
      if (app.name === appName) {
        return { ...app, ...updatedApp };
      }
      return app;
    });

    fs.writeFile(appsFilePath, JSON.stringify(updatedApps, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ message: "Error writing file" });
      }
      res.json({ message: "App updated successfully" });
    });
  });
});

// Endpoint to delete an app
app.delete("/api/apps/:name", (req, res) => {
  const appName = req.params.name;

  fs.readFile(appsFilePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error reading file" });
    }

    let apps = JSON.parse(data);
    const filteredApps = apps.filter((app) => app.name !== appName);

    // Write the updated app list back to the file
    fs.writeFile(appsFilePath, JSON.stringify(filteredApps, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ message: "Error writing file" });
      }
      res.status(200).json({ message: "App deleted successfully." });
    });
  });
});

// --- Suguan Endpoints ---

// Endpoint to get all suguan
app.get("/api/suguan", (req, res) => {
  fs.readFile(suguanFilePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error reading file" });
    }
    const suguan = JSON.parse(data);
    res.json(suguan);
  });
});

// Endpoint to add a new suguan (POST)
app.post("/api/suguan", (req, res) => {
  const newSuguan = req.body;

  // Basic validation
  if (!newSuguan.name || !newSuguan.district || !newSuguan.local) {
    return res
      .status(400)
      .json({ message: "All fields (name, district, local) are required." });
  }

  fs.readFile(suguanFilePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error reading file." });
    }

    const suguan = JSON.parse(data);

    // Check for duplicate suguan name
    const suguanExists = suguan.some((sugu) => sugu.name === newSuguan.name);
    if (suguanExists) {
      return res
        .status(400)
        .json({ message: "Suguan with this name already exists." });
    }

    // Add the new suguan to the list
    suguan.push(newSuguan);

    // Write the updated suguan list back to the file
    fs.writeFile(suguanFilePath, JSON.stringify(suguan, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ message: "Error writing file." });
      }

      res.status(201).json({ message: "Suguan added successfully." });
    });
  });
});

// Endpoint to update a suguan (PUT)
app.put("/api/suguan/:name", (req, res) => {
  const suguanName = req.params.name;
  const updatedSuguan = req.body;

  fs.readFile(suguanFilePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error reading file" });
    }

    const suguan = JSON.parse(data);
    const updatedSuguanList = suguan.map((sugu) => {
      if (sugu.name === suguanName) {
        return { ...sugu, ...updatedSuguan };
      }
      return sugu;
    });

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
app.delete("/api/suguan/:name", (req, res) => {
  const suguanName = req.params.name;

  fs.readFile(suguanFilePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error reading file" });
    }

    let suguan = JSON.parse(data);
    const filteredSuguan = suguan.filter((sugu) => sugu.name !== suguanName);

    // Write the updated suguan list back to the file
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

// Event Endpoints
app.get("/api/events", (req, res) => {
  fs.readFile("./events.json", "utf-8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading file" });
    const events = JSON.parse(data);
    res.json(events);
  });
});

app.post("/api/events", (req, res) => {
  const newEvent = req.body;
  fs.readFile("./events.json", "utf-8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading file" });

    const events = JSON.parse(data);
    events.push(newEvent);

    fs.writeFile("./events.json", JSON.stringify(events, null, 2), (err) => {
      if (err) return res.status(500).json({ message: "Error writing file" });
      res.status(201).json({ message: "Event added successfully" });
    });
  });
});

app.put("/api/events/:eventName", (req, res) => {
  const eventName = req.params.eventName;
  const updatedEvent = req.body;

  fs.readFile("./events.json", "utf-8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading file" });

    let events = JSON.parse(data);
    events = events.map((item) =>
      item.eventName === eventName ? { ...item, ...updatedEvent } : item
    );

    fs.writeFile("./events.json", JSON.stringify(events, null, 2), (err) => {
      if (err) return res.status(500).json({ message: "Error writing file" });
      res.json({ message: "Event updated successfully" });
    });
  });
});

app.delete("/api/events/:eventName", (req, res) => {
  const eventName = req.params.eventName;

  fs.readFile("./events.json", "utf-8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading file" });

    let events = JSON.parse(data);
    events = events.filter((item) => item.eventName !== eventName);

    fs.writeFile("./events.json", JSON.stringify(events, null, 2), (err) => {
      if (err) return res.status(500).json({ message: "Error writing file" });
      res.json({ message: "Event deleted successfully" });
    });
  });
});

// Reminder Endpoints
app.get("/api/reminders", (req, res) => {
  fs.readFile("./reminders.json", "utf-8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading file" });
    const reminders = JSON.parse(data);
    res.json(reminders);
  });
});

app.post("/api/reminders", (req, res) => {
  const newReminder = req.body;
  fs.readFile("./reminders.json", "utf-8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading file" });

    const reminders = JSON.parse(data);
    reminders.push(newReminder);

    fs.writeFile(
      "./reminders.json",
      JSON.stringify(reminders, null, 2),
      (err) => {
        if (err) return res.status(500).json({ message: "Error writing file" });
        res.status(201).json({ message: "Reminder added successfully" });
      }
    );
  });
});

app.put("/api/reminders/:title", (req, res) => {
  const reminderTitle = req.params.title;
  const updatedReminder = req.body;

  fs.readFile("./reminders.json", "utf-8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading file" });

    let reminders = JSON.parse(data);
    reminders = reminders.map((item) =>
      item.title === reminderTitle ? { ...item, ...updatedReminder } : item
    );

    fs.writeFile(
      "./reminders.json",
      JSON.stringify(reminders, null, 2),
      (err) => {
        if (err) return res.status(500).json({ message: "Error writing file" });
        res.json({ message: "Reminder updated successfully" });
      }
    );
  });
});

app.delete("/api/reminders/:title", (req, res) => {
  const reminderTitle = req.params.title;

  fs.readFile("./reminders.json", "utf-8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading file" });

    let reminders = JSON.parse(data);
    reminders = reminders.filter((item) => item.title !== reminderTitle);

    fs.writeFile(
      "./reminders.json",
      JSON.stringify(reminders, null, 2),
      (err) => {
        if (err) return res.status(500).json({ message: "Error writing file" });
        res.json({ message: "Reminder deleted successfully" });
      }
    );
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
