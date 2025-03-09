// ---- Código para la página de objetos ---- //
document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const inventoryId = urlParams.get("inventoryId");

    const addObjectModal = new bootstrap.Modal(document.getElementById("addObjectModal"));
    const newAttributeModal = new bootstrap.Modal(document.getElementById("newAttributeModal"));
    const newTagModal = new bootstrap.Modal(document.getElementById("newTagModal"));
    
    // Reabrir el modal de agregar objeto cuando se cierre el modal de agregar atributo
    document.getElementById("newAttributeModal").addEventListener("hidden.bs.modal", function () {
        addObjectModal.show();
    });

    // Reabrir el modal de agregar objeto cuando se cierre el modal de agregar etiqueta
    document.getElementById("newTagModal").addEventListener("hidden.bs.modal", function () {
        addObjectModal.show();
    });


    if (!inventoryId) {
        Swal.fire("Error", "No se ha seleccionado un inventario", "error");
        console.error("No se encontró inventoryId en la URL.");
        return;
    } else {
        fetchInventoryName(inventoryId); // cargar el nomnbre del inventario en el header
    }

    fetchObjects(inventoryId);
    fetchAttributes(); 
    fetchTags();

    // Manejar la creación de objetos
    document.getElementById("objectForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = new FormData();
        formData.append("name", document.getElementById("objectName").value);
        formData.append("quantity", document.getElementById("objectQuantity").value);
        formData.append("type_qr", document.getElementById("objectTypeQR").value);

        const fileInput = document.getElementById("objectImage");
        if (fileInput.files.length > 0) {
            formData.append("image", fileInput.files[0]);
        }

        // Agregar atributos al FormData
        formData.append("attributes", JSON.stringify(selectedAttributes));

        // Agregar etiquetas al FormData (aquí estaba el error)
        formData.append("tags", JSON.stringify(selectedTags));

        fetch(`https://stackqr.bsite.net/api/objects/${inventoryId}`, {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            Swal.fire("Éxito", "Objeto agregado correctamente", "success");
            selectedAttributes = [];
            selectedTags = [];  // Limpiar las etiquetas seleccionadas
            document.getElementById("objectForm").reset();
            document.getElementById("attributesList").innerHTML = "";
            document.getElementById("tagsList").innerHTML = ""; // Limpiar lista de etiquetas
            let modal = bootstrap.Modal.getInstance(document.getElementById("addObjectModal"));
            modal.hide();
            fetchObjects(inventoryId); // Recargar lista de objetos
        })
        .catch(error => {
            console.error("Error al agregar objeto:", error);
            Swal.fire("Error", "No se pudo agregar el objeto", "error");
        });
    });

    // Guardar cambios en el objeto
    document.getElementById("editObjectForm").addEventListener("submit", async function (event) {
        event.preventDefault();
    
        const id = document.getElementById("editObjectId").value;
        const name = document.getElementById("editObjectName").value;
        const quantity = document.getElementById("editObjectQuantity").value;
        const typeQR = document.getElementById("editObjectTypeQR").value;
        const imageFile = document.getElementById("editObjectImage").files[0];
    
        let formData = new FormData();
        formData.append("name", name);
        formData.append("quantity", quantity);
        formData.append("type_qr", typeQR);
        if (imageFile) {
            formData.append("image", imageFile);
        }
    
        // Obtener atributos editados
        let updatedAttributes = [];
        document.querySelectorAll("#editAttributesList .attribute-value").forEach(input => {
            updatedAttributes.push({
                AttributeId: input.dataset.attrId,
                Value: input.value
            });
        });
    
        // Obtener etiquetas editadas
        let updatedTags = [];
        document.querySelectorAll("#editTagsList .tag-name").forEach(input => {
            updatedTags.push({
                TagId: input.dataset.tagId,
                Name: input.value
            });
        });
    
        formData.append("attributes", JSON.stringify(updatedAttributes));
        formData.append("tags", JSON.stringify(updatedTags));
    
        fetch(`https://stackqr.bsite.net/api/objects/${id}`, {
            method: "PUT",
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("No se pudo actualizar el objeto.");
            }
            return response.json();
        })
        .then(() => {
            Swal.fire("Éxito", "Objeto actualizado correctamente", "success").then(() => {
                fetchObjects(inventoryId);
            });
            document.getElementById("editObjectForm").reset();
            let modal = bootstrap.Modal.getInstance(document.getElementById("editObjectModal"));
            modal.hide();
        })
        .catch(error => {
            console.error("Error al actualizar objeto:", error);
            Swal.fire("Error", "No se pudo actualizar el objeto", "error");
        });
    });       

    // Manejar la busqueda de objetos
    document.getElementById("searchBar").addEventListener("input", function () {
        const searchText = this.value.toLowerCase();
        filterObjects(searchText);
    });
    
    // Funcion para mostrar la barra de busqueda
    document.getElementById("toggleSearch").addEventListener("click", function () {
        let searchBar = document.getElementById("searchBar");
        searchBar.classList.toggle("search-hidden");
        if (!searchBar.classList.contains("search-hidden")) {
            searchBar.focus(); 
        }
    });

});


