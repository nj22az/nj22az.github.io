(function () {
  'use strict';
  function initCalendar() {
  var actions = document.querySelector('.office-home .nav-actions');
  if (!actions) return;
  var now = new Date(), shown = new Date(now.getFullYear(), now.getMonth(), 1);
  var isoWeek = function (date) {
    var d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    return Math.ceil((((d - new Date(Date.UTC(d.getUTCFullYear(), 0, 1))) / 86400000) + 1) / 7);
  };
  var widget = document.createElement('div');
  widget.className = 'office-calendar';
  widget.innerHTML = '<button class="office-calendar-toggle" type="button" aria-expanded="false" aria-controls="office-calendar-panel"><span class="office-calendar-week"></span><time></time></button><section id="office-calendar-panel" class="office-calendar-panel" aria-label="Calendar" hidden><div class="office-calendar-heading"><button type="button" data-month="-1" aria-label="Previous month">‹</button><h2 aria-live="polite"></h2><button type="button" data-month="1" aria-label="Next month">›</button></div><div class="office-calendar-month"></div><div class="office-calendar-footer"><button type="button" data-today>Today</button><a href="#schedule">Working week →</a></div><p>Dates follow your device’s local time.</p></section>';
  actions.prepend(widget);
  var toggle = widget.querySelector('.office-calendar-toggle'), panel = widget.querySelector('section');
  function refreshDate() {
    now = new Date();
    widget.querySelector('.office-calendar-week').textContent = 'Week ' + isoWeek(now);
    var time = widget.querySelector('time');
    time.textContent = now.toLocaleDateString('en-GB', {day:'numeric',month:'short'});
    time.dateTime = [now.getFullYear(), String(now.getMonth()+1).padStart(2,'0'), String(now.getDate()).padStart(2,'0')].join('-');
    toggle.setAttribute('aria-label', 'Open calendar, week ' + isoWeek(now) + ', ' + now.toLocaleDateString('en-GB',{dateStyle:'full'}));
  }
  function render() {
    widget.querySelector('h2').textContent = shown.toLocaleDateString('en-GB',{month:'long',year:'numeric'});
    var first = new Date(shown.getFullYear(), shown.getMonth(), 1), start = new Date(first);
    start.setDate(1 - ((first.getDay()+6)%7));
    var html = '<table><caption class="office-calendar-sr">Month dates and ISO week numbers</caption><thead><tr><th scope="col">Wk</th>' + ['Mo','Tu','We','Th','Fr','Sa','Su'].map(function(day){return '<th scope="col">'+day+'</th>';}).join('') + '</tr></thead><tbody>';
    while (start.getMonth() === shown.getMonth() || start < first) {
      html += '<tr><th scope="row">'+isoWeek(start)+'</th>';
      for (var i=0; i<7; i++) {
        var today = start.toDateString() === now.toDateString();
        html += '<td'+(today?' aria-current="date"':'')+' class="'+(start.getMonth()!==shown.getMonth()?'outside ':'')+(today?'today':'')+'">'+start.getDate()+'</td>';
        start.setDate(start.getDate()+1);
      }
      html += '</tr>';
    }
    widget.querySelector('.office-calendar-month').innerHTML = html+'</tbody></table>';
  }
  function close(focus) {panel.hidden=true;toggle.setAttribute('aria-expanded','false');if(focus)toggle.focus();}
  toggle.addEventListener('click',function(){var open=panel.hidden;panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));if(open){refreshDate();render();document.querySelector('#nav-hamburger[aria-expanded="true"]')?.click();}});
  widget.querySelectorAll('[data-month]').forEach(function(b){b.addEventListener('click',function(){shown.setMonth(shown.getMonth()+Number(b.dataset.month));render();});});
  widget.querySelector('[data-today]').addEventListener('click',function(){refreshDate();shown=new Date(now.getFullYear(),now.getMonth(),1);render();});
  widget.querySelector('a').addEventListener('click',function(){close(false);});
  document.addEventListener('click',function(e){if(!widget.contains(e.target))close(false);});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!panel.hidden){close(true);e.stopPropagation();}});
  widget.addEventListener('focusout',function(){setTimeout(function(){if(!widget.contains(document.activeElement))close(false);},0);});
  refreshDate();setInterval(function(){refreshDate();if(!panel.hidden)render();},60000);
  }
  if (!document.querySelector('.office-home .nav-actions') && document.readyState !== 'complete') document.addEventListener('DOMContentLoaded', initCalendar);
  else initCalendar();
})();
