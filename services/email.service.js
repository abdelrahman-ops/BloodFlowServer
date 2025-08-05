import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendEmail = async (to, subject, text, html) => {
    try {
        const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html
        };

        await transporter.sendMail(mailOptions);
    } catch (err) {
        console.error('Error sending email:', err);
    }
};

// Example usage:
// await sendEmail('user@example.com', 'Welcome to BloodFlow', 'Thank you for registering!');