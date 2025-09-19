const { useState, useEffect } = React;

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function createExcerpt(text) {
  if (!text) return '';
  if (text.length <= 160) {
    return text;
  }
  const slice = text.slice(0, 180);
  const lastSpace = slice.lastIndexOf(' ');
  const candidate = lastSpace > 140 ? slice.slice(0, lastSpace) : slice;
  return `${candidate.trim()}…`;
}

function enhancePost(post) {
  const plainText = stripHtml(post.content);
  const words = plainText.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.round(words / 200));
  const excerptSource = post.excerpt && post.excerpt.trim().length ? post.excerpt : plainText;
  const excerpt = createExcerpt(stripHtml(excerptSource));

  return {
    ...post,
    plainText,
    readingTime,
    excerpt
  };
}

function MonoIcon({ name, className = '' }) {
  return React.createElement('span', {
    className: ['mono-icon', `mono-icon--${name}`, className].filter(Boolean).join(' '),
    'aria-hidden': 'true'
  });
}

function Navigation({ currentPage, onPageChange, onBrandClick }) {
  const pages = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'blog', label: 'Journal', icon: 'journal' },
    { id: 'downloads', label: 'Downloads', icon: 'download' },
    { id: 'about', label: 'About', icon: 'about' }
  ];

  return React.createElement('header', { className: 'top-bar' }, [
    React.createElement('div', { className: 'top-bar__brand', key: 'brand' },
      React.createElement('button', {
        type: 'button',
        className: 'brand-button',
        onClick: onBrandClick
      }, [
        React.createElement('span', { key: 'glyph', className: 'brand-glyph' }),
        React.createElement('span', { key: 'text', className: 'brand-text' }, 'Nils Johansson'),
        React.createElement('span', { key: 'role', className: 'brand-role' }, 'Field Service Engineer')
      ])
    ),
    React.createElement('nav', { className: 'nav-items', key: 'nav', 'aria-label': 'Primary navigation' },
      pages.map(({ id, label, icon }) =>
        React.createElement('button', {
          type: 'button',
          key: id,
          className: 'nav-item' + (currentPage === id ? ' active' : ''),
          'aria-current': currentPage === id ? 'page' : undefined,
          onClick: () => onPageChange(id)
        }, [
          React.createElement(MonoIcon, { key: 'icon', name: icon, className: 'nav-item__icon' }),
          React.createElement('span', { key: 'label', className: 'nav-item__label' }, label)
        ])
      )
    )
  ]);
}

function Hero({ onExplore }) {
  const handleExplore = () => {
    if (typeof onExplore === 'function') {
      onExplore();
    }
  };

  return React.createElement('section', { className: 'hero' }, [
    React.createElement('p', { key: 'eyebrow', className: 'hero__eyebrow' }, 'Field notes & design signals'),
    React.createElement('h1', { key: 'headline', className: 'hero__headline' }, 'Engineering stories delivered with calm precision.'),
    React.createElement('p', { key: 'subhead', className: 'hero__subhead' }, 'Dispatches from shipyards, innovation labs, and cross-border deployments—documenting the rituals that keep complex projects on schedule.'),
    React.createElement('div', { key: 'cta', className: 'hero__cta' }, [
      React.createElement('button', {
        key: 'cta-button',
        type: 'button',
        className: 'primary-button',
        onClick: handleExplore
      }, 'Browse latest articles'),
      React.createElement('span', { key: 'meta', className: 'hero__meta' }, 'Frameworks, reflections, and artefacts captured directly from the work.')
    ])
  ]);
}

function PostCard({ post, onOpen }) {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen(post);
    }
  };

  return React.createElement('article', {
    className: 'post-card',
    role: 'button',
    tabIndex: 0,
    onClick: () => onOpen(post),
    onKeyDown: handleKeyDown
  }, [
    React.createElement('div', { key: 'meta', className: 'post-card__meta' }, [
      React.createElement(MonoIcon, { key: 'icon', name: 'calendar', className: 'post-card__meta-icon' }),
      React.createElement('span', { key: 'date', className: 'post-card__date' }, post.displayDate),
      React.createElement('span', { key: 'separator', className: 'post-card__separator', 'aria-hidden': 'true' }, '•'),
      React.createElement('span', { key: 'time', className: 'post-card__time' }, `${post.readingTime} min read`)
    ]),
    React.createElement('h3', { key: 'title', className: 'post-card__title' }, post.title),
    React.createElement('p', { key: 'excerpt', className: 'post-card__excerpt' }, post.excerpt)
  ]);
}

