//De momento es necesario tenerlo en esta archivo pero talvez se pueda mover a otro archivo mas adelante
//Esto permite que la vista se cargue la vista en el DOM antes de que se ejecute la función
loadView('forms', 'id_forms', false, () => {
    const formEl = document.getElementById("inventory_form")
    if (formEl) {
        formEl.addEventListener('submit', submitHandler)
        // console.log("Listener agregado al formulario inventory_form")
    } else {
        console.error("El formulario inventory_form no se encontró en el DOM.")
    }
})

// ===== Formulario para crear inventario =====//
function submitHandler(event) {
    event.preventDefault()
    const submitButton = event.target.querySelector('button[type="submit"]')
    submitButton.disabled = true
    const formData = new FormData(event.target)
    const data = Object.fromEntries(formData)

    fetch("https://stackqr.bsite.net/api/inventories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(inventory => {
        console.log(inventory)

        //Esto crea la estrctura para un nuevo inventario
        const newInventoryHTML = `
        <div class="flex-column mb-3 d-flex gap-3 border-top-bottom inventory-parent" id="inventory-${inventory.id_inventory}">
    <div class="d-flex gap-3">
        <div>
            <img src="img/icons/folder.svg" 
                    style="width: 80px; height: 80px;" 
                    alt="${inventory.name}" 
                    data-id="${inventory.id_inventory}">
        </div>
        
        <div class="flex-grow-1">
            <div class="justify-content-between d-flex">
                <div class="flex-shrink-1">
                    <h3 class="whithe-color">${inventory.name}</h3>
                </div>
                
                <div class="dropdown">
                    <button type="button"
                            class="dropdown-toggle d-flex align-items-center p-0 border-0 bg-transparent"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            data-id="${inventory.id_inventory}">
                        🗑️
                    </button>
                    
                    <ul class="dropdown-menu bg-dark" 
                        aria-labelledby="dropdownMenuButton">
                        <li>
                            <button class="dropdown-item editar">Editar</button>
                        </li>
                        <li>
                            <button class="dropdown-item eliminar" data-id="${inventory.id_inventory}">Eliminar</button>
                        </li>
                    </ul>
                </div>
            </div>
            
            <div>
                <p>${inventory.description}</p>
            </div>
        </div>
    </div>
</div>`;

// Inserta el nuevo inventario en la lista sin recargar la página
document.getElementById('inventoryList').insertAdjacentHTML('beforeend', newInventoryHTML)
    })
    .catch(error => console.error("Error:", error))
    .finally(() => {
        submitButton.disabled = false
        const modalInstance = bootstrap.Modal.getInstance(document.getElementById("crearInventory"))
        if (modalInstance) modalInstance.hide()
    });
}

