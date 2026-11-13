// =======================================================
// CAPA DEL MODELO (js/modelo/modelo.js)
// Aquí manejo los datos, el almacenamiento en localStorage y las reglas de negocio.
// Como aprendimos en clase, este archivo nunca debe tocar el DOM ni el HTML.
// =======================================================

// Clave propia de nuestro equipo para guardar en el localStorage del navegador
const CLAVE = "equipo-tomas-inventario";

// Arreglo con los productos iniciales de nuestro taller (AyF Gran Formato)
const productosIniciales = [
  {
    id: 1,
    nombre: "Pendón Roller 80x200",
    precio: 65000,
    categoria: "Publicidad",
    cantidad: 15,
    imagen: "img/pendon.svg"
  },
  {
    id: 2,
    nombre: "Vinilo Adhesivo Mate 1m",
    precio: 28000,
    categoria: "Vinilos",
    cantidad: 24,
    imagen: "img/vinilo-mate.svg"
  },
  {
    id: 3,
    nombre: "Vinilo Brillante Vehicular",
    precio: 36000,
    categoria: "Vinilos",
    cantidad: 0,
    imagen: "img/vinilo-brillante.svg"
  },
  {
    id: 4,
    nombre: "Laminado Mate Antirreflejo",
    precio: 22000,
    categoria: "Acabados",
    cantidad: 18,
    imagen: "img/laminado.svg"
  },
  {
    id: 5,
    nombre: "Stickers Troquelados x100",
    precio: 45000,
    categoria: "Stickers",
    cantidad: 30,
    imagen: "img/stickers.svg"
  },
  {
    id: 6,
    nombre: "Aviso en Acrílico 40x60",
    precio: 95000,
    categoria: "Rigidos",
    cantidad: 5,
    imagen: "img/acrilico.svg"
  }
];

