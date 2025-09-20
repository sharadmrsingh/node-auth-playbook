const nodemailer = require('nodemailer');

let transporterPromise;

async function getTransporter() {
  if (!transporterPromise) {
    if (process.env.SMTP_HOST) {
      // Normal SMTP (Gmail, Brevo, etc.)
      transporterPromise = Promise.resolve(
        nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT || 587,
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        })
      );
    } else {
      // Ethereal (auto-create for dev)
      transporterPromise = nodemailer.createTestAccount().then((testAccount) => {
        console.log("🔹 Using Ethereal test account");
        console.log("Login:", testAccount.user);
        console.log("Pass :", testAccount.pass);

        return nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      });
    }
  }
  return transporterPromise;
}

module.exports = async function (to, subject, text) {
  const transporter = await getTransporter();

  const info = await transporter.sendMail({
    from: process.env.SMTP_USER || "no-reply@example.com",
    to,
    subject,
    text,
  });

  console.log("📧 Message sent:", info.messageId);

  // Preview URL for Ethereal
  if (nodemailer.getTestMessageUrl(info)) {
    console.log("🔗 Preview URL:", nodemailer.getTestMessageUrl(info));
  }

  return info;
};
