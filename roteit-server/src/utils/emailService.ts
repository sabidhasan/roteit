import nodemailer from 'nodemailer';

export class EmailService {
  public static async sendEmail(recipient: string, message: string) {
    const testAccount = await nodemailer.createTestAccount();
    console.log('EmailService created test account', testAccount);

    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await transporter.sendMail({
      from: 'roteit@roteit.com',
      to: recipient,
      subject: 'RoteIt Accounts',
      html: message,
    });
    console.log('EmailService info', info)
    console.log('EmailService - sent email preview at: ', nodemailer.getTestMessageUrl(info));
  }
}
