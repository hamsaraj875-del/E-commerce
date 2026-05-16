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
if(offer){
  let inde = 0;
  const offerList = JSON.parse(offer.dataset.offerItem);
  const offerImage = document.querySelector(".offerImage");
  offerImage.src = `/uploads/${offerList[0].offerImage}`;
  setInterval(()=>{
    offerImage.style.opacity = "0";
    offerImage.style.zIndex="-1";
    setTimeout(()=>{
      inde++;
      if(inde >= offerList.length){
        inde = 0;
      }
      offerImage.src = `/uploads/${offerList[inde].offerImage}`;
      offerImage.style.opacity = "1";
      offerImage.style.zIndex = "-1";
    },500);
  },6000);
}