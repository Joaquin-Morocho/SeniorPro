/* ==========================================================================
   SENIOR PRO — LÓGICA DEL PANEL DEL PROFESIONAL (perfil.html)
   Usa el mismo patrón de validación mostrarError / limpiarErrores
   ========================================================================== */

// ============ FUNCIONES DE VALIDACIÓN (patrón reutilizado en todo el sitio) ============
function mostrarError(idError, idInput, mensaje) {
  const errorEl = document.getElementById(idError);
  if (!errorEl) return;
  errorEl.textContent = mensaje;
  errorEl.hidden = false;

  if (idInput) {
    const inputEl = document.getElementById(idInput);
    if (inputEl) inputEl.classList.add('form-input--error');
  }
}

function limpiarErrores(contenedor) {
  const scope = contenedor || document;
  scope.querySelectorAll('.form-error').forEach(function (el) {
    el.hidden = true;
    el.textContent = '';
  });
  scope.querySelectorAll('.form-input--error, .form-select--error, .form-textarea--error').forEach(function (el) {
    el.classList.remove('form-input--error', 'form-select--error', 'form-textarea--error');
  });
}

/* ==========================================================================
   1. NAVEGACIÓN POR PESTAÑAS DEL PANEL
   ========================================================================== */
const panelTabs = document.querySelectorAll('.panel-tab');
const tabPanels = document.querySelectorAll('.tab-panel');

