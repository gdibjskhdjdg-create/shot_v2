const Service = require(".");
const ModelInRedisHook = require("../model/ModelInRedis.hook");


class SampleCRUD_Service extends Service {

    constructor(model) {
        super(model);
        this.modelInRedis = new ModelInRedisHook({ model });
    }

    async get(filters = {}){
        let data = [];

        const getFromDB = async () => {
            const res = await this.model.findAll();
            return res.map(item => item.toJSON());
        }

        if(!this.model.storeInRedis || typeof filters !== 'object' || Object.keys(filters).length > 0){
            data = await getFromDB();
        }
        else{
            data = await this.modelInRedis.GetData();
            if(!data){
                data = await getFromDB();
                await this.modelInRedis.StoreInRedis(data);
            }
        }
        
        return data;
    }

    async create(body){
        try{
            const checkExist = await this.model.findOne({ where: body });
            if(checkExist){
                return checkExist;
            }
        }
        catch(err){}

        const res = await this.model.create(body);
        return res;
    }

    async update(id, body = {}){
        const entity = await this.getById(id);
        Object.keys(body).forEach(item => {
            entity[item] = body[item]
        });

        await entity.save();

        return entity.toJSON();
    }

    async delete(id){
        const entity = await this.getById(id);
        await entity.destroy()

        return true;
    }

    async findOrCreate(data){
        let inputs = []
        for(let i = 0; i < data.length; i++){
            let item = await this.model.findOne({ where: { ...data[i] }});
            if(!item) item = this.model.create({ ...data[i] });

            inputs.push(item)
        }

        return inputs;
    }

}

module.exports = SampleCRUD_Service