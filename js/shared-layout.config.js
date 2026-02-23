/**
 * Shared layout configuration.
 * Split from shared-layout.js to keep shell rendering logic focused.
 */
window.CruiseSharedLayoutConfig = {
  DEFAULT_META: {
    brand: "Royal Caribbean",
    ship: "Adventure of the Seas",
    sailing: "Feb 14–20, 2026",
    sailingLabel: "6-Night Western Caribbean & Perfect Day",
    port: "Port Canaveral",
    checkIn: "12:00 PM",
    allAboard: "2:00 PM",
    tagline: "Experience WOW",
    year: new Date().getFullYear(),
  },
  NAV_ITEMS: [
    {
      id: "index",
      navKey: "home",
      href: "index.html",
      icon: "fa-home",
      text: "Home",
      hint: "The Countdown",
    },
    {
      id: "plan",
      navKey: "plan",
      href: "plan.html",
      icon: "fa-compass",
      text: "Game Plan",
      hint: "What To Do Next",
    },
    {
      id: "itinerary",
      navKey: "today",
      href: "itinerary.html#today",
      icon: "fa-calendar-day",
      text: "Today",
      hint: "Right Now",
    },
    {
      id: "decks",
      navKey: "map",
      href: "decks.html",
      icon: "fa-map",
      text: "Ship Map",
      hint: "Find Anything",
    },
    {
      id: "dining",
      navKey: "food",
      href: "dining.html",
      icon: "fa-utensils",
      text: "Food",
      hint: "Tonight's Pick",
    },
    {
      id: "rooms",
      navKey: "family",
      href: "rooms.html",
      icon: "fa-users",
      text: "Family",
      hint: "Who's Where",
    },
  ],
  MORE_DRAWER_GROUPS: [
    {
      title: "Explore",
      items: [
        {
          id: "ports",
          href: "ports.html",
          icon: "fa-map-location-dot",
          text: "Ports",
        },
        {
          id: "tips",
          href: "tips.html",
          icon: "fa-lightbulb",
          text: "Pro Moves",
        },
        {
          id: "photos",
          href: "photos.html",
          icon: "fa-images",
          text: "Photos",
        },
      ],
    },
    {
      title: "Utility",
      items: [
        {
          id: "operations",
          href: "operations.html",
          icon: "fa-clipboard-check",
          text: "Checklist",
        },
        {
          id: "contacts",
          href: "contacts.html",
          icon: "fa-phone-volume",
          text: "Contacts",
        },
        {
          id: "offline",
          href: "offline.html",
          icon: "fa-wifi",
          text: "Offline",
        },
      ],
    },
  ],
  BOTTOM_NAV_ITEMS: [
    {
      id: "index",
      navKey: "home",
      icon: "fa-home",
      text: "Home",
      href: "index.html",
    },
    {
      id: "plan",
      navKey: "plan",
      icon: "fa-compass",
      text: "Plan",
      href: "plan.html",
    },
    {
      id: "itinerary",
      navKey: "today",
      icon: "fa-calendar-day",
      text: "Today",
      href: "itinerary.html#today",
    },
    {
      id: "decks",
      navKey: "map",
      icon: "fa-ship",
      text: "Map",
      href: "decks.html",
    },
    {
      id: "more",
      navKey: "more",
      icon: "fa-ellipsis",
      text: "More",
      action: "open-more-drawer",
    },
  ],
};
