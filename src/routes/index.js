import { Router } from 'express';
import { postUser,UpdateUser,getAllUsers,DeleteUser,postProduct, UpdateProduct, getAllProducts,DeleteProduct,postCategoria,UpdateCategoria,getAllCategorias,DeleteCategoria} from '../controllers/indexcontrollers.js'

 const router = Router();
//get
 router.get('/getAllUsers',getAllUsers)
 router.get('/getAllProducts',getAllProducts)
 router.get('/getAllCategorias',getAllCategorias)

 //post
 router.post('/postUser',postUser)
 router.post('/UpdateUser',UpdateUser)
 router.post('/DeleteUser',DeleteUser)
 router.post('/postProduct',postProduct)
 router.post('/UpdateProduct',UpdateProduct)
 router.post('/DeleteProduct',DeleteProduct)
 router.post('/postCategoria',postCategoria)
 router.post('/UpdateCategoria',UpdateCategoria)
 router.post('/DeleteCategoria',DeleteCategoria)

 export default router;