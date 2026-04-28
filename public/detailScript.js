const date = document.querySelector("#date");
const deliveryDate = document.querySelector("#deliveryDate");
const timeLimit = document.querySelector("#deliveryDateLimit");

setInterval(()=>{
  const list = ['Sun','Mon','Tue','Wed','Thur','Fri','Sat'];
  const months = [
  'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let nd = new Date();
  date.textContent = ` Today : ${nd.toString().slice(0,16)}`;
  let day = list.indexOf(nd.toString().slice(0,3))+8;
  let month = months.indexOf(nd.toString().slice(4,7));
  let dat = Number(nd.toString().slice(8,10))+8;
  let time = new Date();
  if(dat>31){
    dat-=31;
    month+=1;
  }
  deliveryDate.textContent = `Delivered By : ${list[day%7]} ${months[month]} ${dat}  `;
  timeLimit.textContent = `Order within ${24-time.getHours()}hr  ${60-time.getMinutes()}m   ${60-time.getSeconds()}s`
},1000)


const cart =(items)=>{
  window.location.href=`/addToCart/${items}`;
}


const btn = document.querySelector(".Btn");

btn.addEventListener("click", () => {
  confetti({
    particleCount: 120,
    spread:70,
    origin: { y: 0.8 }
  });
});
