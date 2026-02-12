const CRUISE = {
  sail: new Date('2026-02-14T16:00:00'),
  end: new Date('2026-02-20T08:00:00'),
  itinerary: [
    { date: '2026-02-14', label: 'Embarkation · Port Canaveral' },
    { date: '2026-02-15', label: 'Sea Day' },
    { date: '2026-02-16', label: 'Grand Cayman' },
    { date: '2026-02-17', label: 'Falmouth' },
    { date: '2026-02-18', label: 'Sea Day' },
    { date: '2026-02-19', label: 'Perfect Day at CocoCay' },
    { date: '2026-02-20', label: 'Disembarkation' }
  ],
  rooms: [
    { number: '6650', deck: 'Deck 6', guests: 'Melissa & Bill' },
    { number: '6651', deck: 'Deck 6', guests: 'Abel & Amy' },
    { number: '8528', deck: 'Deck 8', guests: 'Aimee & Karin' },
    { number: '8612', deck: 'Deck 8', guests: 'Isabella & Walter' },
    { number: '3622', deck: 'Deck 3', guests: 'Phoebe & Ryan' }
  ]
};

window.CRUISE = CRUISE;

function todayIso(now) {
  return now.toISOString().split('T')[0];
}

function activeStop(now) {
  return CRUISE.itinerary.find((entry) => entry.date === todayIso(now));
}

function initCruiseExperience() {
  const now = new Date();
  const stop = activeStop(now);
  const body = document.body;
  const phaseLabel = document.querySelector('[data-cruise-phase]');
  const dayLabel = document.querySelector('[data-cruise-day]');

  if (phaseLabel) {
    if (now < CRUISE.sail) phaseLabel.textContent = 'Pre-sail planning';
    else if (now > CRUISE.end) phaseLabel.textContent = 'Cruise complete';
    else phaseLabel.textContent = 'Cruise in progress';
  }

  if (dayLabel && stop) dayLabel.textContent = stop.label;

  if (stop?.label.includes('Sea Day')) body.classList.add('day-sea');
  if (stop?.label.includes('CocoCay')) body.classList.add('day-cococay');

  const isEmbarkationMorning = stop?.date === '2026-02-14' && now.getHours() < 12;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sunriseKey = 'cruise-embarkation-sunrise-played';

  if (isEmbarkationMorning && !reducedMotion && !localStorage.getItem(sunriseKey)) {
    body.classList.add('embarkation-sunrise-run');
    setTimeout(() => body.classList.remove('embarkation-sunrise-run'), 12000);
    localStorage.setItem(sunriseKey, 'true');
  }

  const roomTarget = document.querySelector('[data-room-rotator]');
  if (roomTarget) {
    let roomIndex = 0;
    const paintRoom = () => {
      const room = CRUISE.rooms[roomIndex];
      roomTarget.textContent = `Room ${room.number} · ${room.deck} · ${room.guests}`;
      roomIndex = (roomIndex + 1) % CRUISE.rooms.length;
    };
    paintRoom();
    setInterval(paintRoom, 8000);
  }
}

document.addEventListener('DOMContentLoaded', initCruiseExperience);
