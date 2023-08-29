const AWS = require("aws-sdk");

AWS.config.update({
  region: "ap-south-1",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

const sns = new AWS.SNS();

// Function to send OTP SMS
exports.sendOtpSms = async (phoneNumber, otp) => {
  try {
    const params = {
      Message: `Your OTP is: ${otp} for Gana Suraksha Party Connect`,
      PhoneNumber: phoneNumber,
    };

    const result = await sns.publish(params).promise();
    return result;
  } catch (error) {
    console.error("Failed to send SMS:", error);
    return false;
  }
};
