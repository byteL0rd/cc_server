import * as SMTPServer from 'smtp-server';
const simpleParser = require('mailparser').simpleParser;
import * as SMTPConnection from 'nodemailer/lib/smtp-connection';

// const mail: SendMailOptions = {
//   from: G_Email,
//   to: owner.email,
//   subject: mai.subject,
//   text: mai.text,
//   attachments: []
// }

// const mailed = await smtpTransport.sendMail(mail)

async function onData(stream, session, callback) {
  try {
    const mail = simpleParser(stream)
    console.log(mail)
  } catch (error) {
    console.log(error)
  }
}


export const mailServer = new SMTPServer.SMTPServer({
  onData,
});
