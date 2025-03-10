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

    document.getElementById("editObjectModal").removeAttribute("aria-hidden");


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

        const objectId = document.getElementById("editObjectId").value;
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

        // Limpiar arrays ANTES de obtener los nuevos datos para evitar duplicaciones
        selectedEditAttributes = [];
        selectedEditTags = [];

        // Obtener atributos editados sin duplicados
        document.querySelectorAll("#editAttributesList .attribute-value").forEach(input => {
            let attrId = parseInt(input.dataset.attrId);
            let attrValue = input.value;

            // Verificar si ya existe en selectedEditAttributes para evitar duplicados
            if (!selectedEditAttributes.some(attr => attr.AttributeId === attrId)) {
                selectedEditAttributes.push({
                    AttributeId: attrId,
                    Value: attrValue
                });
            }
        });

        // Obtener etiquetas editadas sin duplicados
        document.querySelectorAll("#editTagsList .input-group").forEach(div => {
            let input = div.querySelector(".tag-name");
            let tagId = parseInt(div.dataset.tagId);

            if (!selectedEditTags.some(tag => tag.TagId === tagId)) {
                selectedEditTags.push({
                    TagId: tagId,
                    Name: input.value
                });
            }
        });

        // Actualizar objeto en la API
        fetch(`https://stackqr.bsite.net/api/objects/${objectId}`, {
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
            console.log("Objeto actualizado correctamente.");

            // Asignar etiquetas al objeto
            if (selectedEditTags.length > 0) {
                return fetch(`https://stackqr.bsite.net/api/tags/assign/${objectId}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(selectedEditTags.map(tag => tag.TagId))
                });
            }
        })
        .then(response => {
            if (response && !response.ok) {
                throw new Error("No se pudieron asignar las etiquetas.");
            }
            console.log("Etiquetas asignadas correctamente.");
        })
        .then(() => {
            // Asignar atributos al objeto
            assignAttributesToObject(objectId, selectedEditAttributes);
            // if (selectedEditAttributes.length > 0) {
            //     return fetch(`https://stackqr.bsite.net/api/attributes/assign/${objectId}`, {
            //         method: "POST",
            //         headers: {
            //             "Content-Type": "application/json"
            //         },
            //         body: JSON.stringify(selectedEditAttributes)
            //     });
            // }
        })
        .then(response => {
            if (response && !response.ok) {
                throw new Error("No se pudieron asignar los atributos.");
            }
            console.log("Atributos asignados correctamente.");
        })
        .then(() => {
            // Recargar la lista de objetos y cerrar modal
            fetchObjects(inventoryId);
            document.getElementById("editObjectForm").reset();
            let modal = bootstrap.Modal.getInstance(document.getElementById("editObjectModal"));
            modal.hide();
            document.getElementById("editObjectModal").setAttribute("aria-hidden", "true");

        })
        .catch(error => {
            console.error("Error en el proceso de edición:", error);
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

    // Manejar el boton de anadir etiqueta
    document.getElementById("addTagToEditListBtn").addEventListener("click", function () {
        let tagSelect = document.getElementById("editTagSelect");
        let selectedTagId = tagSelect.value;
        let selectedTagName = tagSelect.options[tagSelect.selectedIndex].text;
    
        if (!selectedTagId) {
            console.error("No se seleccionó ninguna etiqueta.");
            return;
        }
    
        // Agregar la etiqueta visualmente
        addTagToEditList(selectedTagId, selectedTagName);
    
        // Guardar en la lista de etiquetas seleccionadas
        selectedEditTags.push({ TagId: selectedTagId, Name: selectedTagName });
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

// Funcion para obtener atributos para editar
function fetchAttributesForEdit() {
    fetch("https://stackqr.bsite.net/api/attributes")
        .then(response => response.json())
        .then(data => {
            let attributeSelect = document.getElementById("editAttributeSelect");
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

// Funcion para obtener etiquetas para editar
function fetchTagsForEdit() {
    fetch("https://stackqr.bsite.net/api/tags")
        .then(response => response.json())
        .then(data => {
            let tagSelect = document.getElementById("editTagSelect");
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

// Función para manejar la adición de atributos en la edición
function handleAddAttributeToEdit() {
    let attributeSelect = document.getElementById("editAttributeSelect");
    let valueInput = document.getElementById("editAttributeValue");
    let attributeId = attributeSelect.value;
    let attributeName = attributeSelect.options[attributeSelect.selectedIndex].text;
    let attributeValue = valueInput.value.trim();

    if (!attributeId || !attributeValue) {
        console.error("Faltan datos del atributo");
        return;
    }

    addAttributeToEditList(attributeId, attributeName, attributeValue);
    selectedEditAttributes.push({ AttributeId: attributeId, Name: attributeName, Value: attributeValue });

    // Limpiar el input después de añadir
    valueInput.value = "";
}


// Función para manejar la adición de etiquetas en la edición
function handleAddTagToEdit() {
    let tagSelect = document.getElementById("editTagSelect");
    let tagId = tagSelect.value;
    let tagName = tagSelect.options[tagSelect.selectedIndex]?.text || "";

    if (!tagId) {
        console.error("No se seleccionó ninguna etiqueta.");
        return;
    }

    // Verificar si la etiqueta ya fue agregada
    if (selectedEditTags.some(tag => tag.TagId == tagId)) {
        console.warn("La etiqueta ya está agregada:", tagName);
        return; // Evita agregar etiquetas duplicadas
    }

    addTagToEditList(tagId, tagName);
    selectedEditTags.push({ TagId: tagId, Name: tagName });

    console.log("Etiqueta añadida correctamente:", tagId, tagName);
}


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

    selectedEditAttributes = [];
    selectedEditTags = [];

    fetchAttributesForEdit();
    fetchTagsForEdit();

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

    // Verificar si el atributo ya existe en el DOM
    if (document.querySelector(`#editAttributesList [data-attr-id="${attributeId}"]`)) {
        console.warn("Atributo ya existe en la lista, evitando duplicación:", name);
        return;
    }

    // Agregar al DOM
    let listItem = document.createElement("div");
    listItem.className = "input-group mb-2";
    listItem.innerHTML = `
        <input type="text" class="form-control attribute-name" value="${name}" readonly>
        <input type="text" class="form-control attribute-value" value="${value}" data-attr-id="${attributeId}">
        <button type="button" class="btn btn-danger" onclick="removeEditAttribute(this, ${attributeId})">
            <i class="bi bi-x"></i>
        </button>
    `;
    editAttributesList.appendChild(listItem);

    // Agregar al array si no existe
    if (!selectedEditAttributes.some(attr => attr.AttributeId === attributeId)) {
        selectedEditAttributes.push({ AttributeId: attributeId, Name: name, Value: value });
    }
}


// Función para añadir una etiqueta a la lista de edición (corrigiendo duplicados)
function addTagToEditList(tagId, name) {
    let editTagsList = document.getElementById("editTagsList");

    // Verificar si ya existe en el DOM
    if (document.querySelector(`#editTagsList [data-tag-id="${tagId}"]`)) {
        console.warn("Etiqueta ya existe en la lista:", name);
        return;
    }

    let listItem = document.createElement("div");
    listItem.className = "input-group mb-2";
    listItem.setAttribute("data-tag-id", tagId);

    listItem.innerHTML = `
        <input type="text" class="form-control tag-name" value="${name}" readonly>
        <button type="button" class="btn btn-danger" onclick="removeEditTag(this, ${tagId})">
            <i class="bi bi-x"></i>
        </button>
    `;

    editTagsList.appendChild(listItem);
}

// Funcion para anadir etiquetas a un objeto
function addTagsToObject(objectId, selectedTagIds) {
    if (!selectedTagIds.length) return;

    fetch(`https://stackqr.bsite.net/api/tags/assign/${objectId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(selectedTagIds)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Etiquetas añadidas:", data);
        fetchObjectDetails(objectId); // Recargar detalles del objeto
    })
    .catch(error => console.error("Error al añadir etiquetas:", error));
}

// Función para eliminar la relación entre un objeto y un atributo
function removeEditAttribute(button, attributeId) {
    event.preventDefault(); // Evita que el formulario se envíe y cierre el modal

    let objectId = document.getElementById("editObjectId").value;

    fetch(`https://stackqr.bsite.net/api/attributes/remove/${objectId}/${attributeId}`, {
        method: "DELETE"
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("No se pudo eliminar la relación del atributo con el objeto.");
        }
        return response.json();
    })
    .then(() => {
        console.log(`Atributo ${attributeId} eliminado del objeto ${objectId}`);
        
        // Eliminar visualmente el atributo del DOM
        button.parentElement.remove();

        // Filtrar el atributo de la lista de atributos seleccionados
        selectedEditAttributes = selectedEditAttributes.filter(attr => attr.AttributeId !== attributeId);

        console.log("Lista actualizada de atributos:", selectedEditAttributes);
    })
    .catch(error => {
        console.error("Error al eliminar la relación atributo-objeto:", error);
    });
}

// Función para eliminar una etiqueta de la edición del objeto
function removeEditTag(button, tagId) {
    let objectId = document.getElementById("editObjectId").value;

    fetch(`https://stackqr.bsite.net/api/tags/remove/${objectId}/${tagId}`, {
        method: "DELETE"
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("No se pudo eliminar la etiqueta.");
        }
        return response.json();
    })
    .then(() => {
        console.log(`Etiqueta ${tagId} eliminada del objeto ${objectId}`);

        // Eliminar visualmente la etiqueta del DOM
        button.parentElement.remove();

        // Filtrar la etiqueta del array de etiquetas seleccionadas
        selectedEditTags = selectedEditTags.filter(tag => tag.TagId != tagId);

        console.log("Lista actualizada de etiquetas:", selectedEditTags);
    })
    .catch(error => {
        console.error("Error al eliminar la etiqueta:", error);
    });
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

// Función para asignar atributos al objeto en edición
async function assignAttributesToObject(objectId, selectedEditAttributes) {
    if (selectedEditAttributes.length === 0) return;

    try {
        const requests = selectedEditAttributes.map(attr => {
            return fetch(`https://stackqr.bsite.net/api/attributes/assign/${objectId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    AttributeId: attr.AttributeId,
                    Value: attr.Value
                })
            });
        });

        const responses = await Promise.all(requests);
        for (const response of responses) {
            if (!response.ok) {
                throw new Error(`Error en la asignación de atributos: ${response.statusText}`);
            }
        }

        console.log("Todos los atributos se asignaron correctamente.");
    } catch (error) {
        console.error("Error al asignar atributos:", error);
    }
}

