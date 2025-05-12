function confirmWarning() {
    if(confirm("Are you sure you want to reset your portfolio? All data will be reset.")){
        alert("Portfolio Reset")
    } else {
        alert("Reset request cancelled.")
    }
}
const resetButton = document.getElementById("reset_button")
resetButton.onclick = confirmWarning();