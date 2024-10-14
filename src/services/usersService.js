import { UsersMongoDAO } from "../dao/UserMongoDAO.js"


class UsersService{
    constructor(dao){
        this.dao=dao
    }

    async getUserById(id){
        return await this.dao.getBy({_id:id})
    }
    async getUserByEmail(email){
        let usuario=await this.dao.getBy({email})
        console.log("service user", usuario)
        return usuario
    }
    async createUser(user){
        return await this.dao.create(user)
    }
}

export const usersService=new UsersService(UsersMongoDAO)