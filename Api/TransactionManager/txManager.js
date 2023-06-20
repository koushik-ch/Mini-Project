const { logger} = require('../LogManager/logger.js');

class TransactionManager{

    async transact(client,callback){
        try{
            client.query('BEGIN')
            await callback();
            client.query('COMMIT')
        }catch(err){
            logger.error(err);
            await client.query('ROLLBACK')
            throw err; 
        }
    }
}

module.exports = {TransactionManager}