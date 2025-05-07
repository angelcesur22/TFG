// Verificar el tema guardado al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    const temaGuardado = localStorage.getItem("theme");
    if (temaGuardado) {
      document.documentElement.setAttribute("data-theme", temaGuardado);
      actualizarIcono(temaGuardado);
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
    const boton = document.querySelector(".toggle-theme");
    if (boton) {
      boton.textContent = tema === "dark" ? "☀️" : "🌙";
    }
  }
  