const inputs = document.querySelectorAll(".otp");


function notification(){
  const notifyDiv = document.querySelector("#notifyDiv"); 
  notifyDiv.classList.add("notifyActive");
  setTimeout(()=>{
    notifyDiv.classList.remove("notifyActive");
  },3000);
}


inputs.forEach((input, index) => {
  input.addEventListener("input", (e) => {
    if (e.target.value && index < inputs.length - 1){
      inputs[index + 1].focus();
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key !== "Backspace") return;

    if (input.value) {
      input.value = "";      // clear current first
    } else if (index > 0) {
      inputs[index - 1].focus();   // if already empty, go back
    }
  });
});