/* ==========================================================================
   SENIOR PRO — LÓGICA DE BUSCAR TALENTO (CU05: Buscar servicios)
   ========================================================================== */

// ============ FUNCIONES DE VALIDACIÓN (mismo patrón usado en todo el sitio) ============
function mostrarError(idError, idInput, mensaje) {
  const errorEl = document.getElementById(idError);
  errorEl.textContent = mensaje;
  errorEl.hidden = false;
  if (idInput) {
    document.getElementById(idInput).classList.add('form-input--error');
  }
}

function limpiarErrores(contenedor) {
  const scope = contenedor || document;
  scope.querySelectorAll('.form-error').forEach(function (el) {
    el.hidden = true;
    el.textContent = '';
  });
  scope.querySelectorAll('.form-input--error').forEach(function (el) {
    el.classList.remove('form-input--error');
  });
}

let profesionalSeleccionado = null;

// Datos de ejemplo (en memoria; en producción vendrían de la base de datos
// a través de una API, filtrados por categoría/distrito/disponibilidad)
// Fotos verificadas de personas mayores de 50 años (banco de imágenes libres Pexels).
// Como el banco de fotos "senior" disponible es limitado, algunas se reutilizan
// en categorías distintas; en producción cada profesional subiría su propia foto real.
const FOTO = {
  m1: 'https://images.pexels.com/photos/11556142/pexels-photo-11556142.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  m2: 'https://images.pexels.com/photos/343123/pexels-photo-343123.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  m3: 'https://images.pexels.com/photos/36263265/pexels-photo-36263265.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  m4: 'https://images.pexels.com/photos/30037305/pexels-photo-30037305.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  w1: 'https://images.pexels.com/photos/9532096/pexels-photo-9532096.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  w2: 'https://images.pexels.com/photos/12644996/pexels-photo-12644996.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  w3: 'https://images.pexels.com/photos/5971247/pexels-photo-5971247.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  w4: 'https://images.pexels.com/photos/17043022/pexels-photo-17043022.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  w5: 'https://images.pexels.com/photos/5498753/pexels-photo-5498753.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  w6: 'https://images.pexels.com/photos/16895309/pexels-photo-16895309.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  w7: 'https://images.pexels.com/photos/19960169/pexels-photo-19960169.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  w8: 'https://images.pexels.com/photos/17059080/pexels-photo-17059080.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  w9: 'https://images.pexels.com/photos/16923258/pexels-photo-16923258.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
  w10: 'https://images.pexels.com/photos/15147417/pexels-photo-15147417.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'
};

