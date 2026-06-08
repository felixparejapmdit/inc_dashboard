const sequelize = require("../config/database.js");

async function migrate(shouldClose = true) {
  try {
    await sequelize.authenticate();
    console.log('Database connection OK.');

    // Get current columns
    const [columns] = await sequelize.query("DESCRIBE tasks");
    const hasPriority = columns.some(c => c.Field === 'priority');
    const hasKanbanStatus = columns.some(c => c.Field === 'kanban_status');

    if (!hasPriority) {
      console.log('Adding priority column...');
      await sequelize.query("ALTER TABLE tasks ADD COLUMN priority VARCHAR(20) NOT NULL DEFAULT 'Medium'");
      console.log('Column "priority" added successfully.');
    } else {
      console.log('Column "priority" already exists.');
    }

    if (!hasKanbanStatus) {
      console.log('Adding kanban_status column...');
      await sequelize.query("ALTER TABLE tasks ADD COLUMN kanban_status VARCHAR(50) NOT NULL DEFAULT 'New'");
      console.log('Column "kanban_status" added successfully.');
    } else {
      console.log('Column "kanban_status" already exists.');
    }

    // Migrate statuses
    console.log('Migrating statuses...');
    await sequelize.query("UPDATE tasks SET status = 'Completed' WHERE status = 'Complete'");
    await sequelize.query("UPDATE tasks SET status = 'Active' WHERE status = 'Check'");
    
    // Set Done status for Completed tasks
    await sequelize.query("UPDATE tasks SET kanban_status = 'Done' WHERE status = 'Completed'");
    console.log('Statuses migrated and synced.');

  } catch (error) {
    console.error('Migration failed:', error);
    if (shouldClose) process.exit(1);
  } finally {
    if (shouldClose) {
      await sequelize.close();
    }
  }
}

if (require.main === module) {
  migrate(true);
} else {
  module.exports = migrate;
}

