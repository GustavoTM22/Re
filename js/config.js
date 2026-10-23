/* ============================================================
   CONFIGURACIÓN DEL EVENTO · GUSTAVO & EVELIN
   Edita este archivo para personalizar la invitación.
   ============================================================ */
window.SITE_CONFIG = {
  parents: {
    dad: "Gustavo Antonio Torres Márquez",
    mom: "Evelin Medaly Cabrales Nunura",
    display: "Gustavo & Evelin",
    hashtags: ["#RevelacionDeGenero", "#BabyOnTheWay", "#TeamBoyOrGirl"]
  },
  baby: {
    revealDate: "2026-11-14T15:30:00-05:00",
    result: "",                 // "boy", "girl" o "" (vacío = secreto)
    revealCode: "AMOR",         // palabra secreta para abrir la carta
    autoRevealAfter: "2026-11-14T18:00:00-05:00"
  },
  event: {
    title: "Revelación de género · Baby Torres Cabrales",
    weekday: "Sábado",
    dateLabel: "14 de noviembre de 2026",
    dateShort: "14 · 11 · 2026",
    dateNumeric: "14.11.26",
    timeLabel: "3:30 p.m.",
    timeNote: "Hora por confirmar",
    venueName: "Por confirmar",
    venueAddress: "La dirección exacta se compartirá muy pronto.",
    dressCode: "De blanco, con un detalle celeste o rosa",
    dressNote: "Elige tu color según tu intuición",
    mapUrl: "",                 // pega aquí el enlace de Google Maps
    rsvpDeadline: "2026-11-12T23:59:00-05:00",
    rsvpDeadlineLabel: "jueves 12 de noviembre",
    endDate: "2026-11-14T20:00:00-05:00"
  },
  rsvp: {
    whatsapp: "51904852996",
    webhook: ""                 // opcional: Google Apps Script / Airtable / Make
  },
  gifts: {
    phone: "+51 904 852 996",
    phoneRaw: "51904852996",
    holder: "Evelin Medaly Cabrales Nunura",
    methods: ["Yape", "Plin", "Transferencia"]
  },
  votes: {
    baseBoy: 0,                 // votos iniciales (opcional)
    baseGirl: 0,
    endpoint: ""                // opcional: endpoint GET/POST para votos globales
  },
  music: {
    enabled: true,
    audioUrl: "" // Archivo de música local, opcional
  }
};
