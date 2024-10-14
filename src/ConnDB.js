import mongoose from "mongoose"
export class ConnDB{
    static #connection=null

    static async conectar(url, db){
        if(this.#connection){
            console.log(`Conexion previamente establecida`)
            return this.#connection
        }

        this.#connection=await mongoose.connect(url, {dbName: db})
        console.log(`DB online...!!!`)
        return this.#connection
    }
}