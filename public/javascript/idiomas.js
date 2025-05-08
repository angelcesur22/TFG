// /public/javascript/idiomas.js
document.addEventListener("DOMContentLoaded", () => {
    const idiomaToggle = document.getElementById("idioma-toggle");
    const idiomaMenu = document.getElementById("idioma-menu");
    const opciones = document.querySelectorAll(".idioma-opcion");
    const idiomaActualImg = document.getElementById("idioma-actual");

    idiomaToggle.addEventListener("click", () => {
        idiomaMenu.classList.toggle("show");
    });

    opciones.forEach(opcion => {
        opcion.addEventListener("click", () => {
            const idioma = opcion.dataset.idioma;
            localStorage.setItem("idioma", idioma);
            aplicarIdioma(idioma);
            idiomaActualImg.src = idioma === "es" ? "/images/espana.svg" : "/images/ingles.svg";
            idiomaMenu.classList.remove("show");
        });
    });

    const idiomaActual = localStorage.getItem("idioma") || "es";
    idiomaActualImg.src = idiomaActual === "es" ? "/images/espana.svg" : "/images/ingles.svg";
    aplicarIdioma(idiomaActual);

    function aplicarIdioma(idioma) {
        document.querySelectorAll(".traduccion").forEach(el => {
            const textoTraducido = el.dataset[idioma];
            if (textoTraducido) {
                if (el.tagName.toLowerCase() === "input" || el.tagName.toLowerCase() === "textarea") {
                    el.placeholder = textoTraducido; // Para inputs y textareas
                } else {
                    el.textContent = textoTraducido; // Para otros elementos
                }
            }
        });
    }

    // Ocultar menú al hacer clic fuera
    document.addEventListener("click", (e) => {
        if (!idiomaToggle.contains(e.target) && !idiomaMenu.contains(e.target)) {
            idiomaMenu.classList.remove("show");
        }
    });
});
