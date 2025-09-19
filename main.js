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

const MASCOT_STATES = {
  home: {
    mood: 'happy',
    message: 'こんにちは! Mochi here — pick a story card and let’s start today’s adventure.'
  },
  blog: {
    mood: 'curious',
    message: 'Flip through the journal cards. Each one hides field notes and cozy reflections.'
  },
  downloads: {
    mood: 'helpful',
    message: 'Collect handy goodies for your toolkit. Every download is a little badge of progress!'
  },
  about: {
    mood: 'thinking',
    message: 'Take a peek behind the scenes and meet the engineer guiding these journeys.'
  },
  reading: {
    mood: 'celebrating',
    message: 'Story unlocked! Enjoy the tale, I’ll keep watch for the next surprise.'
  }
};

const MOOD_ICONS = {
  happy: '🌸',
  curious: '🔍',
  helpful: '🎒',
  thinking: '🤔',
  celebrating: '🎉',
  sleeping: '😴'
};

function KawaiiButton({ children, variant = 'primary', size = 'md', className = '', as = 'button', ...props }) {
  const classes = ['kawaii-button', `kawaii-button--${variant}`, `kawaii-button--${size}`, className]
    .filter(Boolean)
    .join(' ');

  if (as === 'a') {
    const { href, target, rel, ...rest } = props;
    return React.createElement('a', { className: classes, href, target, rel, ...rest }, children);
  }

  const { type = 'button', ...rest } = props;
  return React.createElement('button', { className: classes, type, ...rest }, children);
}

function FloatingDecor() {
  const icons = ['🌸', '✨', '🍡', '☁', '🎮'];
  return React.createElement(
    'div',
    { className: 'floating-decor', 'aria-hidden': 'true' },
    icons.map((icon, index) =>
      React.createElement('span', { className: `floating-decor__icon floating-decor__icon--${index}`, key: index }, icon)
    )
  );
}

function MascotGuide({ mood, message, onNudge }) {
  const icon = MOOD_ICONS[mood] || '🌟';
  return React.createElement('aside', {
    className: `mascot-guide mascot-guide--${mood}`,
    role: 'status',
    'aria-live': 'polite'
  }, [
    React.createElement('div', { key: 'character', className: 'mascot-guide__character' }, [
      React.createElement('span', { key: 'emoji', className: 'mascot-guide__emoji', 'aria-hidden': 'true' }, icon),
      React.createElement('span', { key: 'label', className: 'mascot-guide__label' }, 'Mochi the Navigator')
    ]),
    React.createElement('div', { key: 'bubble', className: 'mascot-guide__bubble speech-bubble' },
      React.createElement('p', { key: 'text' }, message)
    ),
    onNudge
      ? React.createElement(KawaiiButton, { key: 'cta', variant: 'secondary', size: 'sm', onClick: onNudge }, 'Take me there ✨')
      : null
  ]);
}

