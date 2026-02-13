document.addEventListener('DOMContentLoaded', () => {

const DECKS = Array.from({length:14}, (_,i)=>{
  const n = 15-i;
  return { n, name:`Deck ${n}`, svg:`decks/deck-${String(n).padStart(2,'0')}-final.min.svg` };
});

const grid = document.getElementById('grid');
const search = document.getElementById('search');
const clearBtn = document.getElementById('searchClear');
const modal = document.getElementById('deckModal');
const closeModal = document.getElementById('closeModal');
const modalTitle = document.getElementById('modalTitle');
const planInner = document.getElementById('planInner');
const zoomIn = document.getElementById('zoomIn');
const zoomOut = document.getElementById('zoomOut');
const zoomReset = document.getElementById('zoomReset');
const zoomValue = document.getElementById('zoomValue');

let zoom = 1;

function render(list){
  grid.innerHTML='';
  list.forEach(d=>{
    const card=document.createElement('div');
    card.className='deck-card';
    card.innerHTML=`<h3>${d.name}</h3>`;
    card.onclick=()=>openDeck(d);
    grid.appendChild(card);
  });
}

function openDeck(deck){
  modal.classList.add('is-open');
  modalTitle.textContent=deck.name;
  planInner.innerHTML='';
  const img=new Image();
  img.src=deck.svg;
  img.onload=()=>{
    img.style.transform=`scale(${zoom})`;
    planInner.appendChild(img);
  };
}

function applyZoom(){
  const img=planInner.querySelector('img');
  if(!img)return;
  img.style.transform=`scale(${zoom})`;
  zoomValue.textContent=Math.round(zoom*100)+'%';
}

zoomIn?.addEventListener('click',()=>{zoom=Math.min(3,zoom+.2);applyZoom();});
zoomOut?.addEventListener('click',()=>{zoom=Math.max(.5,zoom-.2);applyZoom();});
zoomReset?.addEventListener('click',()=>{zoom=1;applyZoom();});

closeModal?.addEventListener('click',()=>modal.classList.remove('is-open'));
modal?.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('is-open');});

search?.addEventListener('input',e=>{
  const q=e.target.value.toLowerCase();
  clearBtn.hidden=!q;
  render(DECKS.filter(d=>d.name.toLowerCase().includes(q)));
});

clearBtn?.addEventListener('click',()=>{
  search.value='';
  clearBtn.hidden=true;
  render(DECKS);
});

render(DECKS);

});