panelTabs.forEach(function (tab) {
  tab.addEventListener('click', function () {
    const targetId = 'tab-' + tab.dataset.tab;

    panelTabs.forEach(function (t) {
      t.classList.remove('is-active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('is-active');
    tab.setAttribute('aria-selected', 'true');

    tabPanels.forEach(function (panel) {
      panel.hidden = panel.id !== targetId;
      panel.classList.toggle('is-active', panel.id === targetId);
    });
  });
});

/* ==========================================================================
   2. CERRAR SESIÓN (RF02) + SALUDO CON EL NOMBRE DE LA CUENTA ACTIVA
   ========================================================================== */
document.getElementById('btnCerrarSesion').addEventListener('click', function () {
  const confirmado = confirm('¿Seguro que deseas cerrar sesión?');
  if (confirmado) {
    spCerrarSesion('../inicioSesion/login.html');
  }
});

// Si hay una sesión activa (registro/login reciente), muestra los datos reales
// del usuario en el banner en vez de los datos de ejemplo ("Joaquin", etc.)
function pintarPerfilDesdeSesion() {
  const sesion = spObtenerSesion();
  if (!sesion) return;

  if (sesion.nombre) {
    document.getElementById('nombreUsuario').textContent = sesion.nombre.split(' ')[0];
  }
  if (sesion.foto) {
    document.getElementById('avatarUsuario').src = sesion.foto;
  }
  if (sesion.profesion) {
    document.getElementById('oficioUsuario').textContent = sesion.profesion;
  }
  if (sesion.distrito) {
    document.getElementById('distritoUsuario').textContent = sesion.distrito;
  }

  const habilidadesEl = document.getElementById('habilidadesUsuario');
  if (sesion.experiencia || sesion.habilidades) {
    const partes = [];
    if (sesion.experiencia) partes.push(sesion.experiencia + ' años de experiencia');
    if (sesion.habilidades) partes.push(sesion.habilidades);
    habilidadesEl.textContent = '🛠️ ' + partes.join(' · ');
    habilidadesEl.hidden = false;
  }
}

pintarPerfilDesdeSesion();

/* ==========================================================================
   3. MIS SERVICIOS — CRUD de publicaciones (RF06, RF07, RF08, RF09, RF10, RF11, RF12)
   ========================================================================== */

// Cuenta activa (para guardar/leer SUS publicaciones de forma persistente)
const sesionPerfilActivo = spObtenerSesion();
const correoProfesionalActivo = sesionPerfilActivo ? (sesionPerfilActivo.id || sesionPerfilActivo.correo || null) : null;

// Datos de ejemplo (solo se usan la primera vez que un profesional entra a su
// panel, si todavía no ha guardado publicaciones propias)
const publicacionesPorDefecto = [
  { id: 1, tipo: 'servicio', nombre: 'Restauración de muebles antiguos', descripcion: 'Restauro muebles de madera con técnicas tradicionales.', categoria: 'Carpintería', precio: 120, distrito: 'Miraflores', foto: 'https://picsum.photos/seed/restauracion-muebles/200/200', estado: 'Activo' },
  { id: 2, tipo: 'servicio', nombre: 'Fabricación de estantes a medida', descripcion: 'Diseño y fabrico estantes personalizados.', categoria: 'Carpintería', precio: 250, distrito: 'Miraflores', foto: 'https://picsum.photos/seed/estantes-medida/200/200', estado: 'Activo' },
  { id: 3, tipo: 'servicio', nombre: 'Reparación de sillas de comedor', descripcion: 'Reparación y refuerzo de estructuras de sillas.', categoria: 'Carpintería', precio: 60, distrito: 'Miraflores', foto: 'https://picsum.photos/seed/sillas-comedor/200/200', estado: 'Pausado' }
];

// Si el profesional ya guardó publicaciones antes, se recuperan tal cual las dejó.
// Si es la primera vez, arranca con los 3 ejemplos de arriba (y quedan ligados a su cuenta).
let publicaciones = (correoProfesionalActivo && spObtenerPublicacionesDe(correoProfesionalActivo))
  || publicacionesPorDefecto.map(function (p) { return Object.assign({}, p); });

let siguienteId = publicaciones.reduce(function (max, p) { return Math.max(max, p.id); }, 0) + 1;
let editandoId = null;

// Guarda el estado actual de "publicaciones" en localStorage, ligado a la cuenta activa
function guardarPublicacionesDeLaSesion() {
  if (correoProfesionalActivo) {
    spGuardarPublicaciones(correoProfesionalActivo, publicaciones);
  }
}

const formServicio = document.getElementById('formServicio');
const tipoTabs = document.querySelectorAll('.type-tab');
const grupoFoto = document.getElementById('grupoFoto');
const pubFotoInput = document.getElementById('pubFoto');
const previewFoto = document.getElementById('previewFoto');
let tipoActivo = 'servicio';
let fotoDataUrl = null;

// Alternar entre "Servicio" y "Producto"
tipoTabs.forEach(function (tab) {
  tab.addEventListener('click', function () {
    tipoActivo = tab.dataset.tipo;

    tipoTabs.forEach(function (t) {
      t.classList.remove('is-active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('is-active');
    tab.setAttribute('aria-selected', 'true');

    // La foto es siempre visible; solo es obligatoria para productos (RF10, RF11)
    document.getElementById('hintFoto').textContent = tipoActivo === 'producto'
      ? 'Obligatoria: sube una imagen clara de tu producto (JPG o PNG).'
      : 'Opcional: sube una imagen de tu trabajo para generar más confianza (JPG o PNG).';
  });
});

// Vista previa de la foto del producto
pubFotoInput.addEventListener('change', function () {
  const file = pubFotoInput.files[0];
  if (!file) {
    fotoDataUrl = null;
    previewFoto.hidden = true;
    return;
  }
  const reader = new FileReader();
  reader.onload = function (e) {
    fotoDataUrl = e.target.result;
    previewFoto.src = fotoDataUrl;
    previewFoto.hidden = false;
  };
  reader.readAsDataURL(file);
});

function renderPublicaciones() {
  const lista = document.getElementById('listaPublicaciones');
  const contador = document.getElementById('contadorPublicaciones');
  const vacio = document.getElementById('sinPublicaciones');

  lista.innerHTML = '';
  contador.textContent = publicaciones.length;
  vacio.hidden = publicaciones.length > 0;

  publicaciones.forEach(function (pub) {
    const item = document.createElement('div');
    item.className = 'publicacion-item';

    const claseBadge = pub.estado === 'Activo' ? 'badge--activo' : 'badge--pausado';
    const fotoSrc = pub.foto || 'https://placehold.co/200x200/EAF0F7/5B6B85?text=Sin+foto';

    item.innerHTML =
      '<img class="publicacion-foto" src="' + fotoSrc + '" alt="Foto de ' + escapeHtml(pub.nombre) + '">' +
      '<div class="publicacion-info">' +
        '<h3>' + escapeHtml(pub.nombre) + '</h3>' +
        '<p class="publicacion-meta">' + escapeHtml(pub.categoria) + ' · ' + escapeHtml(pub.distrito) + '</p>' +
        '<p class="publicacion-descripcion">' + escapeHtml(pub.descripcion) + '</p>' +
        '<span class="publicacion-precio">S/. ' + pub.precio + '</span>' +
      '</div>' +
      '<div class="publicacion-actions">' +
        '<span class="badge ' + claseBadge + '">' + pub.estado + '</span>' +
        '<div class="publicacion-buttons">' +
          '<button type="button" class="btn-editar" data-id="' + pub.id + '">Editar</button>' +
          '<button type="button" class="btn-eliminar" data-id="' + pub.id + '">Eliminar</button>' +
        '</div>' +
      '</div>';

    lista.appendChild(item);
  });

  // Vincular botones recién creados
  lista.querySelectorAll('.btn-editar').forEach(function (btn) {
    btn.addEventListener('click', function () { cargarParaEditar(Number(btn.dataset.id)); });
  });
  lista.querySelectorAll('.btn-eliminar').forEach(function (btn) {
    btn.addEventListener('click', function () { eliminarPublicacion(Number(btn.dataset.id)); });
  });
}

// Evita inyección de HTML al insertar texto del usuario en el DOM
function escapeHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

function cargarParaEditar(id) {
  const pub = publicaciones.find(function (p) { return p.id === id; });
  if (!pub) return;

  editandoId = id;
  document.getElementById('editandoId').value = id;
  document.getElementById('formTitulo').textContent = 'Editar publicación';
  document.getElementById('btnPublicar').textContent = 'Guardar cambios';
  document.getElementById('btnCancelarEdicion').hidden = false;

  document.getElementById('pubNombre').value = pub.nombre;
  document.getElementById('pubDescripcion').value = pub.descripcion;
  document.getElementById('pubCategoria').value = pub.categoria;
  document.getElementById('pubPrecio').value = pub.precio;
  document.getElementById('pubDistrito').value = pub.distrito;

  tipoActivo = pub.tipo;
  tipoTabs.forEach(function (t) {
    const activo = t.dataset.tipo === pub.tipo;
    t.classList.toggle('is-active', activo);
    t.setAttribute('aria-selected', String(activo));
  });
  document.getElementById('hintFoto').textContent = pub.tipo === 'producto'
    ? 'Obligatoria: sube una imagen clara de tu producto (JPG o PNG).'
    : 'Opcional: sube una imagen de tu trabajo para generar más confianza (JPG o PNG).';

  if (pub.foto) {
    fotoDataUrl = pub.foto;
    previewFoto.src = pub.foto;
    previewFoto.hidden = false;
  } else {
    fotoDataUrl = null;
    previewFoto.hidden = true;
  }

  formServicio.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function eliminarPublicacion(id) {
  const confirmado = confirm('¿Seguro que deseas eliminar esta publicación? Esta acción no se puede deshacer.');
  if (!confirmado) return;
  publicaciones = publicaciones.filter(function (p) { return p.id !== id; });
  renderPublicaciones();
  guardarPublicacionesDeLaSesion();
}

function resetFormServicio() {
  formServicio.reset();
  editandoId = null;
  fotoDataUrl = null;
  previewFoto.hidden = true;
  document.getElementById('editandoId').value = '';
  document.getElementById('formTitulo').textContent = 'Publicar nuevo servicio o producto';
  document.getElementById('btnPublicar').textContent = 'Publicar';
  document.getElementById('btnCancelarEdicion').hidden = true;

  tipoActivo = 'servicio';
  tipoTabs.forEach(function (t, i) {
    t.classList.toggle('is-active', i === 0);
    t.setAttribute('aria-selected', String(i === 0));
  });
  document.getElementById('hintFoto').textContent = 'Opcional: sube una imagen de tu trabajo para generar más confianza (JPG o PNG).';

  document.getElementById('pubCategoria').value = 'Carpintería';
  document.getElementById('pubDistrito').value = 'Miraflores';
}

document.getElementById('btnCancelarEdicion').addEventListener('click', resetFormServicio);

formServicio.addEventListener('submit', function (e) {
  e.preventDefault();
  limpiarErrores(formServicio);

  const nombre = document.getElementById('pubNombre').value.trim();
  const descripcion = document.getElementById('pubDescripcion').value.trim();
  const categoria = document.getElementById('pubCategoria').value;
  const precio = document.getElementById('pubPrecio').value;
  const distrito = document.getElementById('pubDistrito').value;
  let valido = true;

  if (nombre === '') {
    mostrarError('errorPubNombre', 'pubNombre', 'El nombre de la publicación es requerido.');
    valido = false;
  }

  if (descripcion === '') {
    mostrarError('errorPubDescripcion', 'pubDescripcion', 'La descripción es requerida.');
    valido = false;
  } else if (descripcion.length < 10) {
    mostrarError('errorPubDescripcion', 'pubDescripcion', 'La descripción debe tener al menos 10 caracteres.');
    valido = false;
  }

  if (categoria === '') {
    mostrarError('errorPubCategoria', 'pubCategoria', 'Selecciona una categoría.');
    valido = false;
  }

  if (precio === '' || Number(precio) <= 0) {
    mostrarError('errorPubPrecio', 'pubPrecio', 'Ingresa un precio válido mayor a 0.');
    valido = false;
  }

  if (distrito === '') {
    mostrarError('errorPubDistrito', 'pubDistrito', 'Selecciona un distrito.');
    valido = false;
  }

  // La foto es obligatoria únicamente cuando se publica un producto (RF10, RF11)
  if (tipoActivo === 'producto' && !fotoDataUrl) {
    mostrarError('errorPubFoto', 'pubFoto', 'Sube una fotografía del producto.');
    valido = false;
  }

  if (!valido) return;

  if (editandoId) {
    const pub = publicaciones.find(function (p) { return p.id === editandoId; });
    pub.tipo = tipoActivo;
    pub.nombre = nombre;
    pub.descripcion = descripcion;
    pub.categoria = categoria;
    pub.precio = Number(precio);
    pub.distrito = distrito;
    pub.foto = fotoDataUrl;
  } else {
    publicaciones.unshift({
      id: siguienteId++,
      tipo: tipoActivo,
      nombre: nombre,
      descripcion: descripcion,
      categoria: categoria,
      precio: Number(precio),
      distrito: distrito,
      foto: fotoDataUrl,
      estado: 'Activo'
    });
  }

  renderPublicaciones();
  guardarPublicacionesDeLaSesion();
  resetFormServicio();
});

renderPublicaciones();

/* ==========================================================================
   4. CALENDARIO DE DISPONIBILIDAD (RF14, RF15, RF16)
   ========================================================================== */
let fechaActual = new Date();

function claveDia(anio, mes, dia) {
  return anio + '-' + mes + '-' + dia;
}

// Genera datos de ejemplo (solo se usan la primera vez, si la cuenta nunca
// guardó un calendario propio en localStorage)
function generarCalendarioDemo() {
  const anio = fechaActual.getFullYear();
  const mes = fechaActual.getMonth();
  const diasDisponibles = [2, 3, 5, 8, 9, 12, 15, 16, 19];
  const diasBloqueados = [7, 14, 21];
  const demo = {};

  diasDisponibles.forEach(function (dia) {
    demo[claveDia(anio, mes, dia)] = 'disponible';
  });
  diasBloqueados.forEach(function (dia) {
    demo[claveDia(anio, mes, dia)] = 'bloqueado';
  });
  return demo;
}

// clave: "YYYY-M-D" → 'disponible' | 'bloqueado'
// Se recupera de localStorage (misma cuenta / mismo navegador); si la cuenta
// nunca guardó nada todavía, se usa el calendario de ejemplo.
let estadosDias = (correoProfesionalActivo && spObtenerDisponibilidadDe(correoProfesionalActivo))
  || generarCalendarioDemo();

// Guarda el estado actual de "estadosDias" en localStorage, ligado a la cuenta activa (RF14/RF15)
function guardarDisponibilidadDeLaSesion() {
  if (correoProfesionalActivo) {
    spGuardarDisponibilidad(correoProfesionalActivo, estadosDias);
  }
}

function renderCalendario() {
  const anio = fechaActual.getFullYear();
  const mes = fechaActual.getMonth();

  const nombreMes = fechaActual.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
  document.getElementById('mesActualLabel').textContent = nombreMes;

  // La semana empieza en Lunes: convertimos getDay() (0=Dom) a formato Lun=0...Dom=6
  const diaSemanaJS = new Date(anio, mes, 1).getDay();
  const primerDiaSemana = (diaSemanaJS + 6) % 7;
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();

  const grid = document.getElementById('calendarGrid');
  grid.innerHTML = '';

  // Celdas vacías antes del día 1
  for (let i = 0; i < primerDiaSemana; i++) {
    const vacio = document.createElement('div');
    vacio.className = 'calendar-day calendar-day--empty';
    grid.appendChild(vacio);
  }

  for (let dia = 1; dia <= diasEnMes; dia++) {
    const celda = document.createElement('button');
    celda.type = 'button';
    celda.className = 'calendar-day';
    celda.textContent = dia;

    const clave = claveDia(anio, mes, dia);
    const estado = estadosDias[clave];
    if (estado) {
      celda.classList.add('calendar-day--' + estado);
    }

    // Ciclo: sin marcar → Disponible (1 clic) → Bloqueado (2 clics) → sin marcar / libre (3 clics)
    celda.addEventListener('click', function () {
      const actual = estadosDias[clave];
      let siguiente;
      if (!actual) {
        siguiente = 'disponible';
      } else if (actual === 'disponible') {
        siguiente = 'bloqueado';
      } else {
        siguiente = null; // vuelve a "libre" (sin marcar)
      }

      if (siguiente) {
        estadosDias[clave] = siguiente;
      } else {
        delete estadosDias[clave];
      }
      guardarDisponibilidadDeLaSesion();
      renderCalendario();
    });

    grid.appendChild(celda);
  }
}

document.getElementById('mesAnterior').addEventListener('click', function () {
  fechaActual.setMonth(fechaActual.getMonth() - 1);
  renderCalendario();
});

document.getElementById('mesSiguiente').addEventListener('click', function () {
  fechaActual.setMonth(fechaActual.getMonth() + 1);
  renderCalendario();
});

renderCalendario();

/* ==========================================================================
   5. SOLICITUDES (RF13)
   ========================================================================== */
// Datos de ejemplo (solo se usan la primera vez que un profesional entra a su
// panel, si todavía no ha recibido solicitudes reales)
const pedidosPorDefecto = [
  { id: 1, cliente: 'Lucía Fernández', correo: 'lucia.fernandez@example.com', telefono: '+51 987 654 321', servicio: 'Restauración de muebles antiguos', fecha: '02/07/2026', estado: 'Pendiente' },
  { id: 2, cliente: 'Jorge Ramírez', correo: 'jorge.ramirez@example.com', telefono: '+51 976 543 210', servicio: 'Fabricación de estantes a medida', fecha: '28/06/2026', estado: 'Aceptado' },
  { id: 3, cliente: 'María López', correo: 'maria.lopez@example.com', telefono: '+51 965 432 109', servicio: 'Reparación de sillas de comedor', fecha: '15/06/2026', estado: 'Completado' }
];

// Si el profesional ya tiene solicitudes guardadas (propias o recibidas de
// clientes reales vía buscar_talento.html / buscar_productos.html), se muestran esas.
// Si es la primera vez, arranca con los 3 ejemplos de arriba.
let pedidos = (correoProfesionalActivo && spObtenerSolicitudesDe(correoProfesionalActivo))
  || pedidosPorDefecto.map(function (p) { return Object.assign({}, p); });

// Guarda el estado actual de "pedidos" en localStorage, ligado a la cuenta activa
function guardarSolicitudesDeLaSesion() {
  if (correoProfesionalActivo) {
    spGuardarSolicitudes(correoProfesionalActivo, pedidos);
  }
}

const badgeClasePorEstado = {
  'Pendiente': 'badge--pendiente-pedido',
  'Aceptado': 'badge--aceptado',
  'Completado': 'badge--completado',
  'Cancelado': 'badge--cancelado'
};

function renderPedidos() {
  const lista = document.getElementById('listaPedidos');
  lista.innerHTML = '';

  pedidos.forEach(function (pedido) {
    const item = document.createElement('div');
    item.className = 'pedido-item';

    let botones = '';
    if (pedido.estado === 'Pendiente') {
      botones =
        '<button type="button" class="btn-pedido btn-pedido--aceptar" data-id="' + pedido.id + '" data-accion="Aceptado">Aceptar</button>' +
        '<button type="button" class="btn-pedido btn-pedido--rechazar" data-id="' + pedido.id + '" data-accion="Cancelado">Rechazar</button>';
    } else if (pedido.estado === 'Aceptado') {
      botones = '<button type="button" class="btn-pedido btn-pedido--completar" data-id="' + pedido.id + '" data-accion="Completado">Marcar completado</button>';
    }

    item.innerHTML =
      '<div class="pedido-info">' +
        '<h3>' + escapeHtml(pedido.cliente) + '</h3>' +
        '<p class="pedido-meta">' + escapeHtml(pedido.servicio) + ' · ' + pedido.fecha + '</p>' +
        '<p class="pedido-contacto">' +
          '<span class="pedido-contacto-item">✉️ ' + escapeHtml(pedido.correo) + '</span>' +
          '<span class="pedido-contacto-item">📞 ' + escapeHtml(pedido.telefono) + '</span>' +
        '</p>' +
      '</div>' +
      '<div class="pedido-actions">' +
        '<span class="badge ' + badgeClasePorEstado[pedido.estado] + '">' + pedido.estado + '</span>' +
        '<div class="pedido-buttons">' + botones + '</div>' +
      '</div>';

    lista.appendChild(item);
  });

  lista.querySelectorAll('.btn-pedido').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const id = Number(btn.dataset.id);
      const nuevoEstado = btn.dataset.accion;
      const pedido = pedidos.find(function (p) { return p.id === id; });
      if (pedido) {
        pedido.estado = nuevoEstado;
        renderPedidos();
        guardarSolicitudesDeLaSesion();
      }
    });
  });
}

renderPedidos();

/* ==========================================================================
   6. VERIFICACIÓN DE IDENTIDAD (RF04)
   ========================================================================== */
// En esta demo la cuenta empieza como "Aprobada" (verificacionAprobada visible).
// El formulario de subida de documentos (verificacionPendiente) queda listo
// por si en el futuro se conecta a una revisión real desde el backend.
const formVerificacion = document.getElementById('formVerificacion');

formVerificacion.addEventListener('submit', function (e) {
  e.preventDefault();
  limpiarErrores(formVerificacion);

  const frontal = document.getElementById('docFrontal').files[0];
  const posterior = document.getElementById('docPosterior').files[0];
  let valido = true;

  if (!frontal) {
    mostrarError('errorDocFrontal', 'docFrontal', 'Sube el lado frontal de tu documento.');
    valido = false;
  }

  if (!posterior) {
    mostrarError('errorDocPosterior', 'docPosterior', 'Sube el lado posterior de tu documento.');
    valido = false;
  }

  if (!valido) return;

  // Simula la aprobación inmediata y cambia a la vista de "Cuenta Verificada"
  document.getElementById('verificacionPendiente').hidden = true;
  document.getElementById('verificacionAprobada').hidden = false;
  mostrarModalExito('Documentos enviados y verificados correctamente.');
});

/* ==========================================================================
   MODAL: ACCIÓN EXITOSA (reutilizable en toda la página de perfil)
   ========================================================================== */
const modalExito = document.getElementById('modalExito');
const btnCerrarExito = document.getElementById('btnCerrarExito');

function mostrarModalExito(mensaje) {
  document.getElementById('modalExitoDescripcion').textContent = mensaje;
  modalExito.hidden = false;
}

function cerrarModalExito() {
  modalExito.hidden = true;
}

btnCerrarExito.addEventListener('click', cerrarModalExito);

// Cierra el modal si se hace clic fuera de la caja (en el fondo oscuro)
modalExito.addEventListener('click', function (e) {
  if (e.target === modalExito) cerrarModalExito();
});

// Cierra el modal con la tecla Escape
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modalExito.hidden) cerrarModalExito();
});

