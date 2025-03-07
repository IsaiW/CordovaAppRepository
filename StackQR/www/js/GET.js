let inventoryHTML = ''
const itemsCache = {} // Almacenará el HTML de cada inventario por ID
let currentSection = 'inventarios'

document.getElementById('inventoryList').addEventListener('click', function(e) {
    const target = e.target;
    if (target.tagName === 'IMG' && target.dataset.id) {
        const invId = target.dataset.id;
        
        // Actualizar sección y botones INMEDIATAMENTE
        currentSection = 'objetos';
        updateFloatingButton();

        // Resto de tu lógica para cargar objetos...
    }
});

// ===== Inventarios =====//
fetch('https://stackqr.bsite.net/api/inventories') //Promeso que obtine los usuarios de la api
.then(response => {
    return response.json()
}) 
.then(data =>{
    data.forEach(inventory => { //Loop que pasa por cada usuario y lo almacena en user

        // Crear la estructura HTML con la información del inventario
        const estructura =`
        <div class="flex-column mb-3 d-flex gap-3 border-top-bottom pad inventory-parent" id="inventory-${inventory.id_inventory}">
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
                    <h4 class="">${inventory.name}</h4>
                </div>
                
                <div class="dropdown">
                    <button type="button"
                            class="dropdown-toggle d-flex align-items-center p-0 border-0 bg-transparent"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            data-id="${inventory.id_inventory}">
                        <img src="img/icons/dots-vertical.svg" 
                        style="width: 1.5rem; height: 1.5rem;" >
                    </button>
                    
                    <ul class="dropdown-menu" 
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
</div>
`

//El icon lo podemos cambiar despues

        document.getElementById('inventoryList').insertAdjacentHTML('beforeend', estructura) 
        // console.log(inventory)
        currentSection = 'inventarios' // Actualizar estado del boton flotante
        updateFloatingButton()        // Actualizar botón flotante para que solo aparezca el boton de crear inventario
    })
})
.catch(error => {console.log(error)})

// ===== Objetos =====//
// Función para renderizar la vista de objetos de un inventario
function renderItemsView(inventoryId) {
  fetch(`https://stackqr.bsite.net/api/objects/inventory/${inventoryId}`)
  .then(response => response.json())
  .then(objectos => {
    console.log(objectos)
        const container = document.getElementById('inventoryList')
        container.innerHTML = ''

        const itemsHTML = objectos.map(obj => `
                <div class="flex-column mb-3 d-flex gap-3 border-top-bottom pad object-item" id="item-${obj.id}">
                    <div class="d-flex gap-3">
                        <!-- Botón para abrir el MODAL específico de este objeto -->
                        <div type="button" 
                            data-bs-toggle="modal" 
                            data-bs-target="#objeto-descripcion-${obj.id}">
                            <div>
                                <img src="${obj.image}" 
                                    style="width: 80px; height: 80px;" 
                                    alt="${obj.name}">
                            </div>
                        </div>
                        
                        <div class="flex-grow-1">
                            <div class="justify-content-between d-flex">
                                <div class="flex-shrink-1">
                                    <h4 class="">${obj.name}</h4>
                                </div>

                                <div class="dropdown">
                                    <button type="button"
                                            class="dropdown-toggle d-flex align-items-center p-0 border-0 bg-transparent"
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false">
                                        🗑️
                                    </button>
                                    <ul class="dropdown-menu">
                                        <li><button class="dropdown-item editar_objeto">Editar</button></li>
                                        <li><button class="dropdown-item eliminar_objeto" data-id="${obj.id}">Eliminar</button></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Modal específico para este objeto -->
                    <div class="modal fade" 
                    id="objeto-descripcion-${obj.id}" 
                    tabindex="-1" 
                    data-quantity="${obj.quantity || 0}"
                    data-item-id="${obj.id}">
                        <div class="modal-dialog modal-fullscreen">
                            <div class="modal-content" style="background-color: #0d1117;">
                                <div class="modal-body">
                                    <img src="${obj.image}" alt="${obj.name}" style="max-width: 100%;">
                                    <h4>${obj.name}</h4>

                                    <div class="border-top-bottom d-flex ">

                                        <div class = "flex-grow-1 text-center">
                                            <label class = "color-w">Cantidad</label>
                                            <p class = "color-w">${obj.quantity}</p>
                                        </div>

                                        <div class = "flex-grow-1 text-center d-flex flex-column align-items-center">
                                            <label class = "color-w">Valor unitario</label>
                                            <input type="number" 
                                                class="unit-value-input custom-input" 
                                                placeholder="Ingrese valor" 
                                                step="0.01"
                                                min="0"
                                                value="0"
                                                data-item-id="${obj.id}">
                                        </div>
                                    </div>

                                    <div class="border-top-bottom text-center pad">
                                        <label class = "color-w">Valor total</label>
                                        <p class="color-w m-0">
                                        $<span class="total-value-display color-w">0.00</span>
                                        </p>
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `)
        .join('')
    //   console.log(objects)
        container.innerHTML = itemsHTML
        itemsCache[inventoryId] = itemsHTML
        currentSection = 'objetos' // Actualizar estado del boton flotante
        updateFloatingButton()    // Actualizar botón flotante para que solo apareza el boton de crear objeto


      container.querySelectorAll('.unit-value-input').forEach(input => {
        input.addEventListener('input', (e) => {
          const itemId = e.target.dataset.itemId;
          const modal = document.getElementById(`objeto-descripcion-${itemId}`)

          const quantity = parseFloat(modal.dataset.quantity) || 0;
          const unitValue = parseFloat(e.target.value) || 0;
          const totalValue = unitValue * quantity;

          modal.querySelector('.total-value-display').textContent = 
            totalValue.toLocaleString('es-ES', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            });
        });
      });
})
.catch(error => console.log(error))
}