const profesionales = [
  { nombre: 'Roberto M.', oficio: 'Carpintero Maestro', categoria: 'Carpintería', distrito: 'Miraflores', distancia: 0.6, rating: 4.9, resenas: 142, precio: 45, disponibleHoy: true, verificado: true, avatar: FOTO.m1, descripcion: 'Restauro y fabrico muebles de madera a medida con técnicas tradicionales.', experiencia: 15 },
  { nombre: 'Manuel Q.', oficio: 'Carpintero Ebanista', categoria: 'Carpintería', distrito: 'Surco', distancia: 3.0, rating: 4.5, resenas: 40, precio: 48, disponibleHoy: true, verificado: true, avatar: FOTO.m2, descripcion: 'Especialista en ebanistería fina y restauración de piezas antiguas.', experiencia: 12 },
  { nombre: 'Teodoro V.', oficio: 'Carpintero Restaurador', categoria: 'Carpintería', distrito: 'Barranco', distancia: 1.8, rating: 4.8, resenas: 65, precio: 50, disponibleHoy: false, verificado: true, avatar: FOTO.m3, descripcion: 'Restauración de muebles coloniales y piezas de valor histórico.', experiencia: 20 },
  { nombre: 'Rosario P.', oficio: 'Carpintera y Diseñadora de Muebles', categoria: 'Carpintería', distrito: 'San Isidro', distancia: 2.2, rating: 4.7, resenas: 38, precio: 52, disponibleHoy: true, verificado: true, avatar: FOTO.w4, descripcion: 'Diseño y fabrico muebles funcionales a medida para espacios pequeños.', experiencia: 10 },

  { nombre: 'María L.', oficio: 'Profesora de Matemáticas', categoria: 'Tutorías', distrito: 'San Isidro', distancia: 0.8, rating: 4.8, resenas: 98, precio: 40, disponibleHoy: true, verificado: true, avatar: FOTO.w1, descripcion: 'Clases particulares de matemáticas para escolares y preparación pre-universitaria.', experiencia: 22 },
  { nombre: 'Elena F.', oficio: 'Tutora de Física y Química', categoria: 'Tutorías', distrito: 'Miraflores', distancia: 1.1, rating: 4.9, resenas: 85, precio: 42, disponibleHoy: true, verificado: true, avatar: FOTO.w2, descripcion: 'Refuerzo escolar en ciencias para secundaria, con material propio.', experiencia: 16 },
  { nombre: 'Gladys N.', oficio: 'Tutora de Comunicación y Lectura', categoria: 'Tutorías', distrito: 'La Molina', distancia: 2.4, rating: 4.7, resenas: 54, precio: 35, disponibleHoy: false, verificado: true, avatar: FOTO.w6, descripcion: 'Apoyo en comprensión lectora y redacción para primaria y secundaria.', experiencia: 14 },
  { nombre: 'Alberto R.', oficio: 'Tutor de Historia y Geografía', categoria: 'Tutorías', distrito: 'San Borja', distancia: 1.6, rating: 4.6, resenas: 47, precio: 38, disponibleHoy: true, verificado: true, avatar: FOTO.m4, descripcion: 'Preparación para exámenes de admisión en ciencias sociales.', experiencia: 18 },

  { nombre: 'Carlos R.', oficio: 'Electricista Certificado', categoria: 'Electricidad', distrito: 'Surco', distancia: 1.4, rating: 4.7, resenas: 76, precio: 50, disponibleHoy: false, verificado: true, avatar: FOTO.m1, descripcion: 'Instalaciones eléctricas residenciales y comerciales, con certificación vigente.', experiencia: 18 },
  { nombre: 'Ana T.', oficio: 'Electricista Residencial', categoria: 'Electricidad', distrito: 'San Borja', distancia: 0.9, rating: 4.9, resenas: 61, precio: 46, disponibleHoy: true, verificado: true, avatar: FOTO.w7, descripcion: 'Instalación y mantenimiento eléctrico para hogares, con enfoque en seguridad.', experiencia: 13 },
  { nombre: 'Walter C.', oficio: 'Electricista Industrial', categoria: 'Electricidad', distrito: 'La Molina', distancia: 3.2, rating: 4.8, resenas: 90, precio: 60, disponibleHoy: true, verificado: true, avatar: FOTO.m2, descripcion: 'Mantenimiento eléctrico industrial y de maquinaria pesada.', experiencia: 25 },

  { nombre: 'Ana P.', oficio: 'Mentora de Negocios', categoria: 'Mentorías', distrito: 'San Borja', distancia: 0.9, rating: 5.0, resenas: 54, precio: 80, disponibleHoy: true, verificado: true, avatar: FOTO.w3, descripcion: 'Asesoría estratégica para pequeños negocios y emprendedores en crecimiento.', experiencia: 25 },
  { nombre: 'Guillermo S.', oficio: 'Mentor de Finanzas Personales', categoria: 'Mentorías', distrito: 'San Isidro', distancia: 1.3, rating: 4.9, resenas: 71, precio: 75, disponibleHoy: false, verificado: true, avatar: FOTO.m3, descripcion: 'Asesoría en ahorro, jubilación e inversión para personas naturales.', experiencia: 30 },
  { nombre: 'Isabel R.', oficio: 'Mentora de Emprendimiento', categoria: 'Mentorías', distrito: 'Miraflores', distancia: 0.5, rating: 4.8, resenas: 44, precio: 70, disponibleHoy: true, verificado: true, avatar: FOTO.w1, descripcion: 'Acompañamiento a mujeres emprendedoras en la formalización de su negocio.', experiencia: 20 },

  { nombre: 'Jorge V.', oficio: 'Mecánico Automotriz', categoria: 'Mecánica', distrito: 'La Molina', distancia: 2.1, rating: 4.6, resenas: 63, precio: 55, disponibleHoy: true, verificado: true, avatar: FOTO.m4, descripcion: 'Mantenimiento preventivo y reparación de motores para todo tipo de vehículos.', experiencia: 20 },
  { nombre: 'Susana E.', oficio: 'Mecánica Automotriz', categoria: 'Mecánica', distrito: 'Surco', distancia: 2.8, rating: 4.7, resenas: 33, precio: 50, disponibleHoy: true, verificado: true, avatar: FOTO.w5, descripcion: 'Diagnóstico y reparación de sistemas eléctricos y de frenos vehiculares.', experiencia: 12 },
  { nombre: 'Ricardo H.', oficio: 'Mecánico de Motos', categoria: 'Mecánica', distrito: 'Barranco', distancia: 1.9, rating: 4.5, resenas: 58, precio: 40, disponibleHoy: false, verificado: true, avatar: FOTO.m1, descripcion: 'Reparación y mantenimiento de motos lineales y scooters.', experiencia: 17 },

  { nombre: 'Rosa T.', oficio: 'Modista', categoria: 'Costura', distrito: 'Barranco', distancia: 1.7, rating: 4.9, resenas: 110, precio: 35, disponibleHoy: false, verificado: true, avatar: FOTO.w8, descripcion: 'Confección y arreglo de prendas a medida, especialista en trajes y vestidos.', experiencia: 30 },
  { nombre: 'Carmen D.', oficio: 'Costurera y Diseñadora', categoria: 'Costura', distrito: 'Miraflores', distancia: 1.2, rating: 4.8, resenas: 72, precio: 32, disponibleHoy: true, verificado: true, avatar: FOTO.w9, descripcion: 'Diseño y confección de ropa a medida, especialista en tallas grandes.', experiencia: 22 },
  { nombre: 'Julia E.', oficio: 'Bordadora y Modista', categoria: 'Costura', distrito: 'San Isidro', distancia: 2.0, rating: 5.0, resenas: 29, precio: 38, disponibleHoy: true, verificado: true, avatar: FOTO.w10, descripcion: 'Bordado a mano y arreglos de vestidos de novia y fiesta.', experiencia: 28 }
];

