const { productosBD } = require("./conexion");
const Producto = require("../class/Producto");

class ProductoNoEncontradoError extends Error {
    constructor(id) {
        super(`Producto con ID ${id} no encontrado`);
    }
}

// Función para validar un producto
function validar(producto) {
    return producto.nombre && producto.cantidad && producto.precio !== undefined;
}
async function mostrarProductos() {
    const productos = await productosBD.get();
    productosValidos = [];
    productos.forEach(producto => {
        const producto1 = new Producto({ id: producto.id, ...producto.data() });
        if (validar(producto1.datos)) {
            productosValidos.push(producto1.datos);
        }
    });

    return productosValidos;
}

async function buscarPorId(id) {
    var productoValido;
    const producto = await productosBD.doc(id).get();
    const producto1 = new Producto({ id: producto.id, ...producto.data() });
    if (validar(producto1.datos)) {
        productoValido = producto1.datos;
    }

    return productoValido;
}

async function nuevoProducto(data) {
    const producto1 = new Producto(data);
    var productoValido = {};
    var productoGuardado = false;
    if (validar(producto1.datos)) {
        productoValido = producto1.datos;
        await productosBD.doc().set(productoValido);
        productoGuardado = true;
    }
    
    return productoGuardado;
}

async function borrarProductos(id) {
    var productoBorrado = true;
    if (await buscarPorId(id) != undefined) {
        console.log("Se borrará el producto");
        await productosBD.doc(id).delete();
    }

    return productoBorrado;
}

async function modificarProducto(id, nuevosDatos) {
    try {
        const docRef = productosBD.doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            throw new ProductoNoEncontradoError(id);
        }

        await docRef.update(nuevosDatos);
        return { mensaje: "Producto actualizado correctamente", id };
    } catch (error) {
        if (error instanceof ProductoNoEncontradoError) {
            // Manejar el error de producto no encontrado
        } else {
            // Manejar otros tipos de errores
        }
        throw error;
    }
}



module.exports = {
    mostrarProductos,
    nuevoProducto,
    borrarProductos,
    buscarPorId,
    modificarProducto,
};

