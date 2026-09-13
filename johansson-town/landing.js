(() => {
  const PRESETS = { "0900": 540, "1642": 1002, "1830": 1110, "2030": 1230 };
  const ORDER = ["live", "run", "0900", "1642", "1830", "2030"];
  const PLACES = [
    { id: "market", code: "01", title: "Sakura Shōten", jp: "桜商店", sub: "Daily goods", district: "Shopping street", open: 540, close: 1200, line: "Thuan’s convenience store. Tea, snacks, everyday things. Yui at the till 09:00–20:00." },
    { id: "frontrow", code: "02", title: "Front-Row Books & Press", jp: "前列書房・印刷", sub: "Books · evening press", district: "East alley", open: 540, close: 1110, line: "Aya’s books and Reiko’s evening paper, under one roof." },
    { id: "form3d", code: "03", title: "Kenji & Tetsuo Repairs", jp: "立体・電気工房", sub: "Patterns · radios · instruments", district: "East alley", open: 540, close: 1140, line: "Kenji’s pattern bench, Tetsuo’s radios, and the Form 3D printer." },
    { id: "office", code: "04", title: "Johansson Harbour Office", jp: "港務・技術事務所", sub: "Marine service · records", district: "Quay", open: 540, close: 1140, line: "Shipping records, tide tables, and Johansson’s marine files." },
    { id: "tea-house", code: "05", title: "Corner Tea House", jp: "角の茶屋", sub: "Tea · seats", district: "Shopping street", open: 540, close: 1140, line: "A quiet corner for tea facing the cedar bench." },
    { id: "ramen", code: "06", title: "Sato Ramen", jp: "佐藤ラーメン", sub: "Noodles", district: "Dining junction", open: 540, close: 1260, line: "Mrs Sato’s counter. Broth until twenty-one hundred." },
    { id: "izakaya", code: "07", title: "Minato Izakaya", jp: "港居酒屋", sub: "Lanterns · yakitori", district: "Harbour front", open: 960, close: 1620, line: "Opens at sixteen hundred. Last pour around three in the morning." },
    { id: "sento", code: "08", title: "Public Bath", jp: "銭湯", sub: "Sentō", district: "Residential circuit", open: 540, close: 1260, line: "The bathhouse frontage. Interior still locked to visitors." },
    { id: "warehouse", code: "09", title: "Quay Warehouse", jp: "倉庫", sub: "Fishing gear", district: "Quay", open: null, close: null, line: "Northern frontage. Ice cabinet, folio stand, storeroom at all hours." },
    { id: "arcade", code: "10", title: "Star Port Arcade", jp: "スターポート", sub: "Cabinets", district: "Dining junction", open: 540, close: 1140, line: "CRT cabinets off the crossing. Keep the aisle clear." },
    { id: "park", code: "11", title: "Harbour Park", jp: "公園", sub: "Benches · trees", district: "West lane", open: null, close: null, line: "Raised walk and benches looking back at the shotengai." },
    { id: "pier", code: "12", title: "Outer Pier", jp: "沖桟橋", sub: "Boards · night warning", district: "Harbour", open: null, close: null, line: "Connected western and eastern lanes, second jetty. Caution after dark." },
  ];
  const RESIDENTS = [
    { name: "Thuan", jp: "トゥアン", role: "Shopkeeper", place: "Sakura Shōten", start: 540, end: 1200 },
    { name: "Yui", jp: "由衣", role: "Clerk", place: "Sakura Shōten", start: 540, end: 1200 },
    { name: "Aya", jp: "綾", role: "Bookseller", place: "Front-Row Books", start: 540, end: 1110 },
    { name: "Reiko", jp: "玲子", role: "Evening press", place: "Front-Row Press", start: 1020, end: 1260 },
    { name: "Kenji", jp: "健司", role: "Pattern maker", place: "Repairs", start: 540, end: 1140 },
    { name: "Tetsuo", jp: "哲雄", role: "Radio repair", place: "Repairs", start: 540, end: 1140 },
    { name: "Harbour master", jp: "港長", role: "Quay authority", place: "Harbour Office", start: 540, end: 1140 },
    { name: "Mrs Sato", jp: "佐藤", role: "Ramen", place: "Sato Ramen", start: 540, end: 1260 },
    { name: "Officer Mori", jp: "森", role: "Night patrol", place: "Street", start: 1200, end: 1860 },
    { name: "Hiroshi", jp: "浩", role: "Cook", place: "Minato Izakaya", start: 960, end: 1620 },
    { name: "Nao", jp: "奈緒", role: "Errands", place: "Shopping street", start: 540, end: 1140 },
    { name: "Bus driver", jp: "運転士", role: "Route", place: "Bus hut", start: 390, end: 1140 },
    { name: "Kenta", jp: "健太", role: "Workshop", place: "Repairs", start: 540, end: 1140 },
    { name: "Hana", jp: "花", role: "Resident", place: "Residential circuit", start: null, end: null },
    { name: "Daichi", jp: "大地", role: "Resident", place: "Park", start: null, end: null },
    { name: "Mr Fujita", jp: "藤田", role: "Resident", place: "East alley", start: null, end: null },
    { name: "Yoshiko", jp: "良子", role: "Resident", place: "Residential circuit", start: null, end: null },
    { name: "Naoko", jp: "直子", role: "Resident", place: "Shopping street", start: null, end: null },
    { name: "Masaru", jp: "勝", role: "Cold storage", place: "Warehouse", start: 480, end: 1080 },
    { name: "Mr Tanabe", jp: "田辺", role: "Resident", place: "Quay houses", start: null, end: null },
  ];

  const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const MONTHS_SHORT = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const TOWN_YEAR = 1988;
  const SHOWA_YEAR = 63;

  const minuteOfDay = (m) => ((m % 1440) + 1440) % 1440;
  const pad = (n) => String(n).padStart(2, "0");
  const fmt = (m) => {
    const w = minuteOfDay(m);
    return `${pad(Math.floor(w / 60))}:${pad(Math.floor(w % 60))}`;
  };
  const fmtS = (m) => {
    const w = minuteOfDay(m);
    const s = Math.floor((w * 60) % 60);
    return `${fmt(w)}:${pad(s)}`;
  };
  const periodOf = (m) => {
    const h = minuteOfDay(m) / 60;
    if (h < 7) return "EARLY MORNING";
    if (h < 17) return "AFTERNOON";
    if (h < 20) return "EVENING";
    return "NIGHT";
  };
  const periodLine = (m) => {
    const p = periodOf(m);
    if (p === "EARLY MORNING") return "Shutters down. The quay is still.";
    if (p === "AFTERNOON") return "Shops are open.";
    if (p === "EVENING") return "Windows lighting. Paper going to press.";
    return "Most shops are closed. Minato is still pouring.";
  };
  const isOpen = (place, m) => {
    if (place.open == null || place.close == null) return true;
    const t = minuteOfDay(m);
    if (place.close > 1440) return t >= place.open || t < place.close - 1440;
    return t >= place.open && t < place.close;
  };
  const hoursLabel = (place) => {
    if (place.open == null) return "Always";
    const close = place.close > 1440 ? place.close - 1440 : place.close;
    return `${fmt(place.open)}–${fmt(close)}`;
  };
  const onDuty = (r, m) => {
    if (r.start == null) return periodOf(m) === "AFTERNOON";
    const t = minuteOfDay(m);
    if (r.end > 1440) return t >= r.start || t < r.end - 1440;
    return t >= r.start && t < r.end;
  };
  const localMinutes = (now) => {
    const d = new Date(now);
    return d.getHours() * 60 + d.getMinutes() + (d.getSeconds() + d.getMilliseconds() / 1000) / 60;
  };
  const townDate = (now) => {
    const d = new Date(now);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const weekday = WEEKDAYS[d.getDay()];
    const monthName = MONTHS[d.getMonth()];
    const monthShort = MONTHS_SHORT[d.getMonth()];
    const mm = pad(month);
    const dd = pad(day);
    const long = `${day} ${monthName.toUpperCase()} ${TOWN_YEAR}`;
    return {
      weekday,
      weekdayUpper: weekday.toUpperCase(),
      short: `${day} ${monthShort} ${TOWN_YEAR}`,
      eraLine: `SHOWA ${SHOWA_YEAR} · ${long}`,
      weekdayLine: `SHOWA ${SHOWA_YEAR} · ${weekday.toUpperCase()}`,
      japanese: `昭和${SHOWA_YEAR}年${month}月${day}日`,
      documentNo: `JT-HB-${SHOWA_YEAR}-${mm}${dd}`,
    };
  };

  let mode = "live";
  let runOrigin = null;

  const $ = (id) => document.getElementById(id);
  const start = $("start");
  const digital = $("boardDigital");
  const periodEl = $("boardPeriod");
  const lineEl = $("boardLine");
  const shopsEl = $("boardShops");
  const liveEl = $("boardLive");
  const statusPeriod = $("statusPeriod");
  const statusShops = $("statusShops");
  const hoursHead = $("hoursHeadTime");
  const hoursBody = $("hoursBody");
  const placesGrid = $("placesGrid");
  const rollGrid = $("rollGrid");
  const statusWeekday = $("statusWeekday");
  const boardDoc = $("boardDoc");
  const boardDateLong = $("boardDateLong");
  const boardDateShort = $("boardDateShort");
  const boardWeekdayLine = $("boardWeekdayLine");
  const noticeWhen = $("noticeWhen");
  const boardJpDate = $("boardJpDate");
  const hourHand = $("handHour");
  const minuteHand = $("handMinute");
  const secondHand = $("handSecond");

  function currentMinutes(now) {
    const local = localMinutes(now);
    if (mode === "live") return minuteOfDay(local);
    if (mode === "run") {
      const origin = runOrigin || { real: now, minutes: 1002 };
      return minuteOfDay(origin.minutes + (now - origin.real) / 1000);
    }
    const d = new Date(now);
    return minuteOfDay(PRESETS[mode] + (d.getSeconds() + d.getMilliseconds() / 1000) / 60);
  }

  function setMode(next) {
    const now = Date.now();
    const shown = currentMinutes(now);
    mode = next;
    runOrigin = next === "run" ? { real: now, minutes: shown } : null;
    document.querySelectorAll("[data-clock-mode]").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.clockMode === mode));
    });
    tick();
  }

  function renderStatic() {
    hoursBody.innerHTML = PLACES.map((place) => `
      <tr data-place="${place.id}">
        <td class="muted">${place.code}</td>
        <td><b>${place.title}</b><div class="muted">${place.jp} · ${place.sub}</div></td>
        <td>${place.district}</td>
        <td>${hoursLabel(place)}</td>
        <td class="now-cell"></td>
      </tr>`).join("");
    placesGrid.innerHTML = PLACES.map((place) => `
      <article class="place-card">
        <p class="board-tiny muted">${place.code} · ${place.jp}</p>
        <h3>${place.title}</h3>
        <p>${place.line}</p>
      </article>`).join("");
    rollGrid.innerHTML = RESIDENTS.map((r) => `
      <div class="roll-card" data-resident="${r.name}">
        <p class="duty"><span class="flag"></span> <span>${r.jp}</span></p>
        <b>${r.name}</b>
        <div class="muted">${r.role} · ${r.place}</div>
      </div>`).join("");
  }

  function tick() {
    if (start.classList.contains("hidden")) return;
    const now = Date.now();
    const minutes = currentMinutes(now);
    const scheduled = PLACES.filter((p) => p.open != null);
    const openCount = scheduled.filter((p) => isOpen(p, minutes)).length;
    const period = periodOf(minutes);
    const night = period === "NIGHT" || period === "EVENING";

    digital.textContent = fmtS(minutes);
    periodEl.textContent = period;
    lineEl.textContent = periodLine(minutes);
    shopsEl.textContent = `SHOPS ${pad(openCount)}/${pad(scheduled.length)} OPEN · HARBOUR DISTRICT TIME`;
    liveEl.textContent = mode === "live" ? "LIVE · VISITOR CLOCK" : mode === "run" ? "60× TOWN SPEED" : "PRESET";
    statusPeriod.textContent = period;
    statusPeriod.classList.toggle("alert", night);
    statusShops.textContent = `${openCount} open`;
    statusShops.classList.toggle("alert", openCount === 0);
    hoursHead.textContent = `${fmtS(minutes)} · ${period}`;

    const civic = townDate(now);
    if (statusWeekday) statusWeekday.textContent = civic.weekday;
    if (boardDoc) boardDoc.textContent = `Document ${civic.documentNo}`;
    if (boardDateLong) boardDateLong.textContent = civic.eraLine;
    if (boardDateShort) boardDateShort.textContent = civic.short;
    if (boardWeekdayLine) boardWeekdayLine.textContent = civic.weekdayLine;
    if (noticeWhen) noticeWhen.textContent = `Posted this ${civic.weekday}`;
    if (boardJpDate) boardJpDate.textContent = civic.japanese;

    const analogSeconds = (minutes * 60) % 60;
    const analogMinutes = minutes % 60;
    const analogHours = (minutes / 60) % 12;
    hourHand.setAttribute("transform", `rotate(${analogHours * 30} 100 100)`);
    minuteHand.setAttribute("transform", `rotate(${analogMinutes * 6} 100 100)`);
    secondHand.setAttribute("transform", `rotate(${analogSeconds * 6} 100 100)`);

    hoursBody.querySelectorAll("tr").forEach((row) => {
      const place = PLACES.find((p) => p.id === row.dataset.place);
      const open = isOpen(place, minutes);
      const cell = row.querySelector(".now-cell");
      cell.innerHTML = `<span class="${open ? "tag-open" : "tag-closed"}">${open ? "OPEN" : "CLOSED"}</span>`;
    });
    rollGrid.querySelectorAll("[data-resident]").forEach((card) => {
      const r = RESIDENTS.find((x) => x.name === card.dataset.resident);
      const duty = onDuty(r, minutes);
      const flag = card.querySelector(".flag");
      flag.textContent = duty ? "ON DUTY" : "OFF";
      flag.parentElement.classList.toggle("on", duty);
    });
  }

  function ticks() {
    const g = $("clockTicks");
    let html = "";
    for (let i = 0; i < 60; i += 1) {
      const major = i % 5 === 0;
      html += `<line x1="100" y1="${major ? 18 : 14}" x2="100" y2="${major ? 32 : 22}" stroke="currentColor" stroke-width="${major ? 4 : 1.6}" transform="rotate(${i * 6} 100 100)"/>`;
    }
    g.innerHTML = html;
  }

  document.querySelectorAll("[data-clock-mode]").forEach((btn) => {
    btn.addEventListener("click", () => setMode(btn.dataset.clockMode));
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "n" && event.key !== "N") return;
    if (start.classList.contains("hidden")) return;
    const target = event.target;
    if (target && target.closest && target.closest("input, textarea, [contenteditable]")) return;
    event.preventDefault();
    setMode(ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length]);
  });

  renderStatic();
  ticks();
  tick();
  setInterval(tick, 80);
})();
