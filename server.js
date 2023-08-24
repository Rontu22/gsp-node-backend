const app = require("./app"); // Import the Express app
const PORT = process.env.PORT || 5008;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
