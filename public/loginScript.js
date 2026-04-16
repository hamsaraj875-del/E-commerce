const toggle = document.querySelector(".toggle");
const insideToggle = document.querySelector(".insideToggle");
const display = document.querySelector(".displayToggle");
const hiddenInput = document.querySelector(".hiddenInput");

function hostShift(){
  insideToggle.classList.toggle("activeInsideToggle");
  if(display.textContent=="User"){
    display.textContent="Host";
    hiddenInput.value = "Host";
    console.log(hiddenInput.value)
  }else{
    display.textContent="User";
    hiddenInput.value = "User";
    console.log(hiddenInput.value)
  }
}