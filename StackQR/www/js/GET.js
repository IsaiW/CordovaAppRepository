let inventoryHTML = ''
const itemsCache = {} // Almacenará el HTML de cada inventario por ID
let currentSection = 'inventarios'

// ===== Inventarios =====//
fetch('https://stackqr.bsite.net/api/inventories') //Promeso que obtine los usuarios de la api
.then(response => {
    return response.json()
}) 
.then(data =>{
    data.forEach(inventory => { //Loop que pasa por cada usuario y lo almacena en user

        // Crear la estructura HTML con la información del inventario
        const name =`
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
                    <h4 class="whithe-color">${inventory.name}</h4>
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

        document.getElementById('inventoryList').insertAdjacentHTML('beforeend', name) 
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
  .then(objects => {
        const container = document.getElementById('inventoryList')
        container.innerHTML = ''

        const itemsHTML = objects.map(obj => `
                <div class="flex-column mb-3 d-flex gap-3 border-top-bottom object-item" id="item-${obj.id}">
                    <div class="d-flex gap-3">
                        <!-- Botón para abrir el MODAL específico de este objeto -->
                        <div type="button" 
                            class="delete-style" 
                            data-bs-toggle="modal" 
                            data-bs-target="#objeto-descripcion-${obj.id}">
                            <div>
                                <img src="${obj.image}" 
                                    style="width: 80px; height: 80px;" 
                                    alt="${obj.nombre}">
                            </div>
                        </div>
                        
                        <div class="flex-grow-1">
                            <div class="justify-content-between d-flex">
                                <div class="flex-shrink-1">
                                    <h4 class="whithe-color">${obj.name}</h4>
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
                    <div class="modal fade" id="objeto-descripcion-${obj.id}" tabindex="-1" aria-labelledby="objetoDescripcion" aria-hidden="true">
                        <div class="modal-dialog">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h1 class="modal-title fs-5">${obj.name}</h1>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body">
                                    <img src="${obj.image}" 
                                            alt="${obj.nombre}" 
                                            style="max-width: 100%;">
                                    <p class="mt-3">${obj.descripcion}</p>
                                    <!-- Agrega más campos según necesites -->
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `)
        .join('');
    //   console.log(objects)
        container.innerHTML = itemsHTML
        itemsCache[inventoryId] = itemsHTML
        currentSection = 'objetos' // Actualizar estado del boton flotante
        updateFloatingButton()    // Actualizar botón flotante para que solo apareza el boton de crear objeto
})
.catch(error => console.log(error))
}