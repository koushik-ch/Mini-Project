const { DbClient } = require('./DbManager/dbHandler.js');
const { CacheService } = require('./CacheManager/cacheService.js');
const { sendEmailConfirmationMessage } = require('./MessagingService/emailMessenger.js');
const { processOrderSchema, sendConfirmationSchema } = require('./Schema/schema.js');
const fetch = require("node-fetch");
const { logger } = require('./LogManager/logger.js'); // Import the logger module

const dbClient = new DbClient();
dbClient.connect();
const cacheService = new CacheService(6382, 6383);

async function getProductDetails(query) {
    // Retrieves product details from cache and database based on the given query.
  try {
    let productIDs = query.pid;
    const quantities = query.q;
    if (typeof productIDs === 'string')
      productIDs = new Array(productIDs);

    let { productDetails, uncachedProductIDs } = await cacheService.getCachedProductDetails(productIDs);

    if (uncachedProductIDs.length > 0) {
      let uncachedProducts = await dbClient.getProductDetailsFromDb(uncachedProductIDs);

      uncachedProducts.forEach(async (product) => {
        logger.info("Cache Miss for " + product.p_id); // Use the logger to log messages
        await cacheService.setProductCache(product.p_id, product);
      });

      productDetails.push(...uncachedProducts);
    }
    return productDetails;
  } catch (err) {
    logger.error(err); // Log the error using the logger
    throw err; 
  }
}

async function getUpdatedPrice(query) {
  //Retrieves the updated price for a product based on the given query.
  try {
    const productID = query.pid;
    const actualPrice = query.price;
    const quantity = query.quantity;
    const discounts = await dbClient.getDiscounts(productID);
    logger.info(discounts); // Use the logger to log messages
    return calculatePrice(discounts, quantity, actualPrice);
  } catch (err) {
    logger.error(err); // Log the error using the logger
    throw err; 
  }
}

async function processOrder(payload, h) {
    //Processes an order based on the given payload.
  try {
    const { error: processOrderError, value: validatedProcessOrderBody } = processOrderSchema.validate(payload);
    if (processOrderError)
      throw (processOrderError);
    await dbClient.processOrder(payload);
    logger.info(payload); // Use the logger to log messages
    await cacheService.updateProductCache(payload.products);

    sendEmailConfirmation({
        email:payload.shippingDetails.Email,
        firstName:payload.shippingDetails.Name
    });

    // await fetch("http://localhost:4200/sendConfirmationEmail", {
    //   method: "POST",
    //   body: JSON.stringify({
    //     email: payload.shippingDetails.Email,
    //     firstName: payload.shippingDetails.Name
    //   }),
    //   headers: {
    //     "Content-type": "application/json; charset=UTF-8"
    //   }
    // });
    return h.response('ok').code(200);
  } catch (err) {
    logger.error(err); // Log the error using the logger
    throw err
  }
}

async function getOrderDetails(query) {
    // Retrieves the details of an order based on the given query.
  try {
    logger.info(query.order_id); // Use the logger to log messages
    return dbClient.getOrderDetails(query.order_id);
  } catch (err) {
    logger.error(err); // Log the error using the logger
    throw err; 
  }
}

function calculatePrice(discounts, quantity, actualPrice) {
    //Calculates the updated price based on the given discounts, quantity, and actual price.
  let updatedPrice = actualPrice;
  if (discounts.defaultDiscount && discounts.defaultDiscount > 0) {
    updatedPrice = updatedPrice - (updatedPrice * (discounts.defaultDiscount / 100));
  }

  if (discounts.Tiers) {
    discounts.Tiers.forEach((tier) => {
      if (tier.quantity <= quantity)
        updatedPrice = updatedPrice - (updatedPrice * (tier.discount / 100));
    });
  }
  return updatedPrice * quantity;
}

function sendEmailConfirmation(payload, h) {
    //Sends an email confirmation based on the given payload.
  try {
    const { error: sendConfirmationError, value: validatedSendConfirmationBody } = sendConfirmationSchema.validate(payload);
    if (sendConfirmationError)
      throw (sendConfirmationError);
    sendEmailConfirmationMessage(payload);
    // return h.response('ok').code(200);
  } catch (err) {
    logger.error(err); // Log the error using the logger
    throw err; 
  }
}

module.exports = {
  getProductDetails,
  getUpdatedPrice,
  processOrder,
  getOrderDetails,
  sendEmailConfirmation,
};
