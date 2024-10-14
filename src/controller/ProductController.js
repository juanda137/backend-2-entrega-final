import { productService } from "../services/productService.js";
import { procesaErrores } from "../utils.js";

export default class ProductController{
    static async getProducts(req, res){
        try {
            let products=await productService.getProducts()
            res.setHeader('Content-Type','application/json');
            return res.status(200).json({products});
        } catch (error) {
            return procesaErrores(res, error)
        }
    }

    static async createProduct(req, res){
        let {title, ...otros}=req.body  //... rest
        if(!title){
            res.setHeader('Content-Type','application/json');
            return res.status(400).json({error:`Complete las props requeridas`})
        }

        // validaciones... 
        try {
            let nuevoProducto=await productService.createProduct({title, ...otros})  // ...spread
            res.setHeader('Content-Type','application/json');
            return res.status(201).json({nuevoProducto});
        } catch (error) {
            return procesaErrores(res, error)
        }
    }
}