import { isValidObjectId } from "mongoose"
import { cartService } from "../services/cartService.js"
import { procesaErrores } from "../utils.js"
import { productService } from "../services/productService.js"
import { CartMongoManager } from "../dao/CartMongoDAO.js"
import { ProductsMongoDAO } from "../dao/ProductsMongoDAO.js"
import { ticketModel } from "../dao/models/ticketModel.js"

export const createCart=async(req,res)=>{
    try {
        let nuevoCart=await cartService.createCart()
        res.setHeader('Content-Type','application/json')
        res.status(201).json({nuevoCart})
    } catch (error) {
        procesaErrores(res, error)
    }
}

export const addProductToCart=async(req, res)=>{
    let {cid, pid}=req.params
    if(!cid || !pid){
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({error:`complete pid / cid`})
    }

    console.log(cid, req.user.cart)
    if(cid!=req.user.cart){
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({error:`Carrito no pertenece al usuario logueado`})
    }

    if(!isValidObjectId(cid) || !isValidObjectId(pid)){
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({error:`fomato invalido cid / pid`})
    }

    try {
        let product=await productService.getProductById(pid)
        console.log(product)
        if(!product){
            res.setHeader('Content-Type','application/json');
            return res.status(400).json({error:`No existe producto con id ${pid}`})
        }
    
        let cart=await cartService.getCartById(cid)
        if(!cart){
            res.setHeader('Content-Type','application/json');
            return res.status(400).json({error:`No existe cart con id ${cid}`})
        }

        let indiceProducto=cart.products.findIndex(p=>p.product._id==pid)
        if(indiceProducto===-1){
            cart.products.push({product:pid, quantity:1})
        }else{
            cart.products[indiceProducto].quantity++
        }

        let cartActualizado=await cartService.updateCart(cid, cart)

        res.setHeader('Content-Type','application/json');
        return res.status(200).json({cartActualizado});
        
    } catch (error) {
        procesaErrores(res, error)        
    }
}


export const getCartById=async(req, res)=>{
    try {
        let {cid}=req.params
        if(!isValidObjectId(cid)){
            res.setHeader('Content-Type','application/json');
            return res.status(400).json({error:`Ingrese id en formato válido`})
        }
    
        let cart=await CartMongoManager.getBy({_id:cid})
        if(!cart){
            res.setHeader('Content-Type','application/json');
            return res.status(400).json({error:`No existe cart ${cid}`})
        }
    
        res.setHeader('Content-Type','application/json');
        return res.status(200).json({cart});
    } catch (error) {
        procesaErrores(res, error)
    }
}

export const purchaseCart=async(req, res)=>{
    try {
        let {cid}=req.params
        if(!isValidObjectId(cid)){
            res.setHeader('Content-Type','application/json');
            return res.status(400).json({error:`Ingrese id en formato válido`})
        }
    
        let cart=await CartMongoManager.getBy({_id:cid})
        if(!cart){
            res.setHeader('Content-Type','application/json');
            return res.status(400).json({error:`No existe cart ${cid}`})
        }

        // recorrer el products del cart, y ver si cada producto existe en DB
        // además ver si hay stock, y actualizar el stock (descuento la quantity que compro). 
        // Mientras, marco que item de product tiene stock y cual no
        // cart.products.forEach
        for(let i=0; i<cart.products.length; i++){  // .forEach no labura bien con async/await, no arroja error, pero no respeta el await...!!! usar for
            let p=cart.products[i]
            // console.log(p)
            let producto=await ProductsMongoDAO.getBy({_id: p.product._id})
            if(producto && producto.stock>=p.quantity){
                p.tieneStock=true
                // actualizar el inventario del producto
                producto.stock=producto.stock-p.quantity
                await ProductsMongoDAO.update(p.product._id, producto)
            }
        }


        // separo lo que tiene stock (para generar ticket)
        const conStock=cart.products.filter(p=>p.tieneStock==true)
        // borro lo que tiene stock de cart.products (queda lo que no tenía stock)
        cart.products=cart.products.filter(p=>p.tieneStock==undefined)

        // si no tengo items con stock, devuelvo error...!!!
        if(conStock.length===0){
            res.setHeader('Content-Type','application/json');
            return res.status(400).json({error:`No hay ítems en condiciones de ser comprados...!!!`})
        }

        // con lo que separe (que tiene stock), calculo total, y grabo el ticket
        let total=conStock.reduce((acum, item)=>acum+=item.quantity*item.product.price , 0)
        let nroComp=Date.now()
        let fecha=new Date()
        let email_comprador=req.user.email
        console.log(nroComp, fecha, email_comprador, total)
        const ticket=await ticketModel.create({
            nroComp, fecha, email_comprador, total, 
            detalle:conStock
        })

        // actualizar cart... como quede (con algún ítem sin stock o vacío)
        await CartMongoManager.update({_id:cid}, cart)

        let errorMail=undefined
        // enviar email (con un try catch independiente... por si falla el envío de mail, 
        // hacer el tratamiento aparte)
        // en el catch completan la descrip del error en errorMail

        res.setHeader('Content-Type','application/json');
        return res.status(200).json({ticket, errorMail});
    } catch (error) {
        procesaErrores(res, error)
    }
}