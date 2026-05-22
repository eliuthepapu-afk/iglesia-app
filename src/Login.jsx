import { useState } from "react";

const CUENTAS_REGISTRADAS = [
  {
    correo: "eliuth@admin.com",
    clave: "78750292",
    nombre: "Eliuth Alcalá",
    rol: "admin"
  },
  {
    correo: "yocabed@admin.com",
    clave: "1234567",
    nombre: "Yocabed Piñeiro",
    rol: "admin"
  },
  {
    correo: "laura@iglesia.com",
    clave: "aseo2026",
    nombre: "Laura Castro",
    rol: "servidor"
  }
];

export default function Login({ alEntrar, oscuro }) {
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState(false);

  const manejarFormulario = (e) => {
    e.preventDefault();
    const usuarioEncontrado = CUENTAS_REGISTRADAS.find(
      (cuenta) => cuenta.correo.toLowerCase() === correo.toLowerCase() && cuenta.clave === clave
    );

    if (usuarioEncontrado) {
      setError(false);
      alEntrar({ nombre: usuarioEncontrado.nombre, rol: usuarioEncontrado.rol });
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-cover bg-center relative" 
         style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2073&auto=format&fit=crop")' }}>
      <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-sm"></div>
      <div className={`relative z-10 w-full max-w-sm p-8 rounded-3xl shadow-2xl ${oscuro ? "bg-zinc-900 text-white" : "bg-white text-gray-800"}`}>
        <div className="text-center mb-6">
          <img src="/logo.jpg" alt="Logo" className="w-20 h-20 rounded-full object-cover border-2 border-blue-500 shadow mx-auto mb-3" />
          <h1 className="text-xl font-bold">Acceso al Panel</h1>
          <p className="text-xs text-zinc-400">Congregación Árbol de Vida</p>
        </div>
        <form onSubmit={manejarFormulario} className="space-y-4">
          <div>
            <input type="email" placeholder="Correo electrónico" value={correo} onChange={e => setCorreo(e.target.value)} className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none ${oscuro ? "bg-zinc-800 border-zinc-700 text-white" : "bg-gray-50 border-gray-200"}`} required />
          </div>
          <div>
            <input type="password" placeholder="Contraseña" value={clave} onChange={e => setClave(e.target.value)} className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none ${oscuro ? "bg-zinc-800 border-zinc-700 text-white" : "bg-gray-50 border-gray-200"}`} required />
          </div>
          {error && <p className="text-xs text-red-500 font-medium text-center">Correo o contraseña incorrectos</p>}
          <button type="submit" className="w-full bg-blue-700 hover:bg-blue-600 text-white font-bold py-3 rounded-xl text-sm shadow-lg transition-all active:scale-95 cursor-pointer">INGRESAR</button>
        </form>
      </div>
    </div>
  );
}