// Agrega los servicios publicados por profesionales registrados en este
// navegador (panel "Mis Servicios" en perfil.html), para que también
// aparezcan como resultados de búsqueda de talento (RF06-RF12)
if (typeof spObtenerPublicacionesDeTodosLosProfesionales === 'function') {
  spObtenerPublicacionesDeTodosLosProfesionales('servicio').forEach(function (pub) {
    profesionales.push({
      nombre: pub.duenoNombre,
      oficio: pub.nombre,
      categoria: pub.categoria,
      distrito: pub.distrito,
      distancia: 0.5,
      rating: 5.0,
      resenas: 0,
      precio: pub.precio,
      // RF16: se consulta el calendario real que el profesional configuró en su
      // panel (perfil.html), en vez de mostrar siempre "disponible" a la fuerza.
      disponibleHoy: (typeof spEstaDisponibleHoy === 'function') ? spEstaDisponibleHoy(pub.duenoId) : true,
      verificado: false,
      // La foto de perfil del profesional (si la subió) tiene prioridad sobre
      // la foto de la publicación como avatar de la persona.
      avatar: pub.duenoFoto || pub.foto || 'https://placehold.co/300x300/EAF0F7/5B6B85?text=Sin+foto',
      descripcion: pub.descripcion,
      experiencia: pub.duenoExperiencia || 0,
      // Datos completos del perfil del profesional (RF03), usados en "Ver perfil"
      resumen: pub.duenoResumen || pub.descripcion,
      formacion: pub.duenoFormacion || '',
      habilidades: pub.duenoHabilidades || '',
      direccion: pub.duenoDireccion || '',
      duenoId: pub.duenoId,
      duenoCorreo: pub.duenoCorreo,
      duenoTelefono: pub.duenoTelefono
    });
  });
}

const inputBusqueda = document.getElementById('inputBusqueda');
const filtroCategoria = document.getElementById('filtroCategoria');
const filtroDistrito = document.getElementById('filtroDistrito');
const filtroCerca = document.getElementById('filtroCerca');
const filtroDisponibleHoy = document.getElementById('filtroDisponibleHoy');

const gridProfesionales = document.getElementById('gridProfesionales');
const sinResultados = document.getElementById('sinResultados');
const contadorResultados = document.getElementById('contadorResultados');

// Evita inyección de HTML al insertar texto dinámico en el DOM
function escapeHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

