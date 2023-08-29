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
    const { name, designation, mobile, role } = req.body;
    const isUserPresent = await isAdminDataPresent(mobile);
    if (isUserPresent) {
      return res.status(400).json({ message: "User already exists" });
    }
    await insertAdminData(name, designation, mobile, role);
    res.json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const insertAdminData = async (name, designation, mobile, role) => {
  try {
    const sql = `INSERT INTO admin_users (name, designation, mobile, role) VALUES (?, ?, ?, ?)`;
    const result = await db.query(sql, [name, designation, mobile, role]);
    return result;
  } catch (error) {
    console.error("Error in insertAdminData : ", error);
    throw error;
  }
};

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
      const userDataPresent = await isAdminDataPresent(mobile);

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

const isAdminDataPresent = async (mobile) => {
  try {
    const [result] = await db.query(
      "SELECT id FROM admin_users WHERE mobile = ? AND name IS NOT NULL",
      [mobile]
    );
    return result[0];
  } catch (error) {
    console.log("Error in isAdminDataPresent: ", error);
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

exports.getAllUsers = async (req, res) => {
  try {
    const { status } = req.query;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const approveStatus = status === "not-approved" ? 0 : 1;
    const [users] = await db.query(
      `SELECT * FROM users WHERE isApproved = ? LIMIT ? OFFSET ?`,
      [approveStatus, limit, offset]
    );
    const count = await db.query(
      `SELECT COUNT(*) as count FROM users WHERE isApproved = ?`,
      [approveStatus]
    );
    const total = count[0][0].count;
    res.json({ users, total });
  } catch (error) {
    console.error("Error in getAllUsers: ", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.approveAllUsers = async (req, res) => {
  try {
    const { users } = req.body;
    // update all users isApproved = 1
    const sql = `UPDATE users SET isApproved = 1 WHERE id IN (?)`;
    await db.query(sql, [users]);
    res.json({ message: "Users approved successfully" });
  } catch (error) {
    console.error("Error in approveUsers ", error);
    res.status(500).json({ message: "Server error" });
  }
};
