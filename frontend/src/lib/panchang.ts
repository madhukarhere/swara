import { MhahPanchang } from 'mhah-panchang';

/** Tirupati (default reference for the Panchangam). */
const TIRUPATI = { lat: 13.6288, lng: 79.4192 };
const IST_OFFSET_MIN = 330;

/* --------------------------- Telugu name tables ---------------------------- */

// Tithi (0-indexed; 0–14 Shukla paksha, 15–29 Krishna paksha)
const TE_TITHI = [
  'పాడ్యమి', 'విదియ', 'తదియ', 'చవితి', 'పంచమి', 'షష్ఠి', 'సప్తమి', 'అష్టమి', 'నవమి',
  'దశమి', 'ఏకాదశి', 'ద్వాదశి', 'త్రయోదశి', 'చతుర్దశి', 'పూర్ణిమ',
  'పాడ్యమి', 'విదియ', 'తదియ', 'చవితి', 'పంచమి', 'షష్ఠి', 'సప్తమి', 'అష్టమి', 'నవమి',
  'దశమి', 'ఏకాదశి', 'ద్వాదశి', 'త్రయోదశి', 'చతుర్దశి', 'అమావాస్య',
];

// Nakshatra (0-indexed)
const TE_NAKSHATRA = [
  'అశ్విని', 'భరణి', 'కృత్తిక', 'రోహిణి', 'మృగశిర', 'ఆర్ద్ర', 'పునర్వసు', 'పుష్యమి', 'ఆశ్లేష',
  'మఖ', 'పుబ్బ', 'ఉత్తర', 'హస్త', 'చిత్త', 'స్వాతి', 'విశాఖ', 'అనూరాధ', 'జ్యేష్ఠ',
  'మూల', 'పూర్వాషాఢ', 'ఉత్తరాషాఢ', 'శ్రవణ', 'ధనిష్ఠ', 'శతభిష', 'పూర్వాభాద్ర', 'ఉత్తరాభాద్ర', 'రేవతి',
];

const TE_PAKSHA_BY_EN: Record<string, string> = { Shukla: 'శుద్ధ', Krishna: 'బహుళ' };

const TE_MASA_BY_EN: Record<string, string> = {
  Chaitra: 'చైత్ర', Vaisakha: 'వైశాఖ', Vaishakha: 'వైశాఖ',
  Jyeshtha: 'జ్యేష్ఠ', Jyestha: 'జ్యేష్ఠ',
  Ashadha: 'ఆషాఢ', Asadha: 'ఆషాఢ',
  Shravana: 'శ్రావణ', Sravana: 'శ్రావణ',
  Bhadrapada: 'భాద్రపద',
  Ashwin: 'ఆశ్వయుజ', Ashwayuja: 'ఆశ్వయుజ', Asvina: 'ఆశ్వయుజ',
  Kartika: 'కార్తీక', Karthika: 'కార్తీక',
  Margashira: 'మార్గశిర', Margasira: 'మార్గశిర',
  Pushya: 'పుష్య', Pausha: 'పుష్య',
  Magha: 'మాఘ',
  Phalguna: 'ఫాల్గుణ',
};

const TE_RITU_BY_EN: Record<string, string> = {
  Spring: 'వసంత', Vasanta: 'వసంత',
  Summer: 'గ్రీష్మ', Grishma: 'గ్రీష్మ',
  Rainy: 'వర్ష', Monsoon: 'వర్ష', Varsha: 'వర్ష',
  Autumn: 'శరద్', Sharad: 'శరద్',
  Prewinter: 'హేమంత', Hemanta: 'హేమంత',
  Winter: 'శిశిర', Shishira: 'శిశిర',
};

const TE_VAARA_BY_EN: Record<string, string> = {
  Sunday: 'ఆదివారం', Monday: 'సోమవారం', Tuesday: 'మంగళవారం', Wednesday: 'బుధవారం',
  Thursday: 'గురువారం', Friday: 'శుక్రవారం', Saturday: 'శనివారం',
};

