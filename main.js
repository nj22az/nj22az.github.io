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

function Navigation({ currentPage, onPageChange, onBrandClick }) {
  const pages = [
    { id: 'home', label: 'Home' },
    { id: 'blog', label: 'Blog' },
    { id: 'downloads', label: 'Downloads' },
    { id: 'about', label: 'About' }
  ];

  return React.createElement('header', { className: 'top-bar' }, [
    React.createElement('div', { className: 'top-bar__brand', key: 'brand' },
      React.createElement('button', {
        type: 'button',
        className: 'brand-button',
        onClick: onBrandClick
      }, [
        React.createElement('span', { key: 'glyph', className: 'brand-glyph' }),
        React.createElement('span', { key: 'text', className: 'brand-text' }, 'Nils Johansson')
      ])
    ),
    React.createElement('nav', { className: 'nav-items', key: 'nav', 'aria-label': 'Primary navigation' },
      pages.map(({ id, label }) =>
        React.createElement('button', {
          type: 'button',
          key: id,
          className: 'nav-item' + (currentPage === id ? ' active' : ''),
          'aria-current': currentPage === id ? 'page' : undefined,
          onClick: () => onPageChange(id)
        }, label)
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
    React.createElement('p', { key: 'eyebrow', className: 'hero__eyebrow' }, 'Engineering, travel, and culture'),
    React.createElement('h1', { key: 'headline', className: 'hero__headline' }, 'Documenting how we build and live at the edges of the map.'),
    React.createElement('p', { key: 'subhead', className: 'hero__subhead' }, 'Field service adventures, maritime engineering lessons, and cultural reflections collected from Scandinavia to Southeast Asia.'),
    React.createElement('div', { key: 'cta', className: 'hero__cta' }, [
      React.createElement('button', {
        key: 'cta-button',
        type: 'button',
        className: 'primary-button',
        onClick: handleExplore
      }, 'Explore the blog'),
      React.createElement('span', { key: 'meta', className: 'hero__meta' }, 'Curated stories, practical frameworks, and the occasional photo essay.')
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
      React.createElement('p', { key: 'copy' }, 'I\'m gathering notes and imagery—check back soon for new posts.')
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
        React.createElement('h2', { key: 'title', className: 'section-title' }, 'Latest writing'),
        React.createElement('p', { key: 'subtitle', className: 'section-subtitle' }, 'Field-tested lessons and cultural reflections from real-world projects.')
      ]),
      React.createElement(PostList, { key: 'list', posts: latestPosts, onOpen })
    ])
  ]);
}

function BlogPage({ posts, onOpen }) {
  return React.createElement('div', { className: 'posts-page' }, [
    React.createElement('section', { key: 'section', className: 'posts-section' }, [
      React.createElement('div', { key: 'header', className: 'section-header' }, [
        React.createElement('h1', { key: 'title', className: 'section-title' }, 'Journal'),
        React.createElement('p', { key: 'subtitle', className: 'section-subtitle' }, 'Long-form thinking, quick dispatches, and frameworks I reach for while working across cultures.')
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
    }, '\u2190 Back to all posts'),
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
      React.createElement('p', { key: 'subtitle', className: 'section-subtitle' }, 'Toolkits, checklists, and references I rely on in the field.')
    ]),
    downloads.length
      ? React.createElement('div', { key: 'grid', className: 'download-grid' },
          downloads.map((item, index) => React.createElement(DownloadCard, { item, key: index }))
        )
      : React.createElement('p', { key: 'empty', className: 'empty-state' }, 'Downloads will be available soon—check back shortly.')
  ]);
}

function AboutPage() {
  return React.createElement('section', { className: 'about-section' }, [
    React.createElement('h1', { key: 'title', className: 'section-title' }, 'About Nils'),
    React.createElement('p', { key: 'lead', className: 'section-lead' }, 'Marine engineer turned field service specialist, following curiosity from shipyards to innovation labs.'),
    React.createElement('p', { key: 'p1', className: 'section-body' }, 'I spend my time solving hard technical problems in the field, supporting teams through challenging deployments, and documenting the cultural nuances that shape every project.'),
    React.createElement('p', { key: 'p2', className: 'section-body' }, 'This site is a living notebook—expect engineering frameworks, travel notes, and honest stories about what it takes to deliver solutions across borders.'),
    React.createElement('p', { key: 'p3', className: 'section-body' }, 'If any of this resonates, feel free to connect or reach out. I love comparing notes.')
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
    React.createElement('footer', { key: 'footer', className: 'site-footer' }, `\u00A9 ${new Date().getFullYear()} Nils Johansson. Crafted with curiosity.`)
  ]);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(App)
);
