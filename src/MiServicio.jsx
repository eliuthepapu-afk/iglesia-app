import { useState, useRef } from "react";
import { Clock, Check, X, Camera, Calendar } from "lucide-react";

export default function MiServicio({ oscuro, usuario, eventosGlobales, setListaEventos }) {
  const d = oscuro;
  
  // Estado para la foto de perfil (guarda la imagen seleccionada)
  const [fotoPerfil, setFotoPerfil] = useState("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1780&auto=format&fit=crop");
  
  // Referencia para activar el selector de archivos oculto
  const archivoInputRef = useRef(null);

  // Función para manejar el cambio de imagen
  const manejarCambioFoto = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      const urlImagen = URL.createObjectURL(archivo);
      setFotoPerfil(urlImagen); // Reemplaza la foto vieja por la tuya
    }
  };

  // Función para confirmar o rechazar una tarea asignada
  const responderTarea = (eventoId, nuevoEstado) => {
    const nuevosEventos = eventosGlobales.map(ev => {
      if (ev.id === eventoId) {
        return {
          ...ev,
          roles: ev.roles.map(r => r.persona === usuario.nombre ? { ...r, estado: nuevoEstado } : r)
        };
      }
      return ev;
    });
    setListaEventos(nuevosEventos);
  };

  // Buscamos qué tareas tiene asignadas el usuario actual
  const misTareas = [];
  eventosGlobales.forEach(ev => {
    ev.roles?.forEach(r => {
      if (r.persona === usuario.nombre) {
        misTareas.push({ eventoId: ev.id, titulo: ev.title, fecha: ev.date, tarea: r.tarea, estado: r.estado || "Pendiente" });
      }
    });
  });

  return (
    <div className="p-6 space-y-6">
      
      {/* SECCIÓN DE PERFIL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className={`rounded-3xl p-8 text-center flex flex-col items-center ${d ? "bg-zinc-800" : "bg-white shadow-sm border"}`}>
          
          {/* Contenedor de la foto con click para cambiarla */}
          <div 
            onClick={() => archivoInputRef.current.click()} 
            className="relative group cursor-pointer mb-4"
            title="Haz clic para cambiar tu foto"
          >
            <div className="w-32 h-32 rounded-full border-4 border-blue-500 p-1 overflow-hidden">
              <img 
                src={fotoPerfil} 
                alt="Perfil" 
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            {/* Efecto hover que muestra la cámara */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white" size={24} />
            </div>
          </div>

          {/* Input de archivo oculto */}
          <input 
            type="file" 
            ref={archivoInputRef} 
            onChange={manejarCambioFoto} 
            accept="image/*" 
            className="hidden" 
          />
          
          <h3 className="text-2xl font-bold">{usuario.nombre}</h3>
          <p className="text-blue-500 font-bold text-sm tracking-widest uppercase mt-1">Líder de Ministerio</p>
          
          <div className="flex justify-between w-full mt-8 border-t border-zinc-700/30 pt-6">
            <div className="text-center flex-1">
              <p className="text-xl font-bold">24</p>
              <p className="text-[10px] text-zinc-400 uppercase font-bold">Servicios</p>
            </div>
            <div className="w-px bg-zinc-700/30 h-10"></div>
            <div className="text-center flex-1">
              <p className="text-xl font-bold">98%</p>
              <p className="text-[10px] text-zinc-400 uppercase font-bold">Asistencia</p>
            </div>
          </div>
        </div>

        {/* CONTROL DE JORNADA / TIEMPO */}
        <div className={`lg:col-span-2 rounded-3xl p-8 flex flex-col justify-between ${d ? "bg-zinc-800" : "bg-white shadow-sm border"}`}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">Mi Tiempo de Servicio</h2>
              <p className="text-xs text-zinc-400 uppercase font-medium mt-1">Jueves, 21 de Mayo de 2026</p>
            </div>
            <Clock className="text-blue-500" size={32} />
          </div>

          <div className="mt-8">
            <button className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-4 text-xl shadow-xl shadow-green-900/20 transition-all active:scale-95 cursor-pointer">
              INICIAR SERVICIO
            </button>
          </div>
        </div>
      </div>

      {/* LISTA DE TAREAS ASIGNADAS */}
      <div className={`rounded-3xl p-8 ${d ? "bg-zinc-800" : "bg-white shadow-sm border"}`}>
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="text-blue-500" size={20} />
          <h3 className="font-bold">Asignaciones del Pastor</h3>
        </div>

        {misTareas.length === 0 ? (
          <p className="text-sm text-zinc-400 italic">No tienes tareas asignadas por ahora.</p>
        ) : (
          <div className="grid gap-4">
            {misTareas.map((t, idx) => (
              <div key={idx} className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${d ? "bg-zinc-900/50 border-zinc-700" : "bg-gray-50 border-gray-200"}`}>
                <div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">{t.tarea}</span>
                  <h4 className="text-lg font-bold mt-2">{t.titulo}</h4>
                  <p className="text-xs text-zinc-500 font-medium">{t.fecha}</p>
                </div>

                <div className="flex items-center gap-3">
                  {t.estado === "Pendiente" ? (
                    <>
                      <button onClick={() => responderTarea(t.eventoId, "Confirmado")} className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all"><Check size={16}/> Confirmar</button>
                      <button onClick={() => responderTarea(t.eventoId, "No puedo")} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all"><X size={16}/> No puedo</button>
                    </>
                  ) : (
                    <span className={`text-xs font-bold px-4 py-2 rounded-xl border ${t.estado === "Confirmado" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>
                      {t.estado === "Confirmado" ? "✓ Tarea Aceptada" : "✕ Declinado"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}