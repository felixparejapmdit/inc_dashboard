require("dotenv").config(); // Load environment variables from .env
const { Sequelize } = require("sequelize");

// Create a new Sequelize instance with environment variables
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    dialect: "mysql",
    dialectModule: require("mysql2"),
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    dialectOptions: {
      connectTimeout: 10000,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
  }
);

// Test connection function (Optional pero helpful para sa logs mo)
sequelize.authenticate()
  .then(() => console.log('✅ Sequelize: Connection has been established successfully.'))
  .catch(err => console.error('❌ Sequelize: Unable to connect to the database:', err));

module.exports = sequelize;
