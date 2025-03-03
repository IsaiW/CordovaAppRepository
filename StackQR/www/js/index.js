// Función para traer vistas e incrustarlas en elementos, con callback opcional
function loadView(viewName, IdElement = null, isAppend = false, callback = () => {}) {
    $.ajax({
        url: 'views/' + viewName + '.html',
        type: 'GET',
        success: function (response) {
            if (IdElement === null) {
                console.error('Elemento contenedor (IdElement) no definido');
            } else {
                isAppend 
                  ? $('#' + IdElement).append(response) 
                  : $('#' + IdElement).html(response);
                callback(); // Ejecuta el callback una vez que la vista se ha cargado
            }
        },
        error: function (xhr, status, error) {
            console.error('Error al cargar la vista parcial: ' + error);
        }
    });
}

//Funcion que pide una imagen dentro del formulario de item-objeto (Arreglar)
// function previewImage(event) {
//     const file = event.target.files[0];
//     if (file) {
//         const reader = new FileReader();
//         reader.onload = function(e) {
//             const container = document.getElementById('itemImg');
//             container.style.backgroundImage = `url(${e.target.result})`;
//             container.style.backgroundSize = "cover";
//             container.style.backgroundPosition = "center";
//             container.innerHTML = ""; // Quita el ícono
//         };
//         reader.readAsDataURL(file);
//     }
// }


