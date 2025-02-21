function addNewFolder(folderName) {
    if (folderName) {
        const tableBody = document.getElementById('table-body');
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td><strong>${folderName}</strongs></td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="addNewObject(this)">Agregar Objeto</button>
                <div class="object-list"></div>
            </td>
        `;
        tableBody.appendChild(newRow);
        
        // Agregar carpeta al select del modal
        const folderSelect = document.getElementById('folderSelect');
        const newOption = document.createElement('option');
        newOption.value = folderName;
        newOption.textContent = folderName;
        folderSelect.appendChild(newOption);
    }
}

function addNewObject(button, objectName = null) {
    if (!objectName) {
        objectName = prompt("Ingrese el nombre del nuevo objeto:");
    }
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

function addItem() {
    let objectName = document.getElementById('itemName').value;
    let selectedFolder = document.getElementById('folderSelect').value;
    if (objectName && selectedFolder) {
        const rows = document.querySelectorAll('#table-body tr');
        rows.forEach(row => {
            if (row.cells[0] && row.cells[0].textContent.trim() === selectedFolder) {
                addNewObject(row.cells[1].querySelector('button'), objectName);
            }
        });
        let modal = bootstrap.Modal.getInstance(document.getElementById('addItemModal'));
        modal.hide();
    }
}

function addFolder() {
    let folderName = document.getElementById('folderName').value;
    if (folderName) {
        addNewFolder(folderName);
        let modal = bootstrap.Modal.getInstance(document.getElementById('addItemModal'));
        modal.hide();
    }
}
