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
  const slice = text.slice(0, 200);
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

const ICON_TONES = {
  neutral: '#7a808d',
  active: '#0F6CBD',
  calendar: '#107C41',
  download: '#C43E1C',
  about: '#5C2D91'
};

const CARD_COLOR_POOL = ['#0F6CBD', '#107C41', '#C43E1C', '#5C2D91', '#038387', '#744DA9'];

function MonoIcon({ name, className = '', tone, style }) {
  const toneStyle = tone ? { color: tone } : undefined;
  return React.createElement('span', {
    className: ['mono-icon', `mono-icon--${name}`, className].filter(Boolean).join(' '),
    style: toneStyle || style ? { ...(toneStyle || {}), ...(style || {}) } : undefined,
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

  return React.createElement('header', { className: 'top-bar' },
    React.createElement('div', { className: 'app-frame top-bar__frame' }, [
      React.createElement('button', {
        type: 'button',
        className: 'brand-button',
        onClick: onBrandClick,
        key: 'brand'
      }, [
        React.createElement('span', { key: 'glyph', className: 'brand-glyph' }),
        React.createElement('div', { key: 'text', className: 'brand-text-block' }, [
          React.createElement('span', { key: 'name', className: 'brand-text' }, 'Nils Johansson'),
          React.createElement('span', { key: 'role', className: 'brand-role' }, 'Field Service Engineer')
        ])
      ]),
      React.createElement('nav', { className: 'nav-items', key: 'nav', 'aria-label': 'Primary navigation' },
        pages.map(({ id, label, icon }) =>
          React.createElement('button', {
            type: 'button',
            key: id,
            className: 'nav-item' + (currentPage === id ? ' active' : ''),
            'aria-current': currentPage === id ? 'page' : undefined,
            onClick: () => onPageChange(id)
          }, [
            React.createElement(MonoIcon, {
              key: 'icon',
              name: icon,
              className: 'nav-item__icon',
              tone: currentPage === id ? ICON_TONES.active : ICON_TONES.neutral
            }),
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
    React.createElement('div', { key: 'content', className: 'hero__content' }, [
      React.createElement('p', { key: 'eyebrow', className: 'hero__eyebrow' }, 'FIELD OPERATIONS PLAYBOOK'),
      React.createElement('h1', { key: 'headline', className: 'hero__headline' }, 'Shareable lessons from live deployments.'),
      React.createElement('p', { key: 'subhead', className: 'hero__subhead' }, 'Structured field notes, design signals, and proven frameworks that help distributed teams deliver consistently.'),
      React.createElement('div', { key: 'cta', className: 'hero__actions' }, [
        React.createElement('button', {
          key: 'primary',
          type: 'button',
          className: 'primary-button',
          onClick: handleExplore
        }, 'Review recent updates'),
        React.createElement('a', {
          key: 'secondary',
          className: 'link-button',
          href: '#downloads'
        }, 'Browse resources →')
      ])
    ]),
    React.createElement('div', { key: 'metrics', className: 'hero__metrics' }, [
      React.createElement('div', { key: 'metric1', className: 'metric-card' }, [
        React.createElement('span', { className: 'metric-value' }, '12'),
        React.createElement('span', { className: 'metric-label' }, 'Active checklists')
      ]),
      React.createElement('div', { key: 'metric2', className: 'metric-card' }, [
        React.createElement('span', { className: 'metric-value' }, '4'),
        React.createElement('span', { className: 'metric-label' }, 'Regions supported')
      ])
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
    className: 'resource-card',
    role: 'button',
    tabIndex: 0,
    onClick: () => onOpen(post),
    onKeyDown: handleKeyDown
  }, [
    React.createElement('div', { key: 'icon', className: 'resource-card__icon resource-card__icon--outline', style: { borderColor: accent } },
      React.createElement(MonoIcon, { name: 'journal', tone: accent })
    ),
    React.createElement('div', { key: 'body', className: 'resource-card__body' }, [
      React.createElement('h3', { key: 'title', className: 'resource-card__title' }, post.title),
      React.createElement('p', { key: 'meta', className: 'resource-card__meta' }, `${post.displayDate} · ${post.readingTime} min read`),
      React.createElement('p', { key: 'excerpt', className: 'resource-card__excerpt' }, post.excerpt)
    ]),
    React.createElement(MonoIcon, { key: 'chevron', name: 'chevron', className: 'resource-card__chevron' })
  ]);
}

function PostList({ posts, onOpen }) {
  if (!posts.length) {
    return React.createElement('div', { className: 'empty-state app-frame' }, [
      React.createElement('h3', { key: 'title' }, 'Fresh stories are on the way'),
      React.createElement('p', { key: 'copy' }, 'New perspectives are being reviewed—check back shortly for updates.')
    ]);
  }

  return React.createElement('div', { className: 'app-frame' },
    React.createElement('div', { className: 'resource-grid resource-grid--three' },
      posts.map((post, index) =>
        React.createElement(PostCard, {
          post,
          onOpen,
          accent: CARD_COLOR_POOL[index % CARD_COLOR_POOL.length],
          key: post.id || post.url || post.title
        })
      )
    )
  );
}

function HomePage({ posts, onOpen, onExplore }) {
  const latestPosts = posts.slice(0, 6);
  return React.createElement(React.Fragment, null, [
    React.createElement(Hero, { key: 'hero', onExplore }),
    React.createElement('section', { key: 'posts', className: 'posts-section app-frame' }, [
      React.createElement('div', { key: 'header', className: 'section-header section-header--split' }, [
        React.createElement('div', { key: 'titles', className: 'section-header__titles' }, [
          React.createElement('h2', { key: 'title', className: 'section-title' }, 'Latest insights'),
          React.createElement('p', { key: 'subtitle', className: 'section-subtitle' }, 'Essays and annotations from recent field engagements.')
        ]),
        React.createElement('a', { key: 'cta', className: 'link-button', onClick: onExplore }, 'View all articles')
      ]),
      React.createElement(PostList, { key: 'list', posts: latestPosts, onOpen })
    ])
  ]);
}

function BlogPage({ posts, onOpen }) {
  return React.createElement('section', { className: 'posts-section app-frame' }, [
    React.createElement('div', { key: 'header', className: 'section-header section-header--split' }, [
      React.createElement('div', { key: 'titles', className: 'section-header__titles' }, [
        React.createElement('h1', { key: 'title', className: 'section-title' }, 'Journal archive'),
        React.createElement('p', { key: 'subtitle', className: 'section-subtitle' }, 'Long-form thinking, status notes, and frameworks guiding cross-regional delivery.')
      ]),
      React.createElement('span', { key: 'count', className: 'section-caption' }, `${posts.length} entries`)
    ]),
    React.createElement('div', { className: 'resource-grid resource-grid--three' },
      posts.map((post, index) =>
        React.createElement(PostCard, {
          post,
          onOpen,
          accent: CARD_COLOR_POOL[index % CARD_COLOR_POOL.length],
          key: post.id || post.url || post.title
        })
      )
    )
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

  return React.createElement('div', { className: 'resource-card resource-card--horizontal' }, [
    React.createElement('div', { key: 'icon', className: 'resource-card__icon resource-card__icon--outline', style: { borderColor: accent } },
      React.createElement(MonoIcon, { name: 'download', tone: accent })
    ),
    React.createElement('div', { key: 'body', className: 'resource-card__body' }, [
      React.createElement('h3', { key: 'title', className: 'resource-card__title' }, item.title),
      React.createElement('p', { key: 'description', className: 'resource-card__excerpt' }, item.description),
      metaItems.length
        ? React.createElement('p', { key: 'meta', className: 'resource-card__meta' }, metaItems.join(' · '))
        : null
    ]),
    item.url
      ? React.createElement('a', {
          key: 'download',
          className: 'link-button link-button--inline',
          href: item.url,
          target: isExternal ? '_blank' : undefined,
          rel: isExternal ? 'noreferrer noopener' : undefined
        }, 'Download')
      : React.createElement(MonoIcon, { key: 'chevron', name: 'chevron', className: 'resource-card__chevron' })
  ]);
}

function DownloadsPage({ downloads }) {
  return React.createElement('section', { className: 'downloads-section app-frame', id: 'downloads' }, [
    React.createElement('div', { key: 'header', className: 'section-header section-header--split' }, [
      React.createElement('div', { key: 'titles', className: 'section-header__titles' }, [
        React.createElement('h1', { key: 'title', className: 'section-title' }, 'Downloads'),
        React.createElement('p', { key: 'subtitle', className: 'section-subtitle' }, 'Toolkits, briefs, and references designed to accelerate your next engagement.')
      ]),
      React.createElement('span', { key: 'caption', className: 'section-caption' }, `${downloads.length} resources`)
    ]),
    downloads.length
      ? React.createElement('div', { key: 'grid', className: 'resource-grid resource-grid--two' },
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
      tone: ICON_COLORS.downloads,
      title: 'Practitioner focus',
      copy: 'Designed for teams shipping in the real world: concise, actionable, and adaptable.'
    }
  ];

  return React.createElement('section', { className: 'about-section app-frame' }, [
    React.createElement('div', { key: 'header', className: 'section-header section-header--split' }, [
      React.createElement('div', { key: 'titles', className: 'section-header__titles' }, [
        React.createElement('h1', { key: 'title', className: 'section-title' }, 'About Nils'),
        React.createElement('p', { key: 'subtitle', className: 'section-subtitle' }, 'Field service engineer translating complex projects into predictable outcomes.')
      ])
    ]),
    React.createElement('div', { key: 'grid', className: 'resource-grid resource-grid--three' },
      highlights.map(({ icon, tone, title, copy }, index) =>
        React.createElement('div', { className: 'resource-card resource-card--stacked', key: index }, [
      React.createElement('div', { className: 'resource-card__icon resource-card__icon--outline', style: { borderColor: tone } },
        React.createElement(MonoIcon, { name: icon, tone })
      ),
          React.createElement('div', { className: 'resource-card__body' }, [
            React.createElement('h3', { className: 'resource-card__title', key: 'title' }, title),
            React.createElement('p', { className: 'resource-card__excerpt', key: 'copy' }, copy)
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
