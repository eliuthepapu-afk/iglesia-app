import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Bell, Send } from 'lucide-react';

export default function Avisos() {
  const [avisos, setAvisos] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [permisoPush, setPermisoPush] = useState('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermisoPush(Notification.permission);
    }
    obtenerAvisos();

    const canalAvisos = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'avisos' },
        (payload) => {
          setAvisos((prev) => [payload.new, ...prev]);
          dispararNotificacionFlotante(payload.new.titulo, payload.new.mensaje);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canalAvisos);
    };
  }, []);

  const obtenerAvisos = async () => {
    try {
      const { data, error } = await supabase
        .from('avisos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAvisos(data || []);
    } catch (error) {
      console.error('Error al cargar avisos:', error.message);
    }
  };

  const solicitarPermiso = async () => {
    if (!('Notification' in window)) {
      alert('Este navegador no soporta notificaciones flotantes.');
      return;
    }
    const respuesta = await Notification.requestPermission();
    setPermisoPush(respuesta);
  };

 const dispararNotificacionFlotante = (title, body) => {
    if ('serviceWorker' in navigator && Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body: body,
          icon: '/logo.jpg',
          vibrate: [200, 100, 200],
          badge: '/logo.jpg'
        });
      });
    } else if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: body, icon: '/logo.jpg' });
    }
  };

  const enviarAviso = async (e) => {
    e.preventDefault();
    if (!titulo.trim() || !mensaje.trim()) return alert('Completa todos los campos');

    setCargando(true);
    try {
      const { error } = await supabase
        .from('avisos')
        .insert([{ titulo, mensaje }]);

      if (error) throw error;

      setTitulo('');
      setMensaje('');
      alert('¡Aviso enviado con éxito!');
    } catch (error) {
      console.error('Error al insertar aviso:', error.message);
      alert('Hubo un error al enviar el aviso');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto text-gray-800">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="text-blue-600" /> Módulo de Avisos e Información
          </h1>
          <p className="text-gray-500 text-sm">Envía anuncios importantes y alertas a la congregación</p>
        </div>

        {permisoPush !== 'granted' && (
          <button
            onClick={solicitarPermiso}
            className="bg-zinc-700 hover:bg-zinc-800 text-white font-medium text-xs py-2 px-3 rounded-lg transition shadow"
          >
            Activar Alertas Flotantes
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white p-5 shadow rounded-xl border border-gray-200 h-fit">
          <h3 className="font-bold text-gray-700 mb-4">Nuevo Anuncio</h3>
          <form onSubmit={enviarAviso} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Título del Aviso</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej. ¡Ensayo general hoy!"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Mensaje</label>
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Escribe los detalles aquí..."
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow flex items-center justify-center gap-2 transition disabled:opacity-50 text-sm"
            >
              <Send size={16} />
              {cargando ? 'Enviando...' : 'Transmitir Aviso'}
            </button>
          </form>
        </div>

        <div className="md:col-span-2 space-y-4">
          <h3 className="font-bold text-gray-700">Historial de Comunicados</h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {avisos.length === 0 ? (
              <div className="bg-white p-6 border border-gray-200 text-center text-gray-400 rounded-xl shadow-sm">
                No se han transmitido avisos todavía.
              </div>
            ) : (
              avisos.map((aviso) => (
                <div key={aviso.id} className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm hover:border-gray-300 transition">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-gray-900 text-base">{aviso.titulo}</h4>
                    <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                      {aviso.created_at ? new Date(aviso.created_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm whitespace-pre-line">{aviso.mensaje}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}