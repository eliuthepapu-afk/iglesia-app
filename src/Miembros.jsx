import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; 

export default function Miembros() {
  const [miembros, setMiembros] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cargando, setCargando] = useState(false);

  // Estado para el formulario de nuevo miembro
  const [nuevoMiembro, setNuevoMiembro] = useState({
    nombre: '',
    telefono: '',
    email: '',
    fecha_nacimiento: '',
    estado: 'Activo'
  });

  // Cargar miembros de Supabase
  const obtenerMiembros = async () => {
    try {
      const { data, error } = await supabase
        .from('miembros')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;
      setMiembros(data || []);
    } catch (error) {
      console.error('Error al obtener miembros:', error.message);
    }
  };

  useEffect(() => {
    obtenerMiembros();
  }, []);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    setNuevoMiembro({
      ...nuevoMiembro,
      [e.target.name]: e.target.value
    });
  };

  // Guardar nuevo miembro en Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nuevoMiembro.nombre.trim()) return alert('El nombre es obligatorio');

    setCargando(true);
    try {
      const { error } = await supabase
        .from('miembros')
        .insert([nuevoMiembro]);

      if (error) throw error;

      setNuevoMiembro({
        nombre: '',
        telefono: '',
        email: '',
        fecha_nacimiento: '',
        estado: 'Activo'
      });
      setMostrarModal(false);
      obtenerMiembros();
      alert('¡Miembro registrado con éxito!');
    } catch (error) {
      console.error('Error al guardar miembro:', error.message);
      alert('Hubo un error al guardar el miembro');
    } finally {
      setCargando(false);
    }
  };

  const miembrosFiltrados = miembros.filter(miembro =>
    miembro.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto text-gray-800">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between justify-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Módulo de Miembros</h1>
          <p className="text-gray-500 text-sm">Gestiona la base de datos de la congregación</p>
        </div>
        <button
          onClick={() => setMostrarModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow transition duration-200"
        >
          + Agregar Miembro
        </button>
      </div>

      {/* Barra de Búsqueda */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar miembro por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tabla de Miembros */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Nombre</th>
                <th className="px-6 py-3">Teléfono</th>
                <th className="px-6 py-3">Correo Electrónico</th>
                <th className="px-6 py-3">Fecha Nacimiento</th>
                <th className="px-6 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {miembrosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-400">
                    No se encontraron miembros registrados.
                  </td>
                </tr>
              ) : (
                miembrosFiltrados.map((miembro) => (
                  <tr key={miembro.id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 font-medium text-gray-900">{miembro.nombre}</td>
                    <td className="px-6 py-4 text-gray-500">{miembro.telefono || '-'}</td>
                    <td className="px-6 py-4 text-gray-500">{miembro.email || '-'}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {miembro.fecha_nacimiento ? new Date(miembro.fecha_nacimiento).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        miembro.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {miembro.estado}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL / FORMULARIO FLOTANTE */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold">Registrar Nuevo Miembro</h3>
              <button 
                onClick={() => setMostrarModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  name="nombre"
                  required
                  value={nuevoMiembro.nombre}
                  onChange={handleChange}
                  placeholder="Ej. Juan Pérez"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Teléfono</label>
                <input
                  type="text"
                  name="telefono"
                  value={nuevoMiembro.telefono}
                  onChange={handleChange}
                  placeholder="Ej. 3001234567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  name="email"
                  value={nuevoMiembro.email}
                  onChange={handleChange}
                  placeholder="ejemplo@correo.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Fecha de Nacimiento</label>
                <input
                  type="date"
                  name="fecha_nacimiento"
                  value={nuevoMiembro.fecha_nacimiento}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Estado</label>
                <select
                  name="estado"
                  value={nuevoMiembro.estado}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cargando}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow disabled:opacity-50"
                >
                  {cargando ? 'Guardando...' : 'Guardar Miembro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}