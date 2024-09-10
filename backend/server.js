const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json({ limit: "10mb" })); // Increased limit to handle Base64 images

const appsFilePath = "./apps.json";
const suguanFilePath = "./suguan.json";
const usersFilePath = "./users.json"; // Path to users.json file in the backend folder

const eventsFilePath = "./events.json";
const remindersFilePath = "./reminders.json";

const API_URL = "172.18.20.9";

// --- Apps Endpoints ---

app.get("/api/apps", (req, res) => {
  fs.readFile(appsFilePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error reading file" });
    }
    const apps = JSON.parse(data);
    res.json(apps);
  });
});

app.post("/api/apps", (req, res) => {
  const newApp = req.body;
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
    const appExists = apps.some((app) => app.name === newApp.name);
    if (appExists) {
      return res
        .status(400)
        .json({ message: "App with this name already exists." });
    }

    apps.push(newApp);
    fs.writeFile(appsFilePath, JSON.stringify(apps, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ message: "Error writing file." });
      }
      res.status(201).json({ message: "App added successfully." });
    });
  });
});

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

app.delete("/api/apps/:name", (req, res) => {
  const appName = req.params.name;

  fs.readFile(appsFilePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error reading file" });
    }

    let apps = JSON.parse(data);
    const filteredApps = apps.filter((app) => app.name !== appName);

    fs.writeFile(appsFilePath, JSON.stringify(filteredApps, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ message: "Error writing file" });
      }
      res.status(200).json({ message: "App deleted successfully." });
    });
  });
});

// --- Login API ---
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  fs.readFile(usersFilePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error reading file" });
    }

    let users = JSON.parse(data);
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update the user's `isLoggedIn` status to true
    users = users.map((u) => {
      if (u.username === username) {
        return { ...u, isLoggedIn: true };
      }
      return u;
    });

    fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ message: "Error writing file" });
      }
      res.status(200).json({ message: "Login successful", user });
    });
  });
});

// --- User Endpoints ---
app.get("/api/users", (req, res) => {
  fs.readFile(usersFilePath, "utf-8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading file" });

    try {
      const users = JSON.parse(data);

      // Ensure that users is an array
      if (!Array.isArray(users)) {
        return res.status(500).json({ message: "Data is not an array" });
      }

      res.json(users);
    } catch (e) {
      return res.status(500).json({ message: "Invalid JSON format" });
    }
  });
});

app.post("/api/users", (req, res) => {
  const newUser = { ...req.body, id: Date.now(), isLoggedIn: false };

  fs.readFile(usersFilePath, "utf-8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading file" });

    try {
      let users = JSON.parse(data);

      // Ensure that users is an array
      if (!Array.isArray(users)) {
        users = [];
      }

      users.push(newUser);

      fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
        if (err) return res.status(500).json({ message: "Error writing file" });
        res.status(201).json({ message: "User added successfully" });
      });
    } catch (e) {
      return res.status(500).json({ message: "Invalid JSON format" });
    }
  });
});

app.put("/api/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const updatedUser = req.body;

  fs.readFile(usersFilePath, "utf-8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading file" });

    const users = JSON.parse(data);
    const updatedUsers = users.map((user) =>
      user.id === userId ? { ...user, ...updatedUser } : user
    );

    fs.writeFile(
      usersFilePath,
      JSON.stringify(updatedUsers, null, 2),
      (err) => {
        if (err) return res.status(500).json({ message: "Error writing file" });
        res.json({ message: "User updated successfully" });
      }
    );
  });
});

// --- User Logout Endpoint ---
app.post("/api/logout", (req, res) => {
  const { userId } = req.body;

  fs.readFile(usersFilePath, "utf-8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading file" });

    const users = JSON.parse(data);
    const updatedUsers = users.map((user) =>
      user.id === userId ? { ...user, isLoggedIn: false } : user
    );

    fs.writeFile(
      usersFilePath,
      JSON.stringify(updatedUsers, null, 2),
      (err) => {
        if (err) return res.status(500).json({ message: "Error writing file" });
        res.json({ message: "User logged out successfully" });
      }
    );
  });
});

// --- Logged-in User Endpoint ---
app.get("/api/users/logged-in", (req, res) => {
  fs.readFile(usersFilePath, "utf-8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading file" });

    const users = JSON.parse(data);
    const loggedInUser = users.find((user) => user.isLoggedIn === true);

    if (loggedInUser) {
      res.json(loggedInUser); // Return the logged-in user
    } else {
      res.status(404).json({ message: "No user is currently logged in" });
    }
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
// });
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
