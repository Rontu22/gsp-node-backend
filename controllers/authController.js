require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const JWT_SECRET = process.env.JWT_SECRET;
const db = require("../database/index");
// const { sendPasswordResetEmail } = require("../utils/email");

// Function to register a new user
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const [userExists] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (userExists.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert the user into the users table
    await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    // Generate a JWT token
    const token = jwt.sign({ userId: userExists.insertId }, JWT_SECRET); // Assuming you have a JWT_SECRET

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Function to log in an existing user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const [user] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (user.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if password is correct
    const isPasswordCorrect = await bcrypt.compare(password, user[0].password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user[0].id }, JWT_SECRET); // Assuming you have a JWT_SECRET

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Function to handle forgot password feature
exports.forgotPassword = async (req, res) => {
  try {
    // const { email } = req.body;

    // // Check if user exists
    // const user = await User.findOne({ email });
    // if (!user) {
    //   return res.status(400).json({ message: "User not found" });
    // }

    // // Generate a unique reset token and save it to the user's document
    // const resetToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
    //   expiresIn: "1h",
    // });
    // user.resetToken = resetToken;
    // user.resetTokenExpiresAt = Date.now() + 60 * 60 * 1000;
    // await user.save();

    // // Send an email to the user with a link to reset their password
    // const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    // // await sendPasswordResetEmail(user.email, resetUrl);

    // console.log("RESET URL : ", resetUrl);

    // res.json({
    //   message:
    //     "An email has been sent to your email address with further instructions",
    //   resetToken: resetToken,
    // });
    console.log("Forgot something");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Function to handle resetting the password
exports.resetPassword = async (req, res) => {
  try {
    // const { resetToken, newPassword } = req.body;
    // // Find the user associated with the reset token and check if it has expired
    // const user = await User.findOne({
    //   resetToken,
    //   //   resetTokenExpiresAt: { $gt: Date.now() },
    // });
    // console.log(user);
    // if (!user) {
    //   return res
    //     .status(400)
    //     .json({ message: "Invalid or expired reset token" });
    // }
    // // Hash the new password
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(newPassword, salt);
    // // Update the user's password and remove the reset token
    // user.password = hashedPassword;
    // user.resetToken = null;
    // user.resetTokenExpiresAt = null;
    // await user.save();
    // res.json({ message: "Password has been reset" });
    console.log("Reset something");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
