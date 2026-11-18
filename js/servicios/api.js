// =======================================================
// CAPA DE SERVICIOS (js/servicios/api.js)
// En este archivo separo el consumo de la API pública de la vista y del modelo.
// Consumo la API REST de Datos Abiertos de Colombia (datos.gov.co) para consultar
// la TRM oficial (Tasa Representativa del Mercado) y cotizar nuestros productos en dólares.
// =======================================================

const ServicioApi = {
  // Endpoint oficial de la TRM en datos.gov.co (funciona sobre la API SODA de Socrata)
  urlBase: "https://www.datos.gov.co/resource/32sa-8pi3.json",

  // Función asíncrona para pedir los últimos registros de la TRM usando fetch y async/await
  async consultarTrm(limite = 5) {
    // Armo la URL con parámetros SoQL ($limit y $order) como vimos en la clase de APIs
    const url = `${this.urlBase}?$limit=${limite}&$order=vigenciadesde DESC`;

    // Hago la petición HTTP GET esperando la respuesta con await
    const respuesta = await fetch(url);

    // Reviso response.ok porque fetch no lanza error solo con códigos 404 o 500
    if (!respuesta.ok) {
      throw new Error(`Error al consultar la API (Código HTTP: ${respuesta.status})`);
    }

    // Convierto el cuerpo de la respuesta de JSON a un arreglo de objetos de JavaScript
    const datosJson = await respuesta.json();

    // Verifico que la API haya devuelto un arreglo con al menos un registro
    if (!Array.isArray(datosJson) || datosJson.length === 0) {
      throw new Error("La API no devolvió registros disponibles de la TRM.");
    }

    // Transformo los datos recibidos con map para quedarme solo con lo que necesita la interfaz
    const registros = datosJson.map((item) => {
      const valorNumerico = Number(item.valor);
      const fechaDesde = item.vigenciadesde ? item.vigenciadesde.slice(0, 10) : "Sin fecha";
      const fechaHasta = item.vigenciahasta ? item.vigenciahasta.slice(0, 10) : "Sin fecha";

      return {
        valor: valorNumerico,
        unidad: item.unidad || "COP",
        vigenciaDesde: fechaDesde,
        vigenciaHasta: fechaHasta
      };
    });

    // Calculo el promedio de la TRM en los días consultados usando reduce
    const sumaTrm = registros.reduce((acumulador, item) => acumulador + item.valor, 0);
    const promedioTrm = registros.length > 0 ? sumaTrm / registros.length : 0;
    const trmActual = registros.length > 0 ? registros[0].valor : 0;

    return {
      registros,
      promedioTrm,
      trmActual
    };
  }
};
