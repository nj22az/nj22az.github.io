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
    var list=root.querySelector('[data-blog-list]'), topic=root.dataset.topic || 'All';
    var filtered=posts.filter(function (p) { return topic==='All' || p.topic===topic; });
    var limit=Number(root.dataset.limit) || filtered.length, fragment=document.createDocumentFragment();
    filtered.slice(0,limit).forEach(function (p) {
      var article=node('article','blog-feed-item'), meta=node('div','blog-feed-meta');
      meta.appendChild(node('span','blog-feed-topic',p.topic));
      if(p.date){var date=node('time','',new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric'}).format(new Date(p.date+'T12:00:00Z')));date.dateTime=p.date;meta.appendChild(date);}
      article.appendChild(meta);
      var heading=node(root.dataset.heading || 'h3'), link=node('a','',p.title);link.href=safeUrl(p.url);heading.appendChild(link);article.appendChild(heading);
      article.appendChild(node('p','',p.excerpt));
      var actions=node('div','blog-feed-links'), read=node('a','blog-read',p.part?'Read part '+p.part+' →':'Read article →');read.href=safeUrl(p.url);read.hreflang='en';actions.appendChild(read);
      if(p.svUrl){var sv=node('a','blog-swedish','Svenska');sv.href=safeUrl(p.svUrl);sv.hreflang='sv';sv.lang='sv';sv.setAttribute('aria-label','Read this article in Swedish');actions.appendChild(sv);}
      article.appendChild(actions);fragment.appendChild(article);
    });
    list.replaceChildren(fragment);
    var count=root.querySelector('[data-blog-count]');if(count)count.textContent=filtered.length+' '+(filtered.length===1?'article':'articles');
  }
  roots.forEach(function (root) {
    root.querySelectorAll('[data-blog-topic]').forEach(function (button) { button.addEventListener('click',function () { root.dataset.topic=button.dataset.blogTopic;root.querySelectorAll('[data-blog-topic]').forEach(function (b) { b.setAttribute('aria-pressed',String(b===button)); });render(root); }); });
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