// ---- Funciones ---- //

// Funcion para obtener objetos
function fetchObjects(inventoryId) {
    console.log(inventoryId);
    fetch(`https://stackqr.bsite.net/api/objects/inventory/${inventoryId}`)
        .then(response => response.json())
        .then(data => {
            renderObjects(data);
        })
        .catch(error => console.error("Error al obtener objetos:", error));
}

// Función para obtener atributos existentes
function fetchAttributes() {
    fetch("https://stackqr.bsite.net/api/attributes")
        .then(response => response.json())
        .then(data => {
            const attributeSelect = document.getElementById("attributeSelect");
            attributeSelect.innerHTML = '<option value="">Seleccionar atributo</option>';
            data.forEach(attribute => {
                let option = document.createElement("option");
                option.value = attribute.id_attribute;
                option.textContent = attribute.name;
                attributeSelect.appendChild(option);
            });
        })
        .catch(error => console.error("Error al obtener atributos:", error));
}

// Cargar etiquetas existentes
function fetchTags() {
    fetch("https://stackqr.bsite.net/api/tags")
        .then(response => response.json())
        .then(data => {
            const tagSelect = document.getElementById("tagSelect");
            tagSelect.innerHTML = '<option value="">Seleccionar etiqueta</option>';
            data.forEach(tag => {
                let option = document.createElement("option");
                option.value = tag.id_tag;
                option.textContent = tag.name;
                tagSelect.appendChild(option);
            });
        })
        .catch(error => console.error("Error al obtener etiquetas:", error));
}

// Funcion para obtener el nombre del inventario
function fetchInventoryName(inventoryId) {
    fetch(`https://stackqr.bsite.net/api/inventories/${inventoryId}`)
        .then(response => response.json())
        .then(data => {
            if (data.name) {
                document.getElementById("inventoryHeader").textContent = data.name;
            } else {
                document.getElementById("inventoryHeader").textContent = "Lista de Objetos";
            }
        })
        .catch(error => {
            console.error("Error al obtener el nombre del inventario:", error);
            document.getElementById("inventoryHeader").textContent = "Lista de Objetos";
        });
}

// renderiza los objetos con sus botones
function renderObjects(objects) {
    let objectsList = document.getElementById("objectsList");
    objectsList.innerHTML = "";

    objects.forEach(obj => {
        let card = `
            <div class="col-md-4 object-card" data-name="${obj.name.toLowerCase()}">
                <div class="card mb-3 position-relative">
                    <img src="https://stackqr.bsite.net${obj.image}" class="card-img-top object-image" onclick="viewObjectDetails(${obj.id})" onerror="this.style.display='none'" alt="Imagen del objeto">
                    <div class="card-body">
                        <h5 class="card-title" onclick="viewObjectDetails(${obj.id})">${obj.name}</h5>
                        <p class="card-text" onclick="viewObjectDetails(${obj.id})"><strong>Cantidad:</strong> ${obj.quantity}</p>
                        <p class="card-text" onclick="viewObjectDetails(${obj.id})"><strong>Tipo QR:</strong> ${obj.typeQR}</p>

                        <!-- Botón de opciones -->
                        <div class="dropdown position-absolute top-0 end-0 m-2">
                            <button class="btn btn-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="bi bi-three-dots-vertical"></i>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li><button class="dropdown-item" onclick="viewObjectDetails(${obj.id})"><i class="bi bi-eye"></i> Ver Detalles</button></li>
                                <li><button class="dropdown-item" onclick="openEditModal(${obj.id}, '${obj.name}', ${obj.quantity}, '${obj.typeQR}', '${obj.image}')"><i class="bi bi-pencil"></i> Editar</button></li>
                                <li><button class="dropdown-item text-danger" onclick="deleteObject(${obj.id})"><i class="bi bi-trash"></i> Eliminar</button></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
        objectsList.innerHTML += card;
    });
}

// Funcion para eliminar objeto
function deleteObject(id) {
    Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`https://stackqr.bsite.net/api/objects/${id}`, {
                method: "DELETE"
            })
            .then(response => response.json())
            .then(() => {
                Swal.fire("Eliminado", "El objeto fue eliminado correctamente", "success").then(() => {
                    window.location.reload();
                });

            })
            .catch(error => {
                console.error("Error al eliminar objeto:", error);
                Swal.fire("Error", "No se pudo eliminar el objeto", "error");
            });
        }
    });
}

