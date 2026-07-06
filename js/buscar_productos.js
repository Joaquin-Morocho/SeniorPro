/* ==========================================================================
   SENIOR PRO — LÓGICA DE BUSCAR PRODUCTOS (CU06: Comprar productos)
   Mismo patrón de validación y modales que buscar_talento.js
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

let productoSeleccionado = null;


// Datos de ejemplo (en memoria; en producción vendrían de la base de datos
// a través de una API, ligados a la tabla PRODUCTO y al vendedor que lo publicó)
const FOTO_PRODUCTO = {
  p1: 'https://images.unsplash.com/photo-1541558869434-2840d308329a?auto=format&fit=crop&w=500&h=400',
  p2: 'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&w=500&h=400',
  p3: 'https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?auto=format&fit=crop&w=500&h=400',
  p4: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=500&h=400',
  p5: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=500&h=400',
  p6: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=500&h=400',
  p7: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=500&h=400',
  p8: '../../imagenes/macetas.jpg'
};

const VENDEDOR_AVATAR = {
  m1: 'https://images.pexels.com/photos/11556142/pexels-photo-11556142.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
  m2: 'https://images.pexels.com/photos/343123/pexels-photo-343123.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
  w8: 'https://images.pexels.com/photos/17059080/pexels-photo-17059080.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
  w9: 'https://images.pexels.com/photos/16923258/pexels-photo-16923258.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
};

// Catálogo de ejemplo, ligado conceptualmente a la clase Producto (RF10-RF13)
const productos = [
  { id: 1, nombre: 'Mesa ratona de madera maciza', vendedor: 'Roberto M.', vendedorAvatar: VENDEDOR_AVATAR.m1, categoria: 'Carpintería', distrito: 'Miraflores', precio: 280, stock: 3, foto: FOTO_PRODUCTO.p1, descripcion: 'Mesa ratona artesanal de cedro, acabado natural, hecha a mano.' },
  { id: 2, nombre: 'Estante flotante a medida', vendedor: 'Manuel Q.', vendedorAvatar: VENDEDOR_AVATAR.m2, categoria: 'Carpintería', distrito: 'Surco', precio: 150, stock: 5, foto: FOTO_PRODUCTO.p2, descripcion: 'Estante de pino tratado, ideal para libros o decoración.' },
  { id: 3, nombre: 'Alhajero tallado a mano', vendedor: 'Roberto M.', vendedorAvatar: VENDEDOR_AVATAR.m1, categoria: 'Carpintería', distrito: 'Miraflores', precio: 90, stock: 0, foto: FOTO_PRODUCTO.p3, descripcion: 'Caja de madera con tallado tradicional y compartimentos internos.' },

  { id: 4, nombre: 'Vestido de fiesta a medida', vendedor: 'Rosa T.', vendedorAvatar: VENDEDOR_AVATAR.w8, categoria: 'Costura', distrito: 'Barranco', precio: 220, stock: 2, foto: FOTO_PRODUCTO.p4, descripcion: 'Confección a medida en tela importada, incluye un ajuste gratuito.' },
  { id: 5, nombre: 'Set de manteles bordados', vendedor: 'Carmen D.', vendedorAvatar: VENDEDOR_AVATAR.w9, categoria: 'Costura', distrito: 'Miraflores', precio: 75, stock: 8, foto: FOTO_PRODUCTO.p5, descripcion: 'Juego de 6 manteles individuales bordados a mano.' },
  { id: 6, nombre: 'Chompa tejida a mano', vendedor: 'Carmen D.', vendedorAvatar: VENDEDOR_AVATAR.w9, categoria: 'Costura', distrito: 'Miraflores', precio: 130, stock: 0, foto: FOTO_PRODUCTO.p6, descripcion: 'Chompa de lana de alpaca, tejida a mano, talla M.' },

  { id: 7, nombre: 'Torta de cumpleaños personalizada', vendedor: 'Gladys N.', vendedorAvatar: VENDEDOR_AVATAR.w8, categoria: 'Repostería', distrito: 'La Molina', precio: 95, stock: 4, foto: FOTO_PRODUCTO.p7, descripcion: 'Torta artesanal de 20 porciones, sabor y diseño a elección.' },
  { id: 8, nombre: 'Set de macetas de cerámica', vendedor: 'Isabel R.', vendedorAvatar: VENDEDOR_AVATAR.w9, categoria: 'Artesanía', distrito: 'Miraflores', precio: 60, stock: 6, foto: FOTO_PRODUCTO.p8, descripcion: 'Set de 3 macetas de cerámica pintadas a mano.' }
];

// Agrega los productos publicados por profesionales registrados en este
// navegador (panel "Mis Servicios" en perfil.html), para que también
// aparezcan en el catálogo de compra (RF10-RF12)
let siguienteIdProductoReal = 1000;
if (typeof spObtenerPublicacionesDeTodosLosProfesionales === 'function') {
  spObtenerPublicacionesDeTodosLosProfesionales('producto').forEach(function (pub) {
    productos.push({
      id: siguienteIdProductoReal++,
      nombre: pub.nombre,
      vendedor: pub.duenoNombre,
      vendedorAvatar: pub.foto || 'https://placehold.co/100x100/EAF0F7/5B6B85?text=Sin+foto',
      categoria: pub.categoria,
      distrito: pub.distrito,
      precio: pub.precio,
      stock: 1,
      foto: pub.foto || 'https://placehold.co/500x400/EAF0F7/5B6B85?text=Sin+foto',
      descripcion: pub.descripcion,
      duenoId: pub.duenoId,
      duenoCorreo: pub.duenoCorreo,
      duenoTelefono: pub.duenoTelefono
    });
  });
}

const inputBusqueda = document.getElementById('inputBusqueda');
const filtroCategoria = document.getElementById('filtroCategoria');
const filtroDistrito = document.getElementById('filtroDistrito');
const filtroSoloStock = document.getElementById('filtroSoloStock');

const gridProductos = document.getElementById('gridProductos');
const sinResultados = document.getElementById('sinResultados');
const contadorResultados = document.getElementById('contadorResultados');

// Evita inyección de HTML al insertar texto dinámico en el DOM
function escapeHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

function renderProductos(lista) {
  gridProductos.innerHTML = '';
  contadorResultados.textContent = lista.length;

  const hayResultados = lista.length > 0;
  gridProductos.hidden = !hayResultados;
  sinResultados.hidden = hayResultados;

  lista.forEach(function (prod) {
    const card = document.createElement('article');
    card.className = 'producto-card';

    const conStock = prod.stock > 0;
    const stockTag = conStock
      ? '<span class="producto-stock-tag producto-stock-tag--disponible">En stock (' + prod.stock + ')</span>'
      : '<span class="producto-stock-tag producto-stock-tag--agotado">Agotado</span>';

    card.innerHTML =
      '<div class="producto-foto-wrapper">' +
        '<img class="producto-foto" src="' + prod.foto + '" alt="Foto de ' + escapeHtml(prod.nombre) + '">' +
        stockTag +
      '</div>' +
      '<div class="producto-body">' +
        '<h3 class="producto-nombre">' + escapeHtml(prod.nombre) + '</h3>' +
        '<div class="producto-vendedor">' +
          '<img class="producto-vendedor-avatar" src="' + prod.vendedorAvatar + '" alt="">' +
          'Vendido por ' + escapeHtml(prod.vendedor) +
        '</div>' +
        '<p class="producto-descripcion">' + escapeHtml(prod.descripcion) + '</p>' +
        '<div class="producto-tags">' +
          '<span class="tag tag--categoria">' + escapeHtml(prod.categoria) + '</span>' +
          '<span class="tag tag--ubicacion">📍 ' + escapeHtml(prod.distrito) + '</span>' +
        '</div>' +
        '<div class="producto-footer">' +
          '<span class="producto-precio">S/. ' + prod.precio + '</span>' +
          '<button type="button" class="btn-comprar" data-id="' + prod.id + '"' + (conStock ? '' : ' disabled') + '>' +
            (conStock ? 'Comprar' : 'Sin stock') +
          '</button>' +
        '</div>' +
      '</div>';

    gridProductos.appendChild(card);
  });

  // Al hacer clic en "Comprar" se abre el modal de pedido (CU06)
  gridProductos.querySelectorAll('.btn-comprar').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const prod = productos.find(function (p) { return p.id === Number(btn.dataset.id); });
      if (prod) abrirModalPedido(prod);
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
  if (filtroSoloStock.checked) {
    chips.push({ texto: 'Solo con stock', accion: function () { filtroSoloStock.checked = false; } });
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
  const soloStock = filtroSoloStock.checked;

  const resultado = productos.filter(function (prod) {
    const coincideTexto =
      palabraClave === '' ||
      prod.nombre.toLowerCase().includes(palabraClave) ||
      prod.categoria.toLowerCase().includes(palabraClave) ||
      prod.vendedor.toLowerCase().includes(palabraClave);

    const coincideCategoria = categoria === '' || prod.categoria === categoria;
    const coincideDistrito = distrito === '' || prod.distrito === distrito;
    const coincideStock = !soloStock || prod.stock > 0;

    return coincideTexto && coincideCategoria && coincideDistrito && coincideStock;
  });

  renderProductos(resultado);
  renderChipsFiltros();
}

// Búsqueda por palabra clave (CU06, paso 1)
document.getElementById('formBusqueda').addEventListener('submit', function (e) {
  e.preventDefault();
  aplicarFiltros();
});

// Los filtros se aplican en tiempo real al cambiarlos
filtroCategoria.addEventListener('change', aplicarFiltros);
filtroDistrito.addEventListener('change', aplicarFiltros);
filtroSoloStock.addEventListener('change', aplicarFiltros);

// Limpiar todos los filtros y volver a mostrar todos los resultados
document.getElementById('btnLimpiarFiltros').addEventListener('click', function () {
  inputBusqueda.value = '';
  filtroCategoria.value = '';
  filtroDistrito.value = '';
  filtroSoloStock.checked = true;
  aplicarFiltros();
});

// Render inicial (respeta el filtro "Solo con stock", activado por defecto)
aplicarFiltros();

/* ==========================================================================
   MODAL: GENERAR PEDIDO (CU06 -- cantidad, subtotal, control de stock)
   ========================================================================== */
