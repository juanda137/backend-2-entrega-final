import mongoose from "mongoose";

export const productModel=mongoose.model(
    "products", 
    new mongoose.Schema(
        {
            title: String, 
            code: {type: String, unique:true},
            price: Number, 
            stock: Number
        },
        {
            timestamps:true, strict: false
        }
    )
)