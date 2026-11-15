// =======================================================
// CAPA DE PRESENTACIÓN (js/vista/vista.js)
// En este archivo me encargo únicamente de leer y dibujar en el HTML (DOM).
// Como vimos con el profesor, la vista nunca debe validar reglas ni tocar localStorage,
// y siempre uso createElement y textContent para insertar texto de forma segura.
// =======================================================

const Vista = {
  // Formateo los precios en pesos colombianos para que se vean claros en la interfaz
  pesos: new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }),

  // Formateo la TRM oficial con 2 decimales (centavos) tal como la publica datos.gov.co
  pesosTrm: new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }),

  // Formateo los valores en dólares estadounidenses para la sección de la API
  dolares: new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }),

  // Dibujo las filas de la tabla en el tbody usando createElement y textContent
  pintarTabla(productosPagina, columnaOrden = "id", direccionOrden = "asc") {
    const cuerpo = document.querySelector("#cuerpo-tabla-resumen");
    cuerpo.replaceChildren();

    // Actualizo las flechas de ordenamiento en los encabezados de la tabla
    this.actualizarEncabezadosOrden(columnaOrden, direccionOrden);

    // Si no hay productos en la búsqueda o filtro, muestro una fila informativa
    if (productosPagina.length === 0) {
      const filaVacia = document.createElement("tr");
      const celdaVacia = document.createElement("td");
      celdaVacia.colSpan = 8;
      celdaVacia.className = "tabla-datos__vacio";
      celdaVacia.textContent = "No hay registros que coincidan con los filtros seleccionados.";
      filaVacia.append(celdaVacia);
      cuerpo.append(filaVacia);
      return;
    }

    productosPagina.forEach((p) => {
      const fila = document.createElement("tr");
      fila.classList.add("tabla-datos__fila");
      if (p.cantidad === 0) {
        fila.classList.add("tabla-datos__fila--agotada", "fila-agotada");
      }

      // Columna: ID
      const celdaId = document.createElement("td");
      celdaId.textContent = p.id;
      fila.append(celdaId);

      // Columna: Imagen miniatura
      const celdaImg = document.createElement("td");
      const img = document.createElement("img");
      img.src = p.imagen;
      img.alt = p.nombre;
      img.classList.add("tabla-datos__miniatura", "miniatura-tabla");
      celdaImg.append(img);
      fila.append(celdaImg);

      // Columna: Nombre
      const celdaNombre = document.createElement("td");
      celdaNombre.textContent = p.nombre;
      fila.append(celdaNombre);

      // Columna: Categoría
      const celdaCat = document.createElement("td");
      celdaCat.textContent = p.categoria;
      fila.append(celdaCat);

      // Columna: Precio
      const celdaPrecio = document.createElement("td");
      celdaPrecio.textContent = this.pesos.format(p.precio);
      fila.append(celdaPrecio);

      // Columna: Cantidad
      const celdaCantidad = document.createElement("td");
      celdaCantidad.textContent = p.cantidad;
      fila.append(celdaCantidad);

      // Columna: Estado (Disponible / Agotado)
      const celdaEstado = document.createElement("td");
      const badge = document.createElement("span");
      badge.classList.add("badge", "badge-estado");
      if (p.cantidad > 0) {
        badge.classList.add("badge--disponible", "badge-disponible");
        badge.textContent = "Disponible";
      } else {
        badge.classList.add("badge--agotado", "badge-agotado");
        badge.textContent = "Agotado";
      }
      celdaEstado.append(badge);
      fila.append(celdaEstado);

      // Columna: Acciones con botones de editar y eliminar
      const celdaAcciones = document.createElement("td");
      celdaAcciones.classList.add("tabla-datos__acciones", "acciones-tabla");
      celdaAcciones.append(
        this.boton("Editar", "editar", p.id, "boton boton--editar-tabla btn-accion-tabla btn-editar"),
        this.boton("Eliminar", "eliminar", p.id, "boton boton--eliminar-tabla btn-accion-tabla btn-eliminar-tabla")
      );
      fila.append(celdaAcciones);

      cuerpo.append(fila);
    });
  },

  // Marco en el encabezado de la tabla cuál columna está ordenada y su dirección
  actualizarEncabezadosOrden(columnaActiva, direccion) {
    const encabezados = document.querySelectorAll("#encabezado-tabla th[data-columna]");
    encabezados.forEach((th) => {
      const nombreBase = th.dataset.titulo;
      const col = th.dataset.columna;
      if (col === columnaActiva) {
        const flecha = direccion === "asc" ? " ▲" : " ▼";
        th.textContent = nombreBase + flecha;
        th.classList.add("tabla-datos__th--activo");
      } else {
        th.textContent = nombreBase + " ↕";
        th.classList.remove("tabla-datos__th--activo");
      }
    });
  },

  // Actualizo los textos y botones de la paginación de la tabla
  pintarPaginacion(paginaActual, totalPaginas, totalFiltrados) {
    const info = document.querySelector("#info-paginacion");
    const btnAnterior = document.querySelector("#btn-pagina-anterior");
    const btnSiguiente = document.querySelector("#btn-pagina-siguiente");

    if (info) {
      info.textContent = `Página ${paginaActual} de ${totalPaginas} (${totalFiltrados} registros encontrados)`;
    }
    if (btnAnterior) {
      btnAnterior.disabled = paginaActual <= 1;
    }
    if (btnSiguiente) {
      btnSiguiente.disabled = paginaActual >= totalPaginas;
    }
  },

  // Pinto las tarjetas de los productos en el catálogo
  pintarTarjetas(productos, totalGeneral) {
    const contenedor = document.querySelector("#contenedor-tarjetas");
    const contador = document.querySelector("#contador-resultados");
    const avisoVacio = document.querySelector("#aviso-sin-coincidencias");

    contenedor.replaceChildren();
    contador.textContent = `Mostrando ${productos.length} de ${totalGeneral} productos`;

    if (productos.length === 0) {
      avisoVacio.classList.remove("oculto");
    } else {
      avisoVacio.classList.add("oculto");
    }

    productos.forEach((p) => {
      const tarjeta = document.createElement("article");
      tarjeta.classList.add("tarjeta", "tarjeta-producto");
      if (p.cantidad === 0) {
        tarjeta.classList.add("tarjeta--agotada", "tarjeta-agotado");
      }

      // Imagen
      const img = document.createElement("img");
      img.src = p.imagen;
      img.alt = p.nombre;
      img.classList.add("tarjeta__imagen", "tarjeta-imagen");
      tarjeta.append(img);

      // Contenedor de la información de la tarjeta
      const cuerpo = document.createElement("div");
      cuerpo.classList.add("tarjeta__cuerpo", "tarjeta-cuerpo");

      const cat = document.createElement("span");
      cat.classList.add("tarjeta__categoria", "tarjeta-categoria");
      cat.textContent = p.categoria;
      cuerpo.append(cat);

      const nom = document.createElement("h3");
      nom.classList.add("tarjeta__nombre", "tarjeta-nombre");
      nom.textContent = p.nombre;
      cuerpo.append(nom);

      const precio = document.createElement("p");
      precio.classList.add("tarjeta__precio", "tarjeta-precio");
      precio.textContent = this.pesos.format(p.precio);
      cuerpo.append(precio);

      const stock = document.createElement("p");
      stock.classList.add("tarjeta__stock", "tarjeta-stock");
      stock.textContent = p.cantidad === 0 ? "¡Producto Agotado!" : `Stock: ${p.cantidad} unidades`;
      cuerpo.append(stock);

      // Botones de acción en la tarjeta
      const acciones = document.createElement("div");
      acciones.classList.add("tarjeta__acciones", "tarjeta-acciones");
      acciones.append(
        this.boton("Editar", "editar", p.id, "boton boton--editar btn-editar"),
        this.boton("Eliminar", "eliminar", p.id, "boton boton--eliminar btn-eliminar")
      );
      cuerpo.append(acciones);

      tarjeta.append(cuerpo);
      contenedor.append(tarjeta);
    });
  },

  // Marco o desmarco una tarjeta cuando el usuario le hace clic
  alternarSeleccionTarjeta(tarjeta) {
    if (tarjeta) {
      tarjeta.classList.toggle("tarjeta--seleccionada");
      tarjeta.classList.toggle("tarjeta-seleccionada");
    }
  },

  // Función de apoyo para crear botones asignándoles data-accion y data-id
  boton(texto, accion, id, clase) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = texto;
    b.className = clase;
    b.dataset.accion = accion;
    b.dataset.id = id;
    return b;
  },

  // Actualizo los valores del resumen en el panel lateral
  pintarResumen(totalRegistros, agotados, totalUnidades, valorInventario) {
    document.querySelector("#metrica-total-registros").textContent = totalRegistros;
    document.querySelector("#metrica-agotados").textContent = agotados;
    document.querySelector("#metrica-total-unidades").textContent = totalUnidades;
    document.querySelector("#metrica-valor-inventario").textContent = this.pesos.format(valorInventario);
  },

  // Creo los botones de filtro por categoría en el aside y actualizo el selector de la tabla
  pintarCategorias(categorias, categoriaActiva) {
    const contenedor = document.querySelector("#contenedor-botones-categorias");
    contenedor.replaceChildren();

    categorias.forEach((cat) => {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.classList.add("boton-categoria", "btn-categoria");
      if (cat === categoriaActiva) {
        boton.classList.add("boton-categoria--activo", "filtro-activo");
      }
      boton.dataset.categoria = cat;
      boton.textContent = cat;
      contenedor.append(boton);
    });

    // También mantengo actualizado el select de categorías de la tabla
    const selectCatTabla = document.querySelector("#filtro-categoria-tabla");
    if (selectCatTabla) {
      selectCatTabla.replaceChildren();
      categorias.forEach((cat) => {
        const opcion = document.createElement("option");
        opcion.value = cat;
        opcion.textContent = cat === "Todas" ? "Todas las categorías" : cat;
        selectCatTabla.append(opcion);
      });
      selectCatTabla.value = categoriaActiva;
    }
  },

  // Mantengo sincronizados los buscadores y filtros en pantalla
  sincronizarControlesFiltro({ textoBusqueda, categoria, estado }) {
    const buscadorCatalogo = document.querySelector("#input-buscador");
    const buscadorTabla = document.querySelector("#input-buscador-tabla");
    const selectCatTabla = document.querySelector("#filtro-categoria-tabla");
    const selectEstadoTabla = document.querySelector("#filtro-estado-tabla");

    if (buscadorCatalogo && buscadorCatalogo.value !== textoBusqueda) {
      buscadorCatalogo.value = textoBusqueda;
    }
    if (buscadorTabla && buscadorTabla.value !== textoBusqueda) {
      buscadorTabla.value = textoBusqueda;
    }
    if (selectCatTabla) {
      selectCatTabla.value = categoria;
    }
    if (selectEstadoTabla) {
      selectEstadoTabla.value = estado;
    }
  },

  // Leo lo que el usuario escribió en el formulario y lo entrego en un objeto
  leerFormulario() {
    const textoPrecio = document.querySelector("#campo-precio").value.trim();
    const textoCantidad = document.querySelector("#campo-cantidad").value.trim();

    return {
      nombre: document.querySelector("#campo-nombre").value,
      precio: textoPrecio === "" ? NaN : Number(textoPrecio),
      cantidad: textoCantidad === "" ? NaN : Number(textoCantidad),
      categoria: document.querySelector("#campo-categoria").value,
      imagen: document.querySelector("#campo-imagen").value || "img/pendon.svg"
    };
  },

  // Cargo los datos de un producto en el formulario para editarlo
  llenarFormulario(p) {
    document.querySelector("#campo-nombre").value = p.nombre;
    document.querySelector("#campo-precio").value = p.precio;
    document.querySelector("#campo-cantidad").value = p.cantidad;
    document.querySelector("#campo-categoria").value = p.categoria;
    document.querySelector("#campo-imagen").value = p.imagen;

    // Cambio el texto del botón y hago visible el botón de cancelar
    document.querySelector("#btn-guardar-producto").textContent = "Guardar cambios";
    document.querySelector("#btn-cancelar").hidden = false;
  },

  // Desplazo la pantalla hacia el formulario cuando se edita un registro
  desplazarAlFormulario() {
    const seccionRegistro = document.querySelector("#seccion-registro");
    if (seccionRegistro) {
      seccionRegistro.scrollIntoView({ behavior: "smooth" });
    }
  },

  // Reseteo los campos y devuelvo el formulario a su estado original
  limpiarFormulario() {
    document.querySelector("#formulario-producto").reset();
    document.querySelector("#btn-guardar-producto").textContent = "Agregar Registro";
    document.querySelector("#btn-cancelar").hidden = true;
  },

  // Muestro los avisos de error o de éxito al usuario
  mostrarMensaje(texto, tipo) {
    const msgError = document.querySelector("#mensaje-error-registro");
    const msgExito = document.querySelector("#mensaje-exito-registro");

    if (tipo === "error") {
      msgError.textContent = texto;
      msgError.classList.remove("oculto");
      msgExito.classList.add("oculto");
    } else {
      msgExito.textContent = texto;
      msgExito.classList.remove("oculto");
      msgError.classList.add("oculto");
    }
  },

  // Oculto los avisos para limpiar la pantalla
  limpiarMensajes() {
    document.querySelector("#mensaje-error-registro").classList.add("oculto");
    document.querySelector("#mensaje-exito-registro").classList.add("oculto");
  },

  // Muestro u oculto el indicador de carga mientras responde la API
  mostrarCargandoApi(cargando) {
    const indicador = document.querySelector("#indicador-carga-api");
    const btnConsultar = document.querySelector("#btn-consultar-api");
    const msgError = document.querySelector("#mensaje-error-api");

    if (cargando) {
      indicador.classList.remove("oculto");
      msgError.classList.add("oculto");
      btnConsultar.disabled = true;
    } else {
      indicador.classList.add("oculto");
      btnConsultar.disabled = false;
    }
  },

  // Muestro un mensaje amable si la API falla o no hay internet
  mostrarErrorApi(mensaje) {
    const msgError = document.querySelector("#mensaje-error-api");
    const contenedorDatos = document.querySelector("#contenedor-resultados-api");

    msgError.textContent = mensaje;
    msgError.classList.remove("oculto");
    if (contenedorDatos) {
      contenedorDatos.classList.add("oculto");
    }
  },

  // Pinto en la interfaz el historial de la TRM recibido desde datos.gov.co
  pintarDatosApi({ registros, promedioTrm, trmActual }, productosEnDolares) {
    const contenedorDatos = document.querySelector("#contenedor-resultados-api");
    const msgError = document.querySelector("#mensaje-error-api");
    const elTrmActual = document.querySelector("#api-trm-actual");
    const elTrmPromedio = document.querySelector("#api-trm-promedio");
    const listaHistorial = document.querySelector("#lista-historial-trm");

    msgError.classList.add("oculto");
    contenedorDatos.classList.remove("oculto");

    elTrmActual.textContent = `${this.pesosTrm.format(trmActual)} COP`;
    elTrmPromedio.textContent = `${this.pesosTrm.format(promedioTrm)} COP`;

    listaHistorial.replaceChildren();
    registros.forEach((reg) => {
      const item = document.createElement("article");
      item.classList.add("panel-api__tarjeta");

      const fecha = document.createElement("span");
      fecha.classList.add("panel-api__fecha");
      fecha.textContent = `Vigencia: ${reg.vigenciaDesde} al ${reg.vigenciaHasta}`;

      const valor = document.createElement("strong");
      valor.classList.add("panel-api__valor");
      valor.textContent = `${this.pesosTrm.format(reg.valor)} ${reg.unidad}`;

      item.append(fecha, valor);
      listaHistorial.append(item);
    });

    this.pintarConversionUsd(productosEnDolares);
  },

  // Pinto la lista de productos con su precio equivalente en dólares (USD)
  pintarConversionUsd(productosEnDolares) {
    const cuerpoUsd = document.querySelector("#cuerpo-tabla-usd");
    if (!cuerpoUsd) return;

    cuerpoUsd.replaceChildren();

    productosEnDolares.forEach((item) => {
      const fila = document.createElement("tr");

      const celdaNombre = document.createElement("td");
      celdaNombre.textContent = item.nombre;

      const celdaCat = document.createElement("td");
      celdaCat.textContent = item.categoria;

      const celdaCop = document.createElement("td");
      celdaCop.textContent = this.pesos.format(item.precioCop);

      const celdaUsd = document.createElement("td");
      celdaUsd.className = "panel-api__celda-usd";
      celdaUsd.textContent = `${this.dolares.format(item.precioUsd)} USD`;

      fila.append(celdaNombre, celdaCat, celdaCop, celdaUsd);
      cuerpoUsd.append(fila);
    });
  },

  // Genero y descargo el archivo CSV en el navegador
  descargarArchivoCsv(contenidoCsv, nombreArchivo) {
    // Agrego el BOM (\uFEFF) para que Excel reconozca bien las tildes y la ñ
    const archivo = new Blob(["\uFEFF" + contenidoCsv], { type: "text/csv;charset=utf-8;" });
    const enlace = document.createElement("a");
    const urlDescarga = URL.createObjectURL(archivo);

    enlace.href = urlDescarga;
    enlace.download = nombreArchivo;
    document.body.append(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(urlDescarga);
  },

  // Leo y muestro confirmación del formulario de contacto sin que el controlador toque el DOM
  procesarEnvioContacto() {
    const formContacto = document.querySelector("#formulario-contacto");
    const inputNombre = document.querySelector("#contacto-nombre");
    const msgContacto = document.querySelector("#mensaje-exito-contacto");

    const nombreCliente = inputNombre ? inputNombre.value.trim() : "";
    if (msgContacto) {
      msgContacto.textContent = `Gracias ${nombreCliente}, hemos recibido tu mensaje. Nos comunicaremos pronto contigo.`;
      msgContacto.classList.remove("oculto");
    }
    if (formContacto) {
      formContacto.reset();
    }
  }
};
