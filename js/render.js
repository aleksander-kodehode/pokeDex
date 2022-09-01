export {renderSinglePokemon, renderPokemonList}
import {pokelistContainer} from "./app.js"
import {fetchSinglePokemon, pokemonListData} from "./fetches.js"
import {displayLoading, hideLoading} from "./loading.js"

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
            statData.textContent = statsObj[key].capitalize()
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