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

const ICON_COLORS = {
  home: '#0a84ff',
  blog: '#30d158',
  downloads: '#ff9f0a',
  about: '#ff375f',
  calendar: '#32ade6',
  download: '#ff9f0a',
  aboutBadge: '#8e8e93'
};

const CARD_COLOR_POOL = ['#0a84ff', '#30d158', '#ff9f0a', '#af52de', '#64d2ff', '#ff375f'];

function MonoIcon({ name, className = '', style }) {
  return React.createElement('span', {
    className: ['mono-icon', `mono-icon--${name}`, className].filter(Boolean).join(' '),
    style,
    'aria-hidden': 'true'
  });
}

function Navigation({ currentPage, onPageChange, onBrandClick }) {
  const pages = [
    { id: 'home', label: 'Home', icon: 'home', tone: ICON_COLORS.home },
    { id: 'blog', label: 'Journal', icon: 'journal', tone: ICON_COLORS.blog },
    { id: 'downloads', label: 'Downloads', icon: 'download', tone: ICON_COLORS.downloads },
    { id: 'about', label: 'About', icon: 'about', tone: ICON_COLORS.about }
  ];

  return React.createElement('header', { className: 'top-bar' },
    React.createElement('div', { className: 'app-frame top-bar__frame' }, [
      React.createElement('div', { className: 'top-bar__brand', key: 'brand' },
        React.createElement('button', {
          type: 'button',
          className: 'brand-button',
          onClick: onBrandClick
        }, [
          React.createElement('span', { key: 'glyph', className: 'brand-glyph' }),
          React.createElement('span', { key: 'identity', className: 'brand-text-block' }, [
            React.createElement('span', { key: 'name', className: 'brand-text' }, 'Nils Johansson'),
            React.createElement('span', { key: 'role', className: 'brand-role' }, 'Field Service Engineer')
          ])
        ])
      ),
      React.createElement('nav', { className: 'nav-items', key: 'nav', 'aria-label': 'Primary navigation' },
        pages.map(({ id, label, icon, tone }) =>
          React.createElement('button', {
            type: 'button',
            key: id,
            className: 'nav-item' + (currentPage === id ? ' active' : ''),
            'aria-current': currentPage === id ? 'page' : undefined,
            onClick: () => onPageChange(id)
          }, [
            React.createElement('span', {
              key: 'badge',
              className: 'nav-item__icon-badge',
              style: { backgroundColor: tone }
            }, React.createElement(MonoIcon, {
              name: icon,
              className: 'nav-item__icon',
              style: { backgroundColor: '#fff' }
            })),
            React.createElement('span', { key: 'label', className: 'nav-item__label' }, label)
          ])
        )
      )
    ])
  );
}

