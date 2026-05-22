import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { X, Plus, Trash2 } from "lucide-react";
import { supabase } from "./supabaseClient";

const eventosIniciales = [
  { id: "1", title: "Reunión General", date: "2026-05-25", color: "#2563eb", tipo: "Culto", roles: [{ tarea: "Sonido", persona: "Eliuth Alcalá" }, { tarea: "Alabanza", persona: "María Romero" }, { tarea: "Aseo", persona: "Juan Pérez" }] },
  { id: "2", title: "Ensayo Alabanza", date: "2026-05-24", color: "#a855f7", tipo: "Ministerio", roles: [{ tarea: "Sonido", persona: "Carlos López" }] },
  { id: "3", title: "Consejería", date: "2026-05-23", color: "#22c55e", tipo: "Pastoral", roles: [] },
  { id: "4", title: "Reunión de Jóvenes", date: "2026-05-21", color: "#f59e0b", tipo: "Jóvenes", roles: [{ tarea: "Aseo", persona: "Laura Castro" }, { tarea: "Recepción", persona: "Ana Gil" }] },
];

const rolColors = {
  Sonido: "bg-blue-100 text-blue-700",
  Alabanza: "bg-purple-100 text-purple-700",
  Aseo: "bg-amber-100 text-amber-700",
  Recepción: "bg-green-100 text-green-700",
};

const getRolColor = (tarea) => rolColors[tarea] || "bg-gray-100 text-gray-700";

