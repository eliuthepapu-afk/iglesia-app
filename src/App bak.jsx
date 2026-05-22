import { useState } from "react";
import Calendario from "./Calendario";
import { Users, Calendar, Heart, Bell, BarChart2, Home, Menu, X, Moon, Sun } from "lucide-react";

const stats = [
  { label: "Miembros activos", value: "124", icon: Users, color: "bg-blue-600" },
  { label: "Eventos este mes", value: "8", icon: Calendar, color: "bg-blue-500" },
  { label: "Peticiones nuevas", value: "13", icon: Heart, color: "bg-blue-700" },
  { label: "Avisos enviados", value: "5", icon: Bell, color: "bg-blue-400" },
];

const eventos = [
  { nombre: "Reunión General", fecha: "Domingo 25 May · 10:00 AM", tipo: "Culto" },
  { nombre: "Ensayo Alabanza", fecha: "Sábado 24 May · 4:00 PM", tipo: "Ministerio" },
  { nombre: "Consejería", fecha: "Viernes 23 May · 6:00 PM", tipo: "Pastoral" },
  { nombre: "Reunión de Jóvenes", fecha: "Miércoles 21 May · 7:00 PM", tipo: "Jóvenes" },
];

const asistencia = [180, 210, 195, 230, 175, 220, 240, 205, 190, 215, 235, 250];
const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

export default function App() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [pagina, setPagina] = useState("dashboard");
  const [oscuro, setOscuro] = useState(false);
  const d = oscuro;

  return (
    <div className={`min-h-screen flex ${d ? "bg-zinc-900 text-white" : "bg-gray-100 text-gray-900"}`}>

      {/* Sidebar */}
      <aside className={`fixed z-20 top-0 left-0 h-full w-64 flex flex-col transition-transform duration-300
        ${menuAbierto ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static
        ${d ? "bg-zinc-800 border-r border-zinc-700" : "bg-white border-r border-gray-200"}`}>

        <div className={`p-6 border-b flex flex-col items-center gap-3 ${d ? "border-zinc-700" : "border-gray-200"}`}>
          <img src="/logo.jpg" alt="Logo" className="w-20 h-20 rounded-full object-cover border-2 border-blue-500 shadow" />
          <div className="text-center">
            <h1 className={`text-sm font-bold leading-tight ${d ? "text-white" : "text-blue-800"}`}>Congregación Árbol de Vida</h1>
            <p className={`text-xs mt-0.5 ${d ? "text-zinc-400" : "text-blue-400"}`}>Panel de administración</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { icon: Home, label: "Dashboard", id: "dashboard" },
            { icon: Calendar, label: "Calendario", id: "calendario" },
            { icon: Users, label: "Miembros", id: "miembros" },
            { icon: Heart, label: "Peticiones", id: "peticiones" },
            { icon: Bell, label: "Avisos", id: "avisos" },
            { icon: BarChart2, label: "Asistencia", id: "asistencia" },
          ].map(({ icon: Icon, label, id }) => (
            <button key={id} onClick={() => { setPagina(id); setMenuAbierto(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition text-sm font-medium
                ${pagina === id
                  ? d ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700"
                  : d ? "text-zinc-300 hover:bg-zinc-700 hover:text-white" : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                }`}>
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        <div className={`p-4 border-t ${d ? "border-zinc-700" : "border-gray-200"}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm text-white">EA</div>
            <div>
              <p className={`text-sm font-medium ${d ? "text-white" : "text-gray-800"}`}>Eliuth Alcalá</p>
              <p className={`text-xs ${d ? "text-zinc-400" : "text-gray-400"}`}>Administrador</p>
            </div>
          </div>
        </div>
      </aside>

      {menuAbierto && <div className="fixed inset-0 bg-black/50 z-10 md:hidden" onClick={() => setMenuAbierto(false)} />}

      <main className="flex-1 flex flex-col min-h-screen">

        {/* Header */}
        <header className={`border-b px-6 py-4 flex items-center justify-between
          ${d ? "bg-zinc-800 border-zinc-700" : "bg-white border-gray-200 shadow-sm"}`}>
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setMenuAbierto(!menuAbierto)}>
              {menuAbierto ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div>
              <h2 className={`text-lg font-semibold ${d ? "text-white" : "text-gray-800"}`}>
                {pagina.charAt(0).toUpperCase() + pagina.slice(1)}
              </h2>
              <p className={`text-xs ${d ? "text-zinc-400" : "text-gray-400"}`}>Miércoles, 20 de mayo de 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setOscuro(!oscuro)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition
                ${d ? "border-zinc-600 text-zinc-300 hover:bg-zinc-700" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}>
              {d ? <Sun size={14} /> : <Moon size={14} />}
              {d ? "Modo claro" : "Modo oscuro"}
            </button>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${d ? "bg-blue-600/30 text-blue-300" : "bg-blue-100 text-blue-700"}`}>
              Estado: Activo
            </span>
          </div>
        </header>

        {pagina === "calendario" ? (
          <Calendario oscuro={oscuro} />
        ) : (
          <div className="p-6 space-y-6">

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map(({ label, value, icon: Icon, color }) => (
                <div key={label} className={`border rounded-xl p-4 flex items-center gap-4
                  ${d ? "bg-zinc-800 border-zinc-700" : "bg-white border-gray-200 shadow-sm"}`}>
                  <div className={`${color} p-3 rounded-lg`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className={`text-xs ${d ? "text-zinc-400" : "text-gray-400"}`}>{label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <div className={`border rounded-xl p-5 ${d ? "bg-zinc-800 border-zinc-700" : "bg-white border-gray-200 shadow-sm"}`}>
                <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${d ? "text-zinc-200" : "text-gray-700"}`}>
                  <Calendar size={16} className="text-blue-500" /> Próximos eventos
                </h3>
                <div className="space-y-3">
                  {eventos.map((e) => (
                    <div key={e.nombre} className={`flex items-center justify-between py-2 border-b last:border-0 ${d ? "border-zinc-700" : "border-gray-100"}`}>
                      <div>
                        <p className="text-sm font-medium">{e.nombre}</p>
                        <p className={`text-xs ${d ? "text-zinc-400" : "text-gray-400"}`}>{e.fecha}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${d ? "bg-zinc-700 text-zinc-200" : "bg-blue-100 text-blue-700"}`}>{e.tipo}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`border rounded-xl p-5 ${d ? "bg-zinc-800 border-zinc-700" : "bg-white border-gray-200 shadow-sm"}`}>
                <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${d ? "text-zinc-200" : "text-gray-700"}`}>
                  <BarChart2 size={16} className="text-blue-500" /> Asistencia 2026
                </h3>
                <div className="flex items-end gap-1.5 h-36 px-1">
                  {asistencia.map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-blue-500 rounded-t opacity-80 hover:opacity-100 transition"
                        style={{ height: `${(val / 250) * 144}px` }}
                        title={`${meses[i]}: ${val}`}
                      />
                      <span className={`text-[9px] ${d ? "text-zinc-500" : "text-gray-400"}`}>{meses[i]}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}