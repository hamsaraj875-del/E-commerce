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

