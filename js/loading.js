export {displayLoading, hideLoading, loading}

const loading =  document.getElementById("loading-container")

function displayLoading(){
    loading.classList.add("display")
    /* setTimeout(() => {
        loading.classList.remove("display")
    }, 1000) */
}


function hideLoading(){
    loading.classList.remove("display")
}