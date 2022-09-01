import {autocomplete, searchArray} from "./search.js"
import {displayLoading, hideLoading, loading} from "./loading.js"

let pokelistContainer = document.querySelector(".pokemon-list")
const homeBtn = document.getElementById("button-home")
const searchField = document.getElementById("search-form")
const searchInput = document.getElementById("myInput")
const searchError = document.getElementById("error-msg")
const eraBtns = document.querySelectorAll(".era-btn")

let pokemonListData = []
let pokemonData = []

//TODO: Module cleanup, overall cleanup of code
//TODO: Go through code and add comments

//Function that fetches list of pokemon's with id between 0-151 (the original pokemon's)
async function fetchPokemonList(action = "https://pokeapi.co/api/v2/pokemon/?offset=0&limit=151"){
    displayLoading()
    pokelistContainer.innerHTML = ""
    let currentPokemon = 0
    //delete all data in array to avoid adding on more pokemon's when rendering
    pokemonListData.length = 0
    await fetch(action)
    .then((response) => {
        if (response.status !== 200) {
            searchError.textContent = "Something went wrong when fetching pokemons..."
            hideLoading()
            throw Error("It didn't fucking work")
        }
        return response.json()
    })
    .then((data) => {
        data.results.forEach((pokemon, index) => {
            currentPokemon++
            fetchPokemonData(pokemon, currentPokemon, data.results.length)
        })
        hideLoading()
    })
}
//Function that fetches more data per pokemon based on params from fetchPokemonList
//Pushes the data from the request to a global array
//Sorts based on the currentPokemon variable and the original fetch request length (based on pokemon ID)
//update the array with sorted data
//then renders out the list
async function fetchPokemonData(pokemon, current = null, total = null){
    displayLoading()
    let pokemonUrl = pokemon.url
    await fetch(pokemonUrl)
    .then((response) => {
        if (response.status !== 200) {
            searchError.textContent = "Something went wrong when fetching pokemons..."
            hideLoading()
            throw Error("It didn't fucking work")
        }
        return response.json()
    })
    .then((data) =>{
        if (current && total) {
            pokemonListData.push({ data })
            if (current === total) {
                //Sort array based on ID (int)
                let orderData = pokemonListData.sort(function (a, b) {
                    return parseFloat(a.data.id) - parseFloat(b.data.id);
                })
                //Set pokemonListData to the new ordered array
                pokemonListData = orderData
                renderPokemonList(pokemonListData)
            }
        }
        hideLoading()
    })
}
//This function runs when user either searches an accepted search string, or click on a card in the list
//Renders the page with a single card with more data then what available in the entire list
async function fetchSinglePokemon(nameOrId){
    searchError.textContent = ""
    displayLoading()
    let pokemonUrl = "https://pokeapi.co/api/v2/pokemon/" + nameOrId
    await fetch(pokemonUrl)
    .then((response) =>  {
        if (response.status !== 200) {
            searchError.textContent = "Could not find this pokemon, try another one"
            hideLoading()
            throw Error("It didn't fucking work")
        }
        searchError.textContent = ""
        return response.json()
    })
    .then((data) => {
        //clear array before pushing new data
        pokemonData.pop()
        pokemonData.push({ data })
        renderSinglePokemon(pokemonData)
        hideLoading()
    })
}

function renderSinglePokemon(pokeData) {
    pokelistContainer.innerHTML = ""
    let d = pokeData[0].data
    const statsArray = ["Weight", "Height", "Ability"]

    let pokemonImageUrl = `https://img.pokemondb.net/sprites/home/normal/${d.name}.png`
    let flexWrapper = document.createElement("div")
    flexWrapper.classList.add("big-pokomon-card-flex-wrapper", "row")

    let pokemonCard = document.createElement("div")
    pokemonCard.classList.add("pokemon-big-card", "card-bg")
    pokemonCard.setAttribute("data-id", d.id)
    pokemonCard.setAttribute("data-name", d.name)
    pokemonCard.setAttribute("data-type", d.types[0]["type"]["name"])

    let pokemonHeading = document.createElement("h2")
    pokemonHeading.classList.add("pokemon-name")
    pokemonHeading.textContent = d.name

    let pokemonImageContainer = document.createElement("div"),
        pokemonImage = document.createElement("img")
    pokemonImageContainer.classList.add("image-container")
    pokemonImage.setAttribute("src", pokemonImageUrl)
    pokemonImage.setAttribute("alt", "Front facing " + d.name)

    let pokemonTypeof = document.createElement("div")
    pokemonTypeof.classList.add("pokemon-typeOf")
        //Needed a forEach incase pokemon had multiple types
        //unsure of the performance of nested forEach loops
        d.types.forEach(slot => {
            let elementType = document.createElement("span")
            elementType.classList.add("element-type")
            elementType.textContent = slot.type.name
            pokemonTypeof.append(elementType)
        });
    
    let statWrapper = document.createElement("div"),
        mainStats = document.createElement("div"),
        statsHeading = document.createElement("h3")

    statWrapper.classList.add("pokemon-stats-wrapper")
    mainStats.classList.add("main-stats")
    statsHeading.textContent = "Stats"

    statsArray.forEach(stat => {
        let mainStat = document.createElement("span"),
            statHeading = document.createElement("h4"),
            statData = document.createElement("p")
        mainStat.classList.add("main-stat")
        statHeading.textContent = stat
        //BUG Fix it so stats are generated dynamically 
        //Possible soulution is to change statsArray to contain 3 objects, where data is updated per pokemon?
        mainStat.append(statHeading, statData)
        mainStats.append(mainStat)
    })

    statWrapper.append(statsHeading, mainStats)

    d.stats.forEach(stat => {
        let sliderStats = document.createElement("div"),
            bar = document.createElement("div"),
            barIndicator = document.createElement("div"),
            sliderHeading = document.createElement("h6")
        sliderStats.classList.add("slider-stats")

        let percent = (stat.base_stat / 1.8) 

        sliderHeading.textContent = stat.stat.name.toUpperCase()
        bar.classList.add("bar")
        barIndicator.classList.add("bar-indicator", stat.stat.name)
        barIndicator.textContent = stat.base_stat
        barIndicator.style.width = percent + "%"
        bar.append(barIndicator)
        sliderStats.append(sliderHeading, bar)
        statWrapper.append(sliderStats)
    })
   
    pokemonImageContainer.append(pokemonImage)
    
    pokemonCard.append(pokemonHeading, pokemonImageContainer, pokemonTypeof)
    flexWrapper.append(pokemonCard, statWrapper)
    pokelistContainer.appendChild(flexWrapper)
}

