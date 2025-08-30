import nodeMailer from "nodemailer";

export const sendEmail = async ({ email, subject, message }) => {
  try {
    const transporter = nodeMailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // Changed to false for port 587
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        ciphers: "SSLv3",
      },
    });

    // Verify connection configuration
    await transporter.verify();
    console.log("SMTP Connection verified successfully");

    const mailOptions = {
      from: `"NicheNest" <${process.env.SMTP_MAIL}>`,
      to: email,
      subject,
      text: message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Email send error:", {
      message: error.message,
      code: error.code,
      response: error.response,
    });
    return false;
  }
};