// 60-year Samvatsara cycle (Telugu). Index 39 = Parabhava (Chaitra 2026 → Chaitra 2027).
const SAMVATSARA_60 = [
  'ప్రభవ', 'విభవ', 'శుక్ల', 'ప్రమోదూత', 'ప్రజాపతి', 'అంగీరస', 'శ్రీముఖ', 'భావ', 'యువ', 'ధాత',
  'ఈశ్వర', 'బహుధాన్య', 'ప్రమాథి', 'విక్రమ', 'వృష', 'చిత్రభాను', 'స్వభాను', 'తారణ', 'పార్థివ', 'వ్యయ',
  'సర్వజిత్', 'సర్వధారి', 'విరోధి', 'వికృతి', 'ఖర', 'నందన', 'విజయ', 'జయ', 'మన్మథ', 'దుర్ముఖి',
  'హేవిళంబి', 'విళంబి', 'వికారి', 'శార్వరి', 'ప్లవ', 'శుభకృత', 'శోభకృత', 'క్రోధి', 'విశ్వావసు', 'పరాభవ',
  'ప్లవంగ', 'కీలక', 'సౌమ్య', 'సాధారణ', 'విరోధికృత్', 'పరీధావి', 'ప్రమాది', 'ఆనంద', 'రాక్షస', 'నల',
  'పింగళ', 'కాళయుక్తి', 'సిద్ధార్థి', 'రౌద్రి', 'దుర్మతి', 'దుందుభి', 'రుధిరోద్గారి', 'రక్తాక్షి', 'క్రోధన', 'అక్షయ',
];

/** Samvatsara for a date. New samvatsara begins on Chaitra Shukla Padyami (Ugadi, ~mid-Mar). */
function samvatsaraFor(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const beforeUgadi = m < 3 || (m === 3 && d < 15);
  const effectiveYear = beforeUgadi ? y - 1 : y;
  // 2026 (after Ugadi) = Parabhava (index 39). 2026 - 1987 = 39 -> match.
  const idx = ((effectiveYear - 1987) % 60 + 60) % 60;
  return SAMVATSARA_60[idx];
}

/** Uttarayana: Makara Sankranti (~Jan 14) to Karkataka Sankranti (~Jul 15). Dakshinayana otherwise. */
function ayanaFor(date: Date): string {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const uttarayana = (m === 1 && d >= 14) || (m > 1 && m < 7) || (m === 7 && d <= 15);
  return uttarayana ? 'ఉత్తరాయణం' : 'దక్షిణాయనం';
}

/* --------------------------- Time formatting -------------------------------- */

// Traditional Telugu day-part prefixes.
function timePrefix(hourIst: number): string {
  if (hourIst < 12) return 'ఉ.'; // ఉదయం — morning
  if (hourIst < 16) return 'మ.'; // మధ్యాహ్నం — noon/afternoon
  if (hourIst < 20) return 'సా.'; // సాయంత్రం — evening
  return 'రా.'; // రాత్రి — night
}

function istParts(iso: string): { h: number; m: number } {
  const t = new Date(iso).getTime() + IST_OFFSET_MIN * 60_000;
  const d = new Date(t);
  return { h: d.getUTCHours(), m: d.getUTCMinutes() };
}

const displayHour = (h: number) => (h === 0 ? 12 : h > 12 ? h - 12 : h);
const pad = (n: number) => String(n).padStart(2, '0');

/** "ఉ. 7-54" style used for tithi/nakshatra transitions + Rahukalam. */
function fmtTime(iso: string): string {
  const { h, m } = istParts(iso);
  return `${timePrefix(h)} ${displayHour(h)}-${pad(m)}`;
}

/** "ఉ. 5.33" style used for sunrise/sunset (dot instead of dash, matching Panchang convention). */
function fmtSunTime(iso: string): string {
  const { h, m } = istParts(iso);
  return `${timePrefix(h)} ${displayHour(h)}.${pad(m)}`;
}

/* --------------------------- Rahukalam --------------------------------------
 * Divide daytime (sunrise → sunset) into 8 equal slots. Traditional slot per
 * weekday, counted from sunrise:
 *   Sun=8, Mon=2, Tue=7, Wed=5, Thu=6, Fri=4, Sat=3 (1-indexed).
 * -------------------------------------------------------------------------- */
const RAHU_SLOT_1_INDEXED = [8, 2, 7, 5, 6, 4, 3]; // Sun..Sat

function rahuKalam(sunriseIso: string, sunsetIso: string, weekday: number) {
  const sunrise = new Date(sunriseIso).getTime();
  const sunset = new Date(sunsetIso).getTime();
  const slotMs = (sunset - sunrise) / 8;
  const slot0 = RAHU_SLOT_1_INDEXED[weekday] - 1;
  return {
    start: new Date(sunrise + slot0 * slotMs).toISOString(),
    end: new Date(sunrise + (slot0 + 1) * slotMs).toISOString(),
  };
}

