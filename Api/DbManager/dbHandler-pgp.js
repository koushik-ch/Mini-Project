const pgp = require('pg-promise')();

class DbClient {
  constructor() {
    const connectionConfig = {
      user: 'postgres',
      host: 'localhost',
      database: 'Mini-project E-commerce Cart',
      password: '1234',
      port: 5432,
    };
    
    this.db = pgp(connectionConfig);
  }

  async connect() {
    console.log('Postgres client connected');
  }

  async getProductDetailsFromDb(productIDs) {
    try {
      const res = await this.db.any(
        `SELECT * FROM products WHERE p_id IN ($1:csv)`,
        [productIDs]
      );
      console.log(res);
      return res;
    } catch (err) {
      console.log(err);
    }
  }

  async getDiscounts(productID) {
    const res = await this.db.oneOrNone(
      `SELECT discountinfo FROM discounts WHERE p_id = $1`,
      [productID]
    );
    return res ? res.discountinfo : null;
  }

  async processOrder(orderDetails) {
    try {
      await this.db.tx(async (t) => {
        await t.none(`INSERT INTO orders(order_details) VALUES($1)`, [
          JSON.stringify(orderDetails),
        ]);

        for (let product of orderDetails.products) {
          const details = await t.one(
            `SELECT product_details FROM products WHERE p_id = $1`,
            [product.p_id]
          );
          const availableStock = details.product_details.availableStock - product.quantity;
          console.log(availableStock);
          details.product_details.availableStock = availableStock;
          await t.none(
            `UPDATE products SET product_details = $1 WHERE p_id = $2`,
            [JSON.stringify(details.product_details), product.p_id]
          );
        }
      });
    } catch (err) {
      throw err;
    }
  }

  async getOrderDetails(orderID) {
    try {
      const orderDetails = await this.db.one(
        `SELECT order_details FROM orders WHERE order_id = $1`,
        [orderID]
      );
      return orderDetails;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = { DbClient };
