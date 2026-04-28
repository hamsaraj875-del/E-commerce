const itemClick = (items)=>{
  window.location.href=`/details/${items}`;
}



const btn = document.querySelector(".Btn");

btn.addEventListener("click", () => {
  confetti({
    particleCount: 120,
    spread:70,
    origin: { y: 0.8 }
  });
});