/* --------------------------- Public API ------------------------------------- */

export interface Panchangam {
  location: string;
  date: string; // DD-MM-YYYY
  vaara: string;
  samvatsara: string;
  ayana: string;
  ritu: string;
  masa: string; // e.g. "నిజ ఆషాఢ" or "అధిక ఆషాఢ"
  paksha: string;
  tithi: string;
  tithiEnd: string;
  nextTithi: string;
  nakshatra: string;
  nakshatraEnd: string;
  nextNakshatra: string;
  rahuStart: string;
  rahuEnd: string;
  sunrise: string;
  sunset: string;
}

/**
 * Full Vedic Panchangam for a date at Tirupati (Drik-based via mhah-panchang).
 * All names/times rendered in Telugu; times shown in IST with the traditional
 * day-part prefix (ఉ./మ./సా./రా.).
 */
export function computePanchang(date: Date): Panchangam {
  const p = new MhahPanchang();
  const sun = p.sunTimer(date, TIRUPATI.lat, TIRUPATI.lng);
  // The traditional Panchang for "today" is the one at sunrise.
  const refAtSunrise = new Date(new Date(sun.sunRise).getTime() + 60_000);
  const cal = p.calendar(refAtSunrise, TIRUPATI.lat, TIRUPATI.lng);
  const calc = p.calculate(refAtSunrise, TIRUPATI.lat, TIRUPATI.lng);

  const tithiIdx = cal.Tithi.ino; // 0–29
  const nextTithiIdx = (tithiIdx + 1) % 30;
  const nakIdx = cal.Nakshatra.ino; // 0–26
  const nextNakIdx = (nakIdx + 1) % 27;

  const masaEn = cal.MoonMasa.name_en_IN ?? cal.Masa.name_en_IN ?? '';
  const masaTe = TE_MASA_BY_EN[masaEn] ?? masaEn;
  const masaPrefix = cal.MoonMasa.isLeapMonth ? 'అధిక' : 'నిజ';

  const pakshaEn = cal.Paksha.name_en_IN ?? '';
  const pakshaTe = TE_PAKSHA_BY_EN[pakshaEn] ?? pakshaEn;

  const rituKey = cal.Ritu.name_en_UK ?? '';
  const rituTe = TE_RITU_BY_EN[rituKey] ?? rituKey;

  // Weekday from the IST civil date — mhah's Day.name_en_UK is derived from the
  // JS Date's local getDay(), so it flips to "yesterday" on servers running in
  // an Americas timezone. Deriving from IST directly makes this TZ-safe.
  const istDate = new Date(date.getTime() + IST_OFFSET_MIN * 60_000);
  const weekday = istDate.getUTCDay();
  const vaaraTe = TE_VAARA_BY_EN[
    ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][weekday]
  ];

  const rahu = rahuKalam(sun.sunRise, sun.sunSet, weekday);

  // Also use the IST civil date for the DD-MM-YYYY label so nothing shifts on
  // Americas-TZ servers.
  const dd = pad(istDate.getUTCDate());
  const mm = pad(istDate.getUTCMonth() + 1);
  const yyyy = istDate.getUTCFullYear();

  return {
    location: 'తిరుపతి',
    date: `${dd}-${mm}-${yyyy}`,
    vaara: vaaraTe,
    samvatsara: samvatsaraFor(date),
    ayana: ayanaFor(date),
    ritu: rituTe ? `${rituTe}రుతువు` : '',
    masa: `${masaPrefix} ${masaTe} మాసం`,
    paksha: pakshaTe ? `${pakshaTe} పక్షం` : '',
    tithi: TE_TITHI[tithiIdx] ?? '',
    tithiEnd: fmtTime(calc.Tithi.end),
    nextTithi: TE_TITHI[nextTithiIdx] ?? '',
    nakshatra: TE_NAKSHATRA[nakIdx] ?? '',
    nakshatraEnd: fmtTime(calc.Nakshatra.end),
    nextNakshatra: TE_NAKSHATRA[nextNakIdx] ?? '',
    rahuStart: fmtTime(rahu.start),
    rahuEnd: fmtTime(rahu.end),
    sunrise: fmtSunTime(sun.sunRise),
    sunset: fmtSunTime(sun.sunSet),
  };
}
