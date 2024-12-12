"use client"; // Esto indica que el componente debe renderizarse en el lado del cliente

export default function Cargando() {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            backgroundColor: "rgb(255, 255, 255)" // Fondo oscuro para combinar con el resto de la app
        }}>
            <div style={{
                width: "100px",
                height: "100px",
                border: "15px solid #444", // Color gris oscuro para el borde del spinner
                borderTop: "15px solid rgb(0, 255, 162)", // Morado para el borde superior
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                marginBottom: "20px"
            }}></div>

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}