function generarEstrellas(rating) {
  const llenas = Math.round(rating);
  return '★★★★★'.slice(0, llenas) + '☆☆☆☆☆'.slice(0, 5 - llenas);
}

function renderProfesionales(lista) {
  gridProfesionales.innerHTML = '';
  contadorResultados.textContent = lista.length;

  const hayResultados = lista.length > 0;
  gridProfesionales.hidden = !hayResultados;
  sinResultados.hidden = hayResultados;

  lista.forEach(function (pro) {
    const card = document.createElement('article');
    card.className = 'profesional-card';

    const tagDisponible = pro.disponibleHoy
      ? '<span class="tag tag--disponible">🟢 Disponible hoy</span>'
      : '';

    const badgeVerificado = pro.verificado
      ? '<span class="badge-verificado">✓ Verificado</span>'
      : '';

    card.innerHTML =
      '<div class="profesional-header">' +
        '<div class="profesional-persona">' +
          '<img class="profesional-avatar" src="' + pro.avatar + '" alt="Foto de ' + escapeHtml(pro.nombre) + '">' +
          '<div>' +
            '<h3 class="profesional-nombre">' + escapeHtml(pro.nombre) + '</h3>' +
            '<p class="profesional-oficio">' + escapeHtml(pro.oficio) + '</p>' +
            '<div class="profesional-rating">' +
              '<span class="rating-estrellas">' + generarEstrellas(pro.rating) + '</span>' +
              '<span class="rating-valor">' + pro.rating.toFixed(1) + '</span>' +
              '<span class="rating-count">(' + pro.resenas + ')</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="profesional-header-right">' +
          badgeVerificado +
          '<button type="button" class="btn-ver-perfil">Ver perfil</button>' +
        '</div>' +
      '</div>' +
      '<p class="profesional-descripcion">' + escapeHtml(pro.descripcion) + '</p>' +
      '<div class="profesional-tags">' +
        '<span class="tag tag--ubicacion">📍 ' + escapeHtml(pro.distrito) + ' · ' + pro.distancia + ' km</span>' +
        '<span class="tag tag--experiencia">' + escapeHtml(pro.categoria) + ' · ' + pro.experiencia + ' años de experiencia</span>' +
        tagDisponible +
      '</div>' +
      '<div class="profesional-footer">' +
        '<span class="profesional-precio">S/. ' + pro.precio + ' <span>/hora</span></span>' +
        '<button type="button" class="btn-contratar">Contratar</button>' +
      '</div>';

    gridProfesionales.appendChild(card);
  });

  // Al hacer clic en "Contratar" se abre el modal con el formulario de contacto
  gridProfesionales.querySelectorAll('.btn-contratar').forEach(function (btn, index) {
    btn.addEventListener('click', function () {
      abrirModalContratar(lista[index]);
    });
  });

  // Al hacer clic en "Ver perfil" se abre el modal con los datos completos del profesional
  gridProfesionales.querySelectorAll('.btn-ver-perfil').forEach(function (btn, index) {
    btn.addEventListener('click', function () {
      abrirModalVerPerfil(lista[index]);
    });
  });
}

function renderChipsFiltros() {
  const contenedor = document.getElementById('chipsFiltros');
  contenedor.innerHTML = '';

  const chips = [];

  if (inputBusqueda.value.trim() !== '') {
    chips.push({ texto: '"' + inputBusqueda.value.trim() + '"', accion: function () { inputBusqueda.value = ''; } });
  }
  if (filtroCategoria.value !== '') {
    chips.push({ texto: filtroCategoria.value, accion: function () { filtroCategoria.value = ''; } });
  }
  if (filtroDistrito.value !== '') {
    chips.push({ texto: filtroDistrito.value, accion: function () { filtroDistrito.value = ''; } });
  }
  if (filtroCerca.checked) {
    chips.push({ texto: 'A menos de 1 km', accion: function () { filtroCerca.checked = false; } });
  }
  if (filtroDisponibleHoy.checked) {
    chips.push({ texto: 'Disponible hoy', accion: function () { filtroDisponibleHoy.checked = false; } });
  }

  chips.forEach(function (chip) {
    const el = document.createElement('span');
    el.className = 'chip-filtro';
    el.innerHTML = escapeHtml(chip.texto) + ' <button type="button" aria-label="Quitar filtro">✕</button>';
    el.querySelector('button').addEventListener('click', function () {
      chip.accion();
      aplicarFiltros();
    });
    contenedor.appendChild(el);
  });
}

