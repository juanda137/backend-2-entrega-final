import express from 'express';
import { ConnDB } from './ConnDB.js';
import { config } from './config/config.js';
import cookieParser from "cookie-parser"


import { router as productsRouter } from './routes/productRouter.js';
import { router as cartsRouter } from './routes/cartRouter.js';
import { router as sessionsRouter} from './routes/sessionsRouter.js';
import { initPassport } from './config/config.passport.js';
import passport from 'passport';
const PORT=config.PORT;

const app=express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())
initPassport()
app.use(passport.initialize())

app.use("/api/products", productsRouter)
app.use("/api/carts", cartsRouter)
app.use("/api/sessions", sessionsRouter)

app.get('/',(req,res)=>{
    res.setHeader('Content-Type','text/plain');
    res.status(200).send('OK');
})

const server=app.listen(PORT,()=>{
    console.log(`Server escuchando en puerto ${PORT}`);
});

await ConnDB.conectar(config.MONGO_URL, config.DB_NAME)
// await ConnDB.conectar(config.MONGO_URL, config.DB_NAME)