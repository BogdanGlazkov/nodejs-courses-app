require("dotenv").config();
const EMAIL_FROM = process.env.EMAIL_FROM;
const BASE_URL = process.env.BASE_URL;

module.exports = function (email) {
  return {
    to: email,
    from: EMAIL_FROM,
    subject: "Account is created",
    html: `
    <h1>Welcome to our store!</h1>
    <p>Your account with email ${email} was created successfully</p>
    <hr />
    <a href="${BASE_URL}">Courses shop</a>
    `,
  };
};
