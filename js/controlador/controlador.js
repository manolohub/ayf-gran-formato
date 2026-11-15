// =======================================================
// CONTROLADOR (js/controlador/controlador.js)
// Aquí coordino el modelo, el servicio de API y la vista: escucho lo que hace el usuario,
// le pido los datos al modelo o a la API y le digo a la vista qué pintar.
// Siguiendo la regla de capas, aquí no pongo reglas de negocio ni modifico el DOM directamente.
// =======================================================

const Controlador = {
  // Estado actual de la aplicación para edición, filtros, ordenamiento y paginación
  idEditando: null,
  categoriaSeleccionada: "Todas",
  estadoSeleccionado: "todos",
  textoBusqueda: "",
  columnaOrden: "id",
  direccionOrden: "asc",
  paginaActual: 1,
  filasPorPagina: 4,
  limiteApi: 5,
  ultimoResultadoApi: null,

  // Función principal donde inicio la aplicación
  iniciar() {
    // 1. Le pido al modelo que cargue los datos (desde localStorage o los iniciales)
    Modelo.cargar();

    // 2. Mando a pintar la interfaz por primera vez
    this.refrescar();

    // 3. Asigno los eventos de la página
    this.registrarEventos();

    // 4. Consulto la API pública de datos.gov.co al iniciar
    this.cargarDatosApi();
  },

  // Agrupo todos los addEventListener de la interfaz
  registrarEventos() {
    // Evento del formulario para agregar o guardar cambios
    document.querySelector("#formulario-producto").addEventListener("submit", (e) => {
      e.preventDefault();
      this.guardar();
    });

    // Evento para cancelar la edición y limpiar el formulario
    document.querySelector("#btn-cancelar").addEventListener("click", () => {
      this.cancelarEdicion();
    });

    // Delegación de eventos en el cuerpo de la tabla: editar o eliminar cualquier fila
    document.querySelector("#cuerpo-tabla-resumen").addEventListener("click", (e) => {
      const boton = e.target.closest("button");
      if (!boton) return;
      const { accion, id } = boton.dataset;
      if (accion === "editar") this.editar(Number(id));
      if (accion === "eliminar") this.eliminar(Number(id));
    });

    // Delegación de eventos en los encabezados de la tabla para ordenar por columna
    document.querySelector("#encabezado-tabla").addEventListener("click", (e) => {
      const celdaTitulo = e.target.closest("th[data-columna]");
      if (!celdaTitulo) return;
      this.cambiarOrden(celdaTitulo.dataset.columna);
    });

    // Delegación de eventos en el catálogo de tarjetas para editar, eliminar o seleccionar
    document.querySelector("#contenedor-tarjetas").addEventListener("click", (e) => {
      const boton = e.target.closest("button");
      if (boton && boton.dataset.accion) {
        e.stopPropagation();
        const { accion, id } = boton.dataset;
        if (accion === "editar") this.editar(Number(id));
        if (accion === "eliminar") this.eliminar(Number(id));
        return;
      }

      // Si hace clic en la tarjeta le pido a la vista que alterne su selección visual
      const tarjeta = e.target.closest(".tarjeta-producto");
      if (tarjeta) {
        Vista.alternarSeleccionTarjeta(tarjeta);
      }
    });

    // Buscador en vivo en el catálogo
    document.querySelector("#input-buscador").addEventListener("input", (e) => {
      this.textoBusqueda = e.target.value;
      this.paginaActual = 1;
      this.refrescar();
    });

    // Buscador en vivo en la sección de la tabla
    const buscadorTabla = document.querySelector("#input-buscador-tabla");
    if (buscadorTabla) {
      buscadorTabla.addEventListener("input", (e) => {
        this.textoBusqueda = e.target.value;
        this.paginaActual = 1;
        this.refrescar();
      });
    }

    // Filtro por categoría al hacer clic en los botones del panel lateral
    document.querySelector("#contenedor-botones-categorias").addEventListener("click", (e) => {
      const boton = e.target.closest(".btn-categoria");
      if (!boton) return;
      this.categoriaSeleccionada = boton.dataset.categoria;
      this.paginaActual = 1;
      this.refrescar();
    });

    // Filtro por categoría desde el selector de la tabla
    const selectCatTabla = document.querySelector("#filtro-categoria-tabla");
    if (selectCatTabla) {
      selectCatTabla.addEventListener("change", (e) => {
        this.categoriaSeleccionada = e.target.value;
        this.paginaActual = 1;
        this.refrescar();
      });
    }

    // Filtro por estado de stock (Todos / Disponibles / Agotados) en la tabla
    const selectEstadoTabla = document.querySelector("#filtro-estado-tabla");
    if (selectEstadoTabla) {
      selectEstadoTabla.addEventListener("change", (e) => {
        this.estadoSeleccionado = e.target.value;
        this.paginaActual = 1;
        this.refrescar();
      });
    }

    // Selector de cantidad de filas por página en la tabla
    const selectFilas = document.querySelector("#select-filas-pagina");
    if (selectFilas) {
      selectFilas.addEventListener("change", (e) => {
        this.filasPorPagina = Number(e.target.value);
        this.paginaActual = 1;
        this.refrescar();
      });
    }

    // Botones de paginación (Anterior y Siguiente)
    const btnAnterior = document.querySelector("#btn-pagina-anterior");
    if (btnAnterior) {
      btnAnterior.addEventListener("click", () => {
        if (this.paginaActual > 1) {
          this.paginaActual--;
          this.refrescar();
        }
      });
    }

    const btnSiguiente = document.querySelector("#btn-pagina-siguiente");
    if (btnSiguiente) {
      btnSiguiente.addEventListener("click", () => {
        this.paginaActual++;
        this.refrescar();
      });
    }

    // Botón para exportar la tabla filtrada y ordenada a un archivo CSV
    const btnExportarCsv = document.querySelector("#btn-exportar-csv");
    if (btnExportarCsv) {
      btnExportarCsv.addEventListener("click", () => {
        this.exportarCsv();
      });
    }

    // Controles para consultar la API de datos.gov.co
    const selectLimiteApi = document.querySelector("#select-limite-api");
    if (selectLimiteApi) {
      selectLimiteApi.addEventListener("change", (e) => {
        this.limiteApi = Number(e.target.value);
        this.cargarDatosApi();
      });
    }

    const btnConsultarApi = document.querySelector("#btn-consultar-api");
    if (btnConsultarApi) {
      btnConsultarApi.addEventListener("click", () => {
        this.cargarDatosApi();
      });
    }

    // Botón para restaurar los datos iniciales de ejemplo
    const btnRestaurar = document.querySelector("#btn-restaurar-ejemplo");
    if (btnRestaurar) {
      btnRestaurar.addEventListener("click", () => {
        if (confirm("¿Deseas restaurar los productos iniciales de ejemplo?")) {
          Modelo.restaurarEjemplo();
          this.cancelarEdicion();
          this.textoBusqueda = "";
          this.categoriaSeleccionada = "Todas";
          this.estadoSeleccionado = "todos";
          this.columnaOrden = "id";
          this.direccionOrden = "asc";
          this.paginaActual = 1;
          Vista.mostrarMensaje("Datos de ejemplo restaurados.", "ok");
          this.refrescar();
        }
      });
    }

    // Formulario de contacto
    const formContacto = document.querySelector("#formulario-contacto");
    if (formContacto) {
      formContacto.addEventListener("submit", (e) => {
        e.preventDefault();
        Vista.procesarEnvioContacto();
      });
    }
  },

  // Proceso para guardar: leo el formulario, valido en el modelo y agrego o actualizo
  guardar() {
    Vista.limpiarMensajes();

    const datos = Vista.leerFormulario();
    const errores = Modelo.validar({ id: this.idEditando, ...datos });

    // Si el modelo me devuelve errores, le digo a la vista que los muestre todos juntos
    if (errores.length > 0) {
      Vista.mostrarMensaje(errores.join(" "), "error");
      return;
    }

    // Si idEditando es null significa que estoy creando; si tiene número, estoy editando
    if (this.idEditando === null) {
      Modelo.agregar(datos);
      Vista.mostrarMensaje("Producto agregado exitosamente.", "ok");
    } else {
      Modelo.actualizar(this.idEditando, datos);
      Vista.mostrarMensaje("Producto actualizado exitosamente.", "ok");
    }

    this.cancelarEdicion();
    this.refrescar();
  },

  // Cargo el producto en el formulario para editarlo
  editar(id) {
    this.idEditando = id;
    const producto = Modelo.buscarPorId(id);
    if (producto) {
      Vista.llenarFormulario(producto);
      Vista.limpiarMensajes();
      Vista.desplazarAlFormulario();
    }
  },

  // Cancelo la edición y regreso el formulario al modo de agregar
  cancelarEdicion() {
    this.idEditando = null;
    Vista.limpiarFormulario();
  },

  // Pregunto confirmación antes de borrar y le pido al modelo que elimine
  eliminar(id) {
    const producto = Modelo.buscarPorId(id);
    if (!producto) return;

    if (confirm(`¿Eliminar "${producto.nombre}"?`)) {
      Modelo.eliminar(id);
      if (this.idEditando === id) {
        this.cancelarEdicion();
      }
      Vista.mostrarMensaje("Producto eliminado.", "ok");
      this.refrescar();
    }
  },

  // Cambio la columna o la dirección de ordenamiento (asc / desc) al hacer clic en un th
  cambiarOrden(columna) {
    if (this.columnaOrden === columna) {
      this.direccionOrden = this.direccionOrden === "asc" ? "desc" : "asc";
    } else {
      this.columnaOrden = columna;
      this.direccionOrden = "asc";
    }
    this.paginaActual = 1;
    this.refrescar();
  },

  // Exporto a CSV los registros que están actualmente filtrados y ordenados
  exportarCsv() {
    const filtrados = Modelo.filtrar({
      textoBusqueda: this.textoBusqueda,
      categoria: this.categoriaSeleccionada,
      estado: this.estadoSeleccionado
    });
    const ordenados = Modelo.ordenar(filtrados, this.columnaOrden, this.direccionOrden);
    const contenidoCsv = Modelo.generarCsv(ordenados);
    Vista.descargarArchivoCsv(contenidoCsv, "inventario_ayf_gran_formato.csv");
  },

  // Consumo la API de datos.gov.co manejando errores con try y catch
  async cargarDatosApi() {
    Vista.mostrarCargandoApi(true);

    try {
      const resultadoApi = await ServicioApi.consultarTrm(this.limiteApi);
      this.ultimoResultadoApi = resultadoApi;
      const productosEnDolares = Modelo.convertirPreciosADolares(resultadoApi.trmActual);
      Vista.pintarDatosApi(resultadoApi, productosEnDolares);
    } catch (error) {
      Vista.mostrarErrorApi(
        "No fue posible conectar con el servicio de datos.gov.co en este momento. Revisa tu conexión a internet e intenta nuevamente."
      );
    } finally {
      Vista.mostrarCargandoApi(false);
    }
  },

  // Sincronizo todas las partes de la vista con los datos actuales del modelo
  refrescar() {
    // Si la categoría elegida ya no existe porque se borró su último producto, vuelvo a "Todas"
    const categorias = Modelo.obtenerCategorias();
    if (!categorias.includes(this.categoriaSeleccionada)) {
      this.categoriaSeleccionada = "Todas";
    }

    // 1. Filtro los productos combinando búsqueda, categoría y estado
    const productosFiltrados = Modelo.filtrar({
      textoBusqueda: this.textoBusqueda,
      categoria: this.categoriaSeleccionada,
      estado: this.estadoSeleccionado
    });

    // 2. Ordeno los productos filtrados por la columna seleccionada
    const productosOrdenados = Modelo.ordenar(
      productosFiltrados,
      this.columnaOrden,
      this.direccionOrden
    );

    // 3. Calculo la paginación para la tabla
    const totalPaginas = Math.max(1, Math.ceil(productosOrdenados.length / this.filasPorPagina));
    if (this.paginaActual > totalPaginas) {
      this.paginaActual = totalPaginas;
    }

    const indiceInicio = (this.paginaActual - 1) * this.filasPorPagina;
    const productosPagina = productosOrdenados.slice(
      indiceInicio,
      indiceInicio + this.filasPorPagina
    );

    // 4. Le pido a la vista que pinte cada sección
    Vista.pintarCategorias(categorias, this.categoriaSeleccionada);
    Vista.sincronizarControlesFiltro({
      textoBusqueda: this.textoBusqueda,
      categoria: this.categoriaSeleccionada,
      estado: this.estadoSeleccionado
    });
    Vista.pintarTabla(productosPagina, this.columnaOrden, this.direccionOrden);
    Vista.pintarPaginacion(this.paginaActual, totalPaginas, productosOrdenados.length);
    Vista.pintarTarjetas(productosFiltrados, Modelo.productos.length);
    Vista.pintarResumen(
      Modelo.productos.length,
      Modelo.productosAgotados(),
      Modelo.totalUnidades(),
      Modelo.valorTotal()
    );

    // Si ya teníamos la TRM cargada de la API, actualizo la tabla de precios en dólares
    if (this.ultimoResultadoApi && this.ultimoResultadoApi.trmActual > 0) {
      const productosEnDolares = Modelo.convertirPreciosADolares(this.ultimoResultadoApi.trmActual);
      Vista.pintarConversionUsd(productosEnDolares);
    }
  }
};
