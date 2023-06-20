const {CacheClient} = require('./cacheHandler.js');

class CacheService{
    constructor(master,slave){
        this.masterCacheClient = new CacheClient(master);
        this.slaveCacheClient = new CacheClient(slave);
        this.masterCacheClient.connect();
        this.slaveCacheClient.connect();
    }
    async getCachedProductDetails(productIDs){
        let productDetails=[];
        let uncachedProductIDs=[];
        for(let productID of productIDs){
            console.log(productIDs);
            let cachedDetails = await this.slaveCacheClient.get(productID);
            if(cachedDetails){
                console.log("Cache Hit for ",productID);
                productDetails.push(cachedDetails);
            }
            else{ 
                console.log("1");
                uncachedProductIDs.push(productID);
            }
        }
        return {productDetails,uncachedProductIDs};
    }

    async updateProductCache(products){
        for(let product of products){
            let cachedDetails = await this.masterCacheClient.get(product.p_id);
            // console.log(cachedDetails);
            if(cachedDetails){
                cachedDetails.product_details.availableStock = cachedDetails.product_details.availableStock - product.quantity;
                this.masterCacheClient.set(product.p_id,cachedDetails);
            }
        }
    }

    async setProductCache(p_id,product){
        await this.masterCacheClient.set(p_id,product);
    }
}

module.exports ={CacheService}