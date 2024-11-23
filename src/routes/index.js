import { Router } from 'express';
import { getUser,postUser,postLibro,getLibros, prestarLibro, devolverLibro, EstadoMulta} from '../controllers/indexcontrollers.js'

 const router = Router();

 router.get('/getUser',getUser)
 router.get('/getLibros',getLibros)

 //post
 router.post('/postUser',postUser)
 router.post('/postLibro',postLibro)
 router.post('/prestarLibro',prestarLibro)
 router.post('/devolverLibro',devolverLibro)
 router.post('/EstadoMulta',EstadoMulta)
 export default router;