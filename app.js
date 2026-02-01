/* ==========================================================================
   Mission Control 2.0 JS — Enhanced UX with advanced features
   ========================================================================== */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

// Enhanced utilities
function toast(msg, type = 'info') {
  const t = $('#toast');
  const tt = $('#toast-text');
  if (!t || !tt) return;
  
  // Add icon based on type
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };
  
  tt.textContent = `${icons[type] || icons.info} ${msg}`;
  t.setAttribute('aria-hidden', 'false');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => t.setAttribute('aria-hidden', 'true'), 1800);
}

function applyReducedEffects() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const smallScreen = window.matchMedia('(max-width: 900px)').matches;
  const saveData = navigator.connection?.saveData ?? false;
  if (prefersReduced || smallScreen || saveData) {
    document.documentElement.classList.add('reduced-effects');
  }
}

function applyIconFallback() {
  const root = document.documentElement;
  if (!document.fonts || !document.fonts.load) {
    root.classList.add('fa-missing');
    return;
  }
  document.fonts.load('1em \"Font Awesome 6 Free\"')
    .then(() => {
      if (!document.fonts.check('1em \"Font Awesome 6 Free\"')) {
        root.classList.add('fa-missing');
      }
    })
    .catch(() => root.classList.add('fa-missing'));
}

function smoothTo(el, opts = {}) {
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start', ...opts });
}

