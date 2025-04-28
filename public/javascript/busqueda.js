document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("buscador-global");
  const modal = document.getElementById("modal-busqueda");
  const resultados = document.getElementById("resultados-busqueda");
  const cerrar = document.getElementById("cerrar-modal");

  let timeout = null;

  input.addEventListener("input", function () {
    clearTimeout(timeout);
    const query = this.value.trim();

    if (query.length === 0) {
      modal.classList.add("hidden");
      resultados.innerHTML = "";
      return;
    }

    timeout = setTimeout(() => {
      fetch(`/buscar?query=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(productos => {
          resultados.innerHTML = "";

          if (!productos.length) {
            resultados.innerHTML = "<p>No se encontraron productos.</p>";
            modal.classList.remove("hidden");
            return;
          }

          productos.forEach(producto => {
            // Obtener imagen
            let imagen = "/images/default.jpg";

            if (Array.isArray(producto.imagenes) && producto.imagenes.length > 0) {
              imagen = producto.imagenes[0]; // ✅ porque es un string

            } else {
              imagen = '/images/no-image.png'; // imagen por defecto
            }
            

            // Obtener precio mínimo
            let precioMinimo = "Sin precio";
            if (Array.isArray(producto.tallas) && producto.tallas.length > 0) {
              const precios = producto.tallas
              .filter(t => !isNaN(parseFloat(t.precio)))
              .map(t => parseFloat(t.precio));
              if (precios.length > 0) {
                precioMinimo = `Desde ${Math.min(...precios)}€`;
              }
            }

            // Construir tarjeta
            const card = document.createElement("a");
            card.href = `/producto/${producto._id}`;
            card.className = "card-producto-link";

            card.innerHTML = `
              <div class="card-producto">
                <img src="${imagen}" alt="${producto.nombre}" class="img-producto" />
                <h3 class="nombre-producto">${producto.nombre}</h3>
                <p class="precio-producto">${precioMinimo}</p>
              </div>
            `;

            resultados.appendChild(card);
          });

          modal.classList.remove("hidden");
        })
        .catch(error => {
          console.error("Error al buscar:", error);
        });
    }, 300);
  });

  cerrar.addEventListener("click", () => {
    modal.classList.add("hidden");
  });
});

