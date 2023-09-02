const AWS = require("aws-sdk");

AWS.config.update({
  region: "us-west-1",
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

    const publishTextPromise = new AWS.SNS({ apiVersion: "2010-03-31" })
      .publish(params)
      .promise();

    publishTextPromise
      .then(function (data) {
        console.log("MessageID is " + data.MessageId);
      })
      .catch(function (err) {
        console.error(err, err.stack);
      });
    return true;
  } catch (error) {
    console.error("Failed to send SMS:", error);
    return false;
  }
};