// ---- Manejo de edicion de objetos ---- //

let selectedEditAttributes = [];
let selectedEditTags = [];

// Abrir modal de edición con datos actuales y cargar atributos y etiquetas relacionadas
function openEditModal(id, name, quantity, typeQR, image) {
    document.getElementById("editObjectId").value = id;
    document.getElementById("editObjectName").value = name;
    document.getElementById("editObjectQuantity").value = quantity;
    document.getElementById("editObjectTypeQR").value = typeQR;

    let editAttributesList = document.getElementById("editAttributesList");
    let editTagsList = document.getElementById("editTagsList");

    editAttributesList.innerHTML = "";
    editTagsList.innerHTML = "";

    fetch(`https://stackqr.bsite.net/api/objects/${id}`)
        .then(response => response.json())
        .then(data => {
            console.log("Detalles del objeto:", data);

            // Cargar atributos
            if (data.attributes && data.attributes.length > 0) {
                data.attributes.forEach(attr => {
                    addAttributeToEditList(attr.attributeId, attr.name, attr.value);
                });
            }

            // Cargar etiquetas
            if (data.tags && data.tags.length > 0) {
                data.tags.forEach(tag => {
                    addTagToEditList(tag.tagId, tag.tagName);
                });
            }
        })
        .catch(error => console.error("Error al obtener detalles del objeto:", error));

    let modal = new bootstrap.Modal(document.getElementById("editObjectModal"));
    modal.show();
}

// Función para añadir un atributo a la lista de edición
function addAttributeToEditList(attributeId, name, value) {
    let editAttributesList = document.getElementById("editAttributesList");

    if (!attributeId || !name || !value) {
        Swal.fire("Error", "Faltan datos del atributo", "error");
        return;
    }

    let listItem = document.createElement("div");
    listItem.className = "input-group mb-2";

    listItem.innerHTML = `
        <input type="text" class="form-control attribute-name" value="${name}" readonly>
        <input type="text" class="form-control attribute-value" value="${value}" data-attr-id="${attributeId}">
        <button class="btn btn-danger" onclick="removeEditAttribute(this, ${attributeId})"><i class="bi bi-x"></i></button>
    `;

    editAttributesList.appendChild(listItem);

    selectedEditAttributes.push({ AttributeId: attributeId, Name: name, Value: value });
}

// Función para añadir una etiqueta a la lista de edición
function addTagToEditList(tagId, name) {
    let editTagsList = document.getElementById("editTagsList");

    if (!tagId || !name) {
        Swal.fire("Error", "Faltan datos de la etiqueta", "error");
        return;
    }

    let listItem = document.createElement("div");
    listItem.className = "input-group mb-2";

    listItem.innerHTML = `
        <input type="text" class="form-control tag-name" value="${name}" readonly>
        <button class="btn btn-danger" onclick="removeEditTag(this, ${tagId})"><i class="bi bi-x"></i></button>
    `;

    editTagsList.appendChild(listItem);

    selectedEditTags.push({ TagId: tagId, Name: name });
}

// Función para eliminar un atributo del modal de edición
function removeEditAttribute(button, attrId) {
    button.parentElement.remove();
}

// Función para eliminar una etiqueta en el modal de edición
function removeEditTag(button, tagId) {
    button.parentElement.remove();
}

// ---- Navegación ---- //

// Función para regresar a la página anterior
function goBack() {
    window.history.back();
}

// funcion para redirigire a la pagina de detalles del objeto - ez app
function viewObjectDetails(objectId) {
    window.location.href = `object-details.html?objectId=${objectId}`;
}

// Filtrar objetos por nombre para la barra de busqueda 
function filterObjects(searchText) {
    document.querySelectorAll(".object-card").forEach(card => {
        const name = card.getAttribute("data-name");
        card.style.display = name.includes(searchText) ? "block" : "none";
    });
}

// ---- Manejo de atributos ---- // 

let selectedAttributes = [];

// Función para abrir el modal de atributos
function openAttributesModal() {
    // Aquí abrirías el modal correspondiente
    console.log("Abrir modal de atributos");
}

// Alternar la visibilidad del formulario de nuevo atributo
function toggleNewAttributeForm() {
    let section = document.getElementById("newAttributeSection");
    section.style.display = section.style.display === "none" ? "block" : "none";
}

