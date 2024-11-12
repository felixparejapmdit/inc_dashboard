const db = require("../db");

exports.getAllApps = (callback) => {
  const query = "SELECT * FROM apps";
  db.query(query, callback);
};

exports.getAvailableApps = (userId, callback) => {
  const query = `
    SELECT apps.*
    FROM apps
    JOIN available_apps ON apps.id = available_apps.app_id
    WHERE available_apps.user_id = ?
  `;
  db.query(query, [userId], callback);
};

exports.addApp = (appData, callback) => {
  const { name, url, description, icon } = appData;
  const checkQuery = "SELECT * FROM apps WHERE name = ?";
  db.query(checkQuery, [name], (err, results) => {
    if (err) return callback(err);

    if (results.length > 0) {
      return callback(null, { message: "App with this name already exists." });
    }

    const insertQuery =
      "INSERT INTO apps (name, url, description, icon) VALUES (?, ?, ?, ?)";
    db.query(
      insertQuery,
      [name, url, description, icon || null],
      (err, result) => {
        if (err) return callback(err);

        callback(null, { id: result.insertId, name, url, description, icon });
      }
    );
  });
};

exports.updateApp = (appId, appData, callback) => {
  const { name, url, description, icon } = appData;
  const updateQuery =
    "UPDATE apps SET name = ?, url = ?, description = ?, icon = ? WHERE id = ?";
  db.query(
    updateQuery,
    [name, url, description, icon || null, appId],
    (err, results) => {
      if (err) return callback(err);
      callback(
        null,
        results.affectedRows > 0
          ? { id: appId, name, url, description, icon }
          : null
      );
    }
  );
};

exports.deleteApp = (appId, callback) => {
  const deleteQuery = "DELETE FROM apps WHERE id = ?";
  db.query(deleteQuery, [appId], (err, results) => {
    if (err) return callback(err);
    callback(null, results.affectedRows > 0);
  });
};