function renderPokemonList() {
    displayLoading()
    pokelistContainer.innerHTML = ""
    
    pokemonListData.forEach(pokemon => {
        let pokemonImageUrl = `https://img.pokemondb.net/sprites/home/normal/${pokemon.data.name}.png`

        let pokemonListCard = document.createElement("div")
        pokemonListCard.classList.add("card", "pokemon-list-card", "card-bg")
        pokemonListCard.setAttribute("data-id", pokemon.data.id)
        pokemonListCard.setAttribute("data-name", pokemon.data.name)
        pokemonListCard.setAttribute("data-type", pokemon.data.types[0]["type"]["name"])
        
        let pokemonImageContainer = document.createElement("div"),
            pokemonImage = document.createElement("img"),
            pokemonIdSpan = document.createElement("span")
        pokemonImageContainer.classList.add("image-container")
        pokemonImage.setAttribute("src", pokemonImageUrl)
        pokemonImage.setAttribute("alt", "Front facing " + pokemon.data.name)
        pokemonIdSpan.classList.add("pokemon-id")
        pokemonIdSpan.textContent = "#" + pokemon.data.id
        
        let pokemonHeader = document.createElement("h2")
        pokemonHeader.classList.add("pokemon-name")
        pokemonHeader.textContent = pokemon.data.name

        let pokemonTypeof = document.createElement("div")
        pokemonTypeof.classList.add("pokemon-typeOf")
        //Needed a forEach incase pokemon had multiple types
        //unsure of the performance of nested forEach loops
        pokemon.data.types.forEach(slot => {
            let elementType = document.createElement("span")
            elementType.classList.add("element-type")
            elementType.textContent = slot.type.name
            pokemonTypeof.append(elementType)
        })

        pokemonImageContainer.append(pokemonIdSpan, pokemonImage)
        pokemonListCard.append(pokemonImageContainer, pokemonHeader, pokemonTypeof)
        pokelistContainer.appendChild(pokemonListCard)

        pokemonListCard.addEventListener("click", (event) => {
            event.preventDefault();
            let renderPokemonId = pokemonListCard.getAttribute("data-id")
            fetchSinglePokemon(renderPokemonId)
        });
    })
    hideLoading()
}
homeBtn.addEventListener("click", () =>{
    renderPokemonList()
})
searchField.addEventListener("submit", (event) => {
    event.preventDefault()
    let targetValue = ""
    const data = new FormData(event.target);
    //Fancy way of grabbing form input value
    if (searchInput.value != ""){
        searchError.textContent = ""
        for (const pair of data.entries()) {
        targetValue = `${pair[1].toLocaleLowerCase()}`
        fetchSinglePokemon(targetValue)}
    } else {
        searchError.textContent="Please type something to search"
    }
});

eraBtns.forEach((btn) => {
    let eraId = btn.getAttribute("id") 
    btn.addEventListener("click", (event) => {
        if(eraId === "kanto") fetchPokemonList()
        else if (eraId === "johto") fetchPokemonList("https://pokeapi.co/api/v2/pokemon/?offset=151&limit=99")
        else if (eraId === "hoenn") fetchPokemonList("https://pokeapi.co/api/v2/pokemon/?offset=252&limit=134")
        else if (eraId === "sinnoh") fetchPokemonList("https://pokeapi.co/api/v2/pokemon/?offset=387&limit=106")
        else if (eraId === "unova") fetchPokemonList("https://pokeapi.co/api/v2/pokemon/?offset=494&limit=155")
        else if (eraId === "kalos") fetchPokemonList("https://pokeapi.co/api/v2/pokemon/?offset=650&limit=71")
        else if (eraId === "alola") fetchPokemonList("https://pokeapi.co/api/v2/pokemon/?offset=722&limit=87")
        else if (eraId === "galar") fetchPokemonList("https://pokeapi.co/api/v2/pokemon/?offset=810&limit=88")
    })
})

autocomplete(document.getElementById("myInput"), searchArray);

//Initialize page
fetchPokemonList()