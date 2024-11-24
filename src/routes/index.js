import { Router } from 'express';
import { getUser,postUser,postLibro,getLibros, prestarLibro, devolverLibro, EstadoMulta, getallUsers, getPrestamos,getPrestamosid} from '../controllers/indexcontrollers.js'

 const router = Router();

 router.get('/getUser',getUser)
 router.get('/getLibros',getLibros)
 router.get('/getallUsers',getallUsers)
 router.get('/getPrestamos',getPrestamos)
 router.get('/getPrestamosid',getPrestamosid)

 //post
 router.post('/postUser',postUser)
 router.post('/postLibro',postLibro)
 router.post('/prestarLibro',prestarLibro)
 router.post('/devolverLibro',devolverLibro)
 router.post('/EstadoMulta',EstadoMulta)
 export default router;