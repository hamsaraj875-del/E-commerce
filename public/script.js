const Name = "E-Commerce-App";
const p = document.querySelector("#Name");
const extender = document.querySelector(".extender");
const body = document.querySelector("body");
const notifyPara = document.querySelector("#notify");

let delay = 1000;
let condition = true;
let index = -1;
repeat();
function repeat(){
  if(condition){
    index++;
    p.innerText = Name.substring(0,index);
    delay = 300;
    if(index == Name.length){
      condition = false;
    }
  }
  else{
    p.innerText = Name.substring(0,index);
    index--;
    delay = 100;
    if(index == -1){
      condition = true;
    }
  }
  setTimeout(repeat,delay);
}


//Extender Function
function Extender(event){
  event.stopPropagation();
  extender.classList.toggle("extenderActive");
}
body.addEventListener("click", () => {
  if (extender.classList.contains("extenderActive")) {
    extender.classList.remove("extenderActive");
  }
});

//Notification Function

function notification(){
  console.log("almost done");
  const notifyDiv = document.querySelector("#notifyDiv"); 
  console.log(notifyDiv);
  notifyDiv.classList.add("notifyActive");
  setTimeout(()=>{
    notifyDiv.classList.remove("notifyActive");
  },3000);
}