function createConfetti() {
  const colors = ['#7dd3fc', '#60a5fa', '#a78bfa', '#a7f3d0', '#fbbf24', '#fb7185'];
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.width = Math.random() * 10 + 5 + 'px';
    confetti.style.height = Math.random() * 10 + 5 + 'px';
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    document.body.appendChild(confetti);
    
    const animation = confetti.animate([
      { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
      { transform: `translateY(${window.innerHeight + 20}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
    ], {
      duration: Math.random() * 3000 + 2000,
      easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
    });
    
    animation.onfinish = () => confetti.remove();
  }
}

/* ----------------------------- App State -------------------------------- */
const MANUAL_CONTENT = [
  `<p class="p">The Family and Friends Cruise Companion: Unabridged Operations Manual</p>`,
  `<p class="p">Adventure of the Seas | February 14–20, 2026 | Western Caribbean &amp; Perfect Day</p>`,
  `<p class="p">—</p>`,
  `<h2>Table of Contents</h2>`,
  `<p class="p">Pre-Cruise Command Center<br>Embarkation Day: The Golden Hour Protocol<br>Ship Fundamentals &amp; Daily Rhythm<br>The Daily Navigator: A Flexible Itinerary<br>Port Playbook: Grand Cayman, Falmouth &amp; CocoCay<br>Dining &amp; Speciality Restaurant Strategy<br>Finance, Communication &amp; Logistics<br>Debarkation &amp; Return to Reality</p>`,
  `<p class="p">---</p>`,
  `<h2>Pre-Cruise Command Center</h2>`,
  `<h3>1.1 Guest Manifest &amp; Core Data</h3>`,
  `<p class="p">Primary Booking (4519230):<br>Stateroom: 6650 (Deck 6, Aft)<br>Guests: William, Melissa, Declan, Owen<br>Muster Station: D22<br>Secondary Booking (6788946):<br>Stateroom: 6651 (Deck 6, Aft)<br>Guest: Amy Abel<br>Muster Station: D22<br>Tertiary Booking (4352113):<br>Stateroom: 8528 (Deck 8, Forward-Mid)<br>Guest: Karin Aimee<br>Muster Station: A2</p>`,
  `<h3>1.2 Official Itinerary</h3>`,
  `<p class="p">Day 1 (Sat, Feb 14): Port Canaveral | Depart 4:00 PM<br>Day 2 (Sun, Feb 15): AT SEA<br>Day 3 (Mon, Feb 16): George Town, Grand Cayman | 10:30 AM - 6:00 PM (Tender Port)<br>Day 4 (Tue, Feb 17): Falmouth, Jamaica | 8:00 AM - 5:00 PM<br>Day 5 (Wed, Feb 18): AT SEA<br>Day 6 (Thu, Feb 19): Perfect Day at CocoCay | 7:00 AM - 5:00 PM<br>Day 7 (Fri, Feb 20): Port Canaveral | Arrive 7:00 AM</p>`,
  `<h3>1.3 Mandatory Pre-Departure Tasks (Complete by Feb 13)</h3>`,
  `<p class="p">Royal App: Download and ensure all adults have access.<br>Online Check-In: Complete via app as soon as it opens (≈45 days prior). Upload photos, select earliest arrival time (10:30 AM target).<br>Linking Bookings: The designated “Concierge” (likely William/Melissa) must link all three booking numbers in the Royal app.<br>Documentation: Ensure passports are valid. Print SetSail passes and luggage tags as backup.<br>Communication: Establish a WhatsApp group as the primary external channel. Designate the “Concierge’s” device as the holder of the 1-device VOOM internet plan for shore-based comms.</p>`,
  `<p class="p">—</p>`,
  `<h2>2. Embarkation Day: The Golden Hour Protocol</h2>`,
  `<p class="p">Objective: Transition from land-based chaos to onboard control within the first 60 minutes.</p>`,
  `<p class="p"><strong>Time Block</strong><br>Action Item<br>Location<br>Responsible Party<br>Notes</p>`,
  `<p class="p">10:30 AM — Arrive at Terminal — Port Canaveral — All — SetSail Pass &amp; Passport ready. Check bags with porters.</p>`,
  `<p class="p">12:00 PM — STEP 1: The Huddle — Deck 4/5 Promenade — All — Do not disperse. Find a wall or quiet seating.</p>`,
  `<p class="p">12:05 PM — STEP 2: Digital Activation — Onboard — Concierge 1 — 1. Connect to ROYAL-WIFI. 2. Open Royal app, verify linked bookings.</p>`,
  `<p class="p">12:10 PM — STEP 3: Priority Booking Via Royal App — Concierge 1 — Concierge 1 — 1. Dining: Modify auto-booked specialty. Secure Nights 1, 3, 4 at chosen venues for 6 people. 2. Shows: Book any reservable shows (if offered).</p>`,
  `<p class="p">12:30 PM — STEP 4: Muster &amp; Verify — Muster Stations / Dining — All — 1. eMuster: Disperse to stations D22 &amp; A2, scan in, watch video. 2. Regroup: Meet at Pool Bar. 3. Physical Link: Visit Specialty Dining podium &amp; MDR maître d’ to confirm linked tables.</p>`,
  `<p class="p">1:00 PM — Mission Complete — Windjammer / Café — All — Have lunch. The operational heavy lifting is done. Cabins ready ≈1:30 PM.</p>`,
  `<p class="p">---</p>`,
  `<h2>3. Ship Fundamentals &amp; Daily Rhythm</h2>`,
  `<h3>3.1 Your Ship Geography</h3>`,
  `<p class="p">Deck 6 Aft (6650, 6651): “The Quiet Zone.”<br>Optimal for quick elevator access to Dining Rooms (Decks 3-5) and Windjammer (Deck 11). Use aft stairwell/elevators as your primary vertical artery.</p>`,
  `<p class="p">Deck 8 Forward-Mid (8528): “The Central Hub.”<br>Closer to forward entertainment (Theater, Spa). Use forward stairwell/elevators. Ideal meeting point: R Bar on Deck 5 Promenade.</p>`,
  `<h3>3.2 The Non-Negotiable Daily Beat</h3>`,
  `<p class="p">Morning (7:30-9:00 AM):<br>Light breakfast (Café Promenade) or full buffet (Windjammer). Confirm day’s plan via group chat.</p>`,
  `<p class="p">Late Morning (10:00 AM):<br>Execute the chosen “Path” for the day (Adventure, Culture, or Chill).</p>`,
  `<p class="p">Afternoon (1:00-4:00 PM):<br>Lunch, followed by flexible time (pool, trivia, nap, return from port).</p>`,
  `<p class="p">Pre-Dinner (6:45 PM):<br>Mandatory Group Meet-Up at R Bar. Dress for dinner, coordinate evening plans.</p>`,
  `<p class="p">Evening (7:30 PM+):<br>Dinner, followed by show, music, or leisure.</p>`,
  `<p class="p">Night (10:00 PM+):<br>Optional late-night activities (comedy, dancing, snacks).</p>`,
  `<h3>3.3 Entertainment &amp; Booking Truths</h3>`,
  `<p class="p">Myth: Shows must be booked months in advance.<br>Reality on Adventure of the Seas: Main theater and ice shows are first-come, first-served.<br>Strategy: The Ice Show in Studio B is the priority. Check the app for performance days (typically sea days). Arrive 30 minutes early for the best group seating. For main theater shows, arriving 15-20 minutes early is sufficient.</p>`,
  `<p class="p">---</p>`,
  `<h2>4. The Daily Navigator: A Flexible Itinerary</h2>`,
  `<p class="p">Each day offers curated “Paths” (A/B/C) tailored to different energy levels and interests.</p>`,
  `<p class="p">📅 Day 2: Sun, Feb 15 — At Sea (Formal Night #1)</p>`,
  `<p class="p">Path A | Thrill-Seeker: Morning FlowRider clinic (book onboard). Afternoon rock climbing or waterslides. Pre-dinner group photos in formal attire.<br>Path B | Culturist: Morning art auction or trivia. Afternoon ice skating show. Relax in the Solarium before formal dinner.<br>Path C | Family Anchor: Morning pool games and mini-golf. Afternoon Adventure Ocean for kids, spa for adults. Casual early dinner before the show.<br>Dinner: Formal Night in Main Dining Room.</p>`,
  `<p class="p">📅 Day 3: Mon, Feb 16 — George Town, Grand Cayman</p>`,
  `<p class="p">Path A | Aquatic Adventure: Ship-sponsored Stingray City &amp; snorkel tour. Return for late lunch onboard.<br>Path B | Beach Club Relaxation: Taxi to Seven Mile Beach (Calico Jack’s or Public Beach). Rent chairs, enjoy calm water.<br>Path C | Historic &amp; Culinary: Explore George Town, visit the National Museum. Lunch at a local eatery like “Paradise Grill.”<br>Dinner: Specialty Dining #1 (e.g., Giovanni’s Table).</p>`,
  `<p class="p">📅 Day 4: Tue, Feb 17 — Falmouth, Jamaica</p>`,
  `<p class="p">Path A | Iconic Excursion: Pre-booked tour to Dunn’s River Falls and/or Blue Hole. Requires water shoes, sense of adventure.<br>Path B | Curated Culture: Historic Falmouth walking tour, then resort day at nearby “Royalton” property (day pass).<br>Path C | Ship Day Savvy: Enjoy a quieter ship. Pool, spa, and onboard activities without crowds.<br>Dinner: Specialty Dining #2 (e.g., Chops Grille).</p>`,
  `<p class="p">📅 Day 5: Wed, Feb 18 — At Sea (Formal Night #2)</p>`,
  `<p class="p">Path A | Final Challenges: Last sessions on FlowRider, rock wall, or zip line (if available). Afternoon packing session.<br>Path B | Enrichment &amp; Leisure: Attend a guest lecture or cooking demo. Afternoon farewell ice show or trivia tournament.<br>Path C | Ultimate Relaxation: Extended spa treatment, leisurely reading on the helipad, final swim.<br>Dinner: Formal Night in Main Dining Room (Lobster Tail night).</p>`,
  `<p class="p">📅 Day 6: Thu, Feb 19 — Perfect Day at CocoCay</p>`,
  `<p class="p">Path A | Thrill Island: Early access to Thrill Waterpark slides (if pre-booked). Afternoon at the Oasis Lagoon pool.<br>Path B | Chill Island: Secure loungers at Chill Island for snorkeling and swimming. Rent a floating mat. Lunch at Chill Grill.<br>Path C | Explorer: Walk the nature trail, visit the observation tower, try the Up, Up &amp; Away balloon (weather/$$), shop at the straw market.<br>Dinner: Specialty Dining #3 or Main Dining Room Farewell.</p>`,
  `<p class="p">---</p>`,
  `<h2>5. Port Playbook: Tactical Briefs</h2>`,
  `<h3>5.1 Grand Cayman (Tender Port)</h3>`,
  `<p class="p">Tender Process: Tenders begin ≈10:45 AM. Go early (10:15 AM) or expect tickets/lines. Ship excursions meet first.<br>Return: Last tender is at 5:15 PM. Aim to queue by 4:30 PM.<br>Currency: USD widely accepted. Many places take credit cards.</p>`,
  `<h3>5.2 Falmouth, Jamaica</h3>`,
  `<p class="p">Docking: Ship docks. Easy walk-off.<br>Advice: For independent tours, only use licensed operators inside the port gate. Set a clear price and return time.<br>Must-Try: Jerk chicken from “Scotchies” (located just outside port).</p>`,
  `<h3>5.3 Perfect Day at CocoCay</h3>`,
  `<p class="p">#1 Rule: Disembark by 8:00 AM to claim prime lounge chairs.<br>Included: All beaches, the massive Oasis Lagoon pool, multiple buffets (Chill Grill, Skipper’s Grill), Snack Shacks.<br>Drinks: Your Refreshment Package works here.<br>Return: All aboard 4:30 PM. Tram available for transport from farther beaches.</p>`,
  `<p class="p">—</p>`,
  `<h2>6. Dining &amp; Speciality Restaurant Strategy</h2>`,
  `<h3>6.1 The 3-Night Package Execution</h3>`,
  `<p class="p">Bookings: Made and linked on Embarkation Day.<br>Recommended Nights: Day 1 (avoid MDR chaos), Day 3 (post-Grand Cayman), Day 6 (CocoCay celebration).<br>Venue Guide:<br>Chops Grille: Classic steakhouse. Order the filet and shareable sides.<br>Giovanni’s Table: Italian family-style. Perfect for groups.<br>Izumi: Hibachi experience (entertaining) or à la carte sushi. Credit from package applies.</p>`,
  `<h3>6.2 Main Dining Room &amp; other Venues</h3>`,
  `<p class="p">My Time Dining: You have reservations. Show up at your set time each night.<br>Windjammer (Buffet): Best for breakfast variety and casual lunches. Avoid peak times (8:30 AM, 12:30 PM).<br>Café Promenade: 24/7 included snacks (pizza, sandwiches, cookies). Your late-night savior.</p>`,
  `<p class="p">---</p>`,
  `<h2>7. Finance, Communication &amp; Logistics</h2>`,
  `<h3>7.1 The Financial Control Panel</h3>`,
  `<p class="p">SeaPass: Your onboard credit card. All spending is charged to your cabin account.<br>Tracking: Use the “Onboard Account” feature in the Royal app daily to monitor charges.<br>Gratuities: Standard daily gratuity ($18.50+/person/day) will be auto-charged. You pre-paid or will see this on your final bill.<br>Settling Up: Final bill is charged to the card on file early on debarkation day. Review paper statement left at your cabin.</p>`,
  `<h3>7.2 The Communication Matrix</h3>`,
  `<p class="p">Onboard (Primary): Royal App’s free in-app chat. Works over ship Wi-Fi without an internet package. Create a group for all 6 guests.<br>Onboard (Secondary - External): The 1-device VOOM internet plan. Use for WhatsApp, email, social media. Log in/out as needed on shared devices.<br>In Port: Local cell service may work (check your plan). Use WhatsApp if connected. Always set a clear physical meet-up time and place.</p>`,
  `<h3>7.3 Luggage &amp; Packing</h3>`,
  `<p class="p">Embarkation: Attach tags. Check large bags with porters; keep essentials, meds, swimwear, and documents in carry-on.<br>Debarkation: Place large bags outside your cabin by 11:00 PM on final night. Keep debarkation day clothes and toiletries in carry-on.</p>`,
  `<p class="p">—</p>`,
  `<h2>8. Debarkation &amp; Return to Reality</h2>`,
  `<h3>8.1 The Night Before (Day 6)</h3>`,
  `<p class="p">Pack checked luggage.<br>Settle onboard account (visit Guest Services if discrepancies).<br>Place luggage in hallway by 11:00 PM.</p>`,
  `<h3>8.2 Debarkation Morning (Day 7)</h3>`,
  `<p class="p">Early Breakfast: Windjammer or Café Promenade opens early.<br>Two Disembarkation Options:<br>Self-Assist (Recommended for Control): Keep all luggage, walk off once ship clears (≈7:15 AM). Best for those with early travel.<br>Checked Luggage: Wait in a designated lounge for your luggage tag number/color to be called. Disembark, find bags in terminal.<br>Customs: Use facial recognition or present passport. Proceed to transportation.</p>`,
  `<h3>8.3 Post-Cruise</h3>`,
  `<p class="p">Survey: You may receive a guest satisfaction survey via email. Your feedback matters.<br>Memories: Your SeaPass cards are souvenirs. Photos can be purchased or downloaded if you used the ship’s photographers.</p>`,
  `<p class="p">—</p>`,
  `<h2>Final Transmission</h2>`,
  `<p class="p">This manual is your blueprint. You have mastered the logistics. The only task left is to enjoy the fluid reality of your family’s adventure. Trust the plan, then live beyond it.</p>`,
  `<p class="p">Bon Voyage, family and friends.</p>`,
  `<p class="p">⸻</p>`,
  `<h2>ADDENDUM X — FAILURE MODES, CONTINGENCIES &amp; FORCE MULTIPLIERS</h2>`,
  `<p class="p">Companion to The Family and Friends Cruise Companion: Unabridged Operations Manual</p>`,
  `<h3>Purpose:</h3>`,
  `<p class="p">This addendum exists for the moments between the plan and reality. It covers health, weather, kids, fatigue, human error, and ship quirks — the things that actually cause stress if they aren’t pre-decided.</p>`,
  `<p class="p">Read once. Use rarely. Appreciate silently.</p>`,
  `<p class="p">⸻</p>`,
  `<h3>X1) MEDICAL &amp; HEALTH CONTINGENCY PROTOCOL</h3>`,
  `<p class="p"><strong>Medical Center (Know Before You Need It)</strong><br>Location: Deck 4 (forward)<br>Hours: Posted daily in app; 24-hour emergency availability<br>Cost reality: Care is not free. Charges go to SeaPass.</p>`,
  `<p class="p"><strong>Decision Tree</strong><br>Minor issue (headache, nausea, scrape):<br>→ Treat in cabin first → reassess in 30–60 minutes<br><br>Moderate issue (fever, persistent vomiting, allergic reaction):<br>→ One adult escorts to Medical<br>→ One adult remains with kids<br>→ Concierge notified<br><br>Serious issue (injury, breathing trouble):<br>→ Call ship emergency number immediately (posted on cabin phone)</p>`,
  `<p class="p"><strong>Medication Safeguard</strong><br>• All critical meds must be split across two carry-ons, not one bag.<br>• Never leave all meds in one cabin.</p>`,
  `<p class="p">⸻</p>`,
  `<h3>X2) WEATHER &amp; SEA-STATE ADAPTATION LOGIC</h3>`,
  `<p class="p"><strong>If CocoCay Is Windy or Overcast</strong><br>• Shade &gt; chairs &gt; water<br>• Poolside + Snack Shack beats beach frustration<br>• Accept “half-day win” and leave early if conditions turn</p>`,
  `<p class="p"><strong>If Tendering Is Delayed (Grand Cayman)</strong><br>• Ship excursions go first — this is intentional<br>• Independent plans should not rush<br>• Convert morning plan → afternoon plan without negotiation</p>`,
  `<h2>The Family and Friends Cruise Companion: Unabridged Operations Manual</h2>`,
  `<p class="p">Adventure of the Seas | February 14–20, 2026 | Western Caribbean &amp; Perfect Day</p>`,
  `<p class="p">---</p>`,
  `<h2>📌 Emoji Legend (Quick Reference Box)</h2>`,
  `<p class="p"><strong>Emoji</strong><br>Meaning<br>🔴<br>Critical Task – Must be on time / affects safety or major plans<br>🟡<br>Optional / Recommended – Enhances experience but not mandatory<br>🟢<br>Informational / Flexible – Helpful notes, tips, or reminders<br>(Legend repeats in footer of each page for quick scanning)</p>`,
  `<p class="p">---</p>`,
  `<h2>🔴🟡🟢 1. Pre-Cruise Command Center</h2>`,
  `<h3>1.1 Guest Manifest &amp; Core Data</h3>`,
  `<p class="p">🔴 Primary Booking (4519230)<br>• Stateroom: 6650 (Deck 6, Aft)<br>• Guests: William, Melissa, Declan, Owen<br>• Muster Station: D22</p>`,
  `<p class="p">🔵 Secondary Booking (6788946)<br>• Stateroom: 6651 (Deck 6, Aft)<br>• Guest: Amy Abel<br>• Muster Station: D22</p>`,
  `<p class="p">🔵 Tertiary Booking (4352113)<br>• Stateroom: 8528 (Deck 8, Forward-Mid)<br>• Guest: Karin Aimee<br>• Muster Station: A2</p>`,
  `<p class="p">---</p>`,
  `<h3>1.2 Official Itinerary (Visual Timeline)</h3>`,
  `<p class="p">Day<br>Port/Activity<br>Time<br>Emoji<br>Feb 14 (Sat)<br>Port Canaveral – Depart<br>4:00 PM<br>🔴<br>Feb 15 (Sun)<br>At Sea<br>All Day<br>🟡<br>Feb 16 (Mon)<br>Grand Cayman (Tender)<br>10:30 AM–6 PM<br>🔴<br>Feb 17 (Tue)<br>Falmouth, Jamaica<br>8 AM–5 PM<br>🔴<br>Feb 18 (Wed)<br>At Sea<br>All Day<br>🟡<br>Feb 19 (Thu)<br>Perfect Day at CocoCay<br>7 AM–5 PM<br>🔴<br>Feb 20 (Fri)<br>Port Canaveral – Arrive<br>7 AM<br>🔴</p>`,
  `<p class="p">---</p>`,
  `<h3>1.3 🔴 Mandatory Pre-Departure Tasks (By Feb 13)</h3>`,
  `<p class="p">🔴 Royal App<br>• Download and confirm access for all adults</p>`,
  `<p class="p">🔴 Online Check-In<br>• Complete as soon as available (~45 days prior)<br>• Upload photos and select earliest arrival (10:30 AM)</p>`,
  `<p class="p">🔴 Link Bookings<br>• Concierge (William/Melissa) must link all three bookings in the app</p>`,
  `<p class="p">🟡 Documentation<br>• Verify passports<br>• Print SetSail passes and luggage tags</p>`,
  `<p class="p">🟢 Communication Setup<br>• Create WhatsApp group<br>• Concierge device holds VOOM internet</p>`,
  `<p class="p">---</p>`,
  `<h2>🔴🟡 2. Embarkation Day: The Golden Hour Protocol</h2>`,
  `<p class="p">Objective: ✅ Achieve full onboard readiness within the first 60 minutes</p>`,
  `<p class="p">⏰ Time<br>🔹 Action<br>📍 Location<br>👤 Lead<br>📝 Notes<br>10:30 AM<br>🔴 Arrive at Terminal<br>Port Canaveral<br>All<br>SetSail &amp; passport ready; check bags with porters<br>12:00 PM<br>🔴 Step 1: The Huddle<br>Deck 4/5 Promenade<br>All<br>Gather before dispersing<br>12:05 PM<br>🔴 Step 2: Digital Activation<br>Onboard<br>Concierge 1<br>Connect to Wi-Fi; verify bookings in app<br>12:10 PM<br>🔴 Step 3: Priority Bookings<br>Royal App
  ...


class AppState {
  constructor() {
    this.itinerary = [
      { day: 1, date: '2026-02-14', label: 'Sat, Feb 14', port: 'Port Canaveral', time: 'Depart 4:00 PM', icon: '🚢' },
      { day: 2, date: '2026-02-15', label: 'Sun, Feb 15', port: 'At Sea', time: 'All Day', icon: '🌊' },
      { day: 3, date: '2026-02-16', label: 'Mon, Feb 16', port: 'George Town, Grand Cayman (Tender)', time: '10:30 AM–6:00 PM', icon: '🏝️' },
      { day: 4, date: '2026-02-17', label: 'Tue, Feb 17', port: 'Falmouth, Jamaica', time: '8:00 AM–5:00 PM', icon: '🌴' },
      { day: 5, date: '2026-02-18', label: 'Wed, Feb 18', port: 'At Sea', time: 'All Day', icon: '🌊' },
      { day: 6, date: '2026-02-19', label: 'Thu, Feb 19', port: 'Perfect Day at CocoCay', time: '7:00 AM–5:00 PM', icon: '☀️' },
      { day: 7, date: '2026-02-20', label: 'Fri, Feb 20', port: 'Port Canaveral', time: 'Arrive 7:00 AM', icon: '🏁' },
    ];
    
    // Enhanced chapter data
    this.chapters = [
      {
        id: 'executive',
        num: 1,
        title: 'Executive Summary · Run the Cruise Like Software',
        color: 'primary',
        sections: [
          {
            title: 'Operating rules',
            icon: '🧭',
            type: 'Principles',
            content: `
              <p class="p">This manual is a <b>human-friendly operations playbook</b>. It assumes real life: small humans, hunger, time windows, and surprise chaos.</p>
              <ul class="list">
                <li><b>Default calm.</b> Fewer decisions. More rhythm.</li>
                <li><b>Do irreversible things early.</b> Muster, reservations, key logistics.</li>
                <li><b>One rendezvous point.</b> Everyone knows where to return.</li>
                <li><b>Red tasks first.</b> Then yellow. Then enjoy being alive.</li>
              </ul>
            `,
            tasks: [
              { id: 'exec-muster', emoji: '🔴', text: '<strong>Muster:</strong> complete immediately after boarding. Future-you will thank you.', type: 'crit' },
              { id: 'exec-dining', emoji: '🟡', text: '<strong>Dining plan:</strong> lock specialty nights early so you don\'t end up eating sadness at 9:45 PM.', type: 'warn' },
              { id: 'exec-rally', emoji: '🟢', text: '<strong>Rendezvous:</strong> pick a default meetup spot + time window. Make it boring. Boring wins.', type: 'ok' }
            ]
          }
        ]
      },
      {
        id: 'embarkation',
        num: 2,
        title: 'Embarkation · Golden Hour Protocol',
        color: 'warning',
        sections: [
          {
            title: 'Immediate wins',
            icon: '⚡',
            type: 'Checklist',
            content: `<p class="p">The first hour onboard is where most "we should've..." stories are born. Keep it simple. Execute the basics.</p>`,
            tasks: [
              { id: 'embark-docs', emoji: '🔴', text: '<strong>Documents:</strong> verify access (SeaPass/app). Photograph anything important.', type: 'crit' },
              { id: 'embark-muster', emoji: '🔴', text: '<strong>Muster:</strong> do it now, not later.', type: 'crit' },
              { id: 'embark-wifi', emoji: '🟡', text: '<strong>Connectivity:</strong> decide "Wi‑Fi vs airplane mode." Set expectations.', type: 'warn' },
              { id: 'embark-meet', emoji: '🟡', text: '<strong>Rendezvous point:</strong> pick one meetup spot + time window.', type: 'warn' }
            ]
          },
          {
            title: 'Stateroom quick ops',
            icon: '🛏️',
            type: 'Room',
            content: `
              <div class="kv">
                <div class="k">Room</div>
                <div class="v">6650 (Deck 6, aft). Put a small "go bag" by the door: sunscreen, meds, band-aids, chargers.</div>
              </div>
              <div class="kv">
                <div class="k">First meal strategy</div>
                <div class="v">Eat something simple early. Hungry people make inventive bad decisions.</div>
              </div>
            `,
            tasks: []
          }
        ]
      },
      // Additional chapters would follow the same pattern...
      {
        id: 'manual',
        num: 'X',
        title: 'Full Operations Manual (Integrated)',
        blurb: 'Everything from the PDF, cleanly formatted and searchable — no external files needed.',
        sections: [
          {
            id: 'manual-full',
            title: 'The Family & Friends Cruise Companion — Unabridged Operations Manual',
            type: 'Manual',
            icon: '📘',
            content: MANUAL_CONTENT,

          }
        ]
      }];
  }
  
  todayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  
  parse(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
}

/* ---------------------------- Persistence ------------------------------- */
class Store {
  constructor(key) { this.key = key; this.state = this.load(); }
  load() { try { return JSON.parse(localStorage.getItem(this.key) || '{}'); } catch { return {}; } }
  save() { localStorage.setItem(this.key, JSON.stringify(this.state)); }
  get(k, def = null) { return (k in this.state) ? this.state[k] : def; }
  set(k, v) { this.state[k] = v; this.save(); }
}

/* ------------------------------ Theme ----------------------------------- */
class Theme {
  constructor() {
    this.store = new Store('mc-theme-v2');
    this.root = document.documentElement;
  }
  
  init() {
    $('#toggle-theme')?.addEventListener('click', () => this.cycle());
    this.apply(this.store.get('theme', 'auto'));
  }
  
  apply(mode) {
    this.root.classList.remove('theme--light', 'theme--dark');
    if (mode === 'light' || mode === 'dark') this.root.classList.add(`theme--${mode}`);
    this.store.set('theme', mode);
    toast(`Theme: ${mode}`, 'info');
  }
  
  cycle() {
    const cur = this.store.get('theme', 'auto');
    const next = (cur === 'auto') ? 'dark' : (cur === 'dark') ? 'light' : 'auto';
    this.apply(next);
  }
}

/* ----------------------------- Effects ---------------------------------- */
class Effects {
  constructor() {
    this.store = new Store('mc-effects-v1');
    this.root = document.documentElement;
  }

  init() {
    this.toggle = $('#effects-mode');
    this.toggle?.addEventListener('change', () => this.apply(this.toggle.checked));
    const reduced = !!this.store.get('reduced', false);
    this.apply(reduced);
    if (this.toggle) this.toggle.checked = reduced;
  }

  apply(enabled) {
    this.root.classList.toggle('reduced-effects', enabled);
    this.store.set('reduced', enabled);
    toast(`Performance mode: ${enabled ? 'on' : 'off'}`, 'info');
  }
}

/* ---------------------------- Itinerary --------------------------------- */
class Itinerary {
  constructor(state) { this.state = state; }
  
  init() {
    this.daystrip = $('#daystrip');
    this.body = $('#itinerary-body');
    this.banner = $('#today-banner .mono');
    this.renderDaystrip();
    this.renderTable();
    this.updateBanner();
    $('#jump-today')?.addEventListener('click', () => this.jumpToToday());
    $('#copy-itin')?.addEventListener('click', () => this.copyItin());
  }

  renderDaystrip() {
    if (!this.daystrip) return;
    this.daystrip.innerHTML = '';
    const today = this.state.todayISO();

    this.state.itinerary.forEach(d => {
      const b = document.createElement('button');
      b.className = 'daychip';
      b.type = 'button';
      b.innerHTML = `
        <div class="daychip__day">${d.icon} Day ${d.day} · ${d.label}</div>
        <div class="daychip__label">${d.port}</div>
      `;
      if (d.date === today) {
        b.classList.add('daychip--today');
        b.setAttribute('aria-current', 'true');
      }
      b.addEventListener('click', () => this.scrollToDay(d.day));
      this.daystrip.appendChild(b);
    });

    const cur = this.daystrip.querySelector('.daychip--today');
    cur?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  renderTable() {
    if (!this.body) return;
    this.body.innerHTML = '';
    const today = this.state.todayISO();

    this.state.itinerary.forEach(d => {
      const tr = document.createElement('tr');
      if (d.date === today) tr.className = 'table__row--today';
      tr.innerHTML = `
        <td><b>${d.icon} Day ${d.day}</b><br><span style="color:var(--muted);font-size:.85rem">${d.label}</span></td>
        <td>${d.port}</td>
        <td style="font-family:var(--mono)">${d.time}</td>
        <td><button class="pill" data-day="${d.day}" style="font-size:.8rem">Jump</button></td>
      `;
      this.body.appendChild(tr);
    });
    
    // Add event listeners to jump buttons
    $$('[data-day]', this.body).forEach(btn => {
      btn.addEventListener('click', (e) => {
        const day = e.target.dataset.day;
        this.scrollToDay(day);
      });
    });
  }

  updateBanner() {
    const today = new Date();
    const todayISO = this.state.todayISO();
    const first = this.state.parse(this.state.itinerary[0].date);
    const last = this.state.parse(this.state.itinerary[this.state.itinerary.length - 1].date);

    let status = 'Pre-cruise';
    const item = this.state.itinerary.find(x => x.date === todayISO);
    if (item) status = `${item.icon} Day ${item.day}: ${item.port}`;
    else if (today > last) status = 'Post-cruise';

    if (this.banner) this.banner.textContent = status;
    document.dispatchEvent(new CustomEvent('mc:today', { detail: { status } }));
  }

  jumpToToday() {
    const iso = this.state.todayISO();
    const item = this.state.itinerary.find(x => x.date === iso);
    if (!item) return smoothTo($('#top'));
    this.scrollToDay(item.day);
    toast(`Jumped to Day ${item.day}: ${item.port}`, 'info');
  }

  scrollToDay(day) {
    const map = {
      1: '#embarkation', 2: '#sea-days', 3: '#port-days', 4: '#port-days',
      5: '#sea-days', 6: '#port-days', 7: '#disembarkation'
    };
    const id = map[day] || '#top';
    const target = $(id) || $('#manual') || $('#top');
    if (!target) return;
    smoothTo(target);
    if (target.id) history.replaceState(null, '', `#${target.id}`);
  }

  copyItin() {
    const lines = this.state.itinerary.map(d => `Day ${d.day} (${d.label}): ${d.port} — ${d.time}`);
    navigator.clipboard?.writeText(lines.join('\n'))
      .then(() => toast('Itinerary copied to clipboard', 'success'))
      .catch(() => toast('Copy failed', 'error'));
  }
}

/* ---------------------------- Task System -------------------------------- */
class Tasks {
  constructor() {
    this.store = new Store('mc-tasks-v3');
  }
  
  init() {
    this.bindCheckboxes();
    document.addEventListener('filters:applied', () => this.updateAllProgress());
    document.addEventListener('mc:today', () => this.updateAllProgress());
    this.updateAllProgress();
  }

  bindCheckboxes() {
    $$('.task[data-task-id]').forEach(task => {
      const id = task.getAttribute('data-task-id');
      const cb = $('.task__check', task);
      if (!id || !cb) return;

      cb.checked = !!this.store.get(id, false);
      task.classList.toggle('task--done', cb.checked);

      cb.addEventListener('change', () => {
        this.store.set(id, cb.checked);
        task.classList.toggle('task--done', cb.checked);
        this.updateAllProgress();
        
        // Celebrate when all tasks in a chapter are complete
        const chapter = task.closest('.chapter');
        if (chapter) {
          const chapterProgress = this.chapterProgress(chapter);
          if (chapterProgress.pct === 100) {
            createConfetti();
            toast(`Chapter ${chapter.dataset.chapter} complete!`, 'success');
          }
        }
      });
    });
  }

  chapterProgress(chapterEl) {
    const tasks = $$('.task[data-task-id]', chapterEl).filter(t => t.style.display !== 'none');
    const total = tasks.length;
    if (!total) return { done: 0, total: 0, pct: 100 };
    let done = 0;
    tasks.forEach(t => {
      const id = t.getAttribute('data-task-id');
      if (id && this.store.get(id, false)) done++;
    });
    const pct = Math.round((done / total) * 100);
    return { done, total, pct };
  }

  updateAllProgress() {
    // per chapter
    $$('.chapter').forEach(ch => {
      const chip = $('[data-chapter-progress]', ch);
      if (!chip) return;
      const p = this.chapterProgress(ch);
      chip.innerHTML = `<b>${p.pct}%</b> done`;
    });

    // overall
    const all = $$('.task[data-task-id]').filter(t => t.style.display !== 'none');
    const total = all.length;
    let done = 0;
    all.forEach(t => {
      const id = t.getAttribute('data-task-id');
      if (id && this.store.get(id, false)) done++;
    });
    const pct = total ? Math.round((done / total) * 100) : 100;
    $('#overall-progress')?.textContent = `${pct}%`;
  }

  nextMustDo() {
    // pick first visible critical not done, else warning not done, else any not done
    const pick = (sel) => $$(sel).find(t => {
      if (t.style.display === 'none') return false;
      const id = t.getAttribute('data-task-id');
      return id ? !this.store.get(id, false) : false;
    });

    return pick('.task.task--crit') || pick('.task.task--warn') || pick('.task[data-task-id]');
  }
}

/* ------------------------------ Filters ---------------------------------- */
class Filters {
  init() {
    this.filters = {
      crit: $('#filter-crit'),
      warn: $('#filter-warn'),
      ok: $('#filter-ok'),
      info: $('#filter-info'),
    };
    this.focus = $('#focus-mode');

    Object.values(this.filters).forEach(cb => cb?.addEventListener('change', () => this.apply()));
    this.focus?.addEventListener('change', () => this.apply());

    $('#expand-all')?.addEventListener('click', () => this.expandAll(true));
    $('#collapse-all')?.addEventListener('click', () => this.expandAll(false));

    this.apply();
  }

  apply() {
    const allow = {
      crit: this.filters.crit?.checked ?? true,
      warn: this.filters.warn?.checked ?? true,
      ok: this.filters.ok?.checked ?? true,
      info: this.filters.info?.checked ?? true,
    };

    $$('.task').forEach(t => {
      const level =
        t.classList.contains('task--crit') ? 'crit' :
        t.classList.contains('task--warn') ? 'warn' :
        t.classList.contains('task--ok') ? 'ok' :
        t.classList.contains('task--info') ? 'info' : null;
      t.style.display = (level && allow[level]) ? '' : 'none';
    });

    const focus = this.focus?.checked ?? false;
    $$('.p, .kv, ul.list, .h').forEach(el => el.style.display = focus ? 'none' : '');

    document.dispatchEvent(new CustomEvent('filters:applied'));
    
    const activeFilters = Object.values(allow).filter(v => v).length;
    toast(`${activeFilters} filter${activeFilters !== 1 ? 's' : ''} active`, 'info');
  }

  expandAll(open) {
    // chapter bodies
    $$('.chapter').forEach(ch => {
      const body = $('.chapter__body', ch);
      if (body) body.style.display = open ? '' : 'none';
    });
    // sections (details)
    $$('details.section').forEach(d => d.open = open);
    
    toast(`${open ? 'Expanded' : 'Collapsed'} all sections`, 'info');
  }
}

/* ------------------------------ TOC -------------------------------------- */
class TOC {
  init() {
    this.toc = $('#toc');
    this.build();
  }

  build() {
    if (!this.toc) return;
    this.toc.innerHTML = '';

    $$('.chapter').forEach((ch, idx) => {
      const id = ch.id;
      const num = ch.dataset.chapter || String(idx + 1);
      const title = $('.chapter__title', ch)?.textContent?.trim() || `Section ${num}`;

      const counts = {
        crit: $$('.task--crit', ch).length,
        warn: $$('.task--warn', ch).length,
        ok: $$('.task--ok', ch).length,
        info: $$('.task--info', ch).length,
      };

      const metaBits = [];
      if (counts.crit) metaBits.push(`🔴 ${counts.crit}`);
      if (counts.warn) metaBits.push(`🟡 ${counts.warn}`);
      if (counts.ok) metaBits.push(`🟢 ${counts.ok}`);
      if (counts.info) metaBits.push(`🔵 ${counts.info}`);

      const li = document.createElement('li');
      li.className = 'toc__item';
      li.innerHTML = `
        <a class="toc__link" href="#${id}">
          <span class="toc__num">${num}</span>
          <span class="toc__content">
            <div class="toc__title">${title}</div>
            <div class="toc__meta">${metaBits.map(x => `<span class="pill">${x}</span>`).join('')}</div>
          </span>
        </a>
      `;
      $('a', li).addEventListener('click', (e) => {
        e.preventDefault();
        smoothTo(document.getElementById(id));
        history.replaceState(null, '', `#${id}`);
        toast(`Jumped to ${title}`, 'info');
      });

      this.toc.appendChild(li);
    });
  }
}

/* ------------------------------ Search ----------------------------------- */
class Search {
  init() {
    this.input = $('#search-input');
    this.count = $('#search-count');
    this.pos = $('#search-pos');
    this.main = $('#main');
    this.hits = [];
    this.idx = 0;

    if (!this.input) return;

    let timer;
    this.input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => this.run(this.input.value), 250);
    });

    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!this.input.value.trim()) return;
        if (!this.hits.length) this.run(this.input.value);
        else this.jump(this.idx + 1);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.clear();
      }
    });
  }

  clearMarks() {
    if (!this.main) return;
    $$('mark.hit', this.main).forEach(m => {
      const t = document.createTextNode(m.textContent);
      m.parentNode.replaceChild(t, m);
      m.parentNode.normalize();
    });
  }

  clear() {
    this.input.value = '';
    this.clearMarks();
    this.hits = [];
    this.idx = 0;
    this.updateMeta();
  }

  updateMeta() {
    if (this.count) this.count.textContent = String(this.hits.length);
    if (this.pos) this.pos.textContent = this.hits.length ? `${this.idx + 1}/${this.hits.length}` : '0/0';
  }

  escape(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  run(q) {
    this.clearMarks();
    this.hits = [];
    this.idx = 0;

    const query = q.trim();
    if (!query) { this.updateMeta(); return; }

    const rx = new RegExp(this.escape(query), 'gi');
    const scopes = ['#chapters', '.hero', '.dashboard']
      .map(sel => $(sel)).filter(Boolean);

    const walkerAccept = (node) => {
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      const p = node.parentElement;
      if (!p) return NodeFilter.FILTER_REJECT;
      if (p.closest('.sidebar') || p.closest('.palette') || p.closest('script') || p.closest('style')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    };

    scopes.forEach(scope => {
      const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, { acceptNode: walkerAccept });
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);

      nodes.forEach(textNode => {
        const text = textNode.nodeValue;
        rx.lastIndex = 0;
        if (!rx.test(text)) return;
        rx.lastIndex = 0;

        const frag = document.createDocumentFragment();
        let last = 0, m;
        while ((m = rx.exec(text)) !== null) {
          const s = m.index;
          const e = s + m[0].length;
          if (s > last) frag.appendChild(document.createTextNode(text.slice(last, s)));
          const mark = document.createElement('mark');
          mark.className = 'hit';
          mark.textContent = text.slice(s, e);
          frag.appendChild(mark);
          this.hits.push(mark);
          last = e;
          if (m.index === rx.lastIndex) rx.lastIndex++;
        }
        if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
        textNode.parentNode.replaceChild(frag, textNode);
      });
    });

    this.updateMeta();
    if (this.hits.length) {
      this.jump(0);
      toast(`Found ${this.hits.length} match${this.hits.length !== 1 ? 'es' : ''}`, 'info');
    } else {
      toast('No matches found', 'warning');
    }
  }

  jump(i) {
    if (!this.hits.length) return;
    this.idx = ((i % this.hits.length) + this.hits.length) % this.hits.length;
    const hit = this.hits[this.idx];
    smoothTo(hit, { block: 'center' });
    hit.style.outline = '2px solid rgba(125,211,252,.75)';
    hit.style.outlineOffset = '2px';
    hit.style.boxShadow = '0 0 10px rgba(125,211,252,.5)';
    setTimeout(() => { 
      hit.style.outline = ''; 
      hit.style.outlineOffset = ''; 
      hit.style.boxShadow = ''; 
    }, 1000);
    this.updateMeta();
  }
}

