export {displayLoading, hideLoading, loading}

const loading =  document.getElementById("loading-container")

function displayLoading(){
    loading.classList.add("display")
}

function hideLoading(){
    loading.classList.remove("display")
}