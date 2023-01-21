const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.firstName.split(' ')[0];
    this.url = url;
    // this.from = `Migram Support <${process.env.EMAIL_FROM}>`;
    // this.from = `engramar@code.sydney`;
    this.from = process.env.SENDGRID_SENDER_EMAIL;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Send the actual email
  // async send(template, subject, paymentData, offerData) {
  async send({ template, subject, paymentData = null, offerData = null }) {
    // 1. Render HTML based on pug template
    let html;

    if (offerData) {
      const { taskTitle, taskBudget, dueDate, offerAmt, recruiterBusinessName } =
        offerData;

      html = pug.renderFile(`${__dirname}/./views/emails/${template}.pug`, {
        firstName: this.firstName,
        url: this.url,
        subject,
        taskTitle,
        taskBudget,
        dueDate,
        offerAmt,
        recruiterBusinessName,
      });
    } else if (paymentData) {
      const {
        taskTitle,
        amountPayable,
        network: cardNetwork,
        last4: cardLast4,
      } = paymentData;
      html = pug.renderFile(`${__dirname}/./views/emails/${template}.pug`, {
        firstName: this.firstName,
        url: this.url,
        subject,
        taskTitle,
        amountPayable,
        cardNetwork,
        cardLast4,
      });
    } else {
      html = pug.renderFile(`${__dirname}/./views/emails/${template}.pug`, {
        firstName: this.firstName,
        url: this.url,
        subject,
      });
    }

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.htmlToText(html),
    };
    //3. Create a transport and send email
    // await this.newTransport().sendMail(mailOptions);
    this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    // await this.send('welcome', 'Welcome to the Migram family!');
    await this.send({
      template: 'welcome',
      subject: 'Welcome to the Migram family!',
    });
  }

  async sendPaymentUnsuccessfulEmail(paymentData) {
    await this.send({
      template: 'PaymentUnsuccessfulEmail',
      subject: 'Credit Card Billing Failure',
      paymentData,
    });
  }

  async sendPaymentSuccessfulEmail(paymentData) {
    // await this.send(
    //   'PaymentSuccessfulEmail',
    //   'Payment Successful',
    //   paymentData
    // );
    await this.send({
      template: 'PaymentSuccessfulEmail',
      subject: 'Payment Successful',
      paymentData,
    });
  }

  async sendNewOfferEmailToCandidate(offerData) {
    await this.send({
      template: 'NewOfferEmail',
      subject: `You've received an offer on your task`,
      offerData,
    });
  }
};
