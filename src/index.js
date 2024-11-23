import express from 'express'; 
import router from './routes/index.js'; 

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes

app.use(router); 

// Iniciar el servidor
app.listen(3000, () => {
    console.log('Servidor escuchando en el puerto 1234');
});


