import { pool } from '../database/conexiondatabase.js'; 

export const getUser = async (req, res) => {
    try {
        const { id_user } = req.query; // Obtener el id_user desde la URL

        if (!id_user) {
            return res.status(400).json({ message: 'id_user es requerido' });
        }

        // Consulta para obtener las multas del usuario
        const multasResult = await pool.query(
            'SELECT * FROM multas WHERE id_user = $1',
            [id_user]
        );

        // Consulta para obtener los libros prestados por el usuario
        const prestamosResult = await pool.query(
            'SELECT * FROM prestamos WHERE id_user = $1',
            [id_user]
        );

        // Respuesta exitosa con ambas informaciones
        res.status(200).json({
            message: 'Datos del usuario',
            multas: multasResult.rows,
            prestamos: prestamosResult.rows,
        });

    } catch (error) {
        console.error('Error ejecutando la consulta:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};
export const getallUsers = async (req, res) => {
    try {
        // Consulta para traer todos los libros
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (error) {
        console.error('Error ejecutando la consulta:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

export const postUser = async (req, res) => {
    try {
        const { username, rol } = req.body; 
        const result = await pool.query(
            'INSERT INTO users (username, rol) VALUES ($1, $2)', [username, rol]
        );
        res.send('Usuario agregado exitosamente');
    } catch (error) {
        console.error('Error ejecutando la consulta:', error);
        res.status(500).json({ message: 'Error' });
    }
};
// Crear un nuevo libro
export const postLibro = async (req, res) => {
    try {
        const { titulo, autor, anio_publicacion, cantidad_disponible } = req.body;

        // Validar campos obligatorios
        if (!titulo || !autor || !anio_publicacion || cantidad_disponible == null) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }

        const result = await pool.query(
            'INSERT INTO libros (titulo, autor, anio_publicacion, cantidad_disponible) VALUES ($1, $2, $3, $4) RETURNING *',
            [titulo, autor, anio_publicacion, cantidad_disponible]
        );

        res.status(201).json({
            message: 'Libro creado exitosamente',
            libro: result.rows[0],
        });
    } catch (error) {
        console.error('Error ejecutando la consulta:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};
export const getLibros = async (req, res) => {
    try {
        // Consulta para traer todos los libros
        const result = await pool.query('SELECT * FROM libros');
        res.json(result.rows); // Retorna los libros como un arreglo en JSON
    } catch (error) {
        console.error('Error ejecutando la consulta:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};
export const prestarLibro = async (req, res) => {
    const client = await pool.connect(); // Conexión para manejar la transacción
    try {
        const { id_libro, id_user, fecha_prestamo,fecha_entrega } = req.body;

        if ([id_libro, id_user, fecha_entrega].some((field) => field == null)) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios: id_libro, id_user, fecha_entrega' });
        }

        // Verificar si el usuario tiene multas pendientes
        const multaResult = await client.query(
            `SELECT * 
             FROM multas 
             WHERE id_user = $1 AND estado = FALSE`,
            [id_user]
        );

        if (multaResult.rows.length > 0) {
            return res.status(403).json({
                message: 'El usuario tiene multas pendientes y no puede realizar un nuevo préstamo.'
            });
        }

        await client.query('BEGIN'); // Inicia la transacción

        // Verificar si el libro existe y tiene unidades disponibles
        const libroResult = await client.query(
            `SELECT cantidad_disponible 
             FROM libros 
             WHERE id_libro = $1`,
            [id_libro]
        );

        if (libroResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Libro no encontrado' });
        }

        const cantidadDisponible = libroResult.rows[0].cantidad_disponible;

        if (cantidadDisponible == null || cantidadDisponible <= 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'No hay unidades disponibles para este libro' });
        }

        // Registrar el préstamo
        const prestamoResult = await client.query(
            `INSERT INTO prestamos (fecha_prestamo, fecha_entrega, estado, id_user, id_libro) 
             VALUES ($1, $2, 0, $3, $4) RETURNING id_prestamo`,
            [fecha_prestamo, fecha_entrega, id_user, id_libro]
        );

        const id_prestamo = prestamoResult.rows[0].id_prestamo;

        // Actualizar la cantidad disponible del libro
        await client.query(
            `UPDATE libros 
             SET cantidad_disponible = cantidad_disponible - 1 
             WHERE id_libro = $1`,
            [id_libro]
        );

        await client.query('COMMIT'); // Confirmar la transacción

        res.status(201).json({
            message: 'Préstamo registrado exitosamente',
            prestamo: {
                id_prestamo,
                id_libro,
                id_user,
                fecha_prestamo,
                fecha_entrega,
            },
        });
    } catch (error) {
        await client.query('ROLLBACK'); // Manejo de errores y rollback
        console.error('Error al procesar el préstamo:', error);
        res.status(500).json({
            message: 'Error del servidor',
            error: error.message
        });
    } finally {
        client.release(); // Liberar la conexión
    }
};
export const devolverLibro = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id_prestamo, fecha_devolucion } = req.body;

        if (!id_prestamo || !fecha_devolucion) {
            return res.status(400).json({ message: 'id_prestamo y fecha_devolucion son obligatorios' });
        }

        await client.query('BEGIN'); // Inicia la transacción

        // Obtener información del préstamo
        const prestamoResult = await client.query(
            `SELECT p.*, u.id_user 
             FROM prestamos p
             JOIN users u ON p.id_user = u.id_user
             WHERE p.id_prestamo = $1`,
            [id_prestamo]
        );

        if (prestamoResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Préstamo no encontrado' });
        }

        const prestamo = prestamoResult.rows[0];
        const { fecha_entrega, estado, id_libro, id_user } = prestamo;

        if (estado === 1) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'El préstamo ya fue devuelto' });
        }

        const fechaEntrega = new Date(fecha_entrega);
        const fechaDevolucion = new Date(fecha_devolucion);
        let multa = 0;

        if (fechaDevolucion > fechaEntrega) {
            const diasRetraso = Math.ceil((fechaDevolucion - fechaEntrega) / (1000 * 60 * 60 * 24));
            multa = diasRetraso * 1000; // Suponiendo una multa de 1000 por día de retraso
        
            // Actualizar la multa en la tabla "multas"
            await client.query(
                `UPDATE multas 
                 SET monto = $1, fecha_pago = $2 
                 WHERE id_prestamo = $3 AND estado = FALSE`,
                [multa, fecha_devolucion, id_prestamo]
            );
        
            // Actualizar el campo de multa en la tabla "prestamos"
            await client.query(
                `UPDATE prestamos 
                 SET multa = $1 
                 WHERE id_prestamo = $2`,
                [multa, id_prestamo]
            );
        }
        

        // Actualizar el estado del préstamo y devolver el libro al inventario
        await client.query(
            `UPDATE prestamos 
             SET fecha_devolucion = $1, estado = 1 
             WHERE id_prestamo = $2`,
            [fecha_devolucion, id_prestamo]
        );

        await client.query(
            `UPDATE libros 
             SET cantidad_disponible = cantidad_disponible + 1 
             WHERE id_libro = $1`,
            [id_libro]
        );

        await client.query('COMMIT'); // Confirma la transacción

        res.status(200).json({
            message: 'Devolución registrada exitosamente',
            devolucion: {
                id_prestamo,
                fecha_devolucion,
                multa
            },
        });
    } catch (error) {
        await client.query('ROLLBACK'); // Revertir transacción en caso de error
        console.error('Error al procesar la devolución:', error);
        res.status(500).json({
            message: 'Error del servidor',
            error: error.message
        });
    } finally {
        client.release(); // Liberar conexión
    }
    
};
export const EstadoMulta = async (req, res) => {
    try {
        const { id_multa } = req.body; // Obtener el id_multa desde el cuerpo de la solicitud

        // Validar si el id_multa fue proporcionado
        if (!id_multa) {
            return res.status(400).json({ message: 'id_multa es requerido' });
        }

        // Verificar si la multa existe y su estado es FALSE
        const multaResult = await pool.query(
            `SELECT * FROM multas WHERE id_multa = $1 AND estado = FALSE`,
            [id_multa]
        );

        // Si no se encuentra la multa con estado FALSE, retornar un error
        if (multaResult.rows.length === 0) {
            return res.status(404).json({
                message: 'No se encontró una multa pendiente con el id proporcionado o ya está pagada.'
            });
        }

        // Actualizar el estado de la multa de FALSE a TRUE
        await pool.query(
            `UPDATE multas SET estado = TRUE WHERE id_multa = $1`,
            [id_multa]
        );

        // Respuesta exitosa
        res.status(200).json({
            message: 'El estado de la multa ha sido actualizado a TRUE.'
        });

    } catch (error) {
        console.error('Error al cambiar el estado de la multa:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

export const getPrestamos = async (req, res) => {
    const client = await pool.connect(); // Usamos una conexión para manejar la transacción
    try {
        // Realizar el INNER JOIN entre prestamos, users y libros
        const result = await pool.query(`
            SELECT 
                p.id_prestamo, 
                u.id_user, 
                u.username, 
                l.titulo, 
                p.fecha_entrega
            FROM 
                prestamos p
            INNER JOIN 
                users u 
            ON 
                p.id_user = u.id_user
            INNER JOIN 
                libros l
            ON 
                p.id_libro = l.id_libro
        `);

        // Obtener la fecha actual para comparar con fecha_entrega
        const fechaActual = new Date();

        // Iteramos sobre los préstamos obtenidos
        for (const prestamo of result.rows) {
            const { id_prestamo, fecha_entrega, id_user } = prestamo;

            // Verificar si ya existe una multa para este préstamo
            const multaExistente = await pool.query(`
                SELECT * FROM multas WHERE id_prestamo = $1 AND estado = FALSE
            `, [id_prestamo]);

            // Si no existe multa, verificamos si el préstamo está fuera de fecha
            if (multaExistente.rows.length === 0) {
                const fechaEntrega = new Date(fecha_entrega);

                if (fechaActual > fechaEntrega) {
                    // Si la fecha actual es mayor a la de entrega, se genera la multa
                    const diasRetraso = Math.ceil((fechaActual - fechaEntrega) / (1000 * 60 * 60 * 24));
                    const multa = (diasRetraso-1)* 1000; // Ejemplo de multa de 1000 por día de retraso

                    // Insertar la multa en la tabla de multas
                    await pool.query(`
                        INSERT INTO multas (id_prestamo, id_user, monto, fecha_generacion, estado)
                        VALUES ($1, $2, $3, $4, FALSE)
                    `, [id_prestamo, id_user, multa, fechaActual]);

                    // También actualizar la tabla de préstamos con el monto de la multa
                    await pool.query(`
                        UPDATE prestamos
                        SET multa = $1
                        WHERE id_prestamo = $2
                    `, [multa, id_prestamo]);
                }
            }
        }

        // Responder con los préstamos
        res.status(200).json({
            message: 'Datos obtenidos exitosamente',
            prestamos: result.rows,
        });
    } catch (error) {
        console.error('Error al ejecutar el INNER JOIN:', error);
        res.status(500).json({
            message: 'Error del servidor',
            error: error.message,
        });
    } finally {
        client.release(); // Liberar la conexión
    }
};
export const getPrestamosid = async (req, res) => {
    const { id_user } = req.query; // Obtener el id_user desde los parámetros de la URL

    try {
        // Realizar el INNER JOIN entre prestamos, users y libros para obtener los detalles de los préstamos del usuario
        const result = await pool.query(`
            SELECT 
                p.id_prestamo, 
                u.id_user, 
                u.username, 
                l.titulo, 
                p.fecha_prestamo, 
                p.fecha_entrega, 
                p.fecha_devolucion, 
                p.estado, 
                p.multa
            FROM 
                prestamos p
            INNER JOIN 
                users u 
            ON 
                p.id_user = u.id_user
            INNER JOIN 
                libros l
            ON 
                p.id_libro = l.id_libro
            WHERE 
                p.id_user = $1
        `, [id_user]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No se encontraron préstamos para este usuario' });
        }

        // Enviar la respuesta con los datos obtenidos
        res.status(200).json({
            message: 'Datos de los préstamos obtenidos exitosamente',
            prestamos: result.rows, // Devolver los préstamos encontrados
        });
    } catch (error) {
        console.error('Error al ejecutar la consulta:', error);
        res.status(500).json({
            message: 'Error del servidor',
            error: error.message,
        });
    }
};

