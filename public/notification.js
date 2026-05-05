//Notification Function
function notification(){
  const notifyDiv = document.querySelector(".notifyDiv"); 
  if(!notifyDiv) return;
  console.log("adding");
  notifyDiv.classList.add("notifyActive");
  notifyDiv.classList.remove("notifyDiv");
  console.log(notifyDiv.innerText);
  setTimeout(()=>{
    console.log("removing");
    notifyDiv.classList.remove("notifyActive");
    notifyDiv.classList.add("notifyDiv");
  },4000);
  console.log("ended");
}