function aplicarFiltros() {
  const palabraClave = inputBusqueda.value.trim().toLowerCase();
  const categoria = filtroCategoria.value;
  const distrito = filtroDistrito.value;
  const soloCerca = filtroCerca.checked;
  const soloDisponibleHoy = filtroDisponibleHoy.checked;

  const resultado = profesionales.filter(function (pro) {
    const coincideTexto =
      palabraClave === '' ||
      pro.nombre.toLowerCase().includes(palabraClave) ||
      pro.oficio.toLowerCase().includes(palabraClave) ||
      pro.categoria.toLowerCase().includes(palabraClave);

    const coincideCategoria = categoria === '' || pro.categoria === categoria;
    const coincideDistrito = distrito === '' || pro.distrito === distrito;
    const coincideCerca = !soloCerca || pro.distancia <= 1;
    const coincideDisponible = !soloDisponibleHoy || pro.disponibleHoy;

    return coincideTexto && coincideCategoria && coincideDistrito && coincideCerca && coincideDisponible;
  });

  renderProfesionales(resultado);
  renderChipsFiltros();
}

// Búsqueda por palabra clave (CU05, paso 2)
document.getElementById('formBusqueda').addEventListener('submit', function (e) {
  e.preventDefault();
  aplicarFiltros();
});

// Los filtros se aplican en tiempo real al cambiarlos
filtroCategoria.addEventListener('change', aplicarFiltros);
filtroDistrito.addEventListener('change', aplicarFiltros);
filtroCerca.addEventListener('change', aplicarFiltros);
filtroDisponibleHoy.addEventListener('change', aplicarFiltros);

// Limpiar todos los filtros y volver a mostrar todos los resultados
document.getElementById('btnLimpiarFiltros').addEventListener('click', function () {
  inputBusqueda.value = '';
  filtroCategoria.value = '';
  filtroDistrito.value = '';
  filtroCerca.checked = false;
  filtroDisponibleHoy.checked = false;
  aplicarFiltros();
});

// Render inicial con todos los profesionales
renderProfesionales(profesionales);

/* ==========================================================================
   MODAL: CONTRATAR PROFESIONAL (formulario de nombre, correo y teléfono)
   ========================================================================== */
const modalContratar = document.getElementById('modalContratar');
const formContratar = document.getElementById('formContratar');

function abrirModalContratar(pro) {
  profesionalSeleccionado = pro;

  document.getElementById('modalNombrePro').textContent = pro.nombre;
  document.getElementById('modalAvatarPro').src = pro.avatar;
  document.getElementById('modalAvatarPro').alt = 'Foto de ' + pro.nombre;
  document.getElementById('modalOficioPro').textContent = pro.oficio;
  document.getElementById('modalPrecioPro').textContent = 'S/. ' + pro.precio + '/hora · ' + pro.distrito;

  limpiarErrores(formContratar);
  formContratar.reset();
  spPrecargarDatosCliente(); // si hay sesión activa, autocompleta nombre/correo/teléfono
  modalContratar.hidden = false;
  document.getElementById('clienteNombre').focus();
}

function cerrarModalContratar() {
  modalContratar.hidden = true;
  profesionalSeleccionado = null;
}

document.getElementById('btnCancelarContratar').addEventListener('click', cerrarModalContratar);

// Cierra el modal si se hace clic fuera de la caja (en el fondo oscuro)
modalContratar.addEventListener('click', function (e) {
  if (e.target === modalContratar) cerrarModalContratar();
});

// Cierra el modal con la tecla Escape
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modalContratar.hidden) cerrarModalContratar();
});

