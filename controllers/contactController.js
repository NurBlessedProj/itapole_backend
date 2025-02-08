require("dotenv").config();
const Contact = require("../models/Contact");
const nodemailer = require("nodemailer");

// Debug logging
console.log("SMTP Config:", {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER,
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Verification Error:", error);
  } else {
    console.log("SMTP Server is ready to take messages");
  }
});

exports.sendContact = async (req, res) => {
  try {
    const { firstName, lastName, email, subject, message } = req.body;

    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    console.log("Request body:", req.body);

    let contact;
    try {
      contact = await Contact.create({
        firstName,
        lastName,
        email,
        subject,
        message,
      });
      console.log("Contact saved:", contact);
    } catch (dbError) {
      console.error("Database error:", dbError);
      return res.status(500).json({
        success: false,
        message: "Failed to save contact",
        error: dbError.message,
      });
    }

    const mailOptions = {
      from: process.env.SMTP_USER,
      replyTo: email,
      to: process.env.ADMIN_EMAIL,
      subject: `Contact Form: ${subject}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>From:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent:", info);

      return res.status(201).json({
        success: true,
        message: "Message sent successfully",
      });
    } catch (emailError) {
      console.error("Email error:", emailError);

      if (contact) {
        await Contact.findByIdAndDelete(contact._id);
        console.log("Contact deleted due to email failure");
      }

      return res.status(500).json({
        success: false,
        message: "Failed to send email",
        error: emailError.message,
      });
    }
  } catch (error) {
    console.error("General error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
