const Event = require("../models/Event");
const Location = require("../models/Location");
const moment = require("moment");

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      include: {
        model: Location,
        as: "location", // Use alias from the model
        attributes: ["name"], // Include only the location name
      },
      order: [
        ["date", "ASC"],
        ["time", "ASC"],
      ], // Sort by date and time
    });
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Error fetching events", error });
  }
};

// Get a single event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: {
        model: Location,
        as: "location",
        attributes: ["name"],
      },
    });

    if (!event) {
      return res
        .status(404)
        .json({ message: `Event with ID ${req.params.id} not found` });
    }

    res.status(200).json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ message: "Error fetching event", error });
  }
};

// Create a new event
exports.createEvent = async (req, res) => {
  const { eventName, date, time, location_id, recurrence } = req.body; // Ensure recurrence is included

  try {
    if (!eventName || !date || !time || !location_id) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const events = [];

    // Recurrence logic (daily, weekly, etc.)
    if (recurrence === "daily") {
      for (let i = 0; i < 7; i++) {
        // Example: 7 days
        const nextDate = moment(date).add(i, "days").format("YYYY-MM-DD");
        events.push({
          eventName,
          date: nextDate,
          time,
          location_id,
          recurrence, // Save recurrence value here
        });
      }
    } else if (recurrence === "weekly") {
      for (let i = 0; i < 4; i++) {
        // Example: 4 weeks
        const nextDate = moment(date).add(i, "weeks").format("YYYY-MM-DD");
        events.push({
          eventName,
          date: nextDate,
          time,
          location_id,
          recurrence, // Save recurrence value here
        });
      }
    } else if (recurrence === "monthly") {
      for (let i = 0; i < 3; i++) {
        // Example: 3 months
        const nextDate = moment(date).add(i, "months").format("YYYY-MM-DD");
        events.push({
          eventName,
          date: nextDate,
          time,
          location_id,
          recurrence, // Save recurrence value here
        });
      }
    } else {
      // No recurrence, single event
      events.push({
        eventName,
        date,
        time,
        location_id,
        recurrence, // Save recurrence value here
      });
    }

    const createdEvents = await Event.bulkCreate(events);

    return res.status(201).json({
      message: "Event(s) created successfully",
      events: createdEvents,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Error creating event", error });
  }
};

// Update an event
exports.updateEvent = async (req, res) => {
  const { eventName, date, time, location_id, recurrence } = req.body;

  try {
    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Update fields
    event.eventName = eventName || event.eventName;
    event.date = date || event.date;
    event.time = time || event.time;
    event.location_id = location_id || event.location_id;
    event.recurrence = recurrence || event.recurrence; // Update recurrence

    await event.save();

    return res.status(200).json(event);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Error updating event", error });
  }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return res
        .status(404)
        .json({ message: `Event with ID ${req.params.id} not found` });
    }

    await event.destroy();
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Error deleting event", error });
  }
};