const modalPedido = document.getElementById('modalPedido');
const formPedido = document.getElementById('formPedido');
const inputCantidad = document.getElementById('inputCantidad');
const btnMenosCantidad = document.getElementById('btnMenosCantidad');
const btnMasCantidad = document.getElementById('btnMasCantidad');

function actualizarSubtotal() {
  if (!productoSeleccionado) return;
  const cantidad = Math.max(1, Number(inputCantidad.value) || 1);
  const subtotal = cantidad * productoSeleccionado.precio;
  document.getElementById('modalSubtotal').textContent = 'S/. ' + subtotal;
}

function abrirModalPedido(prod) {
  productoSeleccionado = prod;

  document.getElementById('modalNombreProducto').textContent = prod.nombre;
  document.getElementById('modalFotoProducto').src = prod.foto;
  document.getElementById('modalFotoProducto').alt = 'Foto de ' + prod.nombre;
  document.getElementById('modalVendedorProducto').textContent = 'Vendido por ' + prod.vendedor;
  document.getElementById('modalPrecioProducto').textContent = 'S/. ' + prod.precio + ' · ' + prod.distrito;
  document.getElementById('cantidadStockHint').textContent = 'Stock disponible: ' + prod.stock;

  inputCantidad.value = 1;
  inputCantidad.max = prod.stock;
  actualizarSubtotal();

  limpiarErrores(formPedido);
  formPedido.reset();
  inputCantidad.value = 1; // el reset del form no debe dejarlo vacío
  spPrecargarDatosCliente(); // si hay sesión activa, autocompleta nombre/correo/teléfono
  modalPedido.hidden = false;
  document.getElementById('clienteNombre').focus();
}