formContratar.addEventListener('submit', function (e) {
  e.preventDefault();
  limpiarErrores(formContratar);

  const nombre = document.getElementById('clienteNombre').value.trim();
  const correo = document.getElementById('clienteCorreo').value.trim();
  const telefono = document.getElementById('clienteTelefono').value.trim();
  let valido = true;

  if (nombre === '') {
    mostrarError('errorClienteNombre', 'clienteNombre', 'El nombre completo es requerido.');
    valido = false;
  }

  if (correo === '') {
    mostrarError('errorClienteCorreo', 'clienteCorreo', 'El correo electrónico es requerido.');
    valido = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    mostrarError('errorClienteCorreo', 'clienteCorreo', 'Ingresa un correo electrónico válido.');
    valido = false;
  }

  if (telefono === '') {
    mostrarError('errorClienteTelefono', 'clienteTelefono', 'El teléfono es requerido.');
    valido = false;
  } else if (!/^\d{9,}$/.test(telefono)) {
    mostrarError('errorClienteTelefono', 'clienteTelefono', 'Ingresa un teléfono válido (mínimo 9 dígitos).');
    valido = false;
  }

  if (!valido) return;

  // Aquí normalmente se enviaría la solicitud al backend (API) para
  // notificar al profesional y crear el pedido en "Pedidos y Mensajes"
  const nombrePro = profesionalSeleccionado.nombre;

  // Si el profesional es una cuenta real registrada en este navegador (tiene
  // duenoId), la solicitud le llega a su pestaña "Solicitudes" en perfil.html
  if (profesionalSeleccionado.duenoId) {
    spAgregarSolicitud(profesionalSeleccionado.duenoId, {
      id: Date.now(),
      cliente: nombre,
      correo: correo,
      telefono: telefono,
      servicio: profesionalSeleccionado.oficio,
      fecha: spFechaHoyCorta(),
      estado: 'Pendiente'
    });
  }

  cerrarModalContratar();
  mostrarModalExito('Notificamos a ' + nombrePro + '. Recibirás su respuesta en breve.');
});

/* ==========================================================================
   MODAL: VER PERFIL DEL PROFESIONAL (foto y datos completos antes de contratar)
   ========================================================================== */
const modalVerPerfil = document.getElementById('modalVerPerfil');

function abrirModalVerPerfil(pro) {
  profesionalSeleccionado = pro;

  document.getElementById('modalPerfilAvatar').src = pro.avatar;
  document.getElementById('modalPerfilAvatar').alt = 'Foto de ' + pro.nombre;
  document.getElementById('modalPerfilNombre').textContent = pro.nombre;
  document.getElementById('modalPerfilOficio').textContent = pro.oficio;
  document.getElementById('modalPerfilEstrellas').textContent = generarEstrellas(pro.rating);
  document.getElementById('modalPerfilRatingValor').textContent = pro.rating.toFixed(1);
  document.getElementById('modalPerfilResenas').textContent = '(' + pro.resenas + ')';

  document.getElementById('modalPerfilBadgeVerificado').innerHTML = pro.verificado
    ? '<span class="badge-verificado">✓ Verificado</span>'
    : '';

  document.getElementById('modalPerfilResumen').textContent =
    pro.resumen || pro.descripcion || 'Este profesional aún no agregó una descripción.';

  const tagDisponiblePerfil = pro.disponibleHoy
    ? '<span class="tag tag--disponible">🟢 Disponible hoy</span>'
    : '';
  document.getElementById('modalPerfilTags').innerHTML =
    '<span class="tag tag--ubicacion">📍 ' + escapeHtml(pro.distrito) + ' · ' + pro.distancia + ' km</span>' +
    '<span class="tag tag--experiencia">' + escapeHtml(pro.categoria) + ' · ' + pro.experiencia + ' años de experiencia</span>' +
    tagDisponiblePerfil;

  document.getElementById('modalPerfilFormacion').textContent =
    (pro.formacion && pro.formacion.trim() !== '') ? pro.formacion : 'No especificado';

  // Habilidades: vienen separadas por comas (guardadas así desde "Editar perfil")
  const habilidadesLista = (pro.habilidades || '')
    .split(',')
    .map(function (h) { return h.trim(); })
    .filter(Boolean);
  const wrapHabilidades = document.getElementById('modalPerfilHabilidadesWrap');
  if (habilidadesLista.length > 0) {
    document.getElementById('modalPerfilHabilidades').innerHTML = habilidadesLista
      .map(function (h) { return '<span class="tag tag--experiencia">' + escapeHtml(h) + '</span>'; })
      .join('');
    wrapHabilidades.hidden = false;
  } else {
    wrapHabilidades.hidden = true;
  }

  document.getElementById('modalPerfilDireccion').textContent =
    (pro.direccion && pro.direccion.trim() !== '')
      ? pro.direccion
      : 'Por seguridad, este profesional solo comparte su distrito: ' + pro.distrito + '.';

  document.getElementById('modalPerfilPrecio').textContent = 'S/. ' + pro.precio + ' /hora';

  modalVerPerfil.hidden = false;
}