function PostList({ posts, onOpen }) {
  if (!posts.length) {
    return React.createElement('div', { className: 'empty-state' }, [
      React.createElement('h3', { key: 'title' }, 'Fresh stories are on the way'),
      React.createElement('p', { key: 'copy' }, 'New perspectives are being reviewed—check back shortly for updates.')
    ]);
  }

  return React.createElement('div', { className: 'post-grid' },
    posts.map((post) =>
      React.createElement(PostCard, {
        post,
        onOpen,
        key: post.id || post.url || post.title
      })
    )
  );
}

function HomePage({ posts, onOpen, onExplore }) {
  const latestPosts = posts.slice(0, 6);
  return React.createElement('div', { className: 'home-view' }, [
    React.createElement(Hero, { key: 'hero', onExplore }),
    React.createElement('section', { key: 'posts', className: 'posts-section' }, [
      React.createElement('div', { key: 'header', className: 'section-header' }, [
        React.createElement('h2', { key: 'title', className: 'section-title' }, 'Latest insights'),
        React.createElement('p', { key: 'subtitle', className: 'section-subtitle' }, 'Essays, briefs, and checklists distilled from live engagements.')
      ]),
      React.createElement(PostList, { key: 'list', posts: latestPosts, onOpen })
    ])
  ]);
}

function BlogPage({ posts, onOpen }) {
  return React.createElement('div', { className: 'posts-page' }, [
    React.createElement('section', { key: 'section', className: 'posts-section' }, [
      React.createElement('div', { key: 'header', className: 'section-header' }, [
        React.createElement('h1', { key: 'title', className: 'section-title' }, 'Journal archive'),
        React.createElement('p', { key: 'subtitle', className: 'section-subtitle' }, 'Long-form thinking, quick status dispatches, and the frameworks guiding cross-regional delivery.')
      ]),
      React.createElement(PostList, { key: 'list', posts, onOpen })
    ])
  ]);
}

function PostView({ post, onBack }) {
  return React.createElement('article', { className: 'post-detail' }, [
    React.createElement('button', {
      key: 'back',
      type: 'button',
      className: 'pill-button',
      onClick: onBack
    }, '← Back to articles'),
    React.createElement('header', { key: 'header', className: 'post-detail__header' }, [
      React.createElement('p', { key: 'eyebrow', className: 'post-detail__eyebrow' }, 'Journal entry'),
      React.createElement('h1', { key: 'title', className: 'post-detail__title' }, post.title),
      React.createElement('p', { key: 'meta', className: 'post-detail__meta' }, `${post.displayDate} \u2022 ${post.readingTime} min read`)
    ]),
    React.createElement('div', {
      key: 'body',
      className: 'post-detail__body content',
      dangerouslySetInnerHTML: { __html: post.content }
    })
  ]);
}

function DownloadCard({ item }) {
  const metaItems = [
    item.file_type ? `Format: ${item.file_type}` : null,
    item.file_size ? `Size: ${item.file_size}` : null,
    typeof item.download_count === 'number' ? `${item.download_count} downloads` : null
  ].filter(Boolean);

  const isExternal = typeof item.url === 'string' && /^https?:\/\//i.test(item.url);

  return React.createElement('article', { className: 'download-card' }, [
    React.createElement('div', { key: 'badge', className: 'download-card__badge' },
      React.createElement(MonoIcon, { name: 'download', className: 'download-card__icon' })
    ),
    React.createElement('h3', { key: 'title', className: 'download-card__title' }, item.title),
    React.createElement('p', { key: 'description', className: 'download-card__description' }, item.description),
    metaItems.length
      ? React.createElement('div', { key: 'meta', className: 'download-card__meta' },
          metaItems.map((meta, index) => React.createElement('span', { key: index }, meta))
        )
      : null,
    item.url
      ? React.createElement('a', {
          key: 'action',
          className: 'button button--subtle download-card__action',
          href: item.url,
          target: isExternal ? '_blank' : undefined,
          rel: isExternal ? 'noreferrer noopener' : undefined
        }, 'Download')
      : null
  ]);
}

