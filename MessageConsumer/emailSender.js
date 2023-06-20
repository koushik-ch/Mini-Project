const amqp = require('amqplib')
const nodemailer = require('nodemailer');
const { sendEmailConfirmation } = require('../Api/MessagingService/emailMessenger');

async function consumeEmailConfirmations(){
    const connection = await amqp.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();
    const queue = 'emailConfirmations';

    await channel.assertQueue(queue,{durable:true});

    channel.consume(queue,(
        message)=>{
        if(message!==null){
            const emailConfirmation = JSON.parse(message.content.toString('utf-8'))
            console.log(emailConfirmation)
            if(sendEmail(emailConfirmation))
                channel.ack(message);
        }
    })
}

async function sendEmail(emailConfirmation) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: '',
        pass: '' 
      }
    });
  
    const mailOptions = {
      from: '',
      to: emailConfirmation.to,
      subject: emailConfirmation.subject,
      text: emailConfirmation.body
    };
  
    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }
  

consumeEmailConfirmations();