function addNewFolder() {
    const folderName = prompt("Ingrese el nombre de la nueva carpeta:");
    if (folderName) {
        const tableBody = document.getElementById('table-body');
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td><strong></strong></td>
            <td>
                <strong>${folderName}</strong>
                <button class="btn btn-secondary btn-sm" onclick="addNewObject(this)">Agregar Objeto</button>
                <div class="object-list"></div>
            </td>
        `;
        tableBody.appendChild(newRow);
    }
}


function addNewObject(button) {
    const objectName = prompt("Ingrese el nombre del nuevo objeto:");
    if (objectName) {
        const row = button.closest('td');
        const objectList = row.querySelector('.object-list');
        const newObjectDiv = document.createElement('div');
        newObjectDiv.classList.add('mb-3');
        newObjectDiv.innerHTML = `
            <div>
                <input type="file" accept="image/*" onchange="previewImage(event, this)" class="form-control mb-2">
                <div class="image-preview mb-2"></div>
                <span>${objectName}
                    <button class="btn btn-danger btn-sm" onclick="deleteObject(this)">-</button>
                </span>
            </div>
        `;
        objectList.appendChild(newObjectDiv);
    }
}

function deleteObject(button) {
    const objectDiv = button.closest('div');
    objectDiv.remove();
}

function previewImage(event, input) {
    const imagePreview = input.nextElementSibling;
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        imagePreview.innerHTML = `<img src="${e.target.result}" alt="Image Preview" class="img-thumbnail" style="max-width: 100px; max-height: 100px;">`;
    }
    if (file) {
        reader.readAsDataURL(file);
    }
}

function searchFolder() {
    const searchQuery = prompt("Ingrese el nombre de la carpeta a buscar:");
    if (searchQuery) {
        const rows = document.querySelectorAll('inventoryList');
        let found = false;
        rows.forEach(row => {
            const folderCell = row.cells[0];
            if (folderCell && folderCell.textContent.trim().toLowerCase() === searchQuery.toLowerCase()) {
                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                folderCell.style.backgroundColor = "yellow";
                setTimeout(() => folderCell.style.backgroundColor = "", 2000);
                found = true;
            }
        });
        if (!found) {
            alert("Carpeta no encontrada.");
        }
    }
}

/** Muestra los detalles de un objeto en una ventana modal. */

function showObjectDetails(name, image, quantity, description) {
    // Asigna los valores recibidos a los elementos del modal
    document.getElementById('objectName').innerText = name;
    document.getElementById('objectImage').src = image;
    document.getElementById('objectQuantity').innerText = quantity;
    document.getElementById('objectDescription').innerText = description;
    
    // Inicializa y muestra el modal de Bootstrap
    var objectModal = new bootstrap.Modal(document.getElementById('objectModal'));
    objectModal.show();
}


// Agregado por Venegas
// Función para crear el objeto, generar el QR y guardarlo
function guardarItem() {
    let fileInput = document.getElementById('fileInput');
    let nombre = document.getElementById('nombreItem').value;
    let cantidad = document.getElementById('cantidad').value;
    let notas = document.getElementById('notesItem').value;

    if (!fileInput.files.length || !nombre || !cantidad || !notas) {
        alert("Por favor, complete todos los campos.");
        return;
    }

    let reader = new FileReader();
    reader.onload = function () {
        let imageBase64 = reader.result;

        // Crear el objeto con los datos
        let item = {
            image: imageBase64,
            nombre: nombre,
            cantidad: cantidad,
            notas: notas
        };

        // Convertir el objeto en JSON para el QR
        let qrData = JSON.stringify({ nombre, cantidad, notas });

        // Llamar a la función para agregar el objeto a la lista
        agregarItemALista(item, qrData);

        // Guardar en sessionStorage sin la imagen en Base64
        guardarsessionStorage(item, qrData);
    };

    reader.readAsDataURL(fileInput.files[0]); // Leer la imagen como Base64
}

// Función para agregar solo el nombre del objeto a la lista
function agregarItemALista(item, qrData) {
    let inventoryList = document.getElementById("inventoryList");

    // Crear el elemento de la lista
    let itemElement = document.createElement("div");
    itemElement.classList.add("list-group-item", "list-group-item-action");
    itemElement.textContent = item.nombre;

    // Agregar evento onclick para abrir el div-modal con los detalles
    itemElement.onclick = function () {
        mostrarDetallesEnDiv(item, qrData);
    };

    // Agregar el ítem a la lista
    inventoryList.appendChild(itemElement);
}

// Función para mostrar los detalles en un div-modal
function mostrarDetallesEnDiv(item, qrData) {
    let modalDiv = document.getElementById("modalDiv");
    let modalContent = document.getElementById("modalContent");
    let qrContainer = document.getElementById("qrContainer");

    // Asignar valores al modal
    modalContent.innerHTML = `
        <h2>${item.nombre}</h2>
        <img src="${item.image}" class="img-fluid rounded mb-3" alt="Item Image">
        <p><strong>Cantidad:</strong> ${item.cantidad}</p>
        <p><strong>Notas:</strong> ${item.notas}</p>
        <button class="close-btn" onclick="cerrarModal()">Cerrar</button>
    `;

    // Limpiar el contenedor antes de generar el QR (evita duplicados)
    qrContainer.innerHTML = "";

    // Generar el código QR dentro del div
    generarQR(qrData, qrContainer);

    // Mostrar el div-modal
    modalDiv.style.display = "flex";
}

// Función para cerrar el modal
function cerrarModal() {
    document.getElementById("modalDiv").style.display = "none";
}

// Función para generar el QR
function generarQR(texto, contenedor) {
    if (!texto || !contenedor) {
        console.error("Datos insuficientes para generar el código QR.");
        return;
    }

    new QRCode(contenedor, {
        text: texto,
        width: 150,
        height: 150
    });
}

// Función para guardar en sessionStorage sin la imagen Base64
function guardarsessionStorage(item, qrData) {
    let inventario = JSON.parse(sessionStorage.getItem("inventario")) || [];

    let itemSinImagen = {
        nombre: item.nombre,
        cantidad: item.cantidad,
        notas: item.notas,
        qrData: qrData
    };

    inventario.push(itemSinImagen);

    try {
        sessionStorage.setItem("inventario", JSON.stringify(inventario));
    } catch (error) {
        console.error("No se pudo guardar en sessionStorage: almacenamiento lleno.");
        alert("El almacenamiento está lleno. No se pudo guardar el ítem.");
    }
}


// Función para previsualizar la imagen seleccionada
function previewImage(event) {
    let file = event.target.files[0]; // Obtener el archivo seleccionado
    let reader = new FileReader();

    reader.onload = function() {
        let previewImg = document.getElementById("previewImg");
        previewImg.src = reader.result; // Asignar la imagen al preview
    };

    if (file) {
        reader.readAsDataURL(file);
    }
}