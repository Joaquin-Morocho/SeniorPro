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
   2. CERRAR SESIÓN (RF02)
   ========================================================================== */
document.getElementById('btnCerrarSesion').addEventListener('click', function () {
  const confirmado = confirm('¿Seguro que deseas cerrar sesión?');
  if (confirmado) {
    window.location.href = '../inicioSesion/login.html';
  }
});

/* ==========================================================================
   3. MIS SERVICIOS — CRUD de publicaciones (RF06, RF07, RF08, RF09, RF10, RF11, RF12)
   ========================================================================== */

// Datos iniciales de ejemplo (en memoria; se pierden al recargar la página,
// ya que esta demo no está conectada a una base de datos real)
let publicaciones = [
  { id: 1, tipo: 'servicio', nombre: 'Restauración de muebles antiguos', descripcion: 'Restauro muebles de madera con técnicas tradicionales.', categoria: 'Carpintería', precio: 120, distrito: 'Miraflores', foto: 'https://picsum.photos/seed/restauracion-muebles/200/200', estado: 'Activo' },
  { id: 2, tipo: 'servicio', nombre: 'Fabricación de estantes a medida', descripcion: 'Diseño y fabrico estantes personalizados.', categoria: 'Carpintería', precio: 250, distrito: 'Miraflores', foto: 'https://picsum.photos/seed/estantes-medida/200/200', estado: 'Activo' },
  { id: 3, tipo: 'servicio', nombre: 'Reparación de sillas de comedor', descripcion: 'Reparación y refuerzo de estructuras de sillas.', categoria: 'Carpintería', precio: 60, distrito: 'Miraflores', foto: 'https://picsum.photos/seed/sillas-comedor/200/200', estado: 'Pausado' }
];
let siguienteId = 4;
let editandoId = null;

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
    publicaciones.push({
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
  resetFormServicio();
});

renderPublicaciones();

/* ==========================================================================
   4. CALENDARIO DE DISPONIBILIDAD (RF14, RF15, RF16)
   ========================================================================== */
let fechaActual = new Date();
let estadosDias = {}; // clave: "YYYY-M-D" → 'disponible' | 'bloqueado'

function claveDia(anio, mes, dia) {
  return anio + '-' + mes + '-' + dia;
}

// Datos de ejemplo precargados para que el calendario no se vea vacío al entrar
(function precargarCalendarioDemo() {
  const anio = fechaActual.getFullYear();
  const mes = fechaActual.getMonth();
  const diasDisponibles = [2, 3, 5, 8, 9, 12, 15, 16, 19];
  const diasBloqueados = [7, 14, 21];

  diasDisponibles.forEach(function (dia) {
    estadosDias[claveDia(anio, mes, dia)] = 'disponible';
  });
  diasBloqueados.forEach(function (dia) {
    estadosDias[claveDia(anio, mes, dia)] = 'bloqueado';
  });
})();

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
   5. PEDIDOS Y MENSAJES (RF13)
   ========================================================================== */
let pedidos = [
  { id: 1, cliente: 'Lucía Fernández', servicio: 'Restauración de muebles antiguos', fecha: '02/07/2026', estado: 'Pendiente' },
  { id: 2, cliente: 'Jorge Ramírez', servicio: 'Fabricación de estantes a medida', fecha: '28/06/2026', estado: 'Aceptado' },
  { id: 3, cliente: 'María López', servicio: 'Reparación de sillas de comedor', fecha: '15/06/2026', estado: 'Completado' }
];

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
  alert('Documentos enviados y verificados correctamente.');
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