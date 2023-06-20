const {Client} = require('pg');
const { logger, errorLogger } = require('../LogManager/logger.js');

class DbClient{
    constructor(){
        this.client = new Client({
            user:'postgres',
            host:'localhost',
            database:'Mini-project E-commerce Cart',
            password:'1234',
            port:5432,
        })
    }
    async connect(){
        await this.client.connect();
        console.log("Postgres client connected");
    }
    async getProductDetailsFromDb(productIDs){
        try{
        productIDs.forEach((id,index)=>{
            productIDs[index]='\''+id+'\''
        })
        await this.client.query('BEGIN')
        const res = await this.client.query(`SELECT * FROM products WHERE p_id IN (${productIDs});`);
        await this.client.query('COMMIT')
        return res.rows;
        }
        catch(err){
            logger.error(err);
            await this.client.query('ROLLBACK')
            throw err; 
        }
    }

    async getDiscounts(productID){
        try{
            const res = await this.client.query(`SELECT * FROM discounts WHERE p_id = '${productID}';`);
            return res.rows[0].discountinfo;
        }catch(err){
            logger.error(err);
            throw err; 
        }
    }

    async processOrder(orderDetails){
        try{
            await this.client.query('BEGIN')
            await this.client.query(`INSERT INTO orders(order_details) VALUES('${JSON.stringify(orderDetails)}')`);
            for(let product of orderDetails.products){
                let details = await this.client.query(`SELECT product_details FROM products WHERE p_id ='${product.p_id}'`);
                details = details.rows[0]
                const availableStock = details.product_details.availableStock-product.quantity;
                console.log(availableStock);
                details.product_details.availableStock = availableStock;
                await this.client.query(`UPDATE products SET product_details = '${JSON.stringify(details.product_details)}' WHERE p_id ='${product.p_id}'`);
            }
            await this.client.query('COMMIT')
        }
        catch(err){
            logger.error(err);
            await this.client.query('ROLLBACK')
            throw err; 
        }

    }
    async getOrderDetails(orderID){
        try{
            const orderDetails = await this.client.query(`SELECT order_details FROM orders WHERE order_id = ${orderID}`);
            return orderDetails.rows[0];
        }catch(err){
            logger.error(err);
            throw err;
        }
    }
}

module.exports = {DbClient};
