import { ProductsMongoDAO as ProductsDAO} from "../dao/ProductsMongoDAO.js"

class ProductService{
    constructor(dao){
        this.dao=dao
    }

    async getProducts(){
        return await this.dao.get()
    }
    async getProductById(id){
        let resultado=await this.dao.get({_id:id})
        if(resultado.length>0) return resultado[0]
        
        return null
    }
    async getProductByTitle(title){
        return await this.dao.get({title})
    }
    async createProduct(product){
        return await this.dao.create(product)
    }

}

export const productService = new ProductService(ProductsDAO)