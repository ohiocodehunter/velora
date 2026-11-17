import nodemailer from 'nodemailer';
import config from './env.js';
import logger from '../utils/logger.js';

const smtpEnabled = Boolean(config.smtp.host && config.smtp.user && config.smtp.pass);

export const transporter = smtpEnabled
  ? nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    })
  : null;

/**
 * Sends mail when SMTP is configured, otherwise prints the message to the
 * server log so development flows (password reset, order confirmation) remain
 * testable without credentials.
 */
export async function sendMail({ to, subject, text, html }) {
  if (!transporter) {
    logger.info(`[mail:dev] to=${to} subject="${subject}"\n${text || ''}`);
    return { delivered: false, preview: text };
  }
  const info = await transporter.sendMail({ from: config.smtp.from, to, subject, text, html });
  logger.info(`[mail] sent to ${to} (${info.messageId})`);
  return { delivered: true, messageId: info.messageId };
}

export default sendMail;
