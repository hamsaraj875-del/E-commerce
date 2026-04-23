
const loaders = document.querySelectorAll(".loading");
const map = document.querySelectorAll(".roadMap");
loaders.forEach((loader,index)=>{
  const orderedDate = new Date(loader.dataset.order);
  const roadMap = map[index];
  
  function updateProgress(){
    const today = new Date();
    const totalDays = 8;
    const passedDays = (today-orderedDate)/(1000*60*60*24);

    let progress = passedDays/totalDays*100;
    if(progress>100) progress = 100;
    if(progress<0) progress = 0;
    loader.style.width = progress+"%";

    let list=["Order Placed","Confirmed","Packed","Shipped","Out for Delivery","Delivered"];
    roadMap.textContent = "";
    for(let i=0;i<list.length;i++){
      if(progress>=16*(i+1)){
        roadMap.textContent+="→ ✔" + list[i];
      }else{
        roadMap.textContent+="→ ⭕" + list[i];
      }
    }
  }
  
  updateProgress();
  setInterval(updateProgress,1000);
})