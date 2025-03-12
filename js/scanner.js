function scanQRCode() {
    const scanButtonContainer = document.getElementById("scanButtonContainer");
    const readerContainer = document.getElementById("readerContainer");
    const readerElement = document.getElementById("reader");

    // Oculta el botón y muestra el escáner
    scanButtonContainer.style.display = "none";
    readerContainer.classList.remove("d-none");

    // Iniciar el escáner
    const html5QrCode = new Html5Qrcode("reader");

    html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
            document.getElementById("result").innerText = "Código QR: " + decodedText;
            
            // Detiene la cámara
            html5QrCode.stop();

            // Oculta el escáner y vuelve a mostrar el botón
            scanButtonContainer.style.display = "block";
            readerContainer.classList.add("d-none");

            // Redirigir a la página de detalles del objeto
            window.location.href = `object-details.html?objectId=${decodedText}`;
        },
        (errorMessage) => {
            console.log(errorMessage);
        }
    ).catch(err => {
        console.log("Error al iniciar la cámara:", err);
    });

    // Cerrar escáner manualmente
    document.getElementById("closeScanner").addEventListener("click", function() {
        html5QrCode.stop();
        scanButtonContainer.style.display = "block";
        readerContainer.classList.add("d-none");
    });
}

document.getElementById("scanButton").addEventListener("click", scanQRCode);

function goBack() {
    window.history.back();
}