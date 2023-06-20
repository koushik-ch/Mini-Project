const amqp = require('amqplib');

async function sendEmailConfirmationMessage(order){
    const connection = await amqp.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();
    const queue = 'emailConfirmations';

    await channel.assertQueue(queue,{durable:true});

    const message = {
        to:order.email,
        subject:'Order Confirmation',
        body:`Thank you for placing the order ${order.firstName}`
    }

    channel.sendToQueue(queue,Buffer.from(JSON.stringify(message)),{presistent:true});
    console.log("Email confirmation message sent");

    setTimeout(()=>{
        connection.close();
    },500);

}

module.exports = {sendEmailConfirmationMessage};