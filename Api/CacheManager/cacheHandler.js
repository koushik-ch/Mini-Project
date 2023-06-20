const {createClient} = require('redis');
const IoRedis = require('ioredis');

class CacheClient{
    constructor(port){
        this.port = port;
        // this.client = createClient({
        //     host:'localhost',
        //     port:port
        // });
        // this.client.on('error', (err) => console.log('Redis Client Error', err));
        // console.log(this.client)
        this.client = new IoRedis(port);
    }
    async connect(){
        // await this.client.connect(this.port);
        console.log("Redis client connected at ",this.port);
    }
    async get(key){
        let cache = await this.client.get(key);
        return JSON.parse(cache);
    }
    async set(key,value){
        await this.client.set(key,JSON.stringify(value));
    }
}

module.exports = {CacheClient};