function Navigation({ currentPage, onPageChange, onBrandClick }) {
  const pages = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'blog', label: 'Blog', icon: '📓' },
    { id: 'downloads', label: 'Downloads', icon: '🎁' },
    { id: 'about', label: 'About', icon: '💬' }
  ];

  return React.createElement('header', { className: 'top-bar kawaii-top-bar' }, [
    React.createElement('div', { className: 'top-bar__brand', key: 'brand' },
      React.createElement(KawaiiButton, {
        variant: 'ghost',
        size: 'sm',
        className: 'brand-button',
        onClick: onBrandClick
      }, [
        React.createElement('span', { key: 'icon', className: 'brand-glyph', 'aria-hidden': 'true' }, '🌈'),
        React.createElement('span', { key: 'text', className: 'brand-text' }, 'Nils Field Notes'),
        React.createElement('span', { key: 'tagline', className: 'brand-tagline' }, 'Curiosity Journal ✧')
      ])
    ),
    React.createElement('nav', { className: 'nav-items', key: 'nav', 'aria-label': 'Primary navigation' },
      pages.map(({ id, label, icon }) =>
        React.createElement(KawaiiButton, {
          variant: currentPage === id ? 'primary' : 'tab',
          size: 'sm',
          key: id,
          className: 'nav-item' + (currentPage === id ? ' active' : ''),
          'aria-current': currentPage === id ? 'page' : undefined,
          onClick: () => onPageChange(id)
        }, [
          React.createElement('span', { key: 'icon', className: 'nav-item__icon', 'aria-hidden': 'true' }, icon),
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

  return React.createElement('section', { className: 'hero kawaii-hero' }, [
    React.createElement('div', { key: 'decor', className: 'hero__decor', 'aria-hidden': 'true' }, '🌸'),
    React.createElement('div', { key: 'content', className: 'hero__content' }, [
      React.createElement('span', { key: 'tag', className: 'hero__tag stamp' }, 'Field Log 01'),
      React.createElement('h1', { key: 'headline', className: 'hero__headline' }, 'Adventure-ready stories & schematics.'),
      React.createElement('p', { key: 'subhead', className: 'hero__subhead' }, 'Playful reflections on engineering in motion, culture on the move, and the gear that keeps the journey running.'),
      React.createElement('div', { key: 'cta', className: 'hero__cta' }, [
        React.createElement(KawaiiButton, {
          key: 'explore',
          variant: 'primary',
          size: 'lg',
          onClick: handleExplore
        }, 'Explore the blog ✨'),
        React.createElement('span', { key: 'meta', className: 'hero__meta' }, '☆ Collect new insights weekly. Tap a card to begin!')
      ])
    ]),
    React.createElement('div', { key: 'bubble', className: 'hero__bubble speech-bubble' }, [
      React.createElement('p', { key: 'line1' }, 'Mochi whispers: “Curiosity is our compass!”'),
      React.createElement('p', { key: 'line2' }, 'Choose a chapter and I’ll tag along.')
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
    React.createElement('span', { key: 'sticker', className: 'post-card__sticker', 'aria-hidden': 'true' }, '✨'),
    React.createElement('div', { key: 'header', className: 'post-card__header' }, [
      React.createElement('span', { key: 'date', className: 'post-card__date' }, post.displayDate),
      React.createElement('span', { key: 'reading', className: 'post-card__time' }, `${post.readingTime} min read`)
    ]),
    React.createElement('h3', { key: 'title', className: 'post-card__title' }, post.title),
    React.createElement('p', { key: 'excerpt', className: 'post-card__excerpt' }, post.excerpt),
    React.createElement('div', { key: 'footer', className: 'post-card__footer' },
      React.createElement('span', { className: 'post-card__cta' }, 'Tap to read →')
    )
  ]);
}

function PostList({ posts, onOpen }) {
  if (!posts.length) {
    return React.createElement('div', { className: 'empty-state speech-bubble' }, [
      React.createElement('h3', { key: 'title' }, 'Fresh stories are brewing ☕️'),
      React.createElement('p', { key: 'copy' }, 'Check back soon—new adventures are on the way!')
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
        React.createElement('h2', { key: 'title', className: 'section-title' }, 'Latest postcards'),
        React.createElement('p', { key: 'subtitle', className: 'section-subtitle' }, 'Choose a vignette to uncover life at the edges of the map.')
      ]),
      React.createElement(PostList, { key: 'list', posts: latestPosts, onOpen })
    ])
  ]);
}

function BlogPage({ posts, onOpen }) {
  return React.createElement('div', { className: 'posts-page' }, [
    React.createElement('section', { key: 'section', className: 'posts-section' }, [
      React.createElement('div', { key: 'header', className: 'section-header' }, [
        React.createElement('h1', { key: 'title', className: 'section-title' }, 'Journal shelf'),
        React.createElement('p', { key: 'subtitle', className: 'section-subtitle' }, 'Field-tested lessons, travel notes, and cultural curios collected on assignment.')
      ]),
      React.createElement(PostList, { key: 'list', posts, onOpen })
    ])
  ]);
}

function PostView({ post, onBack }) {
  return React.createElement('article', { className: 'post-detail' }, [
    React.createElement(KawaiiButton, {
      key: 'back',
      variant: 'ghost',
      size: 'sm',
      className: 'post-detail__back',
      onClick: onBack
    }, '← Back to story dock'),
    React.createElement('header', { key: 'header', className: 'post-detail__header' }, [
      React.createElement('span', { key: 'stamp', className: 'post-detail__stamp' }, 'Story mode ☆'),
      React.createElement('h1', { key: 'title', className: 'post-detail__title' }, post.title),
      React.createElement('p', { key: 'meta', className: 'post-detail__meta' }, `${post.displayDate} • ${post.readingTime} min read`)
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
    React.createElement('span', { key: 'icon', className: 'download-card__icon', 'aria-hidden': 'true' }, '🎁'),
    React.createElement('h3', { key: 'title', className: 'download-card__title' }, item.title),
    React.createElement('p', { key: 'description', className: 'download-card__description' }, item.description),
    metaItems.length
      ? React.createElement('div', { key: 'meta', className: 'download-card__meta' },
          metaItems.map((meta, index) => React.createElement('span', { key: index }, meta))
        )
      : null,
    item.url
      ? React.createElement(KawaiiButton, {
          key: 'action',
          as: 'a',
          variant: 'secondary',
          size: 'sm',
          className: 'download-card__action',
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
      React.createElement('h1', { key: 'title', className: 'section-title' }, 'Downloads chest'),
      React.createElement('p', { key: 'subtitle', className: 'section-subtitle' }, 'Collect practical templates, checklists, and field-ready helpers.')
    ]),
    downloads.length
      ? React.createElement('div', { key: 'grid', className: 'download-grid' },
          downloads.map((item, index) => React.createElement(DownloadCard, { item, key: index }))
        )
      : React.createElement('p', { key: 'empty', className: 'empty-state speech-bubble' }, 'Downloads will be available soon—check back shortly!')
  ]);
}

function AboutPage() {
  const highlights = [
    { icon: '🛠', text: 'Marine engineer turned field service specialist with a taste for complex deployments.' },
    { icon: '🌍', text: 'Works across continents, documenting the cultural nuances that shape every project.' },
    { icon: '🎏', text: 'Shares frameworks, travel rituals, and lessons learned so fellow explorers can thrive.' }
  ];

  return React.createElement('section', { className: 'about-section' }, [
    React.createElement('h1', { key: 'title', className: 'section-title' }, 'Meet Nils'),
    React.createElement('p', { key: 'lead', className: 'section-lead' }, 'Thoughtful notes from shipyards, innovation labs, and the quiet hours in-between.'),
    React.createElement('ul', { key: 'list', className: 'about-section__list' },
      highlights.map(({ icon, text }, index) =>
        React.createElement('li', { className: 'about-section__item', key: index }, [
          React.createElement('span', { className: 'about-section__icon', 'aria-hidden': 'true', key: 'icon' }, icon),
          React.createElement('p', { className: 'about-section__text', key: 'text' }, text)
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
  const mascotState = currentPost
    ? { ...MASCOT_STATES.reading, message: `Enjoy “${currentPost.title}” — I’ll keep watch for highlights.` }
    : MASCOT_STATES[activePage] || MASCOT_STATES.home;

  const mascotNudge = !currentPost && activePage === 'home'
    ? () => handleChangePage('downloads')
    : undefined;

  return React.createElement('div', { className: 'app-shell' }, [
    React.createElement(FloatingDecor, { key: 'decor' }),
    React.createElement(Navigation, { key: 'nav', currentPage: activePage, onPageChange: handleChangePage, onBrandClick: handleBrandClick }),
    React.createElement('main', {
      key: 'main',
      className: 'main-area' + (currentPost ? ' main-area--detail' : '')
    }, mainContent),
    React.createElement(MascotGuide, { key: 'mascot', mood: mascotState.mood, message: mascotState.message, onNudge: mascotNudge }),
    React.createElement('footer', { key: 'footer', className: 'site-footer' }, `© ${new Date().getFullYear()} Nils Johansson ✿ Crafted with curiosity and cocoa.`)
  ]);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(App)
);
