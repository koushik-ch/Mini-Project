const Hapi = require('hapi');
const HapiCors = require('hapi-cors');
const { calculatePrice,placeOrder,getOrders,sendEmail,getProducts } = require('./Routes/routeHandler.js');
const { getUpdatedPrice } = require('./cartService.js');
const {processOrderSchema,sendConfirmationSchema} = require('./Schema/schema.js');
const Joi = require('joi');

const init = async () => {
  const server = Hapi.server({
    port: 4200,
    host: 'localhost'
  });

  await server.register({
    plugin: HapiCors,
    options: {
      origins: ['*'], // Replace * with the actual domain from where your client-side code is hosted
    },
  });

  await server.start();
  console.log('Server running at localhost:4200');

  
  server.route({
    method:'GET',
    path: '/',
    handler: (request, h) => {
      return getProducts(request.query);
    }
  });

  server.route({
    method:'GET',
    path: '/calculatePrice',
    handler: (request, h) => {
      return calculatePrice(request.query);
    }
  });
  server.route({
    method:'GET',
    path: '/getOrderDetails',
    handler: (request, h) => {
      return getOrders(request.query);
    }
  });
  server.route({
    method:'POST',
    path: '/processOrder',
    handler: (request, h) => {
      return placeOrder(request.payload,h);
    },
    // options:{
    //     validate:{
    //         payload:processOrderSchema
    //     }
    // }
  });
  server.route({
    method:'POST',
    path: '/sendConfirmationEmail',
    handler: (request, h) => {
      return sendEmail(request.payload,h);
    },
    // options:{
    //     validate:{
    //         payload:sendConfirmationSchema
    //     }
    // }
  });

};

init();
