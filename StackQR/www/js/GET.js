//Este script utiliza una API diferente para utilizarla como pruebas.
//Muy probablemente lo convierte en async/await.
fetch('https://jsonplaceholder.typicode.com/users') //Promeso que obtine los usuarios de la api
.then(response => { //Agarra la promeso o respuesta
    return response.json() //Transforma en js. Esto tambien es una promesa
}) 
.then(data =>{ //Esto agarra la promesa anterior
    data.forEach(user => { //Loop que pasa por cada usuario y lo almacena en user
        const name = //Con esta variable se guarda la estrutura html que se incrusta en el div con id inventoryList.
        `<div class = "flex-column mb-3">
            <div class = "d-flex flex-row gap-3">
                <div>
                <img src="img/icons/carpeta.svg" style="width: 80px; height: 80px;" alt=""> 
                </div>
                
                <div class= "bg-secondary flex-grow-1">
                <h3>${user.email}</h3>
                </div>
            </div>
        </div>`
//El icon lo podemos cambiar despues

        document.getElementById('inventoryList').insertAdjacentHTML('beforeend', name) 
        // console.log(user)
    })
})
.catch(error => {console.log(error)})
// ${user.name}
// ${user.email}
