import React, { useState } from "react";
import QrReader from "react-qr-reader";
import globalSearchService from "../../utils/FileOrganizer/globalSearchService";
import { moveItemToLocation } from "../../utils/FileOrganizer/locationService";

const ScanQRCode = () => {
  const [scanResult, setScanResult] = useState("");
  const [itemData, setItemData] = useState(null);
  const [newLocation, setNewLocation] = useState({
    shelf: "",
    container: "",
    folder: "",
  });

  const handleScan = async (data) => {
    if (data && data !== scanResult) {
      setScanResult(data);
      const item = await findItemByQRCode(data);
      setItemData(item);
    }
  };

  const handleError = (err) => {
    console.error("QR Scan Error:", err);
  };

  const findItemByQRCode = async (code) => {
    const collections = ["shelves", "containers", "folders", "documents"];
    for (const collection of collections) {
      const data = await globalSearchService.getAllData(collection);
      const found = data.find((item) => {
        return (
          item.generated_code === code ||
          item.qr_code === code || // Optional: if your items use this field
          item.id === code
        );
      });
      if (found) {
        return { ...found, type: collection.slice(0, -1) }; // strip 's'
      }
    }
    return null;
  };

  const handleMove = async () => {
    if (!itemData) return;
    try {
      await moveItemToLocation(itemData.id, itemData.type, newLocation);
      alert("✅ Successfully moved!");
      setItemData(null);
      setNewLocation({ shelf: "", container: "", folder: "" });
    } catch (err) {
      console.error(err);
      alert("❌ Failed to move item.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>📷 Scan QR Code</h2>
      <div style={styles.qrBox}>
        <QrReader
          delay={300}
          onError={handleError}
          onScan={handleScan}
          style={{ width: "300px" }}
        />
      </div>

      {itemData ? (
        <div style={styles.detailsBox}>
          <h3>Item Details</h3>
          <p><strong>ID:</strong> {itemData.id}</p>
          <p><strong>Type:</strong> {itemData.type}</p>
          <p><strong>Shelf:</strong> {itemData.shelf_id || itemData.container?.shelf_id || "—"}</p>
          <p><strong>Container:</strong> {itemData.container_id || "—"}</p>
          <p><strong>Folder:</strong> {itemData.folder_id || "—"}</p>

          <div style={styles.moveBox}>
            <input
              type="text"
              placeholder="New Shelf ID"
              value={newLocation.shelf}
              onChange={(e) =>
                setNewLocation({ ...newLocation, shelf: e.target.value })
              }
              style={styles.input}
            />
            <input
              type="text"
              placeholder="New Container ID"
              value={newLocation.container}
              onChange={(e) =>
                setNewLocation({ ...newLocation, container: e.target.value })
              }
              style={styles.input}
            />
            <input
              type="text"
              placeholder="New Folder ID"
              value={newLocation.folder}
              onChange={(e) =>
                setNewLocation({ ...newLocation, folder: e.target.value })
              }
              style={styles.input}
            />
            <button style={styles.button} onClick={handleMove}>
              Move Item
            </button>
          </div>
        </div>
      ) : (
        <p style={{ marginTop: "1rem" }}>Please scan a QR code...</p>
      )}
    </div>
  );
};

export default ScanQRCode;

// Inline styles
const styles = {
  container: {
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "Arial",
  },
  qrBox: {
    border: "2px dashed #ccc",
    padding: "1rem",
    marginBottom: "1.5rem",
  },
  detailsBox: {
    maxWidth: "400px",
    padding: "1rem",
    backgroundColor: "#f5f5f5",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    marginTop: "1rem",
  },
  moveBox: {
    marginTop: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  input: {
    padding: "0.5rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "0.6rem",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