function DownloadsPage({ downloads }) {
  return React.createElement('section', { className: 'downloads-section' }, [
    React.createElement('div', { key: 'header', className: 'section-header' }, [
      React.createElement('h1', { key: 'title', className: 'section-title' }, 'Downloads'),
      React.createElement('p', { key: 'subtitle', className: 'section-subtitle' }, 'Toolkits, briefs, and references designed to accelerate your next engagement.')
    ]),
    downloads.length
      ? React.createElement('div', { key: 'grid', className: 'download-grid' },
          downloads.map((item, index) => React.createElement(DownloadCard, { item, key: index }))
        )
      : React.createElement('p', { key: 'empty', className: 'empty-state' }, 'New assets are being prepared—check back soon for additional resources.')
  ]);
}

function AboutPage() {
  return React.createElement('section', { className: 'about-section' }, [
    React.createElement('h1', { key: 'title', className: 'section-title' }, 'About Nils'),
    React.createElement('p', { key: 'lead', className: 'section-lead' }, 'Field service engineer translating complex projects into predictable outcomes.'),
    React.createElement('p', { key: 'p1', className: 'section-body' }, 'Marine engineering roots, a decade of hands-on deployments, and a commitment to clear documentation.'),
    React.createElement('p', { key: 'p2', className: 'section-body' }, 'This journal is a working log—expect tested checklists, cultural context, and decision frameworks you can adapt immediately.'),
    React.createElement('p', { key: 'p3', className: 'section-body' }, 'If you operate in similar environments, I hope these notes help you ship with confidence.')
  ]);
}

function App() {
  const [page, setPage] = useState('home');
  const [posts, setPosts] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);

  useEffect(() => {
    fetch('posts.json')
      .then((res) => res.json())
      .then((data) => setPosts(data.map(enhancePost)))
      .catch(() => setPosts([]));

    fetch('downloads.json')
      .then((res) => res.json())
      .then(setDownloads)
      .catch(() => setDownloads([]));
  }, []);

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleChangePage = (nextPage) => {
    setCurrentPost(null);
    setPage(nextPage);
    scrollToTop();
  };

  const handleOpenPost = (post) => {
    setCurrentPost(post);
    setPage('blog');
    scrollToTop();
  };

  const handleBackToPosts = () => {
    setCurrentPost(null);
    scrollToTop();
  };

  const handleBrandClick = () => handleChangePage('home');

  let mainContent;
  if (currentPost) {
    mainContent = React.createElement(PostView, { post: currentPost, onBack: handleBackToPosts });
  } else if (page === 'home') {
    mainContent = React.createElement(HomePage, {
      posts,
      onOpen: handleOpenPost,
      onExplore: () => handleChangePage('blog')
    });
  } else if (page === 'blog') {
    mainContent = React.createElement(BlogPage, { posts, onOpen: handleOpenPost });
  } else if (page === 'downloads') {
    mainContent = React.createElement(DownloadsPage, { downloads });
  } else if (page === 'about') {
    mainContent = React.createElement(AboutPage);
  } else {
    mainContent = React.createElement(HomePage, {
      posts,
      onOpen: handleOpenPost,
      onExplore: () => handleChangePage('blog')
    });
  }

  const activePage = currentPost ? 'blog' : page;

  return React.createElement('div', { className: 'app-shell' }, [
    React.createElement(Navigation, {
      key: 'nav',
      currentPage: activePage,
      onPageChange: handleChangePage,
      onBrandClick: handleBrandClick
    }),
    React.createElement('main', {
      key: 'main',
      className: 'main-area' + (currentPost ? ' main-area--detail' : '')
    }, mainContent),
    React.createElement('footer', { key: 'footer', className: 'site-footer' }, `\u00A9 ${new Date().getFullYear()} Nils Johansson · Field Notes`)
  ]);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(App)
);