/* --------------------------- Command Palette ----------------------------- */
class Palette {
  init() {
    this.el = $('#palette');
    this.input = $('#palette-input');
    this.list = $('#palette-list');
    if (!this.el || !this.input || !this.list) return;

    $('#open-palette')?.addEventListener('click', () => this.open());
    $('#fab-command')?.addEventListener('click', () => this.open());

    this.input.addEventListener('input', () => this.render());
    this.input.addEventListener('keydown', (e) => this.onKey(e));

    this.el.addEventListener('click', (e) => { if (e.target === this.el) this.close(); });

    document.addEventListener('keydown', (e) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'k') { e.preventDefault(); this.open(); }
      if (e.key === 'Escape' && this.el.getAttribute('aria-hidden') === 'false') { e.preventDefault(); this.close(); }
    });

    this.commands = [];
  }

  buildCommands() {
    const base = [
      { id: 'today', icon: '📍', title: 'Jump to Today', sub: 'Auto-scroll to today\'s relevant section', k: 'T', run: () => $('#jump-today')?.click() },
      { id: 'focus', icon: '🎯', title: 'Toggle Focus Mode', sub: 'Show tasks only', k: 'F', run: () => { const t = $('#focus-mode'); if (t) { t.checked = !t.checked; t.dispatchEvent(new Event('change')); } } },
      { id: 'expand', icon: '↕️', title: 'Expand everything', sub: 'Open all sections and bodies', k: 'E', run: () => $('#expand-all')?.click() },
      { id: 'collapse', icon: '↕️', title: 'Collapse everything', sub: 'Hide bodies and close sections', k: 'C', run: () => $('#collapse-all')?.click() },
      { id: 'print', icon: '🖨️', title: 'Print / Save PDF', sub: 'Open print dialog', k: 'P', run: () => window.print() },
      { id: 'theme', icon: '🌓', title: 'Cycle theme', sub: 'auto → dark → light', k: 'M', run: () => $('#toggle-theme')?.click() },
      { id: 'confetti', icon: '🎉', title: 'Celebrate!', sub: 'Trigger celebration effect', k: '🎊', run: () => { createConfetti(); toast('Celebration!', 'success'); } },
    ];

    const chapters = $$('.chapter').map(ch => {
      const id = ch.id;
      const num = ch.dataset.chapter || '?';
      const title = $('.chapter__title', ch)?.textContent?.trim() || 'Section';
      return { id: `ch-${id}`, icon: '§', title: `${num} · ${title}`, sub: 'Jump to section', k: '#', run: () => smoothTo(ch) };
    });

    this.commands = [...base, ...chapters];
  }

  open() {
    this.el.setAttribute('aria-hidden', 'false');
    this.buildCommands();
    this.input.value = '';
    this.render();
    setTimeout(() => { this.input.focus(); this.input.select(); }, 0);
  }

  close() {
    this.el.setAttribute('aria-hidden', 'true');
    this.input.blur();
  }

  render() {
    const q = this.input.value.trim().toLowerCase();
    const cmds = this.commands.filter(c => !q || c.title.toLowerCase().includes(q) || c.sub.toLowerCase().includes(q));
    this.list.innerHTML = '';

    if (!cmds.length) {
      const div = document.createElement('div');
      div.style.padding = '16px';
      div.style.textAlign = 'center';
      div.style.color = 'var(--muted)';
      div.textContent = 'No matches found';
      this.list.appendChild(div);
      return;
    }

    cmds.forEach((c, idx) => {
      const li = document.createElement('li');
      li.className = 'cmd';
      li.setAttribute('role', 'option');
      li.setAttribute('tabindex', idx === 0 ? '0' : '-1');
      li.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
      li.innerHTML = `
        <div class="cmd__left">
          <div class="cmd__ic" aria-hidden="true">${c.icon}</div>
          <div class="cmd__text">
            <div class="cmd__title">${c.title}</div>
            <div class="cmd__sub">${c.sub}</div>
          </div>
        </div>
        <div class="cmd__kbd">${c.k}</div>
      `;
      li.addEventListener('click', () => { this.close(); c.run(); });
      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.close(); c.run(); }
      });
      this.list.appendChild(li);
    });
  }

  onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); this.close(); return; }
    if (e.key === 'Enter') { e.preventDefault(); $('.cmd[aria-selected="true"]', this.list)?.click(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); this.nav(1); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); this.nav(-1); return; }
  }

  nav(dir) {
    const items = $$('.cmd', this.list);
    if (!items.length) return;
    const cur = items.findIndex(x => x.getAttribute('aria-selected') === 'true');
    let next = cur + dir;
    if (next < 0) next = items.length - 1;
    if (next >= items.length) next = 0;
    items.forEach((it, i) => {
      it.setAttribute('aria-selected', i === next ? 'true' : 'false');
      it.tabIndex = i === next ? 0 : -1;
    });
    items[next].focus();
  }
}

