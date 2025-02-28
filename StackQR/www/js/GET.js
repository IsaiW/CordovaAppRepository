let inventoryHTML = '';
const itemsCache = {}; // Almacenará el HTML de cada inventario por ID

//Muy probablemente lo convierte en async/await.
fetch('https://stackqr.bsite.net/api/inventories') //Promeso que obtine los usuarios de la api
.then(response => { //Agarra la promeso o respuesta
    return response.json() //Transforma en js. Esto tambien es una promesa
}) 
.then(data =>{ //Esto agarra la promesa anterior
    data.forEach(inventory => { //Loop que pasa por cada usuario y lo almacena en user
        const name = //Con esta variable se guarda la estrutura html que se incrusta en el div con id inventoryList.
        `<div class = "flex-column mb-3">
            <div class = "d-flex flex-row gap-3">
                <div>
                <img src="img/icons/carpeta.svg" style="width: 80px; height: 80px;" alt="" data-id="${inventory.id_inventory}"> 
                </div>
                
                <div class= "bg-secondary flex-grow-1">
                <h3>${inventory.name}</h3>
                </div>
            </div>
        </div>`
//El icon lo podemos cambiar despues

        document.getElementById('inventoryList').insertAdjacentHTML('beforeend', name) 
        // console.log(user)
    })
})
.catch(error => {console.log(error)})


// Función para renderizar la vista de ítems de un inventario
function renderItemsView(inventoryId) {
    // Obtener detalles del usuario específico usando su ID sacado de la API y de la etiqueta data-id
    fetch(`https://jsonplaceholder.typicode.com/users/${inventoryId}`)
    .then(response => response.json())
    .then(user => {
        const container = document.getElementById('inventoryList');
        container.innerHTML = ''; // Limpiamos la vista actual

        // Crear la estructura HTML con la información del usuario
        const userHTML = `
        <div class="flex-column mb-3">
            <div class="d-flex flex-row gap-3">
                <div>
                    <img src="carpeta.svg" style="width: 80px; height: 80px;" alt="">
                </div>
                <div class="bg-secondary flex-grow-1">
                    <h3>${user.name}</h3>
                    <p>Email: ${user.email}</p>
                    <p>Teléfono: ${user.phone}</p>
                    <p>Dirección: ${user.address.street}, ${user.address.city}</p>
                </div>
            </div>
        </div>`;

        container.insertAdjacentHTML('beforeend', userHTML);
    })
    .catch(error => console.log(error));
}



// ===== Optimización de history y popstate =====
document.getElementById('inventoryList').addEventListener('click', function(e) {
    const target = e.target;
    if (target.tagName === 'IMG' && target.dataset.id) {
        const invId = target.dataset.id;
        // Usar caché si ya existe
        if (itemsCache[invId]) {
            history.pushState({ id: invId }, '', `?inv=${invId}`);
            document.getElementById('inventoryList').innerHTML = itemsCache[invId];
        } else {
            // Guardar HTML actual antes de cambiar (para restauración rápida)
            const currentHTML = document.getElementById('inventoryList').innerHTML;
            history.replaceState({ prevHTML: currentHTML }, '');
            
            // Renderizar y almacenar en caché después de cargar
            renderItemsView(invId);
            history.pushState({ id: invId }, '', `?inv=${invId}`);
            
            // Almacenar en caché cuando la carga termine (usando un observer)
            const observer = new MutationObserver(() => {
                itemsCache[invId] = document.getElementById('inventoryList').innerHTML;
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
            document.getElementById('inventoryList').innerHTML = event.state.prevHTML;
        } else if (itemsCache[event.state.id]) { // Usar caché
            document.getElementById('inventoryList').innerHTML = itemsCache[event.state.id];
        } else { // Fallback: cargar desde API
            renderItemsView(event.state.id);
        }
    } else { // Vista inicial
        document.getElementById('inventoryList').innerHTML = inventoryHTML;
    }
};

