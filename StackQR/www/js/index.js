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
        const rows = document.querySelectorAll('#table-body tr');
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

