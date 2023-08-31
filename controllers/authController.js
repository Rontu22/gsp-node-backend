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
    const { mobile, name, address, state, pin, designation, dateOfBirth } =
      req.body;
    const isUserPresent = await isUserDataPresent(mobile);
    if (isUserPresent) {
      return res.status(400).json({ message: "User already exists" });
    }
    const result = await insertUserData(
      mobile,
      name,
      address,
      state,
      pin,
      designation,
      dateOfBirth
    );
    res.json({
      userId: result[0].insertId,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const insertUserData = async (
  mobile,
  name,
  address,
  state,
  pin,
  designation,
  dateOfBirth
) => {
  try {
    const sql = `INSERT INTO users (mobile, name, address, state, pin, designation, dateOfBirth) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const result = await db.query(sql, [
      mobile,
      name,
      address,
      state,
      pin,
      designation,
      dateOfBirth,
    ]);
    return result;
  } catch (error) {
    console.error("Error in insertUserData : ", error);
    throw error;
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;
    const otp = generateOTP();
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