const Modelo = {
  // Arreglo donde mantengo los productos en memoria
  productos: [],

  // Cargo los datos desde localStorage; si todavía no hay nada guardado, uso los datos de ejemplo
  cargar() {
    try {
      const guardado = localStorage.getItem(CLAVE);
      const datos = guardado ? JSON.parse(guardado) : null;
      this.productos = Array.isArray(datos)
        ? datos
        : productosIniciales.map((p) => ({ ...p }));
    } catch (error) {
      this.productos = productosIniciales.map((p) => ({ ...p }));
    }
  },

  // Convierto el arreglo a texto con JSON y lo guardo en localStorage
  guardar() {
    localStorage.setItem(CLAVE, JSON.stringify(this.productos));
  },

  // Reglas de negocio: reviso los datos y devuelvo la lista de errores (o vacía si todo está bien)
  validar({ id, nombre, precio, cantidad, categoria }) {
    const errores = [];

    // Regla 1: Reviso que el nombre tenga al menos 3 letras
    if (!nombre || nombre.trim().length < 3) {
      errores.push("El nombre debe tener al menos 3 letras.");
    }

    // Regla 2: Verifico que hayan seleccionado una categoría
    if (!categoria || categoria.trim() === "") {
      errores.push("Debes seleccionar una categoría.");
    }

    // Regla 3: El precio debe ser un número positivo mayor a 0
    if (typeof precio !== "number" || isNaN(precio) || precio <= 0) {
      errores.push("El precio debe ser mayor que cero.");
    }

    // Regla 4: La cantidad debe ser un número entero y no puede ser negativa
    if (typeof cantidad !== "number" || isNaN(cantidad) || !Number.isInteger(cantidad) || cantidad < 0) {
      errores.push("La cantidad debe ser un entero mayor o igual a cero.");
    }

    // Regla 5: Reviso que no se repita el nombre (con p.id !== id permito editar sin chocar con el mismo)
    const nombreLimpio = nombre ? nombre.trim().toLowerCase() : "";
    const repetido = this.productos.some(
      (p) => p.nombre.toLowerCase() === nombreLimpio && p.id !== id
    );
    if (repetido) {
      errores.push("Ya existe un producto con ese nombre.");
    }

    return errores;
  },

  // CREATE: agrego un nuevo producto calculando el nuevo id con reduce
  agregar(datos) {
    const nuevoId = this.productos.reduce((max, p) => Math.max(max, p.id), 0) + 1;
    this.productos.push({
      id: nuevoId,
      nombre: datos.nombre.trim(),
      precio: datos.precio,
      cantidad: datos.cantidad,
      categoria: datos.categoria,
      imagen: datos.imagen || "img/pendon.svg"
    });
    this.guardar();
  },

  // READ: busco un producto por su id con find
  buscarPorId(id) {
    return this.productos.find((p) => p.id === id);
  },

  // UPDATE: reemplazo el producto editado usando map
  actualizar(id, datos) {
    this.productos = this.productos.map((p) =>
      p.id === id
        ? {
            ...p,
            nombre: datos.nombre.trim(),
            precio: datos.precio,
            cantidad: datos.cantidad,
            categoria: datos.categoria,
            imagen: datos.imagen || p.imagen
          }
        : p
    );
    this.guardar();
  },

  // DELETE: elimino el producto usando filter
  eliminar(id) {
    this.productos = this.productos.filter((p) => p.id !== id);
    this.guardar();
  },

  // Filtro combinado usando filter: texto de búsqueda + categoría + estado de stock
  filtrar({ textoBusqueda = "", categoria = "Todas", estado = "todos" }) {
    const texto = textoBusqueda.trim().toLowerCase();

    return this.productos.filter((p) => {
      const coincideCategoria = categoria === "Todas" || p.categoria === categoria;
      const coincideTexto =
        texto === "" ||
        p.nombre.toLowerCase().includes(texto) ||
        p.categoria.toLowerCase().includes(texto);

      let coincideEstado = true;
      if (estado === "disponibles") {
        coincideEstado = p.cantidad > 0;
      } else if (estado === "agotados") {
        coincideEstado = p.cantidad === 0;
      }

      return coincideCategoria && coincideTexto && coincideEstado;
    });
  },

  // Ordeno una copia de la lista por la columna elegida usando sort
  ordenar(lista, columna = "id", direccion = "asc") {
    const copia = [...lista];
    const factor = direccion === "asc" ? 1 : -1;

    return copia.sort((a, b) => {
      if (columna === "nombre" || columna === "categoria") {
        return a[columna].localeCompare(b[columna], "es") * factor;
      }
      return (a[columna] - b[columna]) * factor;
    });
  },

  // Obtengo las categorías únicas usando map
  obtenerCategorias() {
    const nombresCategorias = this.productos.map((p) => p.categoria);
    return ["Todas", ...new Set(nombresCategorias)];
  },

  // Calculo el valor total del inventario usando reduce
  valorTotal() {
    return this.productos.reduce((total, p) => total + p.precio * p.cantidad, 0);
  },

  // Sumo la cantidad total de unidades en stock con reduce
  totalUnidades() {
    return this.productos.reduce((total, p) => total + p.cantidad, 0);
  },

  // Cuento los productos agotados (stock 0) con filter
  productosAgotados() {
    return this.productos.filter((p) => p.cantidad === 0).length;
  },

  // Transformo los productos con map para calcular su precio en dólares según la TRM de la API
  convertirPreciosADolares(valorTrm) {
    if (!valorTrm || valorTrm <= 0) return [];

    return this.productos.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      categoria: p.categoria,
      precioCop: p.precio,
      precioUsd: p.precio / valorTrm
    }));
  },

  // Armo el texto en formato CSV usando map para exportar los datos de la tabla
  generarCsv(listaProductos) {
    const encabezados = ["ID", "Nombre", "Categoria", "Precio COP", "Cantidad", "Estado"];
    const filas = listaProductos.map((p) => {
      const estado = p.cantidad > 0 ? "Disponible" : "Agotado";
      const nombreSeguro = `"${p.nombre.replace(/"/g, '""')}"`;
      return [p.id, nombreSeguro, p.categoria, p.precio, p.cantidad, estado].join(",");
    });

    return [encabezados.join(","), ...filas].join("\n");
  },

  // Borro la clave de localStorage y vuelvo a cargar los productos de prueba
  restaurarEjemplo() {
    localStorage.removeItem(CLAVE);
    this.cargar();
  }
};