function cerrarModalVerPerfil() {
  modalVerPerfil.hidden = true;
}

document.getElementById('btnCerrarVerPerfil').addEventListener('click', cerrarModalVerPerfil);

// Cierra el modal si se hace clic fuera de la caja (en el fondo oscuro)
modalVerPerfil.addEventListener('click', function (e) {
  if (e.target === modalVerPerfil) cerrarModalVerPerfil();
});

// Cierra el modal con la tecla Escape
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modalVerPerfil.hidden) cerrarModalVerPerfil();
});

// Desde el perfil también se puede contratar directamente, sin cerrar y buscar de nuevo
document.getElementById('btnContratarDesdePerfil').addEventListener('click', function () {
  const pro = profesionalSeleccionado;
  cerrarModalVerPerfil();
  abrirModalContratar(pro);
});

/* ==========================================================================
   MODAL: SOLICITUD ENVIADA (ÉXITO)
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
   SESIÓN: navbar dinámico + edición de perfil de cliente
   ========================================================================== */
spPintarNavbarPublico({
  login: '../inicioSesion/login.html',
  registro: '../inicioSesion/registro.html',
  perfilUsuario: '../perfil/perfil.html',
  buscarTalento: 'buscar_talento.html'
});

const modalEditarPerfil = document.getElementById('modalEditarPerfil');
const formEditarPerfil = document.getElementById('formEditarPerfil');

// Se llama desde sesion.js cuando un cliente hace clic en "Mi perfil"
function abrirModalEditarPerfil() {
  const sesion = spObtenerSesion();
  if (!sesion) return;

  limpiarErrores(formEditarPerfil);
  document.getElementById('editarPerfilNombre').value = sesion.nombre || '';
  document.getElementById('editarPerfilCorreo').value = sesion.correo || '';
  document.getElementById('editarPerfilTelefono').value = sesion.telefono || '';
  modalEditarPerfil.hidden = false;
}

function cerrarModalEditarPerfil() {
  modalEditarPerfil.hidden = true;
}

document.getElementById('btnCancelarEditarPerfil').addEventListener('click', cerrarModalEditarPerfil);

modalEditarPerfil.addEventListener('click', function (e) {
  if (e.target === modalEditarPerfil) cerrarModalEditarPerfil();
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modalEditarPerfil.hidden) cerrarModalEditarPerfil();
});

formEditarPerfil.addEventListener('submit', function (e) {
  e.preventDefault();
  limpiarErrores(formEditarPerfil);

  const nombre = document.getElementById('editarPerfilNombre').value.trim();
  const correo = document.getElementById('editarPerfilCorreo').value.trim();
  const telefono = document.getElementById('editarPerfilTelefono').value.trim();
  let valido = true;

  if (nombre === '') {
    mostrarError('errorEditarPerfilNombre', 'editarPerfilNombre', 'El nombre completo es requerido.');
    valido = false;
  }

  if (correo === '') {
    mostrarError('errorEditarPerfilCorreo', 'editarPerfilCorreo', 'El correo electrónico es requerido.');
    valido = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    mostrarError('errorEditarPerfilCorreo', 'editarPerfilCorreo', 'Ingresa un correo electrónico válido.');
    valido = false;
  }

  if (telefono !== '' && !/^\d{9,}$/.test(telefono)) {
    mostrarError('errorEditarPerfilTelefono', 'editarPerfilTelefono', 'Ingresa un teléfono válido (mínimo 9 dígitos).');
    valido = false;
  }

  if (!valido) return;

  spActualizarSesion({ nombre: nombre, correo: correo, telefono: telefono });
  cerrarModalEditarPerfil();
  spPintarNavbarPublico({
    login: '../inicioSesion/login.html',
    registro: '../inicioSesion/registro.html',
    perfilUsuario: '../perfil/perfil.html',
    buscarTalento: 'buscar_talento.html'
  });
  mostrarModalExito('Tus datos se actualizaron correctamente.');
});

// Si venimos redirigidos desde otra página con ?editarPerfil=1, abre el modal directo
if (new URLSearchParams(window.location.search).get('editarPerfil') === '1') {
  abrirModalEditarPerfil();
}