export default function Calendario({ oscuro }) {
  const d = oscuro;
  const [eventos, setEventos] = useState(eventosIniciales);
  const [filtroTipo, setFiltroTipo] = useState(null);
  const [modal, setModal] = useState(false);
  const [detalleModal, setDetalleModal] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [eventoDetalle, setEventoDetalle] = useState(null);
  const [form, setForm] = useState({ title: "", date: "", tipo: "", color: "#2563eb", roles: [] });
  const [nuevoRol, setNuevoRol] = useState({ tarea: "", persona: "" });

  const abrirNuevo = (fecha = "") => {
    setEventoSeleccionado(null);
    setForm({ title: "", date: fecha, tipo: "", color: "#2563eb", roles: [] });
    setNuevoRol({ tarea: "", persona: "" });
    setModal(true);
  };

  const abrirEditar = (id) => {
    const ev = eventos.find(e => e.id === id);
    if (!ev) return;
    setEventoSeleccionado(ev.id);
    setForm({ title: ev.title, date: ev.date, tipo: ev.tipo, color: ev.color, roles: [...ev.roles] });
    setNuevoRol({ tarea: "", persona: "" });
    setModal(true);
  };

  const abrirDetalle = (info) => {
    const ev = eventos.find(e => e.id === info.event.id);
    if (ev) { setEventoDetalle(ev); setDetalleModal(true); }
  };

  const agregarRol = () => {
    if (!nuevoRol.tarea || !nuevoRol.persona) return;
    setForm({ ...form, roles: [...form.roles, { ...nuevoRol }] });
    setNuevoRol({ tarea: "", persona: "" });
  };

  const quitarRol = (i) => {
    setForm({ ...form, roles: form.roles.filter((_, idx) => idx !== i) });
  };

  const enviarAvisosAutomaticos = async (eventoForm) => {
    if (!eventoForm.roles || eventoForm.roles.length === 0) return;

    const registrosAvisos = eventoForm.roles.map((r) => ({
      titulo: `Nueva Asignación: ${eventoForm.title}`,
      mensaje: `Has sido asignado para la tarea de "${r.tarea}" el día ${eventoForm.date}. Por favor confirma tu asistencia.`,
      usuario_asignado: r.persona,
      estado: "pendiente"
    }));

    try {
      const { error } = await supabase.from("avisos").insert(registrosAvisos);
      if (error) throw error;
    } catch (error) {
      console.error("Error al generar avisos automáticos:", error.message);
    }
  };

  const guardar = async () => {
    if (!form.title || !form.date) return;
    if (eventoSeleccionado) {
      setEventos(eventos.map(e => e.id === eventoSeleccionado ? { ...e, ...form } : e));
    } else {
      setEventos([...eventos, { id: Date.now().toString(), ...form }]);
    }
    
    await enviarAvisosAutomaticos(form);
    setModal(false);
  };

  const eliminar = () => {
    setEventos(eventos.filter(e => e.id !== eventoSeleccionado));
    setModal(false);
  };

  const manejarFiltro = (tipo) => {
    if (filtroTipo === tipo) {
      setFiltroTipo(null);
    } else {
      setFiltroTipo(tipo);
    }
  };

  const eventosFiltrados = eventos.filter(e => {
    if (!filtroTipo) return true;
    return e.tipo.toLowerCase() === filtroTipo.toLowerCase();
  });

  const input = `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 ${d ? "bg-zinc-700 border-zinc-600 text-white placeholder-zinc-500" : "bg-gray-50 border-gray-300 text-gray-900"}`;
  const card = `border rounded-xl ${d ? "bg-zinc-800 border-zinc-700" : "bg-white border-gray-200 shadow-sm"}`;
  const label = `text-sm mb-1 block ${d ? "text-zinc-400" : "text-gray-500"}`;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-xl font-bold ${d ? "text-white" : "text-gray-800"}`}>Calendario</h2>
          <p className={`text-sm ${d ? "text-zinc-400" : "text-gray-400"}`}>Gestiona los eventos y turnos de servicio</p>
        </div>
        <button onClick={() => abrirNuevo()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          <Plus size={16} /> Nuevo evento
        </button>
      </div>

      <div className={`${card} p-4 mb-4`}>
        <div className="flex justify-between items-center mb-2">
          <p className={`text-xs font-semibold ${d ? "text-zinc-400" : "text-gray-500"}`}>FILTRAR POR TIPO DE EVENTO</p>
          {filtroTipo && (
            <button onClick={() => setFiltroTipo(null)} className="text-xs text-blue-500 hover:underline cursor-pointer">
              Mostrar todos
            </button>
          )}
        </div>
        <div className="flex gap-4 flex-wrap">
          {[{ label: "Culto", color: "#2563eb" }, { label: "Ministerio", color: "#a855f7" }, { label: "Pastoral", color: "#22c55e" }, { label: "Jóvenes", color: "#f59e0b" }].map(c => {
            const estaActivo = filtroTipo === c.label;
            const ningunoSeleccionado = filtroTipo === null;

            return (
              <button
                key={c.label}
                onClick={() => manejarFiltro(c.label)}
                className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border cursor-pointer transition-all duration-200 ${
                  estaActivo 
                    ? (d ? "bg-zinc-700 border-zinc-500 scale-105 shadow-sm" : "bg-gray-100 border-gray-400 scale-105 shadow-inner") 
                    : (ningunoSeleccionado 
                        ? (d ? "bg-transparent border-transparent hover:bg-zinc-700/50" : "bg-transparent border-transparent hover:bg-gray-100")
                        : "opacity-40 hover:opacity-70 border-transparent")
                }`}
              >
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                <span className={`font-medium ${estaActivo ? (d ? "text-white" : "text-gray-900") : (d ? "text-zinc-300" : "text-gray-600")}`}>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={`${card} p-4`}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="es"
          buttonText={{ today: "Hoy" }}
          events={eventosFiltrados.map(e => ({ id: e.id, title: e.title, date: e.date, backgroundColor: e.color, borderColor: e.color }))}
          dateClick={(info) => abrirNuevo(info.dateStr)}
          eventClick={abrirDetalle}
          headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
          height="auto"
        />
      </div>

      {detalleModal && eventoDetalle && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className={`border rounded-2xl p-6 w-full max-w-md mx-4 ${d ? "bg-zinc-800 border-zinc-700" : "bg-white border-gray-200"}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`font-semibold text-lg ${d ? "text-white" : "text-gray-800"}`}>{eventoDetalle.title}</h3>
                <p className={`text-xs ${d ? "text-zinc-400" : "text-gray-400"}`}>{eventoDetalle.date} · {eventoDetalle.tipo}</p>
              </div>
              <button onClick={() => setDetalleModal(false)} className={d ? "text-zinc-400 hover:text-white" : "text-gray-400 hover:text-gray-700"}>
                <X size={20} />
              </button>
            </div>

            <div className={`rounded-lg p-3 mb-4 ${d ? "bg-zinc-700" : "bg-gray-50"}`}>
              <p className={`text-xs font-semibold mb-2 ${d ? "text-zinc-400" : "text-gray-500"}`}>TURNOS ASIGNADOS</p>
              {eventoDetalle.roles.length === 0 ? (
                <p className={`text-sm ${d ? "text-zinc-500" : "text-gray-400"}`}>Sin turnos asignados</p>
              ) : (
                <div className="space-y-2">
                  {eventoDetalle.roles.map((r, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${d ? "bg-zinc-600 text-white" : "bg-blue-100 text-blue-700"}`}>
                          {r.persona.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className={`text-sm ${d ? "text-white" : "text-gray-800"}`}>{r.persona}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${d ? "bg-zinc-600 text-zinc-200" : getRolColor(r.tarea)}`}>{r.tarea}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setDetalleModal(false); abrirEditar(eventoDetalle.id); }}
                className={`flex-1 border text-sm font-medium py-2 rounded-lg transition ${d ? "border-zinc-600 text-zinc-300 hover:bg-zinc-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                Editar evento
              </button>
              <button onClick={() => setDetalleModal(false)} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 rounded-lg transition">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className={`border rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto ${d ? "bg-zinc-800 border-zinc-700" : "bg-white border-gray-200"}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-semibold text-lg ${d ? "text-white" : "text-gray-800"}`}>
                {eventoSeleccionado ? "Editar evento" : "Nuevo evento"}
              </h3>
              <button onClick={() => setModal(false)} className={d ? "text-zinc-400 hover:text-white" : "text-gray-400 hover:text-gray-700"}>
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={label}>Nombre del evento</label>
                <input className={input} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ej: Reunión de oración" />
              </div>
              <div>
                <label className={label}>Tipo de evento</label>
                <input className={input} value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} placeholder="Ej: Culto, Ministerio, Jóvenes..." />
              </div>
              <div>
                <label className={label}>Fecha</label>
                <input type="date" className={input} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div>
                <label className={label}>Color del evento</label>
                <div className="flex items-center gap-3">
                  <input type="color" className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer bg-transparent" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
                  <span className={`text-sm ${d ? "text-zinc-300" : "text-gray-600"}`}>{form.color}</span>
                </div>
              </div>

              <div>
                <label className={label}>Turnos de servicio</label>
                {form.roles.length > 0 && (
                  <div className={`rounded-lg p-3 mb-3 space-y-2 ${d ? "bg-zinc-700" : "bg-gray-50"}`}>
                    {form.roles.map((r, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${d ? "bg-zinc-600 text-zinc-200" : getRolColor(r.tarea)}`}>{r.tarea}</span>
                          <span className={`text-sm ${d ? "text-white" : "text-gray-800"}`}>{r.persona}</span>
                        </div>
                        <button type="button" onClick={() => quitarRol(i)} className="text-red-400 hover:text-red-500">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input className={`${input} flex-1`} value={nuevoRol.tarea} onChange={e => setNuevoRol({ ...nuevoRol, tarea: e.target.value })} placeholder="Tarea (Aseo, Sonido...)" />
                  <input className={`${input} flex-1`} value={nuevoRol.persona} onChange={e => setNuevoRol({ ...nuevoRol, persona: e.target.value })} placeholder="Nombre" />
                  <button type="button" onClick={agregarRol} className="bg-blue-600 hover:bg-blue-500 text-white px-3 rounded-lg transition cursor-pointer">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              {eventoSeleccionado && (
                <button type="button" onClick={eliminar} className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium py-2 rounded-lg transition">
                  Eliminar
                </button>
              )}
              <button type="button" onClick={guardar} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 rounded-lg transition">
                {eventoSeleccionado ? "Guardar cambios" : "Crear evento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}