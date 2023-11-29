require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const JWT_SECRET = process.env.JWT_SECRET;
const db = require("../database/index");
const smsService = require("../services/smsService");
// const { sendPasswordResetEmail } = require("../utils/email");

exports.login = async (req, res) => {
  try {
    const { mobile, code } = req.body;

    // Check if the mobile number exists in the mobile_code_mappings table
    const userMapping = await getMobileCodeMapping(mobile);

    if (!userMapping) {
      return res.status(200).json({
        status: "NO_USER",
        message: "User does not exist",
      });
    }

    // Check if the provided code matches the code in the database
    if (userMapping.code !== code) {
      return res.status(200).json({
        status: "WRONG_CODE",
        message: "Wrong pin code",
      });
    }
    console.log("User Mapping : ", userMapping);
    const user = await getUserByMobileNumber(mobile);

    // Login successful
    res.json({
      status: "SUCCESS",
      message: "Login success",
      userId: user.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getMobileCodeMapping = async (mobile) => {
  try {
    const sql = `
      SELECT *
      FROM users u
      JOIN mobile_code_mappings m ON u.mobile = m.mobile
      WHERE u.mobile = ?
    `;
    const [rows] = await db.query(sql, [mobile]);
    console.log("ROWS : ", rows);

    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error in getMobileCodeMapping : ", error);
    throw error;
  }
};

const getUserByMobileNumber = async (mobile) => {
  try {
    const sql = "SELECT * FROM users WHERE mobile = ?";
    const [rows] = await db.query(sql, [mobile]);

    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error in getUserByMobileNumber : ", error);
    throw error;
  }
};

exports.signup = async (req, res) => {
  try {
    const { mobile, code } = req.body;

    // Check if the mobile number exists in the mobile_code_mappings table
    const isUserPresent = await checkUserPresence(mobile);

    if (isUserPresent) {
      return res.status(200).json({
        status: "USER_EXISTS",
        message: "User already exists",
      });
    }

    // If the user does not exist, proceed with signup
    await createUserMapping(mobile, code);

    // Sign up successful
    res.json({
      status: "SUCCESS",
      message: "Signup success",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Function to check if the mobile number exists in the database
const checkUserPresence = async (mobile) => {
  try {
    const sql = "SELECT * FROM mobile_code_mappings WHERE mobile = ?";
    const [rows] = await db.query(sql, [mobile]);

    return rows.length > 0;
  } catch (error) {
    console.error("Error in checkUserPresence : ", error);
    throw error;
  }
};

// Function to create a new user mapping in the database
const createUserMapping = async (mobile, code) => {
  try {
    const sql = "INSERT INTO mobile_code_mappings (mobile, code) VALUES (?, ?)";
    await db.query(sql, [mobile, code]);
  } catch (error) {
    console.error("Error in createUserMapping : ", error);
    throw error;
  }
};

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
