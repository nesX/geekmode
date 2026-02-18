import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';
import logger from '../../utils/logger.js';

class SmtpAdapter {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE === 'true',
      auth: env.SMTP_USER ? {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      } : undefined,
    });
  }

  async verify() {
    try {
      await this.transporter.verify();
      logger.info('email.smtp', 'SMTP connection verified');
      return true;
    } catch (err) {
      logger.error('email.smtp', `SMTP verification failed: ${err.message}`);
      return false;
    }
  }

  async send({ to, subject, html, text }) {
    try {
      const result = await this.transporter.sendMail({
        from: env.emailFrom,
        to,
        subject,
        html,
        text,
      });

      logger.info('email.smtp', `Email sent to ${to}: ${subject}`);

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (err) {
      logger.error('email.smtp', `Failed to send email: ${err.message}`);
      return {
        success: false,
        error: err.message,
      };
    }
  }
}

export default SmtpAdapter;
