const { usuariosBD } = require("./conexion");
const Usuario = require("../class/Usuario");
const { validarPassword, encriptarPassword } = require("../middlewares/funcionesPassword");

// Función para validar la existencia de campos obligatorios
function validarUsuario(usuario) {
    return !!(usuario.nombre && usuario.usuario && usuario.password);
}

// Función para obtener todos los usuarios válidos
async function mostrarUsuarios() {
    const usuarios = await usuariosBD.get();
    return usuarios.docs.map(doc => {
        const usuario = new Usuario({ id: doc.id, ...doc.data() });
        return validarUsuario(usuario.datos) ? usuario.datos : null;
    }).filter(usuario => usuario !== null);
}

// Función para buscar un usuario por ID
async function buscarPorId(id) {
    const doc = await usuariosBD.doc(id).get();
    if (!doc.exists) {
        return null;
    }

    const usuario = new Usuario({ id: doc.id, ...doc.data() });
    if (validarUsuario(usuario.datos)) {
        const { password, salt, ...usuarioSinPassword } = usuario.datos;
        return usuarioSinPassword;
    }

    return null;
}

// Función para crear un nuevo usuario
async function nuevoUsuario(data) {
    if (!validarUsuario(data)) {
        return { usuarioGuardado: false };
    }

    const { hash, salt } = encriptarPassword(data.password);
    data.password = hash;
    data.salt = salt;
    data.tipoUsuario = "usuario";

    const usuario = new Usuario(data);
    await usuariosBD.doc().set(usuario.datos);

    return { usuarioGuardado: true };
}

// Función para borrar un usuario
async function borrarUsuarios(id) {
    const usuario = await buscarPorId(id);
    if (usuario) {
        await usuariosBD.doc(id).delete();
        return true;
    }
    return false;
}

// Función para modificar un usuario
async function modificarUsuario(id, nuevosDatos) {
    const usuarioDoc = await usuariosBD.doc(id).get();
    if (!usuarioDoc.exists) {
        throw new Error("Usuario no encontrado");
    }

    const updatedData = { ...usuarioDoc.data(), ...nuevosDatos };

    if (nuevosDatos.password) {
        const { hash, salt } = encriptarPassword(nuevosDatos.password);
        updatedData.password = hash;
        updatedData.salt = salt;
    } else {
        delete updatedData.password;
        delete updatedData.salt;
    }

    await usuariosBD.doc(id).update(updatedData);

    return { mensaje: "Usuario actualizado correctamente", id };
}

// Función para realizar el login
async function login(req, usuario, password) {
    const usuarioEncontrado = await usuariosBD.where("usuario", "==", usuario).get();

    let user = {
        usuario: "anónimo",
        tipo: "sin acceso",
    };

    if (usuarioEncontrado.size > 0) {
        for (const doc of usuarioEncontrado.docs) {
            const usuarioData = doc.data();
            const passwordValido = validarPassword(password, usuarioData.salt, usuarioData.password);

            if (passwordValido) {
                user.usuario = usuarioData.usuario;

                if (usuarioData.tipoUsuario === "usuario") {
                    req.session.usuario = user.usuario;
                    user.tipo = "usuario";
                } else if (usuarioData.tipoUsuario === "admin") {
                    req.session.admin = user;
                    user.tipo = "admin";
                }

                break; // Salir del bucle si se encuentra un usuario válido
            }
        }
    }

    return user;
}

// Función para verificar si hay una sesión de usuario activa
function getSessionUsuario(req) {
    return !!req.session.usuario;
}

// Función para verificar si hay una sesión de administrador activa
function getSessionAdmin(req) {
    return !!req.session.admin;
}

module.exports = {
    mostrarUsuarios,
    nuevoUsuario,
    borrarUsuarios,
    buscarPorId,
    modificarUsuario,
    login,
    getSessionUsuario,
    getSessionAdmin,
};