/* ==========================================================================
   7. CONTACTO DE EMERGENCIA (RF05) — vista de solo lectura + edición en tiempo real
   ========================================================================== */
const emergenciaVista = document.getElementById('emergenciaVista');
const formEmergencia = document.getElementById('formEmergencia');
const btnActualizarContacto = document.getElementById('btnActualizarContacto');
const btnCancelarEmergencia = document.getElementById('btnCancelarEmergencia');

// Abre el formulario de edición, precargado con los datos que se ven actualmente
btnActualizarContacto.addEventListener('click', function () {
  document.getElementById('emergenciaNombre').value = document.getElementById('verNombre').textContent;
  document.getElementById('emergenciaRelacion').value = document.getElementById('verRelacion').textContent;
  document.getElementById('emergenciaTelefono').value = document.getElementById('verTelefono').textContent;
  document.getElementById('emergenciaCorreo').value = document.getElementById('verCorreo').textContent;

  emergenciaVista.hidden = true;
  formEmergencia.hidden = false;
  document.getElementById('emergenciaNombre').focus();
});

// Cancela la edición sin guardar cambios y vuelve a mostrar la vista anterior
btnCancelarEmergencia.addEventListener('click', function () {
  limpiarErrores(formEmergencia);
  formEmergencia.hidden = true;
  emergenciaVista.hidden = false;
});

