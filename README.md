# Cordova-Proyect GIT Repository 
This is a proyect made for an assignation in my school, is a andorid aplicacion, wich can generate and scan QR for inventory managment.

**Planteamiento de Funciones**

**1. Gestión de Base de Datos**
   
  Creación de objetos:
  
   Permitir al usuario crear registros en la base de datos con atributos personalizables (nombre, descripción, categoría, etc.).
   Ejemplo de atributos:
     ID
     Nombre del objeto
     Descripción
     Fecha de registro
     Estado (activo/inactivo)
   Almacenamiento local: Utilizar SQLite para guardar los datos directamente en el dispositivo.
      
  Consulta:
  
   Implementar una funcionalidad de búsqueda y filtrado por atributos.

**2. Generación de Códigos QR**

  Generación dinámica:
  
   Crear un QR para cada objeto en la base de datos que apunte a una URL o referencia local.
   Usar un plugin de Cordova como cordova-plugin-qr-generator.
   
  Atributos en el QR:
  
   Codificar los datos relevantes del objeto o un enlace a la ubicación donde se almacenan.
   Descarga/Compartición: Guardar el QR generado como imagen y permitir compartirlo.
  
**3. Lectura de Códigos QR**
   
  Escaneo de QR:
  
   Usar el plugin cordova-plugin-qrscanner para escanear códigos.
   Al escanear, recuperar la información del objeto desde la base de datos.
      
  Validación:
  
   Verificar si el QR pertenece a un objeto registrado en la base de datos antes de mostrar información.
  
**4. Edición de Objetos**
   
  Modificación:
  
   Permitir al usuario editar los atributos del objeto incluso después de generar el QR.
   Sincronización del QR:
   Actualizar la información del QR generado para reflejar los cambios realizados.
  
**5. Reutilización de Atributos**
    
  Plantillas:
  
   Crear plantillas de atributos para objetos similares, facilitando la creación de nuevos registros.
   
Duplicación:   
   
   Permitir duplicar registros existentes y modificar solo lo necesario.




**Flujo Básico del Usuario**

Inicio:

   Pantalla de bienvenida con opciones principales: Crear objeto, Escanear QR, Ver base de datos.
    
  Creación de Objeto:
  
   Formulario para ingresar atributos y guardar en la base de datos.
    
  Generación de QR:
  
   Botón en el detalle del objeto para generar un QR y guardarlo como imagen.
    
  Edición:
  
   Acceso a la lista de objetos con opción de editar y guardar cambios.
    
  Escaneo:
  
   Abrir el escáner QR, identificar el objeto y mostrar los detalles almacenados.
    

