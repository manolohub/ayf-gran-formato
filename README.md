# AyF Gran Formato - Sistema de Catálogo y Gestión de Inventario

**Institución:** Institución Universitaria Pascual Bravo  
**Programa:** Ingeniería de Software (Nivel 6)  
**Curso:** Herramientas de Programación III (ET0056) - Grupo 053 (2026-2)  
**Docente:** Luis Fernando Londoño López  

---

## 1. Integrantes del Equipo y Tabla de Aportes
- **Tomás Bustamante** (Equipo Bustamante)

| Integrante | Aportes Principales | Enlace al Repositorio / Commits |
| :--- | :--- | :--- |
| **Tomás Bustamante** | Diseño semántico HTML5 y estilos CSS3 BEM responsivos; capa Modelo (`modelo.js`) con CRUD, validaciones, métodos de arreglos (`map`, `filter`, `find`, `reduce`, `sort`) y `localStorage`; capa Vista (`vista.js`) con DOM seguro (`textContent`); capa Controlador (`controlador.js`) con delegación, filtros, ordenamiento, paginación y exportación CSV; servicio API REST (`api.js` - `datos.gov.co`); documentación oficial y manuales. | https://github.com/manolohub/ayf-gran-formato/commits/main |

---

## 2. Descripción del Dominio
**AyF Gran Formato** es un taller de impresión digital y publicidad exterior ubicado en Medellín, Colombia. En el negocio manejamos productos de impresión a gran escala como pendones publicitarios, vinilos adhesivos (mate y brillante vehicular), laminados de protección, stickers troquelados y avisos rígidos en acrílico.

Esta aplicación web nos permite:
1. Gestionar el inventario completo del taller con operaciones **CRUD** (crear, consultar, editar y eliminar productos) y persistencia en `localStorage`.
2. Visualizar métricas en tiempo real (total de registros, agotados, unidades en stock y valor total del inventario en pesos colombianos).
3. Consultar y administrar una **tabla de datos** con búsqueda en vivo, filtros combinados (categoría y estado de stock), ordenamiento por columna, paginación y descarga a archivo **CSV**.
4. Consumir la **API REST pública de Datos Abiertos de Colombia (`datos.gov.co`)** para consultar la **TRM oficial (Tasa Representativa del Mercado - Dólar)** y calcular automáticamente el precio en dólares (USD) de nuestros productos e insumos importados.

---

## 3. Estructura del Proyecto y Arquitectura por Capas
Organizamos el proyecto separando claramente las responsabilidades en capas para que la vista nunca guarde datos y el modelo nunca toque el DOM:

```text
trabajo-herramientas/
├── index.html                  # Estructura semántica HTML5
├── README.md                   # Documentación del proyecto y de la API
├── css/
│   └── estilos.css             # Estilos CSS3 con metodología BEM, Flexbox y Grid
├── js/
│   ├── modelo/
│   │   └── modelo.js           # Datos iniciales, validaciones, métodos de arreglos y localStorage
│   ├── servicios/
│   │   └── api.js              # Consumo de la API REST de datos.gov.co con fetch y async/await
│   ├── vista/
│   │   └── vista.js            # Manipulación del DOM con createElement y textContent
│   ├── controlador/
│   │   └── controlador.js      # Eventos, delegación, filtros, paginación y coordinación
│   └── app.js                  # Punto de arranque de la aplicación
└── img/                        # Ilustraciones vectoriales (SVG) propias de los productos
```

---

## 4. Cómo Ejecutar el Proyecto en VS Code (Live Server)
1. Abrir la carpeta del proyecto en **Visual Studio Code**.
2. Tener instalada la extensión **Live Server** (de Ritwick Dey).
3. Hacer clic derecho sobre el archivo `index.html` y seleccionar **"Open with Live Server"** (o hacer clic en el botón **Go Live** en la esquina inferior derecha de VS Code).
4. La aplicación se abrirá automáticamente en el navegador (por ejemplo en `http://127.0.0.1:5500/index.html`).

### Enlace de la Aplicación Publicada
- **GitHub Pages:** https://manolohub.github.io/ayf-gran-formato/
- **Repositorio en GitHub:** https://github.com/manolohub/ayf-gran-formato

---

## 5. Normas de Codificación Acordadas por el Equipo
Para mantener el código limpio y fácil de entender por todos los integrantes, aplicamos estas reglas en todo el proyecto:
- **Nombres en `camelCase`:** Todas las variables, funciones y propiedades en JavaScript usan `camelCase` en español (por ejemplo: `productosFiltrados`, `categoriaSeleccionada`, `cargarDatosApi`). Los objetos principales de cada capa inician con mayúscula (`Modelo`, `Vista`, `Controlador`, `ServicioApi`) y las constantes globales van en mayúscula (`CLAVE`).
- **Clases CSS con metodología BEM:** Usamos la convención `bloque__elemento--modificador` (por ejemplo: `.tarjeta`, `.tarjeta__nombre`, `.tarjeta--agotada`, `.tabla-datos__th--ordenable`, `.panel-api__tarjeta`).
- **Sangría:** 2 espacios en los archivos JavaScript y 4 espacios en HTML y CSS.
- **Comentarios en español:** Comentarios claros en primera persona explicando el propósito de cada bloque o función.
- **Seguridad en el DOM:** Uso exclusivo de `document.createElement()` y `textContent` para pintar datos en pantalla, evitando `innerHTML`.
- **Limpieza:** Código sin funciones muertas ni `console.log` de prueba.

