import nodemailer from "nodemailer";

const isTest = process.env.NODE_ENV === "test";

export const mailTransporter = isTest
  ? ({
      sendMail: async () => ({ accepted: ["test-mode"], rejected: [] }),
      verify: async () => true,
    } as any)
  : nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });


if (!isTest) {
  mailTransporter
    .verify()
    .then(() => console.log("SMTP ready (Gmail)"))
    .catch((err: any) => console.error("SMTP error:", err));
}

