document.addEventListener("DOMContentLoaded", loadAttributes);

function goBack() {
    window.history.back();
}

async function loadAttributes() {
    try {
        const response = await fetch("https://stackqr.bsite.net/api/attributes");
        if (!response.ok) throw new Error("Failed to fetch attributes");

        const attributes = await response.json();
        const tableBody = document.querySelector("#attributesTable tbody");
        tableBody.innerHTML = ""; // Clear existing content

        attributes.forEach(attr => {
            console.log(attr);
            const row = document.createElement("tr");
            row.innerHTML = `
                <td contenteditable="false" id="name-${attr.id_attribute}" class="align-middle">${attr.name}</td>
                <td class="align-middle text-end">
                    <button class="btn btn-sm btn-primary me-2" onclick="enableEdit(${attr.id_attribute})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-success me-2" onclick="updateAttribute(${attr.id_attribute})" id="save-${attr.id_attribute}" style="display:none;">
                        <i class="bi bi-check-lg"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteAttribute(${attr.id_attribute})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading attributes:", error);
    }
}


function enableEdit(attributeId) {
    const nameField = document.getElementById(`name-${attributeId}`);
    nameField.contentEditable = "true";
    nameField.focus();
    
    document.getElementById(`save-${attributeId}`).style.display = "inline"; // Show Save button
}

async function updateAttribute(attributeId) {
    const nameField = document.getElementById(`name-${attributeId}`);
    const newName = nameField.innerText.trim();
    console.log(`Updating attribute ${attributeId} with new name: ${newName}`);

    try {
        const response = await fetch(`https://stackqr.bsite.net/api/attributes/${attributeId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: attributeId, name: newName })
        });

        if (!response.ok) throw new Error("Failed to update attribute");

        console.log(`Attribute ${attributeId} updated successfully`);
        nameField.contentEditable = "false";
        document.getElementById(`save-${attributeId}`).style.display = "none"; // Hide Save button
    } catch (error) {
        console.error("Error updating attribute:", error);
    }
}

async function deleteAttribute(attributeId) {
    Swal.fire({
        title: "Seguro de que desea eliminar este atributo?",
        text: "No se pueden revertir los cambios",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Si!"
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch(`https://stackqr.bsite.net/api/attributes/${attributeId}`, {
                    method: "DELETE"
                });

                if (!response.ok) throw new Error("Fallo al eliminar el atributo");

                Swal.fire("Eliminado!", "El atributo se eliminio correctamente.", "success");
                loadAttributes(); // Refresh the attributes list
            } catch (error) {
                console.error("Error al eliminar el atributo:", error);
                Swal.fire("Error!", "Error al eliminar.", "error");
            }
        }
    });

}

