//Imports
import {fetchPokemonList, fetchSinglePokemon, searchError} from "./fetches.js"
import {renderPokemonList} from "./render.js"
import {autocomplete, searchArray} from "./search.js"
export {pokelistContainer} 

//Global variables
let pokelistContainer = document.querySelector(".pokemon-list")
const homeBtn = document.getElementById("button-home")
const searchField = document.getElementById("search-form")
const searchInput = document.getElementById("myInput")

const eraBtns = document.querySelectorAll(".era-btn")

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
