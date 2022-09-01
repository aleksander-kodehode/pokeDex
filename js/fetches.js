export {fetchPokemonList, fetchPokemonData, fetchSinglePokemon, pokemonListData, pokemonData, searchError}
import {pokelistContainer} from "./app.js"
import {renderPokemonList, renderSinglePokemon} from "./render.js"
import {displayLoading, hideLoading} from "./loading.js"

const searchError = document.getElementById("error-msg")

//Empty arrays for data storage
let pokemonListData = []
let pokemonData = []


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