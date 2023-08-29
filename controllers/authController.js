require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const JWT_SECRET = process.env.JWT_SECRET;
const db = require("../database/index");
const smsService = require("../services/smsService");
// const { sendPasswordResetEmail } = require("../utils/email");

// Function to register a new user
exports.register = async (req, res) => {
  try {
    const { mobile, name, address, state, pin } = req.body;
    const isUserPresent = await isUserDataPresent(mobile);
    if (isUserPresent) {
      return res.status(400).json({ message: "User already exists" });
    }
    await insertUserData(mobile, name, address, state, pin);
    res.json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const insertUserData = async (mobile, name, address, state, pin) => {
  try {
    const sql = `INSERT INTO users (mobile, name, address, state, pin) VALUES (?, ?, ?, ?, ?)`;
    const result = await db.query(sql, [mobile, name, address, state, pin]);
    return result;
  } catch (error) {
    console.error("Error in insertUserData : ", error);
    throw error;
  }
};

// exports.sendOtp = async (req, res) => {
//   try {
//     const { mobile } = req.body;
//     const otp = Math.floor(100000 + Math.random() * 900000);
//     const result = await smsService.sendOtpSms(mobile, otp);
//     res.json({ message: "OTP is sent" });
//   } catch (error) {
//     console.error("Error in sendOtp : ", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;
    const otp = generateOTP(); // Implement OTP generation logic
    // Save the OTP to the database along with the mobile number
    await saveOTPCode(mobile, otp);

    // Send the OTP via SMS
    await smsService.sendOtpSms(mobile, otp);

    res.json({ message: "OTP is sent successfully" });
  } catch (error) {
    console.error("Error in sendOtp: ", error);
    res.status(500).json({ message: "Server error" });
  }
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.verifyOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    const storedOTP = await getStoredOTP(mobile);

    if (storedOTP === otp) {
      const userDataPresent = await isUserDataPresent(mobile);

      if (userDataPresent) {
        return res.json({
          status: "registered-user",
          userId: userDataPresent.id,
        });
      } else {
        return res.json({ status: "new-user" });
      }
    } else {
      return res.json({ status: "wrong-otp" });
    }
  } catch (error) {
    console.error("Error in verifyOtp: ", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getStoredOTP = async (mobile) => {
  try {
    const [otpRow] = await db.query(
      "SELECT code FROM otp_codes WHERE mobile = ? ORDER BY created_at DESC LIMIT 1",
      [mobile]
    );
    return otpRow.length > 0 ? otpRow[0].code : null;
  } catch (error) {
    console.log("Error in getStoredOTP: ", error);
    throw error;
  }
};

const isUserDataPresent = async (mobile) => {
  try {
    const [result] = await db.query(
      "SELECT id FROM users WHERE mobile = ? AND name IS NOT NULL",
      [mobile]
    );
    return result[0];
  } catch (error) {
    console.log("Error in isUserDataPresent: ", error);
    throw error;
  }
};

const saveOTPCode = async (mobile, otp) => {
  try {
    await db.query("INSERT INTO otp_codes (mobile, code) VALUES (?, ?)", [
      mobile,
      otp,
    ]);
  } catch (error) {
    console.error("Error in saveOTPCode: ", error);
    throw error;
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