formEmergencia.addEventListener('submit', function (e) {
  e.preventDefault();
  limpiarErrores(formEmergencia);

  const nombre = document.getElementById('emergenciaNombre').value.trim();
  const relacion = document.getElementById('emergenciaRelacion').value;
  const telefono = document.getElementById('emergenciaTelefono').value.trim();
  const correo = document.getElementById('emergenciaCorreo').value.trim();
  let valido = true;

  if (nombre === '') {
    mostrarError('errorEmergenciaNombre', 'emergenciaNombre', 'El nombre del contacto es requerido.');
    valido = false;
  }

  if (relacion === '') {
    mostrarError('errorEmergenciaRelacion', 'emergenciaRelacion', 'Selecciona una opción.');
    valido = false;
  }

  if (telefono === '') {
    mostrarError('errorEmergenciaTelefono', 'emergenciaTelefono', 'El teléfono es requerido.');
    valido = false;
  } else if (!/^[\d\s+]{9,}$/.test(telefono)) {
    mostrarError('errorEmergenciaTelefono', 'emergenciaTelefono', 'Ingresa un teléfono válido (mínimo 9 dígitos).');
    valido = false;
  }

  if (correo === '') {
    mostrarError('errorEmergenciaCorreo', 'emergenciaCorreo', 'El correo es requerido.');
    valido = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    mostrarError('errorEmergenciaCorreo', 'emergenciaCorreo', 'Ingresa un correo electrónico válido.');
    valido = false;
  }

  if (!valido) return;

  // Actualiza la vista en tiempo real, sin recargar la página
  document.getElementById('verNombre').textContent = nombre;
  document.getElementById('verRelacion').textContent = relacion;
  document.getElementById('verTelefono').textContent = telefono;
  document.getElementById('verCorreo').textContent = correo;

  formEmergencia.hidden = true;
  emergenciaVista.hidden = false;
});
/* ==========================================================================
   8. EDITAR PERFIL (RF03) — nombre, correo, profesión, foto, habilidades y experiencia
   ========================================================================== */