/* ------------------------- Scroll Progress -------------------------------- */
class ProgressBar {
  init() {
    this.bar = $('#progress');
    if (!this.bar) return;
    window.addEventListener('scroll', () => this.update(), { passive: true });
    this.update();
  }
  
  update() {
    const doc = document.documentElement;
    const top = window.scrollY || doc.scrollTop;
    const height = doc.scrollHeight - doc.clientHeight;
    if (height <= 0) return;
    this.bar.style.width = `${clamp((top / height) * 100, 0, 100)}%`;
  }
}

/* ------------------------------ KPIs ------------------------------------- */
class KPIs {
  constructor(state, tasks) { this.state = state; this.tasks = tasks; }
  
  init() {
    this.kNext = $('#kpi-next');
    this.kCountdown = $('#kpi-countdown');
    this.kToday = $('#kpi-today');
    this.kVisible = $('#kpi-visible');

    this.updateAll();
    document.addEventListener('filters:applied', () => this.updateAll());
    document.addEventListener('mc:today', () => this.updateAll());
    setInterval(() => this.updateCountdown(), 60_000);
  }

  updateAll() {
    this.updateNext();
    this.updateCountdown();
    this.updateToday();
    this.updateVisible();
  }

  updateNext() {
    if (!this.kNext) return;
    const t = this.tasks.nextMustDo();
    this.kNext.textContent = t ? t.textContent.trim().replace(/\s+/g, ' ').slice(0, 120) + '...' : '—';
  }