// Añadir un atributo a la lista con opción de eliminar
function addAttribute() {
    const select = document.getElementById("attributeSelect");
    const value = document.getElementById("attributeValue").value.trim();
    const attributesList = document.getElementById("attributesList");

    if (!select.value || !value) {
        Swal.fire("Error", "Selecciona un atributo y asigna un valor", "error");
        return;
    }

    // Verificar si el atributo ya está en la lista
    if (selectedAttributes.some(attr => attr.AttributeId == select.value)) {
        Swal.fire("Error", "Este atributo ya ha sido añadido", "error");
        return;
    }

    // Agregar el atributo a la lista seleccionada
    let attributeId = select.value;
    selectedAttributes.push({ AttributeId: attributeId, Value: value });

    // Crear un elemento de lista con botón para eliminar
    let listItem = document.createElement("li");
    listItem.className = "list-group-item d-flex justify-content-between align-items-center";
    listItem.textContent = `${select.options[select.selectedIndex].text}: ${value}`;

    let removeButton = document.createElement("button");
    removeButton.className = "btn btn-danger btn-sm";
    removeButton.innerHTML = '<i class="bi bi-x"></i>';
    removeButton.onclick = () => {
        selectedAttributes = selectedAttributes.filter(attr => attr.AttributeId != attributeId);
        listItem.remove();
    };

    listItem.appendChild(removeButton);
    attributesList.appendChild(listItem);

    // Limpiar los campos
    document.getElementById("attributeValue").value = "";
}

// Crear un nuevo atributo
function createNewAttribute() {
    const name = document.getElementById("newAttributeName").value.trim();

    if (!name) {
        Swal.fire("Error", "Debes ingresar un nombre", "error");
        return;
    }

    fetch("https://stackqr.bsite.net/api/attributes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name })
    })
    .then(response => response.json())
    .then(data => {
        if (data.id_attribute) {
            document.getElementById("attributeSelect").innerHTML += `<option value="${data.id_attribute}">${name}</option>`;
            document.getElementById("newAttributeName").value = "";
            let modal = bootstrap.Modal.getInstance(document.getElementById("newAttributeModal"));
            modal.hide();
        }
    })
    .catch(error => console.error("Error al crear atributo:", error));
}

// Actualizar la lista de atributos seleccionados
function updateAttributeList() {
    let attributeList = document.getElementById("attributesList");
    attributeList.innerHTML = "";
    selectedAttributes.forEach(attr => {
        let li = document.createElement("li");
        li.textContent = `ID: ${attr.AttributeId}, Valor: ${attr.Value}`;
        attributeList.appendChild(li);
    });
}

// ---- Manejo de etiquetas ---- //

let selectedTags = [];

// Función para abrir el modal de etiquetas
function openTagsModal() {
    // Aquí abrirías el modal correspondiente
    console.log("Abrir modal de etiquetas");
}

// Alternar la visibilidad del formulario de nueva etiqueta
function toggleNewTagForm() {
    let section = document.getElementById("newTagModal");
    section.style.display = section.style.display === "none" ? "block" : "none";
}

// Crear una nueva etiqueta
function createNewTag() {
    const tagName = document.getElementById("newTagName").value.trim();

    if (!tagName) {
        Swal.fire("Error", "El nombre de la etiqueta no puede estar vacío", "error");
        return;
    }

    fetch("https://stackqr.bsite.net/api/tags", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: tagName })
    })
    .then(response => response.json())
    .then(data => {
        Swal.fire("Éxito", "Etiqueta creada correctamente", "success");

        // Cerrar modal después de crear la etiqueta
        let modal = document.getElementById("newTagModal");
        if (modal) {
            let modalInstance = bootstrap.Modal.getInstance(modal);
            if (modalInstance) {
                modalInstance.hide();
            }
        }

        // Actualizar la lista de etiquetas
        fetchTags();

        // Limpiar el campo de entrada
        document.getElementById("newTagName").value = "";
    })
    .catch(error => {
        console.error("Error al crear etiqueta:", error);
        Swal.fire("Error", "No se pudo crear la etiqueta", "error");
    });

}

// Añadir una etiqueta a la lista
function addTag() {
    const select = document.getElementById("tagSelect");
    const tagsList = document.getElementById("tagsList");

    if (!select.value) {
        Swal.fire("Error", "Selecciona una etiqueta", "error");
        return;
    }

    // Verificar si la etiqueta ya está en la lista
    if (selectedTags.includes(select.value)) {
        Swal.fire("Error", "Esta etiqueta ya ha sido añadida", "error");
        return;
    }

    // Agregar la etiqueta a la lista seleccionada
    selectedTags.push(select.value);

    // Crear un elemento de lista con botón para eliminar
    let listItem = document.createElement("li");
    listItem.className = "list-group-item d-flex justify-content-between align-items-center";
    listItem.textContent = select.options[select.selectedIndex].text;

    let removeButton = document.createElement("button");
    removeButton.className = "btn btn-danger btn-sm";
    removeButton.innerHTML = '<i class="bi bi-x"></i>';
    removeButton.onclick = () => {
        selectedTags = selectedTags.filter(tagId => tagId != select.value);
        listItem.remove();
    };

    listItem.appendChild(removeButton);
    tagsList.appendChild(listItem);
}