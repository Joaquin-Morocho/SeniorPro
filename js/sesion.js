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

// Registra (o actualiza, si ya existía el mismo correo) una cuenta
function spGuardarUsuarioRegistrado(usuario) {
  const usuarios = spObtenerUsuarios();
  const indice = usuarios.findIndex(function (u) {
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