const itemClick = (items)=>{
  window.location.href=`/details/${items}`;
}



const btn = document.querySelectorAll(".Btn");

btn.forEach(button=>{
  button.addEventListener("click",(e)=>{
    confetti({
    particleCount: 120,
    spread:70,
    origin: { y: 0.8 }
  });
  })
})

const offer = document.querySelector(".offer");
let inde = 0;
const offerList = JSON.parse(offer.dataset.offerItem);
const offerImage = document.querySelector(".offerImage");

console.log(offerList);
function animation(){
  transition();
  function transition(){
    if(inde>=offerList.length){
      inde=0;
    }
    offerImage.src=`/uploads/${offerList[inde].offerImage}`;
    inde++;
    console.log("hi");
    setTimeout(transition,10000);
  }
}
animation();

