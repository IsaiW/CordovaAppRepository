// ---- Codigo para la pagina de inventarios  ---- //
document.addEventListener("DOMContentLoaded", function () {
    fetchInventories();

    // Manejar el formulario de agregar inventario
    document.getElementById("inventoryForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("inventoryName").value;
        const description = document.getElementById("inventoryDescription").value;

        fetch("https://stackqr.bsite.net/api/inventories", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                description: description
            })
        })
        .then(response => response.json())
        .then(data => {
            Swal.fire("Éxito", "Inventario agregado correctamente", "success");
            fetchInventories();
            document.getElementById("inventoryForm").reset();
            let modal = bootstrap.Modal.getInstance(document.getElementById("addInventoryModal"));
            modal.hide();
        })
        .catch(error => {
            console.error("Error al agregar inventario:", error);
            Swal.fire("Error", "No se pudo agregar el inventario", "error");
        });
    });

    document.getElementById("editInventoryModal").removeAttribute("aria-hidden");

    // Manejar el formulario de edición de inventario
    document.getElementById("editInventoryForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const id = document.getElementById("editInventoryId").value;
        const name = document.getElementById("editInventoryName").value.trim();
        const description = document.getElementById("editInventoryDescription").value.trim();

        if (!name) {
            Swal.fire("Error", "El nombre del inventario no puede estar vacío.", "error");
            return;
        }

        fetch(`https://stackqr.bsite.net/api/inventories/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                description: description
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("No se pudo actualizar el inventario.");
            }
            return response.json();
        })
        .then(() => {
            Swal.fire("Éxito", "Inventario actualizado correctamente", "success");
            fetchInventories();
            let modal = bootstrap.Modal.getInstance(document.getElementById("editInventoryModal"));
            document.getElementById("editInventoryModal").setAttribute("aria-hidden", "true");
            modal.hide();
        })
        .catch(error => {
            console.error("Error al actualizar inventario:", error);
            Swal.fire("Error", "No se pudo actualizar el inventario", "error");
        });
    });

    // Buscar inventarios
    document.getElementById("searchBar").addEventListener("input", function () {
        const searchText = this.value.toLowerCase();
        filterInventories(searchText);
    });

    // Mostrar u ocultar la barra de búsqueda
    document.getElementById("toggleSearch").addEventListener("click", function () {
        let searchBar = document.getElementById("searchBar");
        searchBar.classList.toggle("search-hidden");
        if (!searchBar.classList.contains("search-hidden")) {
            searchBar.focus(); // Enfocar la barra de búsqueda al abrirla
        }
    });
});

// Obtener la lista de inventarios
function fetchInventories() {
    fetch("https://stackqr.bsite.net/api/inventories")
        .then(response => response.json())
        .then(data => {
            renderInventories(data);
        })
        .catch(error => console.error("Error al obtener inventarios:", error));
}

// Renderizar la lista de inventarios
function renderInventories(inventories) {
    let inventoryList = document.getElementById("inventoryList");
    inventoryList.innerHTML = "";

    inventories.forEach(inventory => {
        let card = `
            <div class="col-md-4 inventory-card" data-name="${inventory.name.toLowerCase()}">
                <div class="card mb-3 position-relative">
                    <div class="card-body">
                        <h5 class="card-title" onclick="viewObjects(${inventory.id_inventory})">${inventory.name}</h5>
                        <p class="card-text" onclick="viewObjects(${inventory.id_inventory})">${inventory.description || "Sin descripción"}</p>

                        <!-- Botón de opciones -->
                        <div class="dropdown position-absolute top-0 end-0 m-2">
                            <button class="btn btn-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="bi bi-three-dots-vertical"></i>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li><button class="dropdown-item" onclick="viewObjects(${inventory.id_inventory})"><i class="bi bi-box"></i> Ver Objetos</button></li>
                                <li><button class="dropdown-item" onclick="openEditModal(${inventory.id_inventory}, '${inventory.name}', '${inventory.description || ""}')"><i class="bi bi-pencil"></i> Editar</button></li>
                                <li><button class="dropdown-item text-danger" onclick="deleteInventory(${inventory.id_inventory})"><i class="bi bi-trash"></i> Eliminar</button></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
        inventoryList.innerHTML += card;
    });
}

// Filtrar inventarios por nombre
function filterInventories(searchText) {
    document.querySelectorAll(".inventory-card").forEach(card => {
        const name = card.getAttribute("data-name");
        card.style.display = name.includes(searchText) ? "block" : "none";
    });
}

// Función para abrir el modal de edición con datos actuales
function openEditModal(id, name, description) {
    document.getElementById("editInventoryId").value = id;
    document.getElementById("editInventoryName").value = name;
    document.getElementById("editInventoryDescription").value = description || "";

    let modal = new bootstrap.Modal(document.getElementById("editInventoryModal"));
    modal.show();
}

// Eliminar un inventario con confirmación
function deleteInventory(id) {
    Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`https://stackqr.bsite.net/api/inventories/${id}`, {
                method: "DELETE",
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("No se pudo eliminar el inventario.");
                }
                return response.json();
            })
            .then(() => {
                Swal.fire("Eliminado", "El inventario fue eliminado correctamente", "success");
                fetchInventories();
            })
            .catch(error => {
                console.error("Error al eliminar inventario:", error);
                Swal.fire("Error", "No se pudo eliminar el inventario", "error");
            });
        }
    });
}

// Redirigir a la vista de objetos
function viewObjects(id) {
    window.location.href = `objects.html?inventoryId=${id}`;
}


