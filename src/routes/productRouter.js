import { Router } from 'express';
import ProductController from '../controller/ProductController.js';
export const router=Router()

router.get('/', ProductController.getProducts)
router.post('/', ProductController.createProduct)