import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

console.log("Testing SMTP with:");
console.log("User:", process.env.SMTP_USER);
console.log("Pass length:", process.env.SMTP_PASS?.length);

transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP verify failed:", error);
  } else {
    console.log("SMTP ready! Sending test email...");
    transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: "Test",
      text: "Test email",
    }, (err, info) => {
      if (err) console.error("Send failed:", err);
      else console.log("Sent!", info.response);
    });
  }
});
