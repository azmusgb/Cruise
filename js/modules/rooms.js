(() => {
  'use strict';

document.addEventListener("DOMContentLoaded", function(){

const DATA = [
{ room:"6650", deck:"6", type:"Interior", guests:["Bill","Melissa","Owen","Declan"] },
{ room:"8528", deck:"8", type:"Ocean View", guests:["Aimee","Reese"] },
{ room:"8370", deck:"8", type:"Balcony", guests:["Lea","Calab"] },
{ room:"8612", deck:"8", type:"Balcony", guests:["Bella","TJ"] },
{ room:"3622", deck:"3", type:"Interior", guests:["Phoebe","Ryan"] }
];

const container = document.getElementById("manifestContainer");
const roomBtn = document.getElementById("roomViewBtn");
const guestBtn = document.getElementById("guestViewBtn");

if(!container || !roomBtn || !guestBtn){
  console.error("Manifest failed to initialize: missing DOM elements.");
  return;
}

let currentView = "room";

function renderRoomView(){
  container.innerHTML = "";
  if(!DATA.length){
    container.innerHTML = '<div class="empty">No manifest data found.</div>';
    return;
  }

  DATA.forEach(entry=>{
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>Room ${entry.room}</h3>
      <div class="meta">Deck ${entry.deck} · ${entry.type}</div>
      ${entry.guests.map(g=>`<span class="pill">${g}</span>`).join("")}
    `;
    container.appendChild(card);
  });
}

function renderGuestView(){
  container.innerHTML = "";
  const allGuests = [];

  DATA.forEach(entry=>{
    entry.guests.forEach(g=>{
      allGuests.push({
        name:g,
        room:entry.room,
        deck:entry.deck,
        type:entry.type
      });
    });
  });

  if(!allGuests.length){
    container.innerHTML = '<div class="empty">No guests found.</div>';
    return;
  }

  allGuests.sort((a,b)=>a.name.localeCompare(b.name));

  allGuests.forEach(g=>{
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${g.name}</h3>
      <div class="meta">Room ${g.room} · Deck ${g.deck} · ${g.type}</div>
    `;
    container.appendChild(card);
  });
}

roomBtn.addEventListener("click", ()=>{
  currentView="room";
  roomBtn.classList.add("active");
  guestBtn.classList.remove("active");
  renderRoomView();
});

guestBtn.addEventListener("click", ()=>{
  currentView="guest";
  guestBtn.classList.add("active");
  roomBtn.classList.remove("active");
  renderGuestView();
});

renderRoomView();

});
})();
