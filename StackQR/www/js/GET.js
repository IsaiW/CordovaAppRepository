let inventoryHTML = ''
const itemsCache = {}; // Almacenará el HTML de cada inventario por ID


// ===== Inventarios =====//
fetch('https://stackqr.bsite.net/api/inventories') //Promeso que obtine los usuarios de la api
.then(response => { //Agarra la promeso o respuesta
    return response.json() //Transforma en js. Esto tambien es una promesa
}) 
.then(data =>{ //Esto agarra la promesa anterior
    data.forEach(inventory => { //Loop que pasa por cada usuario y lo almacena en user

        // Crear la estructura HTML con la información del inventario
        const name =`
        <div class="flex-column mb-3 d-flex gap-3 border-top-bottom" id="inventory-${inventory.id_inventory}">
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

//El icon lo podemos cambiar despues

        document.getElementById('inventoryList').insertAdjacentHTML('beforeend', name) 
        // console.log(inventory)
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
        <div class="flex-column mb-3 d-flex gap-3 border-top-bottom" id="item-${obj.id}">
            <div class="d-flex gap-3">
                <div>
                    <img src="${obj.image}" 
                          style="width: 80px; height: 80px;" 
                          alt="${obj.nombre}" 
                          data-id="${obj.id}">
                </div>

                <div class="flex-grow-1">
                    <div class="justify-content-between d-flex">
                        <div class="flex-shrink-1">
                            <h3 class="whithe-color">${obj.name}</h3>
                        </div>

                        <div class="dropdown">
                            <button type="button"
                                    class="dropdown-toggle d-flex align-items-center p-0 border-0 bg-transparent"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    data-id="${obj.id}">
                                🗑️
                            </button>
                            <ul class="dropdown-menu bg-dark" 
                                aria-labelledby="dropdownMenuButton">
                                <li>
                                    <button class="dropdown-item editar">Editar</button>
                                </li>
                                <li>
                                    <button class="dropdown-item eliminar_objeto" data-id="${obj.id}">Eliminar</button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `)
          .join('');
      console.log(objects)
      container.innerHTML = itemsHTML
      itemsCache[inventoryId] = itemsHTML
  })
  .catch(error => console.log(error));
}

// ===== Optimización de history y popstate =====//
document.getElementById('inventoryList').addEventListener('click', function(e) {
    const target = e.target;
    if (target.tagName === 'IMG' && target.dataset.id) {
        const invId = target.dataset.id;
        // Usar caché si ya existe
        if (itemsCache[invId]) {
            history.pushState({ id: invId }, '', `?inv=${invId}`)
            document.getElementById('inventoryList').innerHTML = itemsCache[invId]
        } else {
            // Guardar HTML actual antes de cambiar (para restauración rápida)
            const currentHTML = document.getElementById('inventoryList').innerHTML
            history.replaceState({ prevHTML: currentHTML }, '');
            
            // Renderizar y almacenar en caché después de cargar
            renderItemsView(invId);
            history.pushState({ id: invId }, '', `?inv=${invId}`);
            
            // Almacenar en caché cuando la carga termine (usando un observer)
            const observer = new MutationObserver(() => {
                itemsCache[invId] = document.getElementById('inventoryList').innerHTML
                observer.disconnect();
            });
            observer.observe(document.getElementById('inventoryList'), {
                childList: true,
                subtree: true,
            });
        }
    }
});

// Manejo optimizado de popstate
window.onpopstate = function(event) {
    if (event.state) {
        if (event.state.prevHTML) { // Restaurar desde el estado anterior
            document.getElementById('inventoryList').innerHTML = event.state.prevHTML
        } else if (itemsCache[event.state.id]) { // Usar caché
            document.getElementById('inventoryList').innerHTML = itemsCache[event.state.id]
        } else { // Fallback: cargar desde API
            renderItemsView(event.state.id)
        }
    } else { // Vista inicial
        document.getElementById('inventoryList').innerHTML = inventoryHTML
    }
};