  updateCountdown() {
    if (!this.kCountdown) return;
    const sail = this.state.parse(this.state.itinerary[0].date);
    const now = new Date();
    const ms = sail - now;
    if (ms <= 0) { this.kCountdown.textContent = 'Sailing (or sailed)'; return; }
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    this.kCountdown.textContent = `${days}d ${hours}h ${mins}m`;
  }

  updateToday() {
    if (!this.kToday) return;
    const iso = this.state.todayISO();
    const item = this.state.itinerary.find(d => d.date === iso);
    this.kToday.textContent = item ? `${item.icon} Day ${item.day} · ${item.port}` : 'Not within sail dates';
  }

  updateVisible() {
    if (!this.kVisible) return;
    const visible = $$('.task').filter(t => t.style.display !== 'none').length;
    const total = $$('.task').length;
    this.kVisible.textContent = `${visible}/${total}`;
  }
}

/* --------------------------- Chapter Renderer ---------------------------- */
class ChapterRenderer {
  constructor(state) {
    this.state = state;
  }
  
  init() {
    this.renderChapters();
    bindChapterToggles();
  }
  
  renderChapters() {
    const container = $('#chapters');
    if (!container) return;
    
    container.innerHTML = '';
    
    this.state.chapters.forEach(chapter => {
      const chapterEl = document.createElement('article');
      chapterEl.className = 'chapter';
      chapterEl.id = chapter.id;
      chapterEl.dataset.chapter = chapter.num;
      
      // Build sections HTML
      let sectionsHTML = '';
      chapter.sections.forEach(section => {
        let tasksHTML = '';
        if (section.tasks && section.tasks.length) {
          tasksHTML = section.tasks.map(task => `
            <div class="task task--${task.type}" data-task-id="${task.id}">
              <input class="task__check" type="checkbox" aria-label="Mark task done">
              <div class="task__emoji">${task.emoji}</div>
              <div class="task__text">${task.text}</div>
            </div>
          `).join('');
        }
        
        sectionsHTML += `
          <details class="section" open>
            <summary>
              <div class="left">
                <span class="pill">${section.type}</span>
                <span class="title">${section.title}</span>
              </div>
              <div class="meta">
                <span>${section.icon}</span>
                <svg class="chev" viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </summary>
            <div class="section__body">
              ${section.content}
              ${tasksHTML}
            </div>
          </details>
        `;
      });
      
      chapterEl.innerHTML = `
        <header class="chapter__header">
          <div class="chapter__left">
            <div class="chapter__num">${/^\d+$/.test(String(chapter.num)) ? String(chapter.num).padStart(2, '0') : String(chapter.num)}</div>
            <h3 class="chapter__title">${chapter.title}</h3>
          </div>
          <div class="chapter__right">
            <span class="progress-chip" data-chapter-progress><b>0%</b> done</span>
            <button class="icon-btn" data-chapter-toggle aria-label="Toggle chapter body" title="Collapse/Expand">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </header>
        <div class="chapter__body">
          ${sectionsHTML}
        </div>
      `;
      
      container.appendChild(chapterEl);
    });
  }
}

