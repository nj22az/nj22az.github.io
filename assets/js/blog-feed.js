/* One catalogue and one reading flow for the homepage and Blog. */
(function () {
  'use strict';
  var base = window.OFFICE_BLOG_POSTS || [];
  function text(html) { var box = document.createElement('div'); box.innerHTML = html || ''; return (box.textContent || '').replace(/\s+/g, ' ').trim(); }
  function safeUrl(value) { try { var u = new URL(value, location.origin); return u.protocol === 'https:' && (u.origin === location.origin || u.hostname === 'theofficeofnils.wordpress.com') ? u.href : ''; } catch (_) { return ''; } }
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
  function render(root) {
    var list=root.querySelector('[data-blog-list]');
    var limit=Number(root.dataset.limit) || posts.length, fragment=document.createDocumentFragment();
    posts.slice(0,limit).forEach(function (p) {
      var article=node('article','blog-feed-item'), meta=node('div','blog-feed-meta');
      meta.appendChild(node('span','blog-feed-topic','Article'));
      if(p.date){var date=node('time','',new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric'}).format(new Date(p.date+'T12:00:00Z')));date.dateTime=p.date;meta.appendChild(date);}
      article.appendChild(meta);
      var heading=node(root.dataset.heading || 'h3'), link=node('a','',p.title);link.href=safeUrl(p.url);heading.appendChild(link);article.appendChild(heading);
      article.appendChild(node('p','',p.excerpt));
      var actions=node('div','blog-feed-links'), read=node('a','blog-read',p.part?'Read part '+p.part+' →':'Read article →');read.href=safeUrl(p.url);read.hreflang='en';read.setAttribute('aria-label',(p.part?'Read part '+p.part:'Read article')+': '+p.title);actions.appendChild(read);
      if(p.svUrl){var sv=node('a','blog-swedish','Svenska');sv.href=safeUrl(p.svUrl);sv.hreflang='sv';sv.lang='sv';sv.setAttribute('aria-label','Read this article in Swedish');actions.appendChild(sv);}
      article.appendChild(actions);
      // A rubber-stamp picture of Minato, printed in the page's theme colour (css/blog-stamps.css).
      if(p.stamp&&/^\/assets\/images\/blog\/stamps\/[a-z0-9-]+\.webp$/.test(p.stamp.src)){var stamp=node('span','blog-feed-stamp');stamp.setAttribute('role','img');stamp.setAttribute('aria-label',p.stamp.alt||'');stamp.style.setProperty('--stamp','url('+p.stamp.src+')');article.classList.add('has-stamp');article.appendChild(stamp);}
      fragment.appendChild(article);
    });
    list.replaceChildren(fragment);
    var count=root.querySelector('[data-blog-count]');if(count)count.textContent=posts.length+' '+(posts.length===1?'article':'articles');
  }
  roots.forEach(render);
  // The published catalogue is always readable, even if WordPress is unavailable.
  var started=false;
  function refresh() {
    if(started || !roots.length)return;started=true;
    fetch('https://public-api.wordpress.com/wp/v2/sites/theofficeofnils.wordpress.com/posts?per_page=100').then(function (r) { if(!r.ok)throw Error('Blog unavailable');return r.json(); }).then(function (remote) { if(!Array.isArray(remote))return;posts=merge(base,remote);roots.forEach(render); }).catch(function () {});
  }
  if('IntersectionObserver' in window){var observer=new IntersectionObserver(function (entries) { if(entries.some(function (e) { return e.isIntersecting; })){observer.disconnect();refresh();} },{rootMargin:'160px'});roots.forEach(function (r) { observer.observe(r); });}
  else window.addEventListener('load',refresh,{once:true});
})();

