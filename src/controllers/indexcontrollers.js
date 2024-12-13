import { pool } from '../database/conexiondatabase.js'; 


export const postUser = async (req, res) => {
    try {
        const { nombre, email, password } = req.body; 
        const result = await pool.query(
            'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3)', [nombre, email, password]
        );
        res.send('Usuario agregado exitosamente');
    } catch (error) {
        console.error('Error ejecutando la consulta:', error);
        res.status(500).json({ message: 'Error' });
    }
};

export const UpdateUser = async (req, res) => {
    try {
        const { nombre, email, password,id_usuario } = req.body; 
        const result = await pool.query(
            'UPDATE usuarios SET nombre = $1, email = $2, password = $3 WHERE id_usuario = $4', [nombre, email, password, id_usuario]
        );
        res.send('Usuario actualizado exitosamente');
    } catch (error) {
        console.error('Error ejecutando la consulta:', error);
        res.status(500).json({ message: 'Error' });
    }
};
export const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM usuarios'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error ejecutando la consulta:', error);
        res.status(500).json({ message: 'Error' });
    }
};
export const DeleteUser = async (req, res) => {
    try {
        const {id_usuario } = req.body; 
        const result = await pool.query(
            'DELETE FROM usuarios WHERE id_usuario = $1', [id_usuario]
        );
        res.send('Usuario eliminado exitosamente');
    } catch (error) {
        console.error('Error ejecutando la consulta:', error);
        res.status(500).json({ message: 'Error' });
    }
};
export const postProduct = async (req, res) => {
    try {
        const { nombre_producto, descripcion, precio, foto } = req.body; 
        const result = await pool.query(
            'INSERT INTO productos (nombre_producto, descripcion, precio, foto) VALUES ($1, $2, $3,$4)', [nombre_producto, descripcion, precio, foto]
        );
        res.send('Producto agregado exitosamente');
    } catch (error) {
        console.error('Error ejecutando la consulta:', error);
        res.status(500).json({ message: 'Error' });
    }
};
export const UpdateProduct = async (req, res) => {
    try {
        const { nombre_producto, descripcion, precio,foto,id_producto } = req.body; 
        const result = await pool.query(
            'UPDATE productos SET nombre_producto = $1, descripcion = $2, precio = $3, foto = $4 WHERE id_producto = $5', [nombre_producto, descripcion, precio, foto,id_producto]
        );
        res.send('Usuario actualizado exitosamente');
    } catch (error) {
        console.error('Error ejecutando la consulta:', error);
        res.status(500).json({ message: 'Error' });
    }
}
export const getAllProducts = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM productos'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error ejecutando la consulta:', error);
        res.status(500).json({ message: 'Error' });
    }
};
export const DeleteProduct = async (req, res) => {
    try {
        const {id_producto } = req.body; 
        const result = await pool.query(
            'DELETE FROM productos WHERE id_producto = $1', [id_producto]
        );
        res.send('Producto eliminado exitosamente');
    } catch (error) {
        console.error('Error ejecutando la consulta:', error);
        res.status(500).json({ message: 'Error' });
    }
};
export const postCategoria = async (req, res) => {
    try {
        const { nombre_categoria, descripcion} = req.body; 
        const result = await pool.query(
            'INSERT INTO categorias (nombre_categoria, descripcion) VALUES ($1, $2)', [nombre_categoria, descripcion]
        );
        res.send('Categoria agregada exitosamente');
    } catch (error) {
        console.error('Error ejecutando la consulta:', error);
        res.status(500).json({ message: 'Error' });
    }
};
export const UpdateCategoria = async (req, res) => {
    try {
        const { nombre_categoria, descripcion,id_categoria } = req.body; 
        const result = await pool.query(
            'UPDATE categorias SET nombre_categoria = $1, descripcion = $2 WHERE id_categoria = $3', [nombre_categoria, descripcion,id_categoria]
        );
        res.send('Categoria actualizada exitosamente');
    } catch (error) {
        console.error('Error ejecutando la consulta:', error);
        res.status(500).json({ message: 'Error' });
    }
}
export const getAllCategorias = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM categorias'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error ejecutando la consulta:', error);
        res.status(500).json({ message: 'Error' });
    }
};
export const DeleteCategoria = async (req, res) => {
    try {
        const {id_categoria } = req.body; 
        const result = await pool.query(
            'DELETE FROM categorias WHERE id_categoria = $1', [id_categoria]
        );
        res.send('Categoria eliminada exitosamente');
    } catch (error) {
        console.error('Error ejecutando la consulta:', error);
        res.status(500).json({ message: 'Error' });
    }
};