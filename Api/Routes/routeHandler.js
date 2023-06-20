const Hapi = require('hapi');
const {getProductDetails,getUpdatedPrice,processOrder,getOrderDetails,sendEmailConfirmation} = require('../cartService.js');

// function RouteHandler(request,h){
    
//     if(request.url.pathname === '/calculatePrice')
//         return getUpdatedPrice(request.query);

//     else if(request.url.pathname ==='/processOrder' && request.method ==='post')
//         return processOrder(request.payload,h);

//     else if(request.url.pathname ==='/getOrderDetails')
//         return getOrderDetails(request.query);

//     else if(request.url.pathname ==='/sendConfirmationEmail' && request.method ==='post')
//         return sendEmailConfirmation(request.payload,h);

//     else if(request.url.pathname ==='/')
//         return getProductDetails(request.query);

// }

function calculatePrice(query){
    return getUpdatedPrice(query);
}

function placeOrder(payload,h){
    return processOrder(payload,h);
}

function getOrders(query){
    return getOrderDetails(query);
}

function sendEmail(payload,h){
    return sendEmailConfirmation(payload,h);
}

function getProducts(query){
    return getProductDetails(query);
}
module.exports = {calculatePrice,placeOrder,getOrders,sendEmail,getProducts};