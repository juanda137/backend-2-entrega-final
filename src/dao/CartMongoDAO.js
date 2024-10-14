import { cartsModel } from "./models/cartsModel.js";

export class CartMongoManager{
    static async create(){
        return await cartsModel.create({products:[]})
    }

    static async getBy(filtro={}){
        return await cartsModel.findOne(filtro).populate("products.product")
    }

    static async update(filtro={}, cart){
        // result.modifiedCount
        return await cartsModel.updateOne(filtro, cart)
    }
}