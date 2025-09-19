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
  neutral: '#687684',
  active: '#1DA1F2',
  meta: '#1DA1F2',
  download: '#1DA1F2'
};

const CARD_COLOR_POOL = ['#1DA1F2', '#17BF63', '#F45D22', '#794BC4', '#FFAD1F', '#5C6BC0'];

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

  return React.createElement('aside', { className: 'side-nav' }, [
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
    React.createElement('nav', { className: 'side-nav__items', key: 'nav', 'aria-label': 'Primary navigation' },
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
  ]);
}

function Hero({ onExplore }) {
  const handleExplore = () => {
    if (typeof onExplore === 'function') {
      onExplore();
    }
  };

  return React.createElement('section', { className: 'hero app-frame' }, [
    React.createElement('p', { key: 'eyebrow', className: 'hero__eyebrow' }, 'FIELD OPERATIONS JOURNAL'),
    React.createElement('h1', { key: 'headline', className: 'hero__headline' }, 'Practical notes from complex deployments.'),
    React.createElement('p', { key: 'subhead', className: 'hero__subhead' }, 'Field-tested approaches, cultural context, and ready-to-use resources for distributed teams.'),
    React.createElement('div', { key: 'actions', className: 'hero__actions' }, [
      React.createElement('button', {
        key: 'primary',
        type: 'button',
        className: 'primary-button',
        onClick: handleExplore
      }, 'Browse latest articles'),
      React.createElement('a', {
        key: 'secondary',
        className: 'link-button',
        href: '#downloads'
      }, 'View downloads')
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
    className: 'timeline-card timeline-card--post',
    role: 'button',
    tabIndex: 0,
    onClick: () => onOpen(post),
    onKeyDown: handleKeyDown
  }, [
    React.createElement('header', { key: 'head', className: 'timeline-card__header' }, [
      React.createElement('div', { key: 'icon', className: 'timeline-card__icon' },
        React.createElement(MonoIcon, { name: 'journal', tone: accent })
      ),
      React.createElement('div', { key: 'heading', className: 'timeline-card__heading' }, [
        React.createElement('h3', { key: 'title', className: 'timeline-card__title' }, post.title),
        React.createElement('span', { key: 'meta', className: 'timeline-card__meta' }, `${post.displayDate} · ${post.readingTime} min read`)
      ]),
      React.createElement(MonoIcon, { key: 'chevron', name: 'chevron', className: 'timeline-card__chevron' })
    ]),
    React.createElement('p', { key: 'excerpt', className: 'timeline-card__excerpt' }, post.excerpt)
  ]);
}

function PostList({ posts, onOpen }) {
  if (!posts.length) {
    return [
      React.createElement('div', { className: 'empty-state app-frame', key: 'empty' }, [
        React.createElement('h3', { key: 'title' }, 'Fresh stories are on the way'),
        React.createElement('p', { key: 'copy' }, 'New perspectives are being reviewed—check back shortly for updates.')
      ])
    ];
  }

  return posts.map((post, index) =>
    React.createElement(PostCard, {
      post,
      onOpen,
      accent: CARD_COLOR_POOL[index % CARD_COLOR_POOL.length],
      key: post.id || post.url || post.title || index
    })
  );
}

function DownloadCard({ item, accent }) {
  const metaItems = [
    item.file_type ? `Format: ${item.file_type}` : null,
    item.file_size ? `Size: ${item.file_size}` : null,
    typeof item.download_count === 'number' ? `${item.download_count} downloads` : null
  ].filter(Boolean);

  const isExternal = typeof item.url === 'string' && /^https?:\/\//i.test(item.url);

  return React.createElement('article', { className: 'timeline-card timeline-card--download' }, [
    React.createElement('header', { key: 'head', className: 'timeline-card__header' }, [
      React.createElement('div', { key: 'icon', className: 'timeline-card__icon' },
        React.createElement(MonoIcon, { name: 'download', tone: accent })
      ),
      React.createElement('div', { key: 'heading', className: 'timeline-card__heading' }, [
        React.createElement('h3', { key: 'title', className: 'timeline-card__title' }, item.title),
        metaItems.length
          ? React.createElement('span', { key: 'meta', className: 'timeline-card__meta' }, metaItems.join(' · '))
          : null
      ]),
      item.url
        ? React.createElement('a', {
            key: 'action',
            className: 'link-button link-button--inline',
            href: item.url,
            target: isExternal ? '_blank' : undefined,
            rel: isExternal ? 'noreferrer noopener' : undefined
          }, 'Download')
        : React.createElement(MonoIcon, { key: 'chevron', name: 'chevron', className: 'timeline-card__chevron' })
    ]),
    React.createElement('p', { key: 'description', className: 'timeline-card__excerpt' }, item.description)
  ]);
}

function DownloadsPage({ downloads }) {
  const headerCard = React.createElement('article', { className: 'timeline-card timeline-card--intro', key: 'header' }, [
    React.createElement('h1', { key: 'title', className: 'timeline-card__title' }, 'Downloads'),
    React.createElement('p', { key: 'copy', className: 'timeline-card__excerpt' }, 'Toolkits, briefs, and references designed to accelerate your next engagement.')
  ]);

  if (!downloads.length) {
    return [headerCard, React.createElement('div', { className: 'empty-state', key: 'empty' }, 'New assets are being prepared—check back soon.')];
  }

  const cards = downloads.map((item, index) =>
    React.createElement(DownloadCard, {
      item,
      accent: CARD_COLOR_POOL[index % CARD_COLOR_POOL.length],
      key: index
    })
  );

  return [headerCard, ...cards];
}

function AboutPage() {
  return React.createElement('article', { className: 'timeline-card timeline-card--intro' }, [
    React.createElement('h1', { key: 'title', className: 'timeline-card__title' }, 'About Nils'),
    React.createElement('p', { key: 'p1', className: 'timeline-card__excerpt' }, 'Field service engineer translating complex projects into predictable outcomes.'),
    React.createElement('p', { key: 'p2', className: 'timeline-card__excerpt' }, 'Marine engineering roots, live deployments across regions, and a commitment to clear documentation.'),
    React.createElement('p', { key: 'p3', className: 'timeline-card__excerpt' }, 'This journal is a working log. If you operate in similar environments, I hope these notes help you ship with confidence.')
  ]);
}

function SecondaryPanel({ page, downloads }) {
  if (!downloads.length || page === 'downloads') {
    return null;
  }
  const featured = downloads.slice(0, 3);

  return React.createElement('aside', { className: 'context-panel' },
    React.createElement('div', { className: 'context-card' }, [
      React.createElement('h3', { key: 'title', className: 'context-card__title' }, 'Downloads'),
      React.createElement('ul', { key: 'list', className: 'context-card__list' },
        featured.map((item, index) =>
          React.createElement('li', { key: index }, item.title)
        )
      )
    ])
  );
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
    mainContent = [
      React.createElement(Hero, { key: 'hero', onExplore: () => handleChangePage('blog') })
    ].concat(PostList({ posts: posts.slice(0, 6), onOpen: handleOpenPost }));
  } else if (page === 'blog') {
    mainContent = PostList({ posts, onOpen: handleOpenPost });
  } else if (page === 'downloads') {
    mainContent = DownloadsPage({ downloads });
  } else if (page === 'about') {
    mainContent = [AboutPage()];
  } else {
    mainContent = [
      React.createElement(Hero, { key: 'hero', onExplore: () => handleChangePage('blog') })
    ].concat(PostList({ posts: posts.slice(0, 6), onOpen: handleOpenPost }));
  }

  const activePage = currentPost ? 'blog' : page;
  const timelineItems = Array.isArray(mainContent) ? mainContent : [mainContent];

  return React.createElement('div', { className: 'app-shell' }, [
    React.createElement(Navigation, {
      key: 'nav',
      currentPage: activePage,
      onPageChange: handleChangePage,
      onBrandClick: handleBrandClick
    }),
    React.createElement('div', { className: 'app-main' }, [
      React.createElement('main', {
        key: 'timeline',
        className: 'timeline' + (currentPost ? ' timeline--detail' : '')
      }, timelineItems),
      React.createElement(SecondaryPanel, { key: 'panel', page: activePage, downloads })
    ])
  ]);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(App)
);
