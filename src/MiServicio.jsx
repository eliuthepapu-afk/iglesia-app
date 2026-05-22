import { useState, useRef, useEffect } from "react";
import { Clock, Check, X, Camera, Calendar } from "lucide-react";
import { supabase } from "./supabaseClient";

export default function MiServicio({ oscuro, usuario, eventosGlobales, setListaEventos }) {
  const d = oscuro;
  
  const [fotoPerfil, setFotoPerfil] = useState("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1780&auto=format&fit=crop");
  const [misAvisosTareas, setMisAvisosTareas] = useState([]);
  const archivoInputRef = useRef(null);

 const obtenerMisAsignaciones = async () => {
    try {
      console.log("Usuario actual:", usuario.nombre);
      const { data, error } = await supabase
        .from("avisos")
        .select("*")
        .eq("usuario_asignado", usuario.nombre)
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log("Datos encontrados:", data);
      setMisAvisosTareas(data || []);
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  useEffect(() => {
    obtenerMisAsignaciones();

    const canalMonitoreo = supabase
      .channel("cambios-servicio-avisos")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "avisos" },
        () => {
          obtenerMisAsignaciones();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canalMonitoreo);
    };
  }, [usuario.nombre]);

  const manejarCambioFoto = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      const urlImagen = URL.createObjectURL(archivo);
      setFotoPerfil(urlImagen);
    }
  };

  const responderTarea = async (avisoId, nuevoEstado) => {
    try {
      const { error } = await supabase
        .from("avisos")
        .update({ estado: nuevoEstado })
        .eq("id", avisoId);

      if (error) throw error;
      
      setMisAvisosTareas(prev =>
        prev.map(item => item.id === avisoId ? { ...item, estado: nuevoEstado } : item)
      );
    } catch (error) {
      console.error("Error al responder la asignación:", error.message);
      alert("No se pudo actualizar el estado de la asignación");
    }
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* SECCIÓN DE PERFIL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className={`rounded-3xl p-8 text-center flex flex-col items-center ${d ? "bg-zinc-800 text-white" : "bg-white shadow-sm border text-gray-900"}`}>
          
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
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white" size={24} />
            </div>
          </div>

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
        <div className={`lg:col-span-2 rounded-3xl p-8 flex flex-col justify-between ${d ? "bg-zinc-800 text-white" : "bg-white shadow-sm border text-gray-900"}`}>
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

      {/* LISTA DE TAREAS ASIGNADAS EN TIEMPO REAL */}
      <div className={`rounded-3xl p-8 ${d ? "bg-zinc-800 text-white" : "bg-white shadow-sm border text-gray-900"}`}>
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="text-blue-500" size={20} />
          <h3 className="font-bold">Asignaciones del Pastor</h3>
        </div>

        {misAvisosTareas.length === 0 ? (
          <p className="text-sm text-zinc-400 italic">No tienes tareas asignadas por ahora.</p>
        ) : (
          <div className="grid gap-4">
            {misAvisosTareas.map((t) => (
              <div key={t.id} className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${d ? "bg-zinc-900/50 border-zinc-700" : "bg-gray-50 border-gray-200"}`}>
                <div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">Asignación</span>
                  <h4 className="text-lg font-bold mt-2">{t.titulo}</h4>
                  <p className={`text-sm my-1 ${d ? "text-zinc-300" : "text-gray-600"}`}>{t.mensaje}</p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {t.estado === "pendiente" ? (
                    <>
                      <button onClick={() => responderTarea(t.id, "Confirmado")} className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all"><Check size={16}/> Confirmar</button>
                      <button onClick={() => responderTarea(t.id, "No puedo")} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all"><X size={16}/> No puedo</button>
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