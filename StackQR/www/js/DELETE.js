document.addEventListener('click', async (e) => {
 if (e.target.classList.contains('eliminar')) {
   const id = e.target.dataset.id;
   const inventoryName = e.target.closest('.flex-column').querySelector('h3').textContent;
   
   // Configuracion de modal
   const modal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
   document.getElementById('confirmDeleteButton').dataset.id = id;
   document.querySelector('#confirmDeleteModal .modal-body').innerHTML = `
     ¿Estás seguro de querer eliminar <strong>"${inventoryName}"</strong>?<br>
     Esta acción no se puede deshacer.
   `;

   // Se miestra modal
   modal.show();
 }
});

// Confirmar eliminación
document.getElementById('confirmDeleteButton').addEventListener('click', async function() {
 const id = this.dataset.id;
 const modal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal'));
 
 try {
   const response = await fetch(`https://stackqr.bsite.net/api/inventories/${id}`, {
     method: 'DELETE'
   });

   if (!response.ok) {
     const errorData = await response.json();
     throw new Error(errorData.message || 'Error al eliminar');
   }

   const inventoryElement = document.getElementById(`inventory-${id}`);
   if (inventoryElement) {
     inventoryElement.remove();
     // Mostrar toast de éxito
     const successToast = new bootstrap.Toast(document.getElementById('successToast'));
     document.querySelector('#successToast .toast-body').textContent = 'Inventario eliminado con éxito';
     successToast.show();
   }
   
   modal.hide();
 } catch (error) {
   console.error('Error:', error);
   modal.hide();
   // Mostrar toast de error
   const errorToast = new bootstrap.Toast(document.getElementById('errorToast'));
   document.querySelector('#errorToast .toast-body').textContent = error.message;
   errorToast.show();
 }
});
