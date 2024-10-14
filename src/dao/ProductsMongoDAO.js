import { productModel } from "./models/productModel.js";

export class ProductsMongoDAO{
    static async get(filtro={}){
        return await productModel.find(filtro).lean()
    }

    static async getBy(filtro={}){
        return await productModel.findOne(filtro).lean()
    }

    static async create(product){
        return await productModel.create(product)
    }

    static async update(id, product){
        return await productModel.updateOne({_id:id}, product)
    }
}