function cerrarModalPedido() {
  modalPedido.hidden = true;
  productoSeleccionado = null;
}

btnMenosCantidad.addEventListener('click', function () {
  const actual = Math.max(1, Number(inputCantidad.value) || 1);
  if (actual > 1) {
    inputCantidad.value = actual - 1;
    actualizarSubtotal();
  }
});

btnMasCantidad.addEventListener('click', function () {
  if (!productoSeleccionado) return;
  const actual = Math.max(1, Number(inputCantidad.value) || 1);
  // No se puede pedir más cantidad de la que hay en stock (flujo alterno CU06)
  if (actual < productoSeleccionado.stock) {
    inputCantidad.value = actual + 1;
    actualizarSubtotal();
  }
});

inputCantidad.addEventListener('input', actualizarSubtotal);

document.getElementById('btnCancelarPedido').addEventListener('click', cerrarModalPedido);

// Cierra el modal si se hace clic fuera de la caja (en el fondo oscuro)
modalPedido.addEventListener('click', function (e) {
  if (e.target === modalPedido) cerrarModalPedido();
});

// Cierra el modal con la tecla Escape
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modalPedido.hidden) cerrarModalPedido();
});

formPedido.addEventListener('submit', function (e) {
  e.preventDefault();
  limpiarErrores(formPedido);

  const cantidad = Number(inputCantidad.value);
  const nombre = document.getElementById('clienteNombre').value.trim();
  const correo = document.getElementById('clienteCorreo').value.trim();
  const telefono = document.getElementById('clienteTelefono').value.trim();
  let valido = true;

  // Flujo alterno de CU06: no se puede generar el pedido sin stock suficiente
  if (!cantidad || cantidad < 1) {
    mostrarError('errorCantidad', 'inputCantidad', 'Ingresa una cantidad válida.');
    valido = false;
  } else if (cantidad > productoSeleccionado.stock) {
    mostrarError('errorCantidad', 'inputCantidad', 'Solo hay ' + productoSeleccionado.stock + ' unidades disponibles.');
    valido = false;
  }

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

  // Descuenta el stock localmente (en producción esto lo haría el backend
  // al registrar el pedido, según la postcondición de CU06) y refresca el catálogo
  productoSeleccionado.stock -= cantidad;
  const nombreProducto = productoSeleccionado.nombre;

  // Si el vendedor es una cuenta real registrada en este navegador (tiene
  // duenoId), la solicitud le llega a su pestaña "Solicitudes" en perfil.html
  if (productoSeleccionado.duenoId) {
    spAgregarSolicitud(productoSeleccionado.duenoId, {
      id: Date.now(),
      cliente: nombre,
      correo: correo,
      telefono: telefono,
      servicio: nombreProducto + ' (x' + cantidad + ')',
      fecha: spFechaHoyCorta(),
      estado: 'Pendiente'
    });
  }

  cerrarModalPedido();
  aplicarFiltros();
  mostrarModalExito('Se generó tu pedido de "' + nombreProducto + '". El vendedor lo verá en su panel de pedidos y coordinará la entrega.');
});

/* ==========================================================================
   MODAL: PEDIDO GENERADO (ÉXITO)
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

modalExito.addEventListener('click', function (e) {
  if (e.target === modalExito) cerrarModalExito();
});

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