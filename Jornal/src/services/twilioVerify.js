const twilio = require("twilio");

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const service = () => client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID);

async function sendVerification(to) {
  return service().verifications.create({ to, channel: "sms" });
}

async function checkVerification(to, code) {
  return service().verificationChecks.create({ to, code });
}

module.exports = { sendVerification, checkVerification };