const modalEditarPerfil = document.getElementById('modalEditarPerfil');
const formEditarPerfil = document.getElementById('formEditarPerfil');
const btnEditarPerfil = document.getElementById('btnEditarPerfil');
const btnCancelarEditarPerfil = document.getElementById('btnCancelarEditarPerfil');
const editarFotoInput = document.getElementById('editarFoto');
const previewAvatarPerfil = document.getElementById('previewAvatarPerfil');
let fotoPerfilDataUrl = null;

function abrirModalEditarPerfil() {
  const sesion = spObtenerSesion() || {};

  limpiarErrores(formEditarPerfil);
  document.getElementById('editarNombre').value = sesion.nombre || '';
  document.getElementById('editarCorreo').value = sesion.correo || '';
  document.getElementById('editarTelefono').value = sesion.telefono || '';
  document.getElementById('editarProfesion').value = sesion.profesion || '';
  document.getElementById('editarDistrito').value = sesion.distrito || '';
  document.getElementById('editarDireccion').value = sesion.direccion || '';
  document.getElementById('editarFormacion').value = sesion.formacion || '';
  document.getElementById('editarResumen').value = sesion.resumen || '';
  document.getElementById('editarHabilidades').value = sesion.habilidades || '';
  document.getElementById('editarExperiencia').value = sesion.experiencia || '';

  fotoPerfilDataUrl = sesion.foto || document.getElementById('avatarUsuario').src;
  previewAvatarPerfil.src = fotoPerfilDataUrl;
  editarFotoInput.value = '';

  modalEditarPerfil.hidden = false;
  document.getElementById('editarNombre').focus();
}

