document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".btn-like").forEach(button => {
      button.addEventListener("click", async (e) => {
        e.preventDefault();
  
        const productId = button.dataset.id;
  
        const res = await fetch(`/wishlist/toggle/${productId}`, {
          method: 'POST',
          credentials: 'include' // 👈 Necesario para enviar cookies de sesión
        });
  
        const data = await res.json();
  
        if (data.success) {
          const icon = button.querySelector('i');
  
          // Cambiar entre corazón lleno y vacío
          icon.classList.toggle('fas', data.liked); // lleno
          icon.classList.toggle('far', !data.liked); // vacío
        } else {
          alert('Error al actualizar la wishlist. Intenta iniciar sesión.');
        }
      });
    });
  });
  