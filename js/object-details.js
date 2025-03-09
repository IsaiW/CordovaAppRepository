document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const objectId = urlParams.get("objectId");

    if (!objectId) {
        Swal.fire("Error", "No se ha seleccionado un objeto válido", "error");
        console.error("No se encontró objectId en la URL.");
        return;
    }

    fetchObjectDetails(objectId);
});

function fetchObjectDetails(objectId) {
    fetch(`https://stackqr.bsite.net/api/objects/${objectId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("No se pudo obtener el objeto");
            }
            return response.json();
        })
        .then(data => {
            let detailsContainer = document.getElementById("objectDetails");

            // Asegurar que Attributes y Tags no sean null
            let attributes = data.attributes || [];
            let tags = data.tags || [];

            // Colores alternativos para las etiquetas
            const tagClasses = ["tag-blue", "tag-dark-blue", "tag-red", "tag-dark-red", "tag-green", "tag-dark-green"];
            
            let tagElements = tags.length > 0 
                ? tags.map((tag, index) => 
                    `<span class="tag-container ${tagClasses[index % tagClasses.length]}">
                        ${tag.tagName} 
                        <button class="remove-tag-btn" onclick="removeTag(${objectId}, ${tag.tagId})">&times;</button>
                    </span>`
                  ).join("")
                : "<p>No hay etiquetas asignadas</p>";

            let detailsHTML = `
                <div class="card">
                    <img src="https://stackqr.bsite.net${data.image || '/img/default.png'}" 
                         class="card-img-top object-image" 
                         onerror="this.style.display='none'" 
                         alt="Imagen del objeto">
                    <div class="card-body">
                        <h5 class="card-title">${data.name}</h5>
                        <p class="card-text"><strong>Cantidad:</strong> ${data.quantity}</p>
                        <p class="card-text"><strong>Tipo de QR:</strong> ${data.typeQR}</p>
                        <p class="card-text"><strong>Fecha de Creación:</strong> ${new Date(data.date).toLocaleDateString()}</p>
                        ${attributes.length > 0 
                            ? attributes.map(attr => `<strong>${attr.name}:</strong> ${attr.value}<br>`).join("") 
                            : ""}
                        <br>
                        <h5>Etiquetas</h5>
                        <div>${tagElements}</div>
                    </div>
                </div>
            `;

            detailsContainer.innerHTML = detailsHTML;
        })
        .catch(error => {
            console.error("Error al obtener detalles del objeto:", error);
            Swal.fire("Error", "No se pudo cargar el objeto", "error");
        });
}

// Funcion para regresar a la página anterior
function goBack() {
    window.history.back();
}

// Función para eliminar una etiqueta
function removeTag(objectId, tagId) {
    Swal.fire({
        title: "¿Eliminar esta etiqueta?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
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
                Swal.fire("Eliminado", "La etiqueta fue eliminada correctamente", "success");
                console.log(objectId);
                fetchObjectDetails(objectId); 
            })
            .catch(error => {
                console.error("Error al eliminar la etiqueta:", error);
                Swal.fire("Error", "No se pudo eliminar la etiqueta", "error");
            });
        }
    });
}
