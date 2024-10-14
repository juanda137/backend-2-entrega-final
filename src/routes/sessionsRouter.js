import { Router } from 'express';
import passport from 'passport';
import jwt from "jsonwebtoken"
import { config } from '../config/config.js';
export const router=Router()

router.post('/register', passport.authenticate("registro", {session:false}), (req,res)=>{

    res.setHeader('Content-Type','application/json')
    res.status(201).json({message: "Registro exitoso", nuevoUsuario: req.user})
})
router.post('/login', passport.authenticate("login", {session:false}), (req,res)=>{

    // token
    let token=jwt.sign(req.user, config.SECRET, {expiresIn: 60*5})
    res.cookie("CoderCookie", token)
    // cookie

    res.setHeader('Content-Type','application/json')
    res.status(200).json({message: "Login exitoso", usuarioLogueado: req.user})
})

