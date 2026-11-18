/* One catalogue and one reading flow for the homepage and Blog. */
(function () {
  'use strict';
  var base = window.OFFICE_BLOG_POSTS || [];
  function text(html) { var box = document.createElement('div'); box.innerHTML = html || ''; return (box.textContent || '').replace(/\s+/g, ' ').trim(); }
  function safeUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return '';
    try {
      var u = new URL(value, location.origin);
      var local = u.origin === location.origin && /^https?:$/.test(u.protocol);
      var wordpress = u.protocol === 'https:' && u.hostname === 'theofficeofnils.wordpress.com';
      return local || wordpress ? u.href : '';
    } catch (_) { return ''; }
  }
  function merge(local, remote) {
    var known = new Set(local.map(function (p) { return p.wpId; }).filter(Boolean));
    var posts = local.slice();
    (remote || []).forEach(function (p) {
      if (known.has(p.id) || !safeUrl(p.link)) return;
      known.add(p.id);
      posts.push({id:'wp-' + p.id, title:text(p.title && p.title.rendered) || 'Untitled', excerpt:text(p.excerpt && p.excerpt.rendered).slice(0,240), url:p.link, date:(p.date || '').slice(0,10), topic:'Reflections'});
    });
    return posts.map(function (p, i) { return {post:p, index:i}; }).sort(function (a,b) { return (b.post.date || '').localeCompare(a.post.date || '') || a.index-b.index; }).map(function (p) { return p.post; });
  }
  window.OfficeBlogFeed = {merge:merge};
  var roots = Array.prototype.slice.call(document.querySelectorAll('[data-blog-feed]'));
  var posts = merge(base, []);
  if (!base.length) return;
  function node(tag, cls, value) { var el=document.createElement(tag); if(cls)el.className=cls; if(value)el.textContent=value; return el; }
  function isReview(post) { return Boolean(post.hotel) || post.topic === 'Hotel stay'; }
  function render(root) {
    var list=root.querySelector('[data-blog-list]');
    var selected=root.querySelector('[data-blog-filter][aria-pressed="true"]');
    var category=selected ? selected.dataset.blogFilter : 'all';
    var items=category==='all' ? posts : posts.filter(function (post) { return isReview(post) === (category==='reviews'); });
    var limit=Number(root.dataset.limit) || items.length, fragment=document.createDocumentFragment();
    items.slice(0,limit).forEach(function (p) {
      var article=node('article','blog-feed-item'), meta=node('div','blog-feed-meta');
      var url=safeUrl(p.url);
      if(!url)return;
      meta.appendChild(node('span','blog-feed-topic',isReview(p)?'Hotel review':p.topic||'Article'));
      if(p.date){var date=node('time','',new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric'}).format(new Date(p.date+'T12:00:00Z')));date.dateTime=p.date;meta.appendChild(date);}
      article.appendChild(meta);
      var heading=node(root.dataset.heading || 'h3'), link=node('a','',p.title);link.href=url;heading.appendChild(link);article.appendChild(heading);
      article.appendChild(node('p','',p.excerpt));
      var readLabel=p.part?'Read part '+p.part+' →':isReview(p)?'Read review →':'Read article →';
      var actions=node('div','blog-feed-links'), read=node('a','blog-read',readLabel);read.href=url;read.hreflang='en';actions.appendChild(read);
      if(/^[a-z0-9-]+$/.test(p.hotel || '')) {
        var parking=node('a','blog-parking','Parking details');
        parking.href='/hotels/#review-'+p.hotel;
        parking.setAttribute('aria-label','Parking details for '+p.title.split(':')[0]);
        actions.appendChild(parking);
      }
      if(p.svUrl){var sv=node('a','blog-swedish','Svenska');sv.href=safeUrl(p.svUrl);sv.hreflang='sv';sv.lang='sv';sv.setAttribute('aria-label','Read this article in Swedish');actions.appendChild(sv);}
      article.appendChild(actions);
      // A rubber-stamp picture of Minato, printed in the page's theme colour (css/blog-stamps.css).
      if(p.stamp&&/^\/assets\/images\/blog\/stamps\/[a-z0-9-]+\.webp$/.test(p.stamp.src)){var stamp=node('span','blog-feed-stamp');stamp.setAttribute('role','img');stamp.setAttribute('aria-label',p.stamp.alt||'');stamp.style.setProperty('--stamp','url('+p.stamp.src+')');article.classList.add('has-stamp');article.appendChild(stamp);}
      fragment.appendChild(article);
    });
    list.replaceChildren(fragment);
    var count=root.querySelector('[data-blog-count]');
    if(count) {
      var label=category==='reviews'?'hotel review':category==='articles'?'article':'post';
      count.textContent=items.length+' '+label+(items.length===1?'':'s');
    }
  }
  roots.forEach(function (root) {
    var toolbar=root.querySelector('[data-blog-filters]');
    if(toolbar) {
      toolbar.hidden=false;
      toolbar.addEventListener('click',function (event) {
        var button=event.target.closest('[data-blog-filter]');
        if(!button || button.getAttribute('aria-pressed')==='true')return;
        toolbar.querySelector('[aria-pressed="true"]').setAttribute('aria-pressed','false');
        button.setAttribute('aria-pressed','true');
        render(root);
      });
    }
    render(root);
  });
  // The published catalogue is always readable, even if WordPress is unavailable.
  var started=false;
  function refresh() {
    if(started || !roots.length)return;started=true;
    fetch('https://public-api.wordpress.com/wp/v2/sites/theofficeofnils.wordpress.com/posts?per_page=100').then(function (r) { if(!r.ok)throw Error('Blog unavailable');return r.json(); }).then(function (remote) { if(!Array.isArray(remote))return;posts=merge(base,remote);roots.forEach(render); }).catch(function () {});
  }
  if('IntersectionObserver' in window){var observer=new IntersectionObserver(function (entries) { if(entries.some(function (e) { return e.isIntersecting; })){observer.disconnect();refresh();} },{rootMargin:'160px'});roots.forEach(function (r) { observer.observe(r); });}
  else window.addEventListener('load',refresh,{once:true});
})();

