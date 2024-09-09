// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3000;

// Middleware to parse incoming JSON
app.use(express.json());

// Path to the JSON file
const dataFilePath = path.join(__dirname, "data.json");

// Helper function to read the JSON file
const readDataFile = () => {
  return JSON.parse(fs.readFileSync(dataFilePath, "utf-8"));
};

// Helper function to write to the JSON file
const writeDataFile = (data) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
};

// GET all items
app.get("/items", (req, res) => {
  const data = readDataFile();
  res.json(data);
});

// GET an item by ID
app.get("/items/:id", (req, res) => {
  const data = readDataFile();
  const item = data.find((item) => item.id === parseInt(req.params.id));
  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }
  res.json(item);
});

// POST a new item
app.post("/items", (req, res) => {
  const data = readDataFile();
  const newItem = {
    id: Date.now(), // Use timestamp as a simple ID
    ...req.body,
  };
  data.push(newItem);
  writeDataFile(data);
  res.status(201).json(newItem);
});

// PUT (Update) an item by ID
app.put("/items/:id", (req, res) => {
  const data = readDataFile();
  const itemIndex = data.findIndex(
    (item) => item.id === parseInt(req.params.id)
  );
  if (itemIndex === -1) {
    return res.status(404).json({ message: "Item not found" });
  }

  const updatedItem = { ...data[itemIndex], ...req.body };
  data[itemIndex] = updatedItem;
  writeDataFile(data);
  res.json(updatedItem);
});

// DELETE an item by ID
app.delete("/items/:id", (req, res) => {
  const data = readDataFile();
  const filteredData = data.filter(
    (item) => item.id !== parseInt(req.params.id)
  );
  if (filteredData.length === data.length) {
    return res.status(404).json({ message: "Item not found" });
  }

  writeDataFile(filteredData);
  res.status(200).json({ message: "Item deleted successfully" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
