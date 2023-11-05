// config/dev.js
console.log("**********CONNECTED TO DEV**********");
module.exports = {
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
  },
  // Other dev-specific configurations
};
