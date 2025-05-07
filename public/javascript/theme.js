// Verificar el tema guardado al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    const temaGuardado = localStorage.getItem("theme");
    if (temaGuardado) {
        document.documentElement.setAttribute("data-theme", temaGuardado);
        actualizarIcono(temaGuardado);
    } else {
        actualizarIcono("light"); // Por defecto, tema claro
    }
});

// Función para cambiar de tema
function toggleTheme() {
    const temaActual = document.documentElement.getAttribute("data-theme");
    const nuevoTema = temaActual === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nuevoTema);
    localStorage.setItem("theme", nuevoTema);
    actualizarIcono(nuevoTema);
}

// Función para actualizar el icono del botón
function actualizarIcono(tema) {
  const icono = document.getElementById("theme-icon");
  if (icono) {
      icono.style.transition = "transform 0.5s";
      icono.style.transform = "rotate(360deg)";
      setTimeout(() => {
        icono.innerHTML = tema === "dark" ? `
        <svg width='24px' height='24px' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
            <circle cx='12' cy='12' r='5' fill='white'></circle>
            <line x1='12' y1='1' x2='12' y2='4' stroke='white' stroke-width='2' stroke-linecap='round'></line>
            <line x1='12' y1='20' x2='12' y2='23' stroke='white' stroke-width='2' stroke-linecap='round'></line>
            <line x1='4.22' y1='4.22' x2='6.34' y2='6.34' stroke='white' stroke-width='2' stroke-linecap='round'></line>
            <line x1='17.66' y1='17.66' x2='19.78' y2='19.78' stroke='white' stroke-width='2' stroke-linecap='round'></line>
            <line x1='1' y1='12' x2='4' y2='12' stroke='white' stroke-width='2' stroke-linecap='round'></line>
            <line x1='20' y1='12' x2='23' y2='12' stroke='white' stroke-width='2' stroke-linecap='round'></line>
            <line x1='4.22' y1='19.78' x2='6.34' y2='17.66' stroke='white' stroke-width='2' stroke-linecap='round'></line>
            <line x1='17.66' y1='6.34' x2='19.78' y2='4.22' stroke='white' stroke-width='2' stroke-linecap='round'></line>
        </svg>
        ` : `
   <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="mdi-moon-waning-crescent" width="24" height="24" viewBox="0 0 24 24"><path d="M2 12A10 10 0 0 0 15 21.54A10 10 0 0 1 15 2.46A10 10 0 0 0 2 12Z"/></svg>
      `;
      icono.style.transform = "rotate(0deg)";
    }, 250)
  }
}