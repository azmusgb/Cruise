
(function(){
  'use strict';

  /* =========================================================
     DECK DATA
  ========================================================= */

  const DECKS = [
    { n:15, name:'Deck 15', sub:'Sports & Observation', cat:'wel',
      svg:'decks/deck-15-final.min.svg', img:'decks/deck-15.png',
      desc:'Rock climbing wall, jogging track, mini-golf and open-air sports courts.',
      tags:['Rock Climbing','Jogging Track','Mini-Golf','Ocean Views'] },

    { n:14, name:'Deck 14', sub:'Sky Deck', cat:'ent',
      svg:'decks/deck-14-final.min.svg', img:'decks/deck-14.png',
      desc:'Viking Crown Lounge and panoramic sky views.',
      tags:['Viking Crown','Sky Bar','Observation Deck'] },

    { n:13, name:'Deck 13', sub:'Adventure Zone', cat:'ent',
      svg:'decks/deck-13-final.min.svg', img:'decks/deck-13.png',
      desc:'FlowRider surf simulator and Adventure Ocean.',
      tags:['FlowRider','Adventure Ocean','Climbing Wall'] },

    { n:12, name:'Deck 12', sub:'Pool Deck', cat:'wel',
      svg:'decks/deck-12-final.min.svg', img:'decks/deck-12.png',
      desc:'Main pool, Solarium, Windjammer and Pool Bar.',
      tags:['Main Pool','Solarium','Windjammer','Pool Bar'] },

    { n:11, name:'Deck 11', sub:'Fitness & Spa', cat:'wel',
      svg:'decks/deck-11-final.min.svg', img:'decks/deck-11.png',
      desc:'Vitality Spa and fitness centre.',
      tags:['Vitality Spa','Fitness Centre','Salon'] },

    { n:10, name:'Deck 10', sub:'Stateroom Corridor', cat:'ess',
      svg:'decks/deck-10-final.min.svg', img:'decks/deck-10.png',
      desc:'Premium staterooms with aft balconies.',
      tags:['Premium Cabins','Aft Balconies'] },

    { n:9, name:'Deck 9', sub:'Midship Cabins', cat:'ess',
      svg:'decks/deck-09-final.min.svg', img:'decks/deck-09.png',
      desc:'Family-friendly staterooms.',
      tags:['Family Staterooms','Midship'] },

    { n:8, name:'Deck 8', sub:'Stateroom Access', cat:'ess',
      svg:'decks/deck-08-final.min.svg', img:'decks/deck-08.png',
      desc:'Interior and oceanview staterooms.',
      tags:['Interior Cabins','Oceanview'] },

    { n:7, name:'Deck 7', sub:'Cabin Transit', cat:'ess',
      svg:'decks/deck-07-final.min.svg', img:'decks/deck-07.png',
      desc:'Quiet stateroom corridor.',
      tags:['Staterooms','Elevators'] },

    { n:6, name:'Deck 6', sub:'Stateroom Ring', cat:'ess', isMyDeck:true,
      svg:'decks/deck-06-final.min.svg', img:'decks/deck-06.png',
      desc:'Your home deck — Room 6650.',
      tags:['Room 6650','Midship Elevators','Wake Views'] },

    { n:5, name:'Deck 5', sub:'Royal Promenade', cat:'ent',
      svg:'decks/deck-05-final.min.svg', img:'decks/deck-05.png',
      desc:'Café Promenade, shops and parades.',
      tags:['Café Promenade','Guest Services','Shops'] },

    { n:4, name:'Deck 4', sub:'Dining & Entertainment', cat:'ent',
      svg:'decks/deck-04-final.min.svg', img:'decks/deck-04.png',
      desc:'Main Dining Room and Casino Royale.',
      tags:['Main Dining','Casino','Theater'] },

    { n:3, name:'Deck 3', sub:'Lobby & Guest Services', cat:'ess',
      svg:'decks/deck-03-final.min.svg', img:'decks/deck-03.png',
      desc:'Grand Lobby and Shore Excursions.',
      tags:['Grand Lobby','Excursions'] },

    { n:2, name:'Deck 2', sub:'Medical & Embarkation', cat:'ess',
      svg:'decks/deck-02-final.min.svg', img:'decks/deck-02.png',
      desc:'Medical centre and gangway.',
      tags:['Medical','Gangway'] }
  ];

  let activeFilter = 'all';
  let searchQuery = '';
  let currentDeck = null;
  let zoom = 1;

  const $ = id => document.getElementById(id);

  const grid = $('grid');
  const empty = $('empty');
  const search = $('search');
  const searchClear = $('searchClear');
  const backdrop = $('backdrop');
  const mClose = $('mClose');
  const mNum = $('mNum');
  const mName = $('mName');
  const mSub = $('mSub');
  const mDesc = $('mDesc');
  const mFoot = $('mFoot');
  const planInner = $('planInner');
  const zIn = $('zIn');
  const zOut = $('zOut');
  const zReset = $('zReset');
  const zVal = $('zVal');

  function filteredDecks(){
    return DECKS.filter(d => {
      const filterMatch =
        activeFilter === 'all' ||
        (activeFilter === 'mine' && d.isMyDeck) ||
        d.cat === activeFilter;

      const q = searchQuery.trim().toLowerCase();
      const searchMatch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.sub.toLowerCase().includes(q) ||
        d.tags.join(' ').toLowerCase().includes(q);

      return filterMatch && searchMatch;
    });
  }

  function renderGrid(){
    grid.querySelectorAll('.card').forEach(c => c.remove());
    const list = filteredDecks();

    if(!list.length){
      empty.classList.add('show');
      return;
    }

    empty.classList.remove('show');

    list.forEach(deck => {
      const card = document.createElement('div');
      card.className = `card ${deck.isMyDeck ? 'my-deck':''}`;
      card.innerHTML = `
        ${deck.isMyDeck ? '<div class="my-badge">★ My Deck</div>' : ''}
        <div class="card-top">
          <div class="card-num">${deck.n}</div>
          <div>
            <div class="card-name">${deck.name}</div>
            <div class="card-sub">${deck.sub}</div>
          </div>
          <div class="card-arrow">→</div>
        </div>
        <div class="card-tags">
          ${deck.tags.slice(0,3).map(t=>`<span class="tag">${t}</span>`).join('')}
        </div>
      `;
      card.addEventListener('click', ()=> openDeck(deck));
      grid.insertBefore(card, empty);
    });
  }

  function setZoom(val){
    zoom = Math.max(0.5, Math.min(3, val));
    planInner.style.transform = `scale(${zoom})`;
    zVal.textContent = Math.round(zoom*100)+'%';
  }

  function loadPlan(deck){
    planInner.innerHTML = '';
    setZoom(1);

    const img = new Image();
    img.src = deck.svg;
    img.alt = `${deck.name} plan`;
    img.style.maxWidth = '100%';

    img.onerror = () => {
      img.src = deck.img;
    };

    planInner.appendChild(img);
  }

  function openDeck(deck){
    currentDeck = deck;

    mNum.textContent = deck.n;
    mName.textContent = deck.name;
    mSub.textContent = deck.sub;
    mDesc.textContent = deck.desc;

    mFoot.innerHTML = deck.tags.map(t => `<span class="chip">${t}</span>`).join('');

    loadPlan(deck);

    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDeck(){
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
    currentDeck = null;
  }

  document.querySelectorAll('.ftab').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.ftab').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.f;
      renderGrid();
    });
  });

  search.addEventListener('input', e=>{
    searchQuery = e.target.value;
    searchClear.hidden = !searchQuery;
    renderGrid();
  });

  searchClear.addEventListener('click', ()=>{
    search.value='';
    searchQuery='';
    searchClear.hidden=true;
    renderGrid();
  });

  mClose.addEventListener('click', closeDeck);
  backdrop.addEventListener('click', e=>{
    if(e.target===backdrop) closeDeck();
  });

  zIn.addEventListener('click', ()=> setZoom(zoom+0.25));
  zOut.addEventListener('click', ()=> setZoom(zoom-0.25));
  zReset.addEventListener('click', ()=> setZoom(1));

  renderGrid();

})();
