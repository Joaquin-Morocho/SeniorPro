/* ==========================================================================
   SENIOR PRO — GESTIÓN DE SESIÓN (MODO DEMO, SIN BACKEND)
   ==========================================================================
   Este proyecto todavía no tiene servidor ni base de datos, así que la
   "cuenta" del usuario se simula guardando los datos en localStorage del
   navegador. Cuando exista un backend real, estas funciones se reemplazan
   por llamadas a la API (fetch) y el resto de páginas no necesita cambiar,
   porque siempre consultan la sesión a través de spObtenerSesion().

   Incluir este script ANTES del script propio de cada página:
   <script src="../../js/sesion.js"></script>
   ========================================================================== */

const SP_KEY_SESION = 'seniorProSesion';
const SP_KEY_USUARIOS = 'seniorProUsuarios';

/* ---------- "Base de datos" simulada de cuentas registradas ---------- */

function spObtenerUsuarios() {
  try {
    const raw = localStorage.getItem(SP_KEY_USUARIOS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

// Genera un identificador único para cada cuenta nueva, sin importar el
// método de registro elegido (correo, teléfono o documento). Este ID es la
// clave real usada para guardar publicaciones, pedidos y disponibilidad de
// cada cuenta, para que dos cuentas registradas por teléfono/documento (sin
// correo) nunca compartan ni se sobrescriban datos entre sí.
function spGenerarId() {
  return 'u_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
}

function spBuscarUsuarioPorId(id) {
  if (!id) return null;
  return spObtenerUsuarios().find(function (u) { return u.id === id; }) || null;
}

// Registra (o actualiza, si ya existía) una cuenta. Empareja primero por "id"
// (identificador único generado al registrarse); solo si el usuario no trae
// id (cuentas antiguas) se recurre al correo como respaldo.
function spGuardarUsuarioRegistrado(usuario) {
  const usuarios = spObtenerUsuarios();
  const indice = usuarios.findIndex(function (u) {
    if (usuario.id && u.id) return u.id === usuario.id;
    return u.correo && usuario.correo && u.correo === usuario.correo;
  });

  if (indice >= 0) {
    usuarios[indice] = usuario;
  } else {
    usuarios.push(usuario);
  }

  localStorage.setItem(SP_KEY_USUARIOS, JSON.stringify(usuarios));
}

function spBuscarUsuarioPorCorreo(correo) {
  return spObtenerUsuarios().find(function (u) { return u.correo === correo; }) || null;
}

/* ---------- Sesión activa ---------- */

function spIniciarSesion(usuario) {
  localStorage.setItem(SP_KEY_SESION, JSON.stringify(usuario));
}

function spObtenerSesion() {
  try {
    const raw = localStorage.getItem(SP_KEY_SESION);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function spActualizarSesion(cambios) {
  const sesion = spObtenerSesion();
  if (!sesion) return;
  const actualizado = Object.assign({}, sesion, cambios);
  spIniciarSesion(actualizado);
  spGuardarUsuarioRegistrado(actualizado);
}

function spCerrarSesion(urlLogin) {
  localStorage.removeItem(SP_KEY_SESION);
  window.location.href = urlLogin;
}

function spEscaparTexto(texto) {
  const div = document.createElement('div');
  div.textContent = texto == null ? '' : texto;
  return div.innerHTML;
}

// Fecha actual en formato DD/MM/AAAA, usada al registrar solicitudes nuevas
function spFechaHoyCorta() {
  const hoy = new Date();
  const dia = String(hoy.getDate()).padStart(2, '0');
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  return dia + '/' + mes + '/' + hoy.getFullYear();
}

/* ==========================================================================
   NAVBAR PÚBLICO (index.html, buscar_talento.html, buscar_productos.html)
   Si hay una sesión activa, reemplaza "Iniciar sesión / Registrarse" por el
   saludo del usuario, un enlace "Mi perfil" y "Cerrar sesión".

   rutas = {
     login: '...',            // ruta a login.html desde la página actual
     registro: '...',         // ruta a registro.html
     perfilUsuario: '...',    // ruta a perfil.html (panel del profesional)
     buscarTalento: '...'     // ruta a buscar_talento.html
   }
   ========================================================================== */
function spPintarNavbarPublico(rutas) {
  const sesion = spObtenerSesion();
  const navActions = document.querySelector('.nav-actions');
  if (!navActions) return;

  if (!sesion) {
    navActions.innerHTML =
      '<a href="' + rutas.login + '" class="link-login">Iniciar sesión</a>' +
      '<a href="' + rutas.registro + '" class="btn btn-primary">Registrarse</a>';
    return;
  }

  const primerNombre = (sesion.nombre || '').trim().split(' ')[0] || 'tu cuenta';

  navActions.innerHTML =
    '<span class="navbar-saludo">Hola, ' + spEscaparTexto(primerNombre) + '</span>' +
    '<a href="#" class="link-login" id="spBtnMiPerfil">Mi perfil</a>' +
    '<button type="button" class="btn btn-primary" id="spBtnCerrarSesion">Cerrar sesión</button>';

  document.getElementById('spBtnCerrarSesion').addEventListener('click', function () {
    const confirmado = confirm('¿Seguro que deseas cerrar sesión?');
    if (confirmado) spCerrarSesion(rutas.login);
  });

  document.getElementById('spBtnMiPerfil').addEventListener('click', function (e) {
    e.preventDefault();

    if (sesion.tipo === 'usuario') {
      // Usuario (profesional): va a su panel completo
      window.location.href = rutas.perfilUsuario;
      return;
    }

    // Cliente: solo debe poder editar sus datos de contacto, no tiene panel
    if (typeof abrirModalEditarPerfil === 'function') {
      // Ya estamos en una página que tiene el modal (buscar_talento / buscar_productos)
      abrirModalEditarPerfil();
    } else {
      // Página sin el modal (ej. index.html): redirige y avisa que lo abra allá
      window.location.href = rutas.buscarTalento + '?editarPerfil=1';
    }
  });
}

/* ==========================================================================
   PRECARGA DE DATOS EN FORMULARIOS DE CONTRATAR / COMPRAR
   Si hay sesión activa, autocompleta nombre/correo/teléfono. El campo sigue
   siendo editable por si el cliente quiere usar otro contacto para ese pedido.
   ========================================================================== */
function spPrecargarDatosCliente() {
  const sesion = spObtenerSesion();
  if (!sesion) return;

  const nombreInput = document.getElementById('clienteNombre');
  const correoInput = document.getElementById('clienteCorreo');
  const telefonoInput = document.getElementById('clienteTelefono');

  if (nombreInput) nombreInput.value = sesion.nombre || '';
  if (correoInput) correoInput.value = sesion.correo || '';
  if (telefonoInput) telefonoInput.value = sesion.telefono || '';
}

/* ==========================================================================
   PUBLICACIONES (SERVICIOS/PRODUCTOS) POR PROFESIONAL — RF06-RF12
   Se guardan en localStorage agrupadas por el correo del profesional dueño,
   para que persistan entre sesiones y puedan mostrarse también en
   buscar_talento.html / buscar_productos.html.
   ========================================================================== */
const SP_KEY_PUBLICACIONES = 'seniorProPublicaciones'; // { "correo@ejemplo.com": [ {...pub}, ... ] }

function spObtenerTodasPublicaciones() {
  try {
    const raw = localStorage.getItem(SP_KEY_PUBLICACIONES);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

// Guarda (reemplaza) la lista completa de publicaciones de un profesional
function spGuardarPublicaciones(correo, publicaciones) {
  if (!correo) return;
  const todas = spObtenerTodasPublicaciones();
  todas[correo] = publicaciones;
  localStorage.setItem(SP_KEY_PUBLICACIONES, JSON.stringify(todas));
}

// Devuelve las publicaciones guardadas de un profesional, o null si nunca guardó nada
function spObtenerPublicacionesDe(correo) {
  if (!correo) return null;
  const todas = spObtenerTodasPublicaciones();
  return todas[correo] || null;
}

// Junta las publicaciones ACTIVAS de tipo "servicio" o "producto" de TODOS
// los profesionales registrados en este navegador, agregando los datos de
// contacto y de PERFIL COMPLETO del dueño (RF03), para mostrarlas en
// buscar_talento.html / buscar_productos.html (incluida la vista "Ver perfil")
function spObtenerPublicacionesDeTodosLosProfesionales(tipo) {
  const todas = spObtenerTodasPublicaciones();
  const usuarios = spObtenerUsuarios();
  const resultado = [];

  Object.keys(todas).forEach(function (idProfesional) {
    const dueno = usuarios.find(function (u) { return u.id === idProfesional; });
    const duenoNombre = dueno ? dueno.nombre : 'Profesional Senior Pro';

    (todas[idProfesional] || []).forEach(function (pub) {
      if (pub.tipo === tipo && pub.estado === 'Activo') {
        resultado.push(Object.assign({}, pub, {
          duenoId: idProfesional,
          duenoNombre: duenoNombre,
          duenoCorreo: dueno ? dueno.correo : '',
          duenoTelefono: dueno ? dueno.telefono : '',
          // Datos de perfil completos del profesional (Clase Perfil / RF03),
          // usados en la vista "Ver perfil" de buscar_talento.html
          duenoFoto: dueno ? dueno.foto : '',
          duenoResumen: dueno ? dueno.resumen : '',
          duenoFormacion: dueno ? dueno.formacion : '',
          duenoHabilidades: dueno ? dueno.habilidades : '',
          duenoDireccion: dueno ? dueno.direccion : '',
          duenoExperiencia: dueno ? dueno.experiencia : ''
        }));
      }
    });
  });

  return resultado;
}

/* ==========================================================================
   SOLICITUDES DE CONTRATACIÓN / COMPRA — RF13
   Cuando un cliente contrata un servicio o compra un producto, la solicitud
   se guarda ligada al correo del PROFESIONAL dueño de esa publicación, para
   que le aparezca en la pestaña "Solicitudes" de su panel (perfil.html).
   ========================================================================== */
const SP_KEY_SOLICITUDES = 'seniorProSolicitudes'; // { "correoProfesional": [ {...solicitud}, ... ] }

function spObtenerTodasSolicitudes() {
  try {
    const raw = localStorage.getItem(SP_KEY_SOLICITUDES);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

// Devuelve las solicitudes guardadas de un profesional, o null si nunca se guardó nada todavía
function spObtenerSolicitudesDe(correoProfesional) {
  if (!correoProfesional) return null;
  const todas = spObtenerTodasSolicitudes();
  return todas[correoProfesional] || null;
}

// Guarda (reemplaza) la lista completa de solicitudes de un profesional.
// perfil.html la usa para persistir cambios de estado (Aceptar/Rechazar/Completar).
function spGuardarSolicitudes(correoProfesional, solicitudes) {
  if (!correoProfesional) return;
  const todas = spObtenerTodasSolicitudes();
  todas[correoProfesional] = solicitudes;
  localStorage.setItem(SP_KEY_SOLICITUDES, JSON.stringify(todas));
}

// Agrega una nueva solicitud al final de la lista de un profesional.
// buscar_talento.html / buscar_productos.html la usan cuando un cliente
// contrata un servicio o compra un producto.
function spAgregarSolicitud(correoProfesional, solicitud) {
  if (!correoProfesional) return;
  const actuales = spObtenerSolicitudesDe(correoProfesional) || [];
  actuales.unshift(solicitud);
  spGuardarSolicitudes(correoProfesional, actuales);
}

/* ==========================================================================
   CALENDARIO DE DISPONIBILIDAD — RF14, RF15, RF16
   Se guarda el estado de cada día (disponible/bloqueado) ligado al correo del
   profesional, para que persista entre sesiones y pueda consultarse desde
   buscar_talento.html antes de que un cliente contrate un servicio.
   ========================================================================== */
const SP_KEY_DISPONIBILIDAD = 'seniorProDisponibilidad'; // { "correo@ejemplo.com": { "YYYY-M-D": "disponible"|"bloqueado" } }

function spObtenerTodaLaDisponibilidad() {
  try {
    const raw = localStorage.getItem(SP_KEY_DISPONIBILIDAD);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

// Devuelve el calendario guardado de un profesional, o null si nunca guardó nada todavía
function spObtenerDisponibilidadDe(correo) {
  if (!correo) return null;
  const todas = spObtenerTodaLaDisponibilidad();
  return todas[correo] || null;
}

// Guarda (reemplaza) el calendario completo de un profesional
function spGuardarDisponibilidad(correo, estadosDias) {
  if (!correo) return;
  const todas = spObtenerTodaLaDisponibilidad();
  todas[correo] = estadosDias;
  localStorage.setItem(SP_KEY_DISPONIBILIDAD, JSON.stringify(todas));
}

// Clave estándar "YYYY-M-D" (mes en formato getMonth(), 0=enero) para un día del calendario.
// Se usa tanto en perfil.js (al marcar días) como aquí (al consultar disponibilidad de hoy).
function spClaveDia(anio, mes, dia) {
  return anio + '-' + mes + '-' + dia;
}

// Clave del día de HOY, en el mismo formato que usa el calendario
function spClaveHoy() {
  const hoy = new Date();
  return spClaveDia(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
}

// RF16: indica si un profesional marcó HOY como disponible en su calendario.
// Si todavía no guardó ningún calendario o no marcó nada para hoy, se asume
// disponible por defecto (no hay ningún bloqueo registrado).
function spEstaDisponibleHoy(correo) {
  const calendario = spObtenerDisponibilidadDe(correo);
  if (!calendario) return true;
  const estadoHoy = calendario[spClaveHoy()];
  return estadoHoy !== 'bloqueado';
}