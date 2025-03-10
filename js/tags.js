document.addEventListener("DOMContentLoaded", loadTags);

function goBack() {
    window.history.back();
}

async function loadTags() {
    try {
        const response = await fetch("https://stackqr.bsite.net/api/tags"); // Adjust API endpoint if needed
        if (!response.ok) throw new Error("Failed to fetch tags");

        const tags = await response.json();
        const tableBody = document.querySelector("#tagsTable tbody");
        tableBody.innerHTML = ""; // Clear existing content

        tags.forEach(tag => {
            console.log(tag);
            const row = document.createElement("tr");
            row.innerHTML = `
                <td contenteditable="false" id="name-${tag.id_tag}" class="align-middle">${tag.name}</td>
                <td class="align-middle text-end">
                    <button class="btn btn-sm btn-primary me-2" onclick="enableEdit(${tag.id_tag})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-success me-2" onclick="updatetag(${tag.id_tag})" id="save-${tag.id_tag}" style="display:none;">
                        <i class="bi bi-check-lg"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deletetag(${tag.id_tag})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading tags:", error);
    }
}

function enableEdit(tagId) {
    const nameField = document.getElementById(`name-${tagId}`);
    nameField.contentEditable = "true";
    nameField.focus();
    document.getElementById(`save-${tagId}`).style.display = "inline"; // Show Save button
}

async function updatetag(tagId) {
    const nameField = document.getElementById(`name-${tagId}`);
    const newName = nameField.innerText.trim();

    try {
        const response = await fetch(`https://stackqr.bsite.net/api/tags/${tagId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: tagId, name: newName })
        });

        if (!response.ok) throw new Error("Failed to update tag");

        console.log(`tag ${tagId} updated successfully`);
        nameField.contentEditable = "false";
        document.getElementById(`save-${tagId}`).style.display = "none"; // Hide Save button
    } catch (error) {
        console.error("Error updating tag:", error);
    }
}

async function deletetag(tagId) {
    Swal.fire({
        title: "Seguro de que desea eliminar esta etiqueta?",
        text: "No se pueden revertir los cambios",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Si!"
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch(`https://stackqr.bsite.net/api/tags/${tagId}`, {
                    method: "DELETE"
                });
                console.log(tagId)
                if (!response.ok) throw new Error("Fallo al eliminar la etiqueta");

                Swal.fire("Eliminado!", "La etiqueta se eliminio correctamente.", "success");
                loadTags(); // Refresh the labels list
            } catch (error) {
                console.error("Error al eliminar la etiqueta:", error);
                Swal.fire("Error!", "Error al eliminar.", "error");
            }
        }
    });

}