---

## 6. Documentación de la API REST Consumida
Consumimos la API pública del portal de **Datos Abiertos del Estado Colombiano (`datos.gov.co`)**, que funciona sobre la API SODA de Socrata y no requiere llave privada para consultas públicas:

- **Nombre del conjunto de datos:** Tasa de Cambio Representativa del Mercado - Histórico (Superintendencia Financiera de Colombia).
- **URL Base:** `https://www.datos.gov.co/resource`
- **Endpoint:** `/32sa-8pi3.json`
- **Método HTTP:** `GET`
- **Parámetros SoQL utilizados:**
  - `$limit`: Cantidad de registros a consultar (5, 8 o 12 días recientes).
  - `$order`: `vigenciadesde DESC` (para traer primero la tasa vigente más reciente).
- **URL completa de ejemplo:**  
  `https://www.datos.gov.co/resource/32sa-8pi3.json?$limit=5&$order=vigenciadesde DESC`
- **Ejemplo real del JSON de respuesta (Estado `200 OK`):**
```json
[
  {
    "valor": "3269.88",
    "unidad": "COP",
    "vigenciadesde": "2026-11-10T00:00:00.000",
    "vigenciahasta": "2026-11-10T00:00:00.000"
  },
  {
    "valor": "3237.83",
    "unidad": "COP",
    "vigenciadesde": "2026-11-07T00:00:00.000",
    "vigenciahasta": "2026-11-09T00:00:00.000"
  }
]
```

---

## 7. Fuentes de Documentación Oficial Consultadas
1. **MDN Web Docs - Usando Fetch (`fetch`, `async/await` y `response.ok`):**  
   - **Enlace:** https://developer.mozilla.org/es/docs/Web/API/Fetch_API/Using_Fetch  
   - **Para qué nos sirvió:** Para estructurar la petición HTTP `GET` en `js/servicios/api.js` usando `async/await`, entender por qué `fetch` solo rechaza la promesa ante fallos de red y por qué es obligatorio verificar `respuesta.ok` para detectar errores HTTP como 404 o 500.
2. **MDN Web Docs - `Array.prototype.reduce()`, `map()`, `filter()`, `find()` y `sort()`:**  
   - **Enlace:** https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array  
   - **Para qué nos sirvió:** Para implementar en `js/modelo/modelo.js` y `js/servicios/api.js` el cálculo del valor total del inventario y el promedio de la TRM con `reduce`, el ordenamiento por columnas de la tabla con `sort` y `localeCompare`, los filtros combinados con `filter` y la conversión de precios a dólares con `map`.
3. **MDN Web Docs - `Window.localStorage`:**  
   - **Enlace:** https://developer.mozilla.org/es/docs/Web/API/Window/localStorage  
   - **Para qué nos sirvió:** Para guardar y recuperar el arreglo de productos del taller usando `localStorage.setItem()`, `localStorage.getItem()`, `JSON.stringify()` y `JSON.parse()`, asegurando que los cambios del CRUD permanezcan al recargar la página.
4. **MDN Web Docs - `Node.textContent` vs `Element.innerHTML`:**  
   - **Enlace:** https://developer.mozilla.org/es/docs/Web/API/Node/textContent  
   - **Para qué nos sirvió:** Para pintar de forma segura en `js/vista/vista.js` los datos ingresados por el usuario y los datos provenientes de la API sin riesgo de inyección de código HTML/XSS.
5. **Documentación Oficial Socrata Open Data API (SODA) - `datos.gov.co`:**  
   - **Enlace:** https://dev.socrata.com/docs/queries/  
   - **Para qué nos sirvió:** Para aprender a usar los parámetros de consulta SoQL `$limit` y `$order=vigenciadesde DESC` al consumir el recurso `32sa-8pi3.json` de Datos Abiertos de Colombia.

---

## 8. Recursos y Uso Ético de Herramientas
- **Imágenes y recursos gráficos:** Los íconos e ilustraciones en la carpeta `img/` (`loguito.svg`, `pendon.svg`, `vinilo-mate.svg`, `vinilo-brillante.svg`, `laminado.svg`, `stickers.svg`, `acrilico.svg`) son gráficos vectoriales SVG propios elaborados para el catálogo del proyecto. No se utilizan librerías externas de CSS ni de JavaScript.
- **Declaración sobre apoyo de IA:** Se utilizó asistencia de IA como apoyo de estudio para revisar la estructura del documento de requisitos, verificar cómo agregar la marca de orden de bytes (`\uFEFF`) al exportar archivos CSV con tildes para Excel y repasar el consumo del endpoint de la TRM en `datos.gov.co`. Todo el código fue revisado, probado en el navegador y contrastado con la documentación oficial de MDN Web Docs.
