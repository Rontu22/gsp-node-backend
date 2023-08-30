// config/dev.js
console.log("**********CONNECTED TO STAGE**********");
module.exports = {
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    port: process.env.DB_PORT,
  },
  // Other dev-specific configurations
};