/* --------------------------- Chapter Toggles ------------------------------ */
function bindChapterToggles() {
  $$('.chapter').forEach(ch => {
    const btn = $('[data-chapter-toggle]', ch);
    const body = $('.chapter__body', ch);
    if (!btn || !body) return;
    btn.addEventListener('click', () => {
      const hidden = body.style.display === 'none';
      body.style.display = hidden ? '' : 'none';
      btn.style.transform = hidden ? 'rotate(0deg)' : 'rotate(180deg)';
    });
  });
}

/* ------------------------------ FAB -------------------------------------- */
function bindFab() {
  $('#fab-top')?.addEventListener('click', () => {
    smoothTo($('#top'));
    toast('Back to top', 'info');
  });
  
  $('#fab-help')?.addEventListener('click', () => {
    toast('Press Ctrl/⌘K for commands, Enter to cycle search results', 'info');
  });
}

/* ------------------------------ Print ------------------------------------ */
function bindPrint() {
  $('#print-btn')?.addEventListener('click', () => {
    toast('Opening print dialog...', 'info');
    setTimeout(() => window.print(), 300);
  });
}

/* ------------------------------ Boot ------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  applyReducedEffects();
  applyIconFallback();

  // Hide loading screen
  setTimeout(() => {
    $('#loading').classList.add('hidden');
  }, 800);
  
  // Initialize all components
  const state = new AppState();
  const theme = new Theme(); theme.init();
  const effects = new Effects(); effects.init();
  const itin = new Itinerary(state); itin.init();
  const chapterRenderer = new ChapterRenderer(state); chapterRenderer.init();
  const filters = new Filters(); filters.init();
  const tasks = new Tasks(); tasks.init();
  const toc = new TOC(); toc.init();
  const search = new Search(); search.init();
  const palette = new Palette(); palette.init();
  const pb = new ProgressBar(); pb.init();
  const kpi = new KPIs(state, tasks); kpi.init();

  bindFab();
  bindPrint();
  bindChapterToggles();

  // hash nav
  if (window.location.hash) {
    setTimeout(() => {
      smoothTo($(window.location.hash));
    }, 500);
  }

  toast('Mission Control 2.0 Ready 🚢', 'success');
  
  // Add a subtle welcome animation
  setTimeout(() => {
    document.querySelectorAll('.hero__badges .badge').forEach((badge, i) => {
      setTimeout(() => {
        badge.style.transform = 'translateY(0)';
        badge.style.opacity = '1';
      }, i * 100);
    });
  }, 300);
});
