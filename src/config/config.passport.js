import passport from "passport"
import local from "passport-local"
import passportJWT from "passport-jwt"
import { usersService } from "../services/usersService.js"
import { cartService } from "../services/cartService.js"
import { generaHash, validaHash } from "../utils.js"
import { config } from "./config.js"

const buscarToken=(req)=>{
    let token=null

    if(req.cookies.CoderCookie){
        token=req.cookies.CoderCookie
    }

    return token
}

export const initPassport=()=>{
    passport.use("registro", 
        new local.Strategy(
            {
                usernameField: "email", passReqToCallback:true
            },
            async(req, username, password, done)=>{
                try {
                    let {first_name: nombre, ...otros}=req.body
                    if(!nombre){
                        console.log("no llega nombre")
                        return done(null, false, {message:"nombre es requerido"})
                    }
                    // validaciones varias...
                    let existe=await usersService.getUserByEmail(username)
                    console.log("passport usuario", existe)
                    if(existe){
                        console.log("usuario ya existe")
                        return done(null, false, {message:"email existe en db"})
                    }
                    password=generaHash(password)
                    let carritoNuevo=await cartService.createCart()
                    let nuevoUsuario=await usersService.createUser({nombre, ...otros, email: username, cart: carritoNuevo._id, password})
                    return done(null, nuevoUsuario)
                } catch (error) {
                    console.log(error.message)
                    return done(error)
                }
            }
        )
    ) // fin registro

    passport.use("login", 
        new local.Strategy(
            {usernameField:"email"},
            async (username, password, done)=>{
                try {
                    let usuario=await usersService.getUserByEmail(username)
                    if(!usuario){
                        return done(null, false, {message:"Credenciales invalidas"})
                    }
                    if(!validaHash(password, usuario.password)){
                        return done(null, false, {message:"Credenciales invalidas"})
                    }
                    delete usuario.password
                    return done(null, usuario)
                } catch (error) {
                    return done(error)
                }
            }
        )
    )

    passport.use("current",
        new passportJWT.Strategy(
            {
                secretOrKey: config.SECRET,
                // jwtFromRequest: new passportJWT.ExtractJwt.fromUrlQueryParameter("token")
                jwtFromRequest: new passportJWT.ExtractJwt.fromExtractors([buscarToken])
            },
            async(usuario, done)=>{
                try {
                    return done(null, usuario)
                } catch (error) {
                    return done(error)
                }
            }
        )
    )

} 