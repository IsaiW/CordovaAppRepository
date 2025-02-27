// Cochinero para el metodo POST para el formulario de crear inventario
loadView('forms', 'id_forms', false, () => {
    const formEl = document.getElementById("inventory_form");
    if (formEl) {
        formEl.addEventListener('submit', submitHandler);
        // console.log("Listener agregado al formulario inventory_form");
    } else {
        console.error("El formulario inventory_form no se encontró en el DOM.");
    }
});

function submitHandler(event) {
    event.preventDefault();
    const submitButton = event.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    fetch("https://stackqr.bsite.net/api/inventories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    // .then(res => res.json())
    // .then(data => console.log(data))
    .catch(error => console.error("Error:", error))
    .finally(() => {
        submitButton.disabled = false;
        const modalInstance = bootstrap.Modal.getInstance(document.getElementById("crearInventory"));
        if (modalInstance) modalInstance.hide();
    });
}
