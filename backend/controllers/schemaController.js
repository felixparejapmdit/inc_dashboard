const { sequelize } = require("../models"); // Default instance
const { Sequelize } = require("sequelize");

// Helper to get Sequelize instance (Default or Custom)
const getSequelizeInstance = async (dbConfig) => {
    if (dbConfig && dbConfig.database) {
        // Determine dialect (assume mysql if not specified, or use default's dialect)
        const dialect = dbConfig.dialect || sequelize.options.dialect || 'mysql';

        const customSequelize = new Sequelize(
            dbConfig.database,
            dbConfig.username,
            dbConfig.password,
            {
                host: dbConfig.host,
                port: dbConfig.port || 3306,
                dialect: dialect,
                logging: false, // Disable logging for cleaner output
                dialectOptions: dbConfig.dialectOptions || {}
            }
        );

        // Test connection
        await customSequelize.authenticate();
        return { instance: customSequelize, isCustom: true };
    }
    return { instance: sequelize, isCustom: false };
};

// Check schema status
exports.checkSchema = async (req, res) => {
    let customSequelize = null;

    try {
        const dbConfig = req.body.dbConfig; // Optional custom DB config
        const { instance, isCustom } = await getSequelizeInstance(dbConfig);
        customSequelize = isCustom ? instance : null;

        // 1. Get all table names from the database using raw SQL
        // This ensures we get ONLY tables that actually exist in the database
        const results = await instance.query(
            `SELECT TABLE_NAME 
             FROM information_schema.TABLES 
             WHERE TABLE_SCHEMA = DATABASE() 
             AND TABLE_TYPE = 'BASE TABLE'
             ORDER BY TABLE_NAME`
        );
        // results[0] contains the rows, results[1] contains metadata
        const dbTables = results[0].map(row => row.TABLE_NAME);
        console.log(`\n📊 Database Tables (${dbTables.length}):`, dbTables);
        console.log(`Database: ${isCustom ? dbConfig.database : sequelize.config.database}`);

        // 2. Get all defined models from Default Sequelize (Source of Truth)
        const definedModels = sequelize.models;
        const missingTables = [];
        const allModels = [];

        // 3. Compare models against database tables
        for (const modelName in definedModels) {
            const model = definedModels[modelName];
            const tableName = model.getTableName(); // Get the actual table name used in DB

            // Add to all models list
            const modelInfo = {
                modelName: modelName,
                tableName: tableName,
                status: "Synced",
                details: []
            };

            if (!dbTables.includes(tableName)) {
                modelInfo.status = "Missing Table";
                modelInfo.details = ["Entire table missing"];
                missingTables.push(modelInfo);
            } else {
                // Table exists, check for missing columns
                try {
                    const tableInfo = await instance.getQueryInterface().describeTable(tableName);
                    const modelAttributes = model.tableAttributes;
                    const missingColumns = [];

                    for (const attrName in modelAttributes) {
                        const attr = modelAttributes[attrName];
                        const colName = attr.field || attrName; // Actual DB column name
                        if (!tableInfo[colName]) {
                            missingColumns.push(colName);
                        }
                    }

                    if (missingColumns.length > 0) {
                        modelInfo.status = "Missing Columns";
                        modelInfo.details = missingColumns;
                        missingTables.push(modelInfo);
                    }
                } catch (descError) {
                    console.error(`Error describing table ${tableName}:`, descError);
                }
            }

            allModels.push(modelInfo);
        }

        res.status(200).json({
            message: "Schema check completed.",
            targetDatabase: isCustom ? dbConfig.database : sequelize.config.database,
            totalDefinedModels: Object.keys(definedModels).length,
            totalDbTables: dbTables.length,
            dbTables: dbTables,
            allModels: allModels,
            missingTables: missingTables,
        });

    } catch (error) {
        console.error("Error checking schema:", error);
        res.status(500).json({ message: "Failed to check schema status.", error: error.message });
    } finally {
        if (customSequelize) {
            await customSequelize.close();
        }
    }
};

// Sync schema (Create missing tables or columns)
exports.syncSchema = async (req, res) => {
    const { tablesToSync, dbConfig } = req.body; // Expect array of table names or "ALL", optional dbConfig
    let customSequelize = null;

    try {
        const { instance, isCustom } = await getSequelizeInstance(dbConfig);
        customSequelize = isCustom ? instance : null;

        const definedModels = sequelize.models; // Local definitions
        let syncedTables = [];
        const errors = [];

        const tablesToProcess = (tablesToSync === "ALL" || !tablesToSync)
            ? Object.keys(definedModels).map(m => definedModels[m].getTableName())
            : (Array.isArray(tablesToSync) ? tablesToSync : []);

        for (const tableName of tablesToProcess) {
            // Find model by table name
            const modelName = Object.keys(definedModels).find(m => definedModels[m].getTableName() === tableName);
            if (!modelName) continue;

            const model = definedModels[modelName];

            try {
                if (isCustom) {
                    // Custom DB Logic
                    const dbTables = await instance.getQueryInterface().showAllTables();

                    if (!dbTables.includes(tableName)) {
                        // Create Table
                        await instance.getQueryInterface().createTable(
                            tableName,
                            model.tableAttributes
                        );
                        syncedTables.push(`${tableName} (Created)`);
                    } else {
                        // Table exists, check/add columns
                        const tableInfo = await instance.getQueryInterface().describeTable(tableName);
                        const modelAttributes = model.tableAttributes;
                        let addedCols = 0;

                        for (const attrName in modelAttributes) {
                            const attr = modelAttributes[attrName];
                            const colName = attr.field || attrName;
                            if (!tableInfo[colName]) {
                                await instance.getQueryInterface().addColumn(tableName, colName, attr);
                                addedCols++;
                            }
                        }
                        if (addedCols > 0) {
                            syncedTables.push(`${tableName} (Updated: ${addedCols} cols)`);
                        }
                    }

                } else {
                    // Default DB: Use Standard Sync with Alter
                    // 'alter: true' adds columns but tries not to delete data. 
                    await model.sync({ alter: true });
                    syncedTables.push(tableName);
                }
            } catch (err) {
                console.error(`Error syncing table ${tableName}:`, err);
                errors.push({ table: tableName, error: err.message });
            }
        }

        if (errors.length > 0) {
            return res.status(207).json({
                message: "Partial sync completed with errors.",
                synced: syncedTables,
                errors: errors
            });
        }

        res.status(200).json({
            message: "Database sync completed successfully.",
            syncedTables: syncedTables,
        });

    } catch (error) {
        console.error("Error syncing schema:", error);
        res.status(500).json({ message: "Failed to sync database schema.", error: error.message });
    } finally {
        if (customSequelize) {
            await customSequelize.close();
        }
    }
};
