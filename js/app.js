//Imports
import {autocomplete, searchArray} from "./search.js"
import {displayLoading, hideLoading, loading} from "./loading.js"

//Global variables
let pokelistContainer = document.querySelector(".pokemon-list")
const homeBtn = document.getElementById("button-home")
const searchField = document.getElementById("search-form")
const searchInput = document.getElementById("myInput")
const searchError = document.getElementById("error-msg")
const eraBtns = document.querySelectorAll(".era-btn")

//Empty arrays for data storage
let pokemonListData = []
let pokemonData = []

//TODO: Module cleanup, overall cleanup of code
//TODO: Go through code and add comments

//Function that fetches list of pokemon's based on url offset and limit)
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
        //Loop through each data point, ++ to currentPokemon to match it in the fetchPokemonData
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
//fetches data based on pokemon name or ID
//Could probably rewrite this to use data that exist, and if it doesnt look up new data maybe a todo 
//TODO:Optimize code to reuse data from pokemonData array
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
        console.log(pokemonData);
        hideLoading()
    })
}
/// Renders out a single pokemon card with more data then available when displayed in the list
function renderSinglePokemon(pokeData) {
    //Clear out container
    pokelistContainer.innerHTML = ""
    //Short hand for cleaner code
    let d = pokeData[0].data
    //Object with stats for generating elements based on keys.length
    let statsObj = {
        weight: 0,
        height: 0, 
        ability: ""
    }
    Object.assign(statsObj, {
        weight: (d.weight / 10), 
        height: (d.height / 10), 
        ability: d.abilities[0].ability.name
    })
    
    let pokemonImageUrl = `https://img.pokemondb.net/sprites/home/normal/${d.name}.png`
    let flexWrapper = document.createElement("div")
    flexWrapper.classList.add("big-pokomon-card-flex-wrapper", "row")

    //Right container, displaying the image + name
    let pokemonCard = document.createElement("div")
    pokemonCard.classList.add("pokemon-big-card", "card-bg")
    pokemonCard.setAttribute("data-id", d.id)
    pokemonCard.setAttribute("data-name", d.name)
    pokemonCard.setAttribute("data-type", d.types[0]["type"]["name"])
    //Heading with pokemon name
    let pokemonHeading = document.createElement("h2")
    pokemonHeading.classList.add("pokemon-name")
    pokemonHeading.textContent = d.name.capitalize()
    //Image container
    let pokemonImageContainer = document.createElement("div"),
        pokemonImage = document.createElement("img")
    pokemonImageContainer.classList.add("image-container")
    pokemonImage.setAttribute("src", pokemonImageUrl)
    pokemonImage.setAttribute("alt", "Front facing " + d.name.capitalize())

    //Displays what type the pokemon is
    let pokemonTypeof = document.createElement("div")
    pokemonTypeof.classList.add("pokemon-typeOf")
    //Needed a forEach incase pokemon had multiple types
    d.types.forEach(slot => {
        let elementType = document.createElement("span")
        elementType.classList.add("element-type")
        elementType.textContent = slot.type.name
        pokemonTypeof.append(elementType)
    });
    //Creating some elements for stats
    let statWrapper = document.createElement("div"),
        mainStats = document.createElement("div"),
        statsHeading = document.createElement("h3")
    
    statsHeading.textContent = "STATS"
    statWrapper.classList.add("pokemon-stats-wrapper")
    mainStats.classList.add("main-stats")

    //Object loop to add data
    for (const key in statsObj) {
        let mainStat = document.createElement("span"),
            statHeading = document.createElement("h4"),
            statData = document.createElement("p")
        mainStat.classList.add("main-stat")
        statHeading.textContent = key.capitalize()
        //Check which unit to add behind the value based on heading
        if (statHeading.textContent == "Weight") {
            statData.textContent = `${statsObj[key]} kg`
        } else if (statHeading.textContent == "Height"){
            statData.textContent = `${statsObj[key]} m`
        } else {
            statData.textContent = statsObj[key]
        }
        mainStat.append(statHeading, statData)
        mainStats.append(mainStat)
    }
    statWrapper.append(statsHeading, mainStats)

    //Bar stats
    d.stats.forEach(stat => {
        //Divide value by random number to not make it overflow the parent div when value exceed 100
        let percent = (stat.base_stat / 1.8) 

        let sliderStats = document.createElement("div"),
            bar = document.createElement("div"),
            barIndicator = document.createElement("div"),
            sliderHeading = document.createElement("h6")
        sliderStats.classList.add("slider-stats")

        sliderHeading.textContent = stat.stat.name.capitalize()
        bar.classList.add("bar")
        barIndicator.classList.add("bar-indicator", stat.stat.name)
        barIndicator.textContent = stat.base_stat
        barIndicator.style.width = percent + "%"
        bar.append(barIndicator)
        sliderStats.append(sliderHeading, bar)
        statWrapper.append(sliderStats)
    })
    //If game_index is not empty, append data on where the pokemon first appeared.
    if (d.game_indices != "") {
        const firstAppeared = document.createElement("p")
        firstAppeared.textContent = `${d.name.capitalize()} first appeared in Pokemon ${d.game_indices[0].version.name.capitalize()}`
        console.log(d.game_indices[0].version.name);
        statWrapper.append(firstAppeared)
    }
    //Append most elements outside of the loops to their respective parent
    pokemonImageContainer.append(pokemonImage)
    pokemonCard.append(pokemonHeading, pokemonImageContainer, pokemonTypeof)
    flexWrapper.append(pokemonCard, statWrapper)
    pokelistContainer.appendChild(flexWrapper)
}
//Rendering out the list of all the pokemon cards
function renderPokemonList() {
    displayLoading()
    pokelistContainer.innerHTML = ""
    
    //forEach loop to render out a pokemon-card for everything in the array
    pokemonListData.forEach(pokemon => {
        let pokemonImageUrl = `https://img.pokemondb.net/sprites/home/normal/${pokemon.data.name}.png`

        //Create a lot of elements and assign attributes, classes, content etc.
        let pokemonListCard = document.createElement("div")
        pokemonListCard.classList.add("card", "pokemon-list-card", "card-bg")
        pokemonListCard.setAttribute("data-id", pokemon.data.id)
        pokemonListCard.setAttribute("data-name", pokemon.data.name)
        pokemonListCard.setAttribute("data-type", pokemon.data.types[0]["type"]["name"])
        
        //Create a lot of elements and assign attributes, classes, content etc.
        let pokemonImageContainer = document.createElement("div"),
            pokemonImage = document.createElement("img"),
            pokemonIdSpan = document.createElement("span")
        pokemonImageContainer.classList.add("image-container")
        pokemonImage.setAttribute("src", pokemonImageUrl)
        pokemonImage.setAttribute("alt", "Front facing " + pokemon.data.name.capitalize())
        pokemonIdSpan.classList.add("pokemon-id")
        pokemonIdSpan.textContent = "#" + pokemon.data.id
        
        //Create a lot of elements and assign attributes, classes, content etc.
        let pokemonHeader = document.createElement("h2")
        pokemonHeader.classList.add("pokemon-name")
        pokemonHeader.textContent = pokemon.data.name.capitalize()

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
        //Append elements outside of the typeof loop to their respective parent
        pokemonImageContainer.append(pokemonIdSpan, pokemonImage)
        pokemonListCard.append(pokemonImageContainer, pokemonHeader, pokemonTypeof)
        pokelistContainer.appendChild(pokemonListCard)

        //Add eventListener for to all the cards that runs fetchSinglePokemon
        pokemonListCard.addEventListener("click", (event) => {
            event.preventDefault();
            let renderPokemonId = pokemonListCard.getAttribute("data-id")
            fetchSinglePokemon(renderPokemonId)
        });
    })
    hideLoading()
}
/* Nav bar event listeners */
//home button
homeBtn.addEventListener("click", () =>{
    renderPokemonList()
})
//Search field
searchField.addEventListener("submit", (event) => {
    event.preventDefault()
    let targetValue = ""
    const data = new FormData(event.target);
    //Fancy way of grabbing form input value with a catch if search string is empty
    if (searchInput.value != ""){
        searchError.textContent = ""
        for (const pair of data.entries()) {
        targetValue = `${pair[1].toLocaleLowerCase()}`
        fetchSinglePokemon(targetValue)}
    } else {
        searchError.textContent="Please type something to search"
    }
});
//Era buttons, adding event listener to all buttons at once through a loop
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

//method to capitalize only the first letter instead of the whole string
Object.defineProperty(String.prototype, 'capitalize', {
    value: function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false
  });
//AutoComplete function for the search field init.
autocomplete(document.getElementById("myInput"), searchArray);

//Initialize page
fetchPokemonList()
