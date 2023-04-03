require("dotenv").config();
const EMAIL_FROM = process.env.EMAIL_FROM;
const BASE_URL = process.env.BASE_URL;

module.exports = function (email, token) {
  return {
    to: email,
    from: EMAIL_FROM,
    subject: "Access restoration",
    html: `
    <h1>Forgot your password?</h1>
    <p>If no, please ignore this letter</p>
    <p>If yes, click the link below:</p>
    <p><a href="${BASE_URL}/auth/password/${token}">Restore access</a></p>
    <hr />
    `,
  };
};
