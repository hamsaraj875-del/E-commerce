
const loaders = document.querySelectorAll(".loading");
const map = document.querySelectorAll(".roadMap");
const deliveryStatus = document.querySelectorAll(".deliveryStatus");
const deliveryStatusDate = document.querySelectorAll(".deliveryStatusDate");
const Btn = document.querySelectorAll(".Btn");



loaders.forEach((loader,index)=>{
  const orderedDate = new Date(loader.dataset.order);
  const payment = loader.dataset.payment;
  const roadMap = map[index];
  const status = deliveryStatus[index];
  const statusDate = deliveryStatusDate[index];
  const btn = Btn[index];


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

    if(payment === "true"){
      btn.style.display = "none";
    }

    const deliveryDate = deliveryTimeCalculate(orderedDate);
    statusDate.textContent = "Expected Delivery : " + deliveryDate.toDateString();

    let statusContent = "";
    for(let i=0;i<list.length;i++){
      let step = 100/list.length;
      if(progress>=step*(i+1) && progress<=100){
        roadMap.textContent+="   →   ✔   " + list[i];
        statusContent = list[i];
      }
      else if(progress>100 && !payment){
        roadMap.textContext+="   →   ✔   " + list[i];
      }
      else{
        roadMap.textContent+="   →   ⭕   " + list[i];
      }
    }
    if(statusContent == ""){
      status.textContent = "Delivery status : Processing the order";
    }else{
      status.textContent = "Delivery status : " + statusContent;
    }
  }
  
  updateProgress();
  setInterval(updateProgress,60000);
})

function deliveryTimeCalculate(orderedDate){
  let deliveryDate = new Date(orderedDate);
  deliveryDate.setDate(deliveryDate.getDate()+8);
  return deliveryDate;
}