function Hero({ onExplore }) {
  const handleExplore = () => {
    if (typeof onExplore === 'function') {
      onExplore();
    }
  };

  return React.createElement('section', { className: 'hero app-frame' }, [
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

function PostCard({ post, onOpen, accent }) {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen(post);
    }
  };

  return React.createElement('article', {
    className: 'settings-item post-card',
    role: 'button',
    tabIndex: 0,
    onClick: () => onOpen(post),
    onKeyDown: handleKeyDown
  }, [
    React.createElement('div', { key: 'icon', className: 'settings-leading' },
      React.createElement('span', {
        className: 'settings-icon',
        style: { backgroundColor: accent }
      }, React.createElement(MonoIcon, { name: 'calendar', style: { backgroundColor: '#fff' } }))
    ),
    React.createElement('div', { key: 'body', className: 'settings-body' }, [
      React.createElement('h3', { key: 'title', className: 'settings-title' }, post.title),
      React.createElement('p', { key: 'meta', className: 'settings-subtitle' }, `${post.displayDate} · ${post.readingTime} min read`),
      React.createElement('p', { key: 'excerpt', className: 'settings-secondary' }, post.excerpt)
    ]),
    React.createElement(MonoIcon, { key: 'chevron', name: 'chevron', className: 'settings-chevron' })
  ]);
}

function PostList({ posts, onOpen }) {
  if (!posts.length) {
    return React.createElement('div', { className: 'empty-state app-frame' }, [
      React.createElement('h3', { key: 'title' }, 'Fresh stories are on the way'),
      React.createElement('p', { key: 'copy' }, 'New perspectives are being reviewed—check back shortly for updates.')
    ]);
  }

  return React.createElement('div', { className: 'settings-group app-frame' },
    posts.map((post, index) =>
      React.createElement(PostCard, {
        post,
        onOpen,
        accent: CARD_COLOR_POOL[index % CARD_COLOR_POOL.length],
        key: post.id || post.url || post.title
      })
    )
  );
}

function HomePage({ posts, onOpen, onExplore }) {
  const latestPosts = posts.slice(0, 6);
  return React.createElement(React.Fragment, null, [
    React.createElement(Hero, { key: 'hero', onExplore }),
    React.createElement('section', { key: 'posts', className: 'posts-section app-frame' }, [
      React.createElement('div', { key: 'header', className: 'section-header section-header--left' }, [
        React.createElement('h2', { key: 'title', className: 'section-title' }, 'Latest insights'),
        React.createElement('p', { key: 'subtitle', className: 'section-subtitle' }, 'Essays, briefs, and checklists distilled from live engagements.')
      ]),
      React.createElement(PostList, { key: 'list', posts: latestPosts, onOpen })
    ])
  ]);
}

function BlogPage({ posts, onOpen }) {
  return React.createElement('section', { className: 'posts-section app-frame' }, [
    React.createElement('div', { key: 'header', className: 'section-header section-header--left' }, [
      React.createElement('h1', { key: 'title', className: 'section-title' }, 'Journal archive'),
      React.createElement('p', { key: 'subtitle', className: 'section-subtitle' }, 'Long-form thinking, quick status dispatches, and the frameworks guiding cross-regional delivery.')
    ]),
    React.createElement(PostList, { key: 'list', posts, onOpen })
  ]);
}

function PostView({ post, onBack }) {
  return React.createElement('article', { className: 'post-detail app-frame' }, [
    React.createElement('button', {
      key: 'back',
      type: 'button',
      className: 'pill-button',
      onClick: onBack
    }, '← Back to articles'),
    React.createElement('header', { key: 'header', className: 'post-detail__header' }, [
      React.createElement('p', { key: 'eyebrow', className: 'post-detail__eyebrow' }, 'Journal entry'),
      React.createElement('h1', { key: 'title', className: 'post-detail__title' }, post.title),
      React.createElement('p', { key: 'meta', className: 'post-detail__meta' }, `${post.displayDate} · ${post.readingTime} min read`)
    ]),
    React.createElement('div', {
      key: 'body',
      className: 'post-detail__body content',
      dangerouslySetInnerHTML: { __html: post.content }
    })
  ]);
}

function DownloadCard({ item, accent }) {
  const metaItems = [
    item.file_type ? `Format: ${item.file_type}` : null,
    item.file_size ? `Size: ${item.file_size}` : null,
    typeof item.download_count === 'number' ? `${item.download_count} downloads` : null
  ].filter(Boolean);

  const isExternal = typeof item.url === 'string' && /^https?:\/\//i.test(item.url);

  return React.createElement('div', { className: 'settings-item download-card' }, [
    React.createElement('div', { key: 'icon', className: 'settings-leading' },
      React.createElement('span', {
        className: 'settings-icon',
        style: { backgroundColor: accent }
      }, React.createElement(MonoIcon, { name: 'download', style: { backgroundColor: '#fff' } }))
    ),
    React.createElement('div', { key: 'body', className: 'settings-body' }, [
      React.createElement('h3', { key: 'title', className: 'settings-title' }, item.title),
      React.createElement('p', { key: 'description', className: 'settings-secondary' }, item.description),
      metaItems.length
        ? React.createElement('p', { key: 'meta', className: 'settings-subtitle' }, metaItems.join(' · '))
        : null
    ]),
    item.url
      ? React.createElement('a', {
          key: 'download',
          className: 'settings-action-link',
          href: item.url,
          target: isExternal ? '_blank' : undefined,
          rel: isExternal ? 'noreferrer noopener' : undefined
        }, 'Download')
      : null
  ]);
}

function DownloadsPage({ downloads }) {
  return React.createElement('section', { className: 'downloads-section app-frame' }, [
    React.createElement('div', { key: 'header', className: 'section-header section-header--left' }, [
      React.createElement('h1', { key: 'title', className: 'section-title' }, 'Downloads'),
      React.createElement('p', { key: 'subtitle', className: 'section-subtitle' }, 'Toolkits, briefs, and references designed to accelerate your next engagement.')
    ]),
    downloads.length
      ? React.createElement('div', { key: 'group', className: 'settings-group' },
          downloads.map((item, index) => React.createElement(DownloadCard, {
            item,
            accent: CARD_COLOR_POOL[index % CARD_COLOR_POOL.length],
            key: index
          }))
        )
      : React.createElement('div', { key: 'empty', className: 'empty-state' }, [
          React.createElement('h3', { key: 'title' }, 'Downloads coming soon'),
          React.createElement('p', { key: 'text' }, 'New assets are being prepared—check back for additional resources.')
        ])
  ]);
}

function AboutPage() {
  const highlights = [
    {
      icon: 'about',
      tone: ICON_COLORS.about,
      title: 'Global deployments',
      copy: 'Marine engineering roots with a decade of hands-on field work across continents.'
    },
    {
      icon: 'journal',
      tone: ICON_COLORS.blog,
      title: 'Documented frameworks',
      copy: 'Every project contributes playbooks—checklists, brief templates, and cultural context.'
    },
    {
      icon: 'download',
      tone: ICON_COLORS.download,
      title: 'Practitioner focus',
      copy: 'Designed for teams shipping in the real world: concise, actionable, and adaptable.'
    }
  ];

  return React.createElement('section', { className: 'about-section app-frame' }, [
    React.createElement('div', { key: 'header', className: 'section-header section-header--left' }, [
      React.createElement('h1', { key: 'title', className: 'section-title' }, 'About Nils'),
      React.createElement('p', { key: 'subtitle', className: 'section-subtitle' }, 'Field service engineer translating complex projects into predictable outcomes.')
    ]),
    React.createElement('div', { key: 'group', className: 'settings-group' },
      highlights.map(({ icon, tone, title, copy }, index) =>
        React.createElement('div', { className: 'settings-item', key: index }, [
          React.createElement('div', { className: 'settings-leading' },
            React.createElement('span', {
              className: 'settings-icon',
              style: { backgroundColor: tone }
            }, React.createElement(MonoIcon, { name: icon, style: { backgroundColor: '#fff' } }))
          ),
          React.createElement('div', { className: 'settings-body' }, [
            React.createElement('h3', { className: 'settings-title', key: 'title' }, title),
            React.createElement('p', { className: 'settings-secondary', key: 'copy' }, copy)
          ])
        ])
      )
    )
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
      className: 'main-area'
    }, mainContent),
    React.createElement('footer', { key: 'footer', className: 'site-footer app-frame' }, `\u00A9 ${new Date().getFullYear()} Nils Johansson · Field Notes`)
  ]);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(App)
);
