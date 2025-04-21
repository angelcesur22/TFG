document.addEventListener('DOMContentLoaded', () => {
    const carrusel = document.querySelector('.carrusel-imagenes');
    const totalSlides = document.querySelectorAll('.carrusel-imagenes img').length;
    let index = 0;
  
    function mostrarSlide(i) {
      carrusel.style.transform = `translateX(-${i * 100}vw)`;
    }
  
    document.querySelector('.flecha.derecha').addEventListener('click', () => {
      index = (index + 1) % totalSlides;
      mostrarSlide(index);
    });
  
    document.querySelector('.flecha.izquierda').addEventListener('click', () => {
      index = (index - 1 + totalSlides) % totalSlides;
      mostrarSlide(index);
    });
  
    setInterval(() => {
      index = (index + 1) % totalSlides;
      mostrarSlide(index);
    }, 5000);
  });