function cerrarModalEditarPerfil() {
  modalEditarPerfil.hidden = true;
}

btnEditarPerfil.addEventListener('click', abrirModalEditarPerfil);
btnCancelarEditarPerfil.addEventListener('click', cerrarModalEditarPerfil);

// Cierra el modal si se hace clic fuera de la caja (en el fondo oscuro)
modalEditarPerfil.addEventListener('click', function (e) {
  if (e.target === modalEditarPerfil) cerrarModalEditarPerfil();
});

// Cierra el modal con la tecla Escape
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modalEditarPerfil.hidden) cerrarModalEditarPerfil();
});

// Vista previa inmediata al elegir una nueva foto de perfil
editarFotoInput.addEventListener('change', function () {
  const file = editarFotoInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    fotoPerfilDataUrl = e.target.result;
    previewAvatarPerfil.src = fotoPerfilDataUrl;
  };
  reader.readAsDataURL(file);
});

formEditarPerfil.addEventListener('submit', function (e) {
  e.preventDefault();
  limpiarErrores(formEditarPerfil);

  const nombre = document.getElementById('editarNombre').value.trim();
  const correo = document.getElementById('editarCorreo').value.trim();
  const telefono = document.getElementById('editarTelefono').value.trim();
  const profesion = document.getElementById('editarProfesion').value.trim();
  const distrito = document.getElementById('editarDistrito').value;
  const direccion = document.getElementById('editarDireccion').value.trim();
  const formacion = document.getElementById('editarFormacion').value.trim();
  const resumen = document.getElementById('editarResumen').value.trim();
  const habilidades = document.getElementById('editarHabilidades').value.trim();
  const experiencia = document.getElementById('editarExperiencia').value;
  let valido = true;

  if (nombre === '') {
    mostrarError('errorEditarNombre', 'editarNombre', 'El nombre completo es requerido.');
    valido = false;
  }

  if (correo === '') {
    mostrarError('errorEditarCorreo', 'editarCorreo', 'El correo electrónico es requerido.');
    valido = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    mostrarError('errorEditarCorreo', 'editarCorreo', 'Ingresa un correo electrónico válido.');
    valido = false;
  }

  if (telefono === '') {
    mostrarError('errorEditarTelefono', 'editarTelefono', 'El teléfono es requerido.');
    valido = false;
  } else if (!/^\d{9,}$/.test(telefono)) {
    mostrarError('errorEditarTelefono', 'editarTelefono', 'Ingresa un teléfono válido (mínimo 9 dígitos).');
    valido = false;
  }

  if (profesion === '') {
    mostrarError('errorEditarProfesion', 'editarProfesion', 'La profesión u oficio es requerido.');
    valido = false;
  }

  if (distrito === '') {
    mostrarError('errorEditarDistrito', 'editarDistrito', 'Selecciona un distrito.');
    valido = false;
  }

  if (experiencia !== '' && (Number(experiencia) < 0 || Number(experiencia) > 80)) {
    mostrarError('errorEditarExperiencia', 'editarExperiencia', 'Ingresa un número de años válido (0 a 80).');
    valido = false;
  }

  if (!valido) return;

  // Guarda los cambios en la sesión (localStorage) — ver js/sesion.js
  spActualizarSesion({
    nombre: nombre,
    correo: correo,
    telefono: telefono,
    profesion: profesion,
    distrito: distrito,
    direccion: direccion,
    formacion: formacion,
    resumen: resumen,
    habilidades: habilidades,
    experiencia: experiencia,
    foto: fotoPerfilDataUrl
  });

  // Actualiza el banner en tiempo real, sin recargar la página
  pintarPerfilDesdeSesion();

  cerrarModalEditarPerfil();
  mostrarModalExito('Tu perfil se actualizó correctamente.');
});