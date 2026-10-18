/* The Office header: project shortcuts and one calendar for dates and availability. */
(function () {
  'use strict';
  function initHeader() {
    var actions = document.querySelector('.office-home .nav-actions');
    if (!actions) return;
    var nav = document.querySelector('.office-home .nav-links');
    var paths = {
      projects:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
      world:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c-4 5-4 13 0 18M12 3c4 5 4 13 0 18',
      course:'M13 2 3 14h9l-1 8 10-12h-9l1-8Z'
    };
    var shortcuts = [
      ['Projects',location.pathname==='/'||location.pathname==='/index.html'?'#projects':'/#projects','Projects',paths.projects],
      ['Johansson World','/world/','World',paths.world],
      ['Blog','/blog/','Blog',CONFIG.icons.notebook],
      ['Sjöskolan — electronics course','/sjoskolan/','Sjöskolan',paths.course],
      ['Linux Port','/linux-port/','Linux',CONFIG.icons.joystick]
    ];
    nav.classList.add('office-quick-links');
    nav.setAttribute('aria-label','Quick access');nav.setAttribute('role','group');
    nav.innerHTML = shortcuts.map(function (link) {
      return '<a href="'+link[1]+'" aria-label="'+link[0]+'" title="'+link[0]+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+link[3]+'"/></svg><span>'+link[2]+'</span></a>';
    }).join('');

    var locations = CONFIG.author.locations || [], schedule = CONFIG.author.schedule || {};
    var locationIndex = Number(schedule.defaultLocation) || 0;
    try { var saved = localStorage.getItem('nj-sched-loc'); if (saved !== null) locationIndex = Number(saved); } catch (_) {}
    if (!Number.isInteger(locationIndex) || !locations[locationIndex]) locationIndex = 0;
    var now = new Date(), shown = new Date(now.getFullYear(),now.getMonth(),1), selected = new Date(now), cache = new Map();
    var escape = function (value) {return String(value || '').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
    var key = function (d) {return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
    var fromKey = function (value) {var parts=value.split('-').map(Number);return new Date(parts[0],parts[1]-1,parts[2]);};
    var isoWeek = function (date) {
      var d = new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate()));
      d.setUTCDate(d.getUTCDate()+4-(d.getUTCDay() || 7));
      return Math.ceil((((d-new Date(Date.UTC(d.getUTCFullYear(),0,1)))/86400000)+1)/7);
    };
    var widget = document.createElement('div'); widget.className='office-calendar';
    widget.innerHTML='<button class="office-calendar-toggle" type="button" aria-expanded="false" aria-controls="office-calendar-panel"><span class="office-calendar-week"></span><time></time></button><section id="office-calendar-panel" class="office-calendar-panel" aria-label="Calendar and availability" hidden><p class="office-calendar-kicker">Office availability</p><label class="office-calendar-location">Location<select aria-label="Availability location">'+locations.map(function(loc,i){return '<option value="'+i+'">'+escape(loc.name)+', '+escape(loc.label)+'</option>';}).join('')+'</select></label><div class="office-calendar-heading"><button type="button" data-month="-1" aria-label="Previous month">‹</button><h2 aria-live="polite"></h2><button type="button" data-month="1" aria-label="Next month">›</button></div><div class="office-calendar-month"></div><p class="office-calendar-key">Green: usual office hours · Muted: weekend · Rust: public holiday</p><div class="office-calendar-detail" aria-live="polite"></div><div class="office-calendar-footer"><button type="button" data-today>Today</button><span>ISO week numbers · Local dates</span></div><p class="office-calendar-note"></p><p class="office-calendar-holiday-status" role="status"></p></section>';
    actions.prepend(widget);
    var toggle=widget.querySelector('.office-calendar-toggle'), panel=widget.querySelector('section'), locationSelect=widget.querySelector('select');
    locationSelect.value=String(locationIndex);
    widget.querySelector('.office-calendar-note').textContent=schedule.note || 'Usual office hours, Monday–Friday.';
    function holidayState(year) {
      var loc=locations[locationIndex], code=loc && loc.countryCode;
      return cache.get(year+'-'+code) || {status:code?'pending':'unavailable',days:{}};
    }
    function availability(date) {
      var state=holidayState(date.getFullYear()), holiday=state.days[key(date)], weekend=date.getDay()===0 || date.getDay()===6;
      if (holiday) return {kind:'holiday',text:'Unavailable · '+holiday};
      if (weekend) return {kind:'weekend',text:'Unavailable · Weekend'};
      if (state.status==='pending') return {kind:'pending',text:'Usual office hours · Checking public holidays'};
      if (state.status!=='ready') return {kind:'pending',text:'Usual office hours · Holiday data unavailable'};
      return {kind:'available',text:'Available · Office hours'};
    }
    function refreshDate() {
      now=new Date();widget.querySelector('.office-calendar-week').textContent='Week '+isoWeek(now);
      var time=widget.querySelector('time');time.textContent=now.toLocaleDateString('en-GB',{day:'numeric',month:'short'});time.dateTime=key(now);
      toggle.setAttribute('aria-label','Open calendar and availability, week '+isoWeek(now)+', '+now.toLocaleDateString('en-GB',{dateStyle:'full'}));
    }
    function detail() {
      var status=availability(selected), loc=locations[locationIndex];
      widget.querySelector('.office-calendar-detail').innerHTML='<strong>'+escape(selected.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'}))+'</strong><span>'+escape(status.text)+'</span><small>'+escape(loc && (loc.name+', '+loc.label))+'</small>';
    }
    function render() {
      var focused=widget.querySelector('[data-date]:focus'), focusKey=focused && focused.dataset.date;
      widget.querySelector('h2').textContent=shown.toLocaleDateString('en-GB',{month:'long',year:'numeric'});
      var first=new Date(shown.getFullYear(),shown.getMonth(),1), start=new Date(first);start.setDate(1-((first.getDay()+6)%7));
      var html='<table><caption class="office-calendar-sr">Choose a date to see office availability</caption><thead><tr><th scope="col">Wk</th>'+['Mo','Tu','We','Th','Fr','Sa','Su'].map(function(day){return '<th scope="col">'+day+'</th>';}).join('')+'</tr></thead><tbody>';
      while (start.getMonth()===shown.getMonth() || start<first) {
        html+='<tr><th scope="row">'+isoWeek(start)+'</th>';
        for(var i=0;i<7;i++) {
          var today=key(start)===key(now), status=availability(start), label=start.toLocaleDateString('en-GB',{dateStyle:'full'})+' · '+status.text;
          html+='<td><button type="button" data-date="'+key(start)+'"'+(today?' aria-current="date"':'')+' aria-pressed="'+(key(start)===key(selected))+'" aria-label="'+escape(label)+'" class="'+status.kind+(start.getMonth()!==shown.getMonth()?' outside':'')+(today?' today':'')+'">'+start.getDate()+'</button></td>';
          start.setDate(start.getDate()+1);
        }
        html+='</tr>';
      }
      widget.querySelector('.office-calendar-month').innerHTML=html+'</tbody></table>';
      if(focusKey) widget.querySelector('[data-date="'+focusKey+'"]')?.focus();
      detail();
      var state=holidayState(shown.getFullYear()), note=widget.querySelector('.office-calendar-holiday-status');
      note.textContent=state.status==='pending'?'Checking public holidays…':state.status==='ready'?'Public holidays adjusted for the selected location.':'Public holiday data unavailable. Weekday hours are the usual pattern; holiday exceptions are unconfirmed.';
    }
    async function loadHolidays(year) {
      var code=locations[locationIndex]?.countryCode, cacheKey=year+'-'+code;
      if(!code || cache.has(cacheKey)) return;
      cache.set(cacheKey,{status:'pending',days:{}});
      var controller=new AbortController(), timer=setTimeout(function(){controller.abort();},8000);
      try {
        var response=await fetch('https://date.nager.at/api/v3/PublicHolidays/'+year+'/'+code,{signal:controller.signal});
        if(!response.ok) throw Error('Holiday data unavailable');
        var data=await response.json();if(!Array.isArray(data)) throw Error('Invalid calendar');
        var days={};data.forEach(function(h){if(/^\d{4}-\d{2}-\d{2}$/.test(h.date))days[h.date]=String(h.localName || h.name || 'Public holiday');});
        cache.set(cacheKey,{status:'ready',days:days});
      } catch (_) {cache.set(cacheKey,{status:'unavailable',days:{}});} finally {clearTimeout(timer);if(!panel.hidden)render();}
    }
    function showMonth() {
      render();loadHolidays(shown.getFullYear());
      var prev=new Date(shown.getFullYear(),shown.getMonth(),0), next=new Date(shown.getFullYear(),shown.getMonth()+1,1);
      if(prev.getFullYear()!==shown.getFullYear())loadHolidays(prev.getFullYear());
      if(next.getFullYear()!==shown.getFullYear())loadHolidays(next.getFullYear());
    }
    function close(focus) {panel.hidden=true;toggle.setAttribute('aria-expanded','false');if(focus)toggle.focus();}
    toggle.addEventListener('click',function(){var open=panel.hidden;if(open)document.querySelector('#nav-hamburger[aria-expanded="true"]')?.click();panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));if(open){refreshDate();showMonth();}});
    widget.querySelectorAll('[data-month]').forEach(function(b){b.addEventListener('click',function(){shown.setMonth(shown.getMonth()+Number(b.dataset.month));selected=new Date(shown);showMonth();});});
    locationSelect.addEventListener('change',function(){locationIndex=Number(locationSelect.value);try{localStorage.setItem('nj-sched-loc',String(locationIndex));}catch(_){}showMonth();});
    widget.querySelector('.office-calendar-month').addEventListener('click',function(e){var b=e.target.closest('[data-date]');if(b){selected=fromKey(b.dataset.date);render();}});
    widget.querySelector('[data-today]').addEventListener('click',function(){refreshDate();shown=new Date(now.getFullYear(),now.getMonth(),1);selected=new Date(now);showMonth();});
    document.addEventListener('click',function(e){if(!e.composedPath().includes(widget))close(false);});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!panel.hidden){close(true);e.stopPropagation();}});
    widget.addEventListener('focusout',function(){setTimeout(function(){if(!widget.contains(document.activeElement))close(false);},0);});
    refreshDate();setInterval(function(){refreshDate();if(!panel.hidden)render();},60000);
  }
  if(!document.querySelector('.office-home .nav-actions') && document.readyState!=='complete') document.addEventListener('DOMContentLoaded',initHeader);
  else initHeader();
})();
