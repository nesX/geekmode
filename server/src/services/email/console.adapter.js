import logger from '../../utils/logger.js';

class ConsoleAdapter {
  async verify() {
    logger.info('email.console', 'Console email adapter ready');
    return true;
  }

  async send({ to, subject, html, text }) {
    logger.info('email.console', `
=== EMAIL ===
To: ${to}
Subject: ${subject}
---
${text}
=============
    `);

    return {
      success: true,
      messageId: `console-${Date.now()}`,
    };
  }
}

export default ConsoleAdapter;
