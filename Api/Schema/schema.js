const Joi = require('joi');

const processOrderSchema = Joi.object({
  products: Joi.array().items(
    Joi.object({
      p_id: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required(),
      actualPrice: Joi.number().positive().required(),
      discountedPrice: Joi.number().positive().required(),
    })
  ).required(),
  shippingDetails: Joi.object({
    Name: Joi.string().required(),
    Email: Joi.string().email().required(),
    Address: Joi.string().required(),
    PIN: Joi.string().required(),
  }).required(),
  totalActualPrice: Joi.number().positive().required(),
  totalDiscountedPrice: Joi.number().positive().required(),
});

const sendConfirmationSchema = Joi.object({
  email: Joi.string().email().required(),
  firstName: Joi.string().required(),
});


module.exports={processOrderSchema,sendConfirmationSchema};
