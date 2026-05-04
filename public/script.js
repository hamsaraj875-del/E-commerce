document.addEventListener("DOMContentLoaded", () => {

  const Name = "E-Commerce-App";
  const p = document.querySelector("#Name");
  const extender = document.querySelector(".extender");
  const body = document.querySelector("body");

  let delay = 1000;
  let condition = true;
  let index = -1;

  function repeat(){
    if(condition){
      index++;
      if(p) p.innerText = Name.substring(0,index);
      delay = 300;
      if(index == Name.length){
        condition = false;
      }
    }
    else{
      if(p) p.innerText = Name.substring(0,index);
      index--;
      delay = 100;
      if(index == -1){
        condition = true;
      }
    }
    setTimeout(repeat,delay);
  }

  repeat();

  // Extender
  function Extender(event){
    event.stopPropagation();
    extender?.classList.toggle("extenderActive");
  }
  window.Extender = Extender;

  body?.addEventListener("click", () => {
    if (extender?.classList.contains("extenderActive")) {
      extender.classList.remove("extenderActive");
    }
  });

  // Notification
  const notifyDiv = document.querySelector("#notifyDiv");
  if (notifyDiv) {
    notifyDiv.classList.remove("notifyActive");
    void notifyDiv.offsetWidth;
    notifyDiv.classList.add("notifyActive");

    setTimeout(()=>{
      notifyDiv.classList.remove("notifyActive");
    },3000);
  }

});