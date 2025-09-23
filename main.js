const { useState, useEffect, useMemo, useCallback, useRef } = React;

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
  const tags = Array.isArray(post.tags) ? post.tags : [];
  const categories = Array.isArray(post.categories) ? post.categories : [];
  const coverIcon = post.coverIcon || TYPE_ICON_MAP[post.contentType] || 'journal';
  const categoryLabel = categories[0] || post.contentType || 'Journal';

  return {
    ...post,
    plainText,
    readingTime,
    excerpt,
    tags,
    categories,
    coverIcon,
    categoryLabel
  };
}

function getPostIdentifier(post) {
  if (!post) {
    return undefined;
  }
  return post.id || post.url || post.title;
}

const ICON_TONES = {
  neutral: 'var(--ink-tertiary)',
  active: 'var(--ink-primary)',
  meta: 'var(--ink-secondary)',
  download: 'var(--ink-primary)'
};

const CARD_COLOR_POOL = ['var(--ink-primary)'];

const AVAILABLE_ICONS = [
  { id: 'journal', label: 'Journal Entry' },
  { id: 'globe', label: 'Cultural Insight' },
  { id: 'checklist', label: 'Checklist' },
  { id: 'wave', label: 'Field Note' },
  { id: 'compass', label: 'Mission Planning' },
  { id: 'toolkit', label: 'Technical Dispatch' },
  { id: 'antenna', label: 'Signal & Comms' },
  { id: 'safety', label: 'Safety Advisory' }
];

const TYPE_ICON_MAP = {
  'Technical Dispatch': 'toolkit',
  'Cultural Insight': 'globe',
  Checklist: 'checklist',
  'Journal Entry': 'journal',
  'Field Note': 'wave',
  'Mission Planning': 'compass',
  'Signal & Comms': 'antenna',
  'Safety Advisory': 'safety'
};

const SHOW_PROFILE = {
  title: 'Field Notes Radio',
  tagline: 'Steady tactics for crews in motion.',
  description: 'Stories, frameworks, and calm perspectives from field service engineer Nils Johansson. Built for teams that need to move fast—without losing composure.',
  host: 'Hosted by Nils Johansson',
  cadence: 'New episodes every other Tuesday',
  location: 'Recorded in Gothenburg, Sweden',
  artwork: 'assets/images/podcast/show-artwork-placeholder.svg',
  theme: {
    start: '#6f5bff',
    mid: '#a668ff',
    end: '#ff7bc7'
  }
};

const EPISODE_ARTWORKS = [
  'assets/images/podcast/episode-art-01.svg',
  'assets/images/podcast/episode-art-02.svg',
  'assets/images/podcast/episode-art-03.svg',
  'assets/images/podcast/episode-art-04.svg'
];

const EPISODE_THEMES = [
  {
    gradient: 'linear-gradient(135deg, rgba(118, 76, 255, 0.9), rgba(196, 103, 255, 0.92))',
    glow: 'radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.3), transparent 60%)',
    accent: '#f4ecff'
  },
  {
    gradient: 'linear-gradient(135deg, rgba(81, 130, 255, 0.85), rgba(130, 211, 255, 0.9))',
    glow: 'radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.32), transparent 58%)',
    accent: '#e1f2ff'
  },
  {
    gradient: 'linear-gradient(135deg, rgba(255, 96, 140, 0.88), rgba(255, 162, 97, 0.88))',
    glow: 'radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.28), transparent 55%)',
    accent: '#ffe6e6'
  },
  {
    gradient: 'linear-gradient(135deg, rgba(75, 192, 141, 0.88), rgba(117, 219, 198, 0.92))',
    glow: 'radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.34), transparent 60%)',
    accent: '#e9fff6'
  }
];

function formatEpisodeNumber(value) {
  return String(value).padStart(2, '0');
}

function prepareEpisodes(posts) {
  if (!Array.isArray(posts)) {
    return [];
  }

  const sorted = posts.slice().sort((a, b) => {
    const aDate = Date.parse(a.date);
    const bDate = Date.parse(b.date);
    if (Number.isNaN(aDate) && Number.isNaN(bDate)) {
      return 0;
    }
    if (Number.isNaN(aDate)) {
      return 1;
    }
    if (Number.isNaN(bDate)) {
      return -1;
    }
    return bDate - aDate;
  });

  return sorted.map((post, index, array) => {
    const episodeNumber = array.length - index;
    const theme = EPISODE_THEMES[index % EPISODE_THEMES.length];
    const artwork = EPISODE_ARTWORKS[index % EPISODE_ARTWORKS.length];
    const durationMinutes = Math.max(12, Math.min(58, Math.round((post.readingTime || 1) * 6)));

    return {
      ...post,
      episodeNumber,
      episodeLabel: `Episode ${formatEpisodeNumber(episodeNumber)}`,
      episodeCode: `EP${formatEpisodeNumber(episodeNumber)}`,
      durationMinutes,
      episodeArtwork: artwork,
      episodeTheme: theme
    };
  });
}

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest first' },
  { id: 'oldest', label: 'Oldest first' },
  { id: 'shortest', label: 'Shortest read' },
  { id: 'longest', label: 'Longest read' }
];


function MonoIcon({ name, className = '', tone, style, 'aria-label': ariaLabel }) {
  const toneStyle = tone ? { color: tone } : undefined;
  return React.createElement('span', {
    className: ['mono-icon', `mono-icon--${name}`, className].filter(Boolean).join(' '),
    style: toneStyle || style ? { ...(toneStyle || {}), ...(style || {}) } : undefined,
    'aria-hidden': ariaLabel ? undefined : 'true',
    'aria-label': ariaLabel,
    role: ariaLabel ? 'img' : undefined
  });
}

const NAV_ITEMS = [
  { id: 'home', label: 'Show', icon: 'home' },
  { id: 'blog', label: 'Episodes', icon: 'journal' },
  { id: 'downloads', label: 'Downloads', icon: 'download' },
  { id: 'about', label: 'About', icon: 'about' }
];

function FilterMenu({
  searchTerm,
  onSearch,
  tags,
  selectedTag,
  onSelectTag,
  sortOrder,
  onSortChange,
  contentTypes,
  selectedContentType,
  onSelectContentType,
  searchInputRef,
  isOpen,
  onToggle
}) {
  const hasTags = Array.isArray(tags) && tags.length > 0;
  const hasContentTypes = Array.isArray(contentTypes) && contentTypes.length > 0;
  const toggleMenu = typeof onToggle === 'function' ? onToggle : () => {};
  const activeFilters = [
    Boolean(searchTerm && searchTerm.trim().length),
    selectedTag !== 'All',
    selectedContentType !== 'All',
    sortOrder !== 'newest'
  ].filter(Boolean).length;
  const hintText = 'Shortcut: ⌘ / Ctrl + K';

  const tagSection = hasTags
    ? React.createElement('div', { key: 'tags', className: 'filter-menu__section filter-menu__section--tags' }, [
        React.createElement('span', { key: 'label', className: 'filter-menu__label' }, 'Tags'),
        React.createElement('div', { key: 'chips', className: 'filter-menu__chips' },
          ['All', ...tags].map((tag) => React.createElement('button', {
            key: tag,
            type: 'button',
            className: 'filter-chip' + (selectedTag === tag ? ' filter-chip--active' : ''),
            onClick: () => onSelectTag(tag)
          }, tag))
        )
      ])
    : null;

  const controls = [
    React.createElement('div', { key: 'sort', className: 'filter-menu__control' }, [
      React.createElement('label', {
        key: 'label',
        htmlFor: 'sort-order',
        className: 'filter-menu__control-label'
      }, 'Sort'),
      React.createElement('select', {
        key: 'input',
        id: 'sort-order',
        className: 'filter-menu__select',
        value: sortOrder,
        onChange: (event) => onSortChange(event.target.value)
      }, SORT_OPTIONS.map(({ id, label }) =>
        React.createElement('option', { key: id, value: id }, label)
      ))
    ])
  ];

  if (hasContentTypes) {
    controls.push(
      React.createElement('div', { key: 'type', className: 'filter-menu__control' }, [
        React.createElement('label', {
          key: 'label',
          htmlFor: 'content-type',
          className: 'filter-menu__control-label'
        }, 'Content type'),
        React.createElement('select', {
          key: 'input',
          id: 'content-type',
          className: 'filter-menu__select',
          value: selectedContentType,
          onChange: (event) => onSelectContentType(event.target.value)
        }, ['All', ...contentTypes].map((type) =>
          React.createElement('option', { key: type, value: type }, type)
        ))
      ])
    );
  }

  const searchSection = React.createElement('div', { key: 'search', className: 'filter-menu__section filter-menu__section--search' }, [
    React.createElement('label', {
      key: 'label',
      htmlFor: 'search-field',
      className: 'filter-menu__label'
    }, 'Search'),
    React.createElement('div', { key: 'input', className: 'search-field' },
      React.createElement('input', {
        id: 'search-field',
        type: 'search',
        value: searchTerm,
        placeholder: 'Search episodes and resources…',
        onChange: (event) => onSearch(event.target.value),
        className: 'search-field__input',
        ref: searchInputRef
      })
    )
  ]);

  const viewSection = React.createElement('div', { key: 'view', className: 'filter-menu__section filter-menu__section--view' }, [
    React.createElement('span', { key: 'label', className: 'filter-menu__label' }, 'Episode filters'),
    React.createElement('div', { key: 'controls', className: 'filter-menu__controls' }, controls)
  ]);

  const bodySections = [searchSection, viewSection, tagSection].filter(Boolean);

  const body = isOpen
    ? React.createElement('div', { key: 'panel', className: 'filter-menu__panel', id: 'filter-menu-panel' }, bodySections)
    : null;

  return React.createElement('section', { className: 'filter-menu' }, [
    React.createElement('div', { key: 'header', className: 'filter-menu__header' }, [
      React.createElement('button', {
        key: 'trigger',
        type: 'button',
        className: 'filter-menu__trigger',
        onClick: toggleMenu,
        'aria-expanded': isOpen ? 'true' : 'false',
        'aria-controls': 'filter-menu-panel'
      }, [
        React.createElement(MonoIcon, {
          key: 'icon',
          name: 'settings',
          className: 'filter-menu__icon',
          tone: isOpen ? ICON_TONES.active : ICON_TONES.neutral
        }),
        React.createElement('span', { key: 'label', className: 'filter-menu__trigger-label' }, 'Browse episodes'),
        activeFilters
          ? React.createElement('span', { key: 'badge', className: 'filter-menu__badge' }, `${activeFilters} active`)
          : null
      ].filter(Boolean)),
      React.createElement('span', { key: 'hint', className: 'filter-menu__hint' }, hintText)
    ]),
    body
  ].filter(Boolean));
}

function Navigation({ currentPage, onPageChange, onBrandClick }) {
  const handleBrand = () => {
    if (typeof onBrandClick === 'function') {
      onBrandClick();
    }
  };

  return React.createElement('header', { className: 'show-nav' },
    React.createElement('div', { className: 'show-nav__inner' }, [
      React.createElement('button', {
        key: 'brand',
        type: 'button',
        className: 'show-nav__brand',
        onClick: handleBrand
      }, [
        React.createElement('span', { key: 'icon', className: 'show-nav__brand-icon', 'aria-hidden': 'true' }),
        React.createElement('span', { key: 'copy', className: 'show-nav__brand-copy' }, [
          React.createElement('span', { key: 'title', className: 'show-nav__brand-title' }, SHOW_PROFILE.title),
          React.createElement('span', { key: 'meta', className: 'show-nav__brand-meta' }, 'by Nils Johansson')
        ])
      ]),
      React.createElement('nav', { key: 'nav', className: 'show-nav__tabs', 'aria-label': 'Primary navigation' },
        NAV_ITEMS.map(({ id, label }) =>
          React.createElement('button', {
            type: 'button',
            key: id,
            className: 'show-nav__tab' + (currentPage === id ? ' show-nav__tab--active' : ''),
            'aria-current': currentPage === id ? 'page' : undefined,
            onClick: () => onPageChange(id)
          }, label)
        )
      ),
      React.createElement('div', { key: 'actions', className: 'show-nav__actions' },
        React.createElement('button', {
          type: 'button',
          className: 'pill-button show-nav__subscribe'
        }, 'Follow show')
      )
    ])
  );
}

function BottomNavigation({ currentPage, onPageChange }) {
  return React.createElement('nav', { className: 'bottom-nav', 'aria-label': 'Primary navigation' },
    NAV_ITEMS.map(({ id, label, icon }) =>
      React.createElement('button', {
        type: 'button',
        key: id,
        className: 'bottom-nav__item' + (currentPage === id ? ' active' : ''),
        'aria-current': currentPage === id ? 'page' : undefined,
        onClick: () => onPageChange(id)
      }, [
        React.createElement('span', { key: 'active', className: 'bottom-nav__indicator', 'aria-hidden': 'true' }),
        React.createElement(MonoIcon, {
          key: 'icon',
          name: icon,
          className: 'bottom-nav__icon',
          tone: currentPage === id ? ICON_TONES.active : ICON_TONES.neutral
        }),
        React.createElement('span', { key: 'label', className: 'bottom-nav__label' }, label)
      ])
    )
  );
}

function ShowHero({ onExplore, onPlayEpisode, featuredEpisode, totalEpisodes }) {
  const heroStyle = {
    '--show-hero-start': SHOW_PROFILE.theme.start,
    '--show-hero-mid': SHOW_PROFILE.theme.mid,
    '--show-hero-end': SHOW_PROFILE.theme.end
  };

  const handleExplore = () => {
    if (typeof onExplore === 'function') {
      onExplore();
    }
  };

  const handlePlay = () => {
    if (featuredEpisode && typeof onPlayEpisode === 'function') {
      onPlayEpisode(featuredEpisode);
      return;
    }
    handleExplore();
  };

  const metaItems = [
    SHOW_PROFILE.host,
    SHOW_PROFILE.cadence,
    typeof totalEpisodes === 'number' && totalEpisodes > 0
      ? `${totalEpisodes} episodes`
      : null,
    SHOW_PROFILE.location
  ].filter(Boolean);

  const highlight = featuredEpisode
    ? React.createElement('div', { key: 'highlight', className: 'show-hero__highlight' }, [
        React.createElement('div', { key: 'art', className: 'show-hero__highlight-art' },
          React.createElement('img', {
            src: featuredEpisode.episodeArtwork || SHOW_PROFILE.artwork,
            alt: '',
            'aria-hidden': 'true'
          })
        ),
        React.createElement('div', { key: 'copy', className: 'show-hero__highlight-copy' }, [
          React.createElement('span', { key: 'label', className: 'show-hero__highlight-label' }, featuredEpisode.episodeLabel || 'Latest episode'),
          React.createElement('h3', { key: 'title', className: 'show-hero__highlight-title' }, featuredEpisode.title),
          React.createElement('p', { key: 'meta', className: 'show-hero__highlight-meta' }, `${featuredEpisode.displayDate} · ${featuredEpisode.durationMinutes || featuredEpisode.readingTime || 20} min`)
        ]),
        React.createElement('button', {
          key: 'play',
          type: 'button',
          className: 'pill-button show-hero__highlight-play',
          onClick: handlePlay
        }, [
          React.createElement(MonoIcon, { key: 'icon', name: 'play', className: 'show-hero__highlight-icon' }),
          React.createElement('span', { key: 'label' }, 'Play')
        ])
      ])
    : null;

  return React.createElement('section', { className: 'show-hero', style: heroStyle }, [
    React.createElement('div', { key: 'bg', className: 'show-hero__backdrop', 'aria-hidden': 'true' }),
    React.createElement('div', { key: 'inner', className: 'show-hero__inner' }, [
      React.createElement('div', { key: 'artwrap', className: 'show-hero__artwork-wrap' },
        React.createElement('div', { className: 'show-hero__artwork-sheen', 'aria-hidden': 'true' }),
        React.createElement('img', {
          key: 'art',
          className: 'show-hero__artwork',
          src: SHOW_PROFILE.artwork,
          alt: `${SHOW_PROFILE.title} cover art`
        })
      ),
      React.createElement('div', { key: 'content', className: 'show-hero__content' }, [
        React.createElement('span', { key: 'eyebrow', className: 'show-hero__eyebrow' }, 'Original Podcast'),
        React.createElement('h1', { key: 'title', className: 'show-hero__title' }, SHOW_PROFILE.title),
        React.createElement('p', { key: 'tagline', className: 'show-hero__tagline' }, SHOW_PROFILE.tagline),
        React.createElement('p', { key: 'description', className: 'show-hero__description' }, SHOW_PROFILE.description),
        React.createElement('div', { key: 'meta', className: 'show-hero__meta' },
          metaItems.map((item, index) => React.createElement('span', { key: index }, item))
        ),
        React.createElement('div', { key: 'actions', className: 'show-hero__actions' }, [
          React.createElement('button', {
            key: 'play-latest',
            type: 'button',
            className: 'primary-button show-hero__primary',
            onClick: handlePlay
          }, 'Listen now'),
          React.createElement('button', {
            key: 'browse',
            type: 'button',
            className: 'link-button show-hero__secondary',
            onClick: handleExplore
          }, 'Browse episodes')
        ]),
        highlight
      ])
    ])
  ]);
}

function EpisodeCard({ post, onOpen }) {
  if (!post) {
    return null;
  }

  const handleOpen = () => {
    if (typeof onOpen === 'function') {
      onOpen(post);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOpen();
    }
  };

  const style = post.episodeTheme
    ? {
        '--episode-card-gradient': post.episodeTheme.gradient,
        '--episode-card-glow': post.episodeTheme.glow,
        '--episode-card-accent': post.episodeTheme.accent
      }
    : undefined;

  const metaParts = [
    post.episodeLabel || post.categoryLabel,
    post.displayDate,
    post.durationMinutes ? `${post.durationMinutes} min` : `${post.readingTime || 20} min`
  ].filter(Boolean);

  return React.createElement('article', {
    className: 'episode-card',
    role: 'button',
    tabIndex: 0,
    onClick: handleOpen,
    onKeyDown: handleKeyDown,
    style
  }, [
    React.createElement('div', { key: 'backdrop', className: 'episode-card__backdrop', 'aria-hidden': 'true' }),
    React.createElement('div', { key: 'inner', className: 'episode-card__inner' }, [
      React.createElement('div', { key: 'art', className: 'episode-card__art' },
        React.createElement('img', {
          src: post.episodeArtwork || SHOW_PROFILE.artwork,
          alt: '',
          'aria-hidden': 'true'
        })
      ),
      React.createElement('div', { key: 'content', className: 'episode-card__content' }, [
        React.createElement('span', { key: 'meta', className: 'episode-card__meta' }, metaParts.join(' · ')),
        React.createElement('h3', { key: 'title', className: 'episode-card__title' }, post.title),
        React.createElement('p', { key: 'excerpt', className: 'episode-card__excerpt' }, post.excerpt),
        React.createElement('div', { key: 'actions', className: 'episode-card__actions' }, [
          React.createElement('span', { key: 'cta', className: 'episode-card__cta' }, [
            React.createElement(MonoIcon, { key: 'icon', name: 'play', className: 'episode-card__cta-icon' }),
            'Play episode'
          ])
        ])
      ])
    ])
  ]);
}

function EpisodeList({ posts, onOpen }) {
  if (!Array.isArray(posts) || !posts.length) {
    return [
      React.createElement('div', { className: 'empty-state', key: 'empty' }, [
        React.createElement('h3', { key: 'title' }, 'New episodes are on the way'),
        React.createElement('p', { key: 'copy' }, 'Production is in review—check back shortly to listen in.')
      ])
    ];
  }

  return posts.map((post) =>
    React.createElement(EpisodeCard, {
      post,
      onOpen,
      key: getPostIdentifier(post) || post.title
    })
  );
}

function ShareBar({ post }) {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const copyResetTimeoutRef = useRef(null);

  const shareUrl = useMemo(() => {
    if (!post || !post.url) {
      return '';
    }
    if (typeof window !== 'undefined') {
      try {
        return new URL(post.url, window.location.origin).toString();
      } catch (error) {
        return post.url;
      }
    }
    return post.url;
  }, [post]);

  const encodedUrl = shareUrl ? encodeURIComponent(shareUrl) : '';
  const encodedTitle = post && post.title ? encodeURIComponent(post.title) : '';

  const shareTargets = [
    {
      id: 'linkedin',
      label: 'LinkedIn',
      icon: 'share',
      href: encodedUrl ? `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}` : undefined
    },
    {
      id: 'x',
      label: 'Post',
      icon: 'share',
      href: encodedUrl ? `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` : undefined
    },
    {
      id: 'email',
      label: 'Email',
      icon: 'mail',
      href: encodedUrl ? `mailto:?subject=${encodedTitle}&body=${encodedUrl}` : undefined
    }
  ];

  const enabledShareTargets = shareTargets.filter(({ href }) => Boolean(href));

  const closeMenu = useCallback((focusTrigger = true) => {
    setMenuOpen(false);
    if (focusTrigger && triggerRef.current) {
      triggerRef.current.focus();
    }
  }, []);

  const handleCopy = useCallback(() => {
    if (!shareUrl || typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopied(true);
        closeMenu();
        if (copyResetTimeoutRef.current) {
          clearTimeout(copyResetTimeoutRef.current);
        }
        copyResetTimeoutRef.current = setTimeout(() => {
          setCopied(false);
          copyResetTimeoutRef.current = null;
        }, 2200);
      })
      .catch(() => {});
  }, [shareUrl, closeMenu]);

  const handlePrint = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.print();
    }
    closeMenu();
  }, [closeMenu]);

  const handleMenuKeyDown = useCallback((event) => {
    if (!menuOpen || !menuRef.current) {
      return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
      return;
    }
    event.preventDefault();
    const items = Array.from(menuRef.current.querySelectorAll('.share-menu__item:not([aria-disabled="true"])'));
    if (!items.length) {
      return;
    }
    const currentIndex = items.indexOf(document.activeElement);
    let nextIndex = 0;
    if (event.key === 'ArrowDown') {
      nextIndex = currentIndex === -1 || currentIndex === items.length - 1 ? 0 : currentIndex + 1;
    } else {
      nextIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
    }
    const nextItem = items[nextIndex];
    if (nextItem && typeof nextItem.focus === 'function') {
      nextItem.focus();
    }
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        closeMenu(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    if (menuOpen && menuRef.current) {
      const focusableItems = Array.from(menuRef.current.querySelectorAll('.share-menu__item:not([aria-disabled="true"])'));
      if (focusableItems.length > 0) {
        focusableItems[0].focus();
      }
    }
  }, [menuOpen]);

  useEffect(() => () => {
    if (copyResetTimeoutRef.current) {
      clearTimeout(copyResetTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (menuOpen) {
      setCopied(false);
    }
  }, [menuOpen]);

  const identifier = getPostIdentifier(post);
  const menuId = identifier
    ? `share-menu-${identifier.toString().replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`
    : 'share-menu';
  const shareButtonLabel = copied ? 'Link copied' : 'Share';
  const triggerClasses = ['share-menu__trigger'];
  if (menuOpen) {
    triggerClasses.push('share-menu__trigger--open');
  }
  if (copied) {
    triggerClasses.push('share-menu__trigger--copied');
  }

  return React.createElement('div', { className: 'share-menu', ref: containerRef }, [
    React.createElement('button', {
      key: 'trigger',
      type: 'button',
      className: triggerClasses.join(' '),
      ref: triggerRef,
      'aria-haspopup': 'menu',
      'aria-expanded': menuOpen ? 'true' : 'false',
      'aria-controls': menuOpen ? menuId : undefined,
      onClick: () => setMenuOpen((open) => !open)
    }, [
      React.createElement(MonoIcon, { key: 'icon', name: 'share', className: 'share-menu__trigger-icon' }),
      React.createElement('span', { key: 'label', className: 'share-menu__trigger-label' }, shareButtonLabel)
    ]),
    menuOpen
      ? React.createElement('div', {
          key: 'popover',
          id: menuId,
          className: 'share-menu__popover',
          role: 'menu',
          'aria-label': 'Share options',
          ref: menuRef,
          onKeyDown: handleMenuKeyDown
        }, [
          enabledShareTargets.length
            ? React.createElement('div', { key: 'targets', className: 'share-menu__group' },
                enabledShareTargets.map(({ id, label, href, icon }) =>
                  React.createElement('a', {
                    key: id,
                    className: 'share-menu__item',
                    href,
                    target: '_blank',
                    rel: 'noreferrer noopener',
                    role: 'menuitem',
                    tabIndex: -1,
                    onClick: () => closeMenu(false)
                  }, [
                    React.createElement(MonoIcon, { key: 'icon', name: icon, className: 'share-menu__item-icon' }),
                    React.createElement('span', { key: 'label', className: 'share-menu__item-label' }, label)
                  ])
                )
              )
            : null,
          enabledShareTargets.length
            ? React.createElement('div', { key: 'divider', className: 'share-menu__divider' })
            : null,
          React.createElement('div', { key: 'system', className: 'share-menu__group' }, [
            React.createElement('button', {
              key: 'copy',
              type: 'button',
              className: 'share-menu__item share-menu__item--button',
              onClick: handleCopy,
              disabled: !shareUrl,
              'aria-disabled': !shareUrl ? 'true' : undefined,
              role: 'menuitem',
              tabIndex: -1
            }, [
              React.createElement(MonoIcon, { key: 'icon', name: 'link', className: 'share-menu__item-icon' }),
              React.createElement('span', { key: 'label', className: 'share-menu__item-label' }, 'Copy link')
            ]),
            React.createElement('button', {
              key: 'print',
              type: 'button',
              className: 'share-menu__item share-menu__item--button',
              onClick: handlePrint,
              role: 'menuitem',
              tabIndex: -1
            }, [
              React.createElement(MonoIcon, { key: 'icon', name: 'printer', className: 'share-menu__item-icon' }),
              React.createElement('span', { key: 'label', className: 'share-menu__item-label' }, 'Print')
            ])
          ])
        ])
      : null
  ]);
}

function EpisodeDetail({ post, onBack, onToggleBookmark, isBookmarked }) {
  const bodyRef = useRef(null);

  const handleBookmark = () => {
    if (typeof onToggleBookmark === 'function') {
      onToggleBookmark(post);
    }
  };

  const handleJumpToNotes = () => {
    if (bodyRef.current) {
      try {
        bodyRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (error) {
        bodyRef.current.scrollIntoView();
      }
    }
  };

  const metaParts = [
    post.displayDate,
    post.durationMinutes ? `${post.durationMinutes} min` : `${post.readingTime || 20} min`,
    post.categoryLabel
  ].filter(Boolean);

  const style = post.episodeTheme
    ? {
        '--episode-detail-gradient': post.episodeTheme.gradient,
        '--episode-detail-glow': post.episodeTheme.glow,
        '--episode-detail-accent': post.episodeTheme.accent
      }
    : undefined;

  return React.createElement('article', { className: 'episode-detail', style }, [
    React.createElement('div', { key: 'hero', className: 'episode-detail__hero' }, [
      React.createElement('button', {
        key: 'back',
        type: 'button',
        className: 'link-button episode-detail__back',
        onClick: onBack
      }, [
        React.createElement(MonoIcon, { key: 'icon', name: 'arrow-left', className: 'episode-detail__back-icon' }),
        React.createElement('span', { key: 'label' }, 'Back to episodes')
      ]),
      React.createElement('div', { key: 'frame', className: 'episode-detail__frame' },
        React.createElement('div', { className: 'episode-detail__frame-shine', 'aria-hidden': 'true' }),
        React.createElement('img', {
          key: 'art',
          src: post.episodeArtwork || SHOW_PROFILE.artwork,
          alt: `${post.title} artwork`
        })
      ),
      React.createElement('div', { key: 'summary', className: 'episode-detail__summary' }, [
        React.createElement('span', { key: 'label', className: 'episode-detail__label' }, post.episodeLabel || 'Episode'),
        React.createElement('h1', { key: 'title', className: 'episode-detail__title' }, post.title),
        React.createElement('p', { key: 'meta', className: 'episode-detail__meta' }, metaParts.join(' · '))
      ]),
      React.createElement('div', { key: 'actions', className: 'episode-detail__actions' }, [
        React.createElement('button', {
          key: 'play',
          type: 'button',
          className: 'primary-button episode-detail__play',
          onClick: handleJumpToNotes
        }, [
          React.createElement(MonoIcon, { key: 'icon', name: 'play', className: 'episode-detail__play-icon' }),
          React.createElement('span', { key: 'label' }, 'Play episode')
        ]),
        React.createElement('button', {
          key: 'bookmark',
          type: 'button',
          className: 'icon-button episode-detail__bookmark',
          onClick: handleBookmark,
          'aria-pressed': isBookmarked
        }, [
          React.createElement('span', { key: 'sr', className: 'visually-hidden' }, isBookmarked ? 'Remove bookmark' : 'Save for later'),
          React.createElement(MonoIcon, {
            key: 'icon',
            name: isBookmarked ? 'bookmark-filled' : 'bookmark',
            className: 'episode-detail__bookmark-icon',
            tone: isBookmarked ? ICON_TONES.active : ICON_TONES.neutral
          })
        ])
      ])
    ]),
    post.tags && post.tags.length
      ? React.createElement('div', { key: 'meta-tags', className: 'tag-list tag-list--detail' },
          post.tags.map((tag) => React.createElement('span', { className: 'tag-chip', key: tag }, tag))
        )
      : null,
    React.createElement(ShareBar, { key: 'share', post }),
    React.createElement('div', {
      key: 'body',
      className: 'episode-detail__body content',
      ref: bodyRef,
      dangerouslySetInnerHTML: { __html: post.content }
    })
  ]);
}

function DownloadCard({ item }) {
  if (!item || !item.title || !item.url) {
    return null;
  }

  const description = item.description && item.description.trim().length
    ? item.description.trim()
    : null;
  const isExternal = typeof item.url === 'string' && /^https?:\/\//i.test(item.url);

  return React.createElement('li', { className: 'download-item' }, [
    React.createElement('div', { key: 'details', className: 'download-item__details' }, [
      React.createElement('h3', { key: 'title', className: 'download-item__title' }, item.title),
      description
        ? React.createElement('p', { key: 'description', className: 'download-item__description' }, description)
        : null
    ].filter(Boolean)),
    React.createElement('a', {
      key: 'action',
      className: 'download-item__link',
      href: item.url,
      download: isExternal ? undefined : '',
      target: isExternal ? '_blank' : undefined,
      rel: isExternal ? 'noreferrer noopener' : undefined,
      'aria-label': `Download ${item.title}`
    }, 'Download')
  ]);
}

function DownloadsPage({ downloads }) {
  const introBlock = React.createElement('section', { className: 'download-intro-block', key: 'intro' }, [
    React.createElement('h1', { key: 'title', className: 'download-group__title' }, 'Downloads'),
    React.createElement('p', { key: 'copy', className: 'download-intro' }, 'Grab the files you need for field work, planning, or follow-up. Each link opens or saves the resource directly.')
  ]);

  if (!downloads.length) {
    return [introBlock, React.createElement('p', { className: 'download-empty', key: 'empty' }, 'No downloads are available yet. Check back soon for new resources.')];
  }

  const grouped = downloads.reduce((acc, item) => {
    const key = item.category || 'Resources';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

  const sections = Object.entries(grouped).map(([category, items]) =>
    React.createElement('section', { key: category, className: 'download-group' }, [
      React.createElement('h2', { key: 'title', className: 'download-group__title' }, category),
      React.createElement('ul', { key: 'list', className: 'download-list' },
        items.map((item) => React.createElement(DownloadCard, { item, key: item.title || item.url }))
      )
    ])
  );

  return [introBlock, ...sections];
}

function AboutPage({ about, isLoading }) {
  if (isLoading) {
    return React.createElement(EpisodeSkeleton, { key: 'about-skeleton' });
  }

  if (!about) {
    return React.createElement('article', { className: 'timeline-card timeline-card--intro' }, [
      React.createElement('h1', { key: 'title', className: 'timeline-card__title' }, 'About content unavailable'),
      React.createElement('p', { key: 'copy', className: 'timeline-card__excerpt' }, 'The about page could not be loaded. Refresh the page or check that about.json is being generated.')
    ]);
  }

  return React.createElement('article', { className: 'timeline-card timeline-card--intro' }, [
    React.createElement('div', { key: 'header', className: 'timeline-card__header' }, [
      React.createElement('div', { key: 'icon', className: 'timeline-card__icon' },
        React.createElement(MonoIcon, { name: about.coverIcon || 'journal', tone: ICON_TONES.active })
      ),
      React.createElement('div', { key: 'heading', className: 'timeline-card__heading' }, [
        React.createElement('span', { key: 'badge', className: 'timeline-card__badge' }, about.category || 'About'),
        React.createElement('h1', { key: 'title', className: 'timeline-card__title' }, about.title),
        about.updated
          ? React.createElement('span', { key: 'updated', className: 'timeline-card__meta' }, `Last updated ${about.updated}`)
          : null
      ])
    ]),
    about.tags && about.tags.length
      ? React.createElement('div', { key: 'tags', className: 'tag-list tag-list--detail' },
          about.tags.map((tag) => React.createElement('span', { className: 'tag-chip', key: tag }, tag))
        )
      : null,
    React.createElement('div', {
      key: 'body',
      className: 'timeline-card__body content',
      dangerouslySetInnerHTML: { __html: about.content }
    })
  ]);
}

function InspectorPanel({ currentPost }) {
  if (!currentPost) {
    return null;
  }

  const tagList = Array.isArray(currentPost.tags) && currentPost.tags.length
    ? React.createElement('div', { className: 'inspector-card__tags' },
        currentPost.tags.map((tag) => React.createElement('span', { key: tag, className: 'inspector-card__tag' }, tag))
      )
    : null;

  const metaParts = [
    currentPost.durationMinutes ? `${currentPost.durationMinutes} min` : `${currentPost.readingTime || 20} min`,
    currentPost.displayDate
  ].filter(Boolean);

  const style = currentPost.episodeTheme
    ? {
        '--inspector-accent-gradient': currentPost.episodeTheme.gradient,
        '--inspector-accent-glow': currentPost.episodeTheme.glow
      }
    : undefined;

  return React.createElement('aside', { className: 'inspector-panel' },
    React.createElement('section', { className: 'inspector-card inspector-card--now-playing', style }, [
      React.createElement('span', { key: 'label', className: 'inspector-card__label' }, 'Now playing'),
      React.createElement('div', { key: 'art', className: 'inspector-card__art' },
        React.createElement('img', {
          src: currentPost.episodeArtwork || SHOW_PROFILE.artwork,
          alt: `${currentPost.title} artwork`
        })
      ),
      React.createElement('h3', { key: 'title', className: 'inspector-card__title' }, currentPost.title),
      React.createElement('p', { key: 'meta', className: 'inspector-card__meta' }, metaParts.join(' · ')),
      tagList
    ].filter(Boolean))
  );
}

function Breadcrumbs({ segments }) {
  if (!Array.isArray(segments) || !segments.length) {
    return null;
  }

  return React.createElement('nav', { className: 'breadcrumbs', 'aria-label': 'Breadcrumb' },
    segments.map((segment, index) => {
      const isCurrent = index === segments.length - 1;
      const key = segment.id || segment.label || index;

      if (isCurrent || typeof segment.onSelect !== 'function') {
        return React.createElement('span', {
          key,
          className: 'breadcrumbs__item breadcrumbs__item--current',
          'aria-current': isCurrent ? 'page' : undefined
        }, segment.label);
      }

      return React.createElement('button', {
        key,
        type: 'button',
        className: 'breadcrumbs__item',
        onClick: segment.onSelect
      }, segment.label);
    })
  );
}

function BackToTopButton({ visible, onClick }) {
  return React.createElement('button', {
    type: 'button',
    className: 'back-to-top' + (visible ? ' back-to-top--visible' : ''),
    onClick,
    'aria-hidden': visible ? undefined : 'true',
    tabIndex: visible ? 0 : -1
  }, [
    React.createElement(MonoIcon, { key: 'icon', name: 'arrow-up', className: 'back-to-top__icon' }),
    React.createElement('span', { key: 'label' }, 'Top')
  ]);
}

function EpisodeSkeleton() {
  return React.createElement('article', { className: 'episode-card episode-card--skeleton' }, [
    React.createElement('div', { key: 'backdrop', className: 'episode-card__backdrop', 'aria-hidden': 'true' }),
    React.createElement('div', { key: 'inner', className: 'episode-card__inner' }, [
      React.createElement('div', { key: 'art', className: 'episode-card__art episode-card__art--skeleton' }),
      React.createElement('div', { key: 'content', className: 'episode-card__content' }, [
        React.createElement('div', { key: 'line1', className: 'episode-card__skeleton-line episode-card__skeleton-line--short' }),
        React.createElement('div', { key: 'line2', className: 'episode-card__skeleton-line episode-card__skeleton-line--title' }),
        React.createElement('div', { key: 'line3', className: 'episode-card__skeleton-line episode-card__skeleton-line--body' })
      ])
    ])
  ]);
}

function App() {
  const [page, setPage] = useState('home');
  const [posts, setPosts] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedContentType, setSelectedContentType] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingDownloads, setIsLoadingDownloads] = useState(true);
  const [about, setAbout] = useState(null);
  const [isLoadingAbout, setIsLoadingAbout] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    if (typeof window === 'undefined') {
      return new Set();
    }
    try {
      const stored = window.localStorage.getItem('bookmarkedPosts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return new Set(parsed);
        }
      }
    } catch (error) {
      return new Set();
    }
    return new Set();
  });
  const [showBackToTop, setShowBackToTop] = useState(false);
  const searchInputRef = useRef(null);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  useEffect(() => {
    setIsLoadingPosts(true);
    fetch('posts.json')
      .then((res) => res.json())
      .then((data) => {
        const enhanced = data.map(enhancePost);
        setPosts(prepareEpisodes(enhanced));
      })
      .catch(() => setPosts([]))
      .finally(() => setIsLoadingPosts(false));

    setIsLoadingDownloads(true);
    fetch('downloads.json')
      .then((res) => res.json())
      .then(setDownloads)
      .catch(() => setDownloads([]))
      .finally(() => setIsLoadingDownloads(false));

    setIsLoadingAbout(true);
    fetch('about.json')
      .then((res) => res.json())
      .then((payload) => setAbout(payload))
      .catch(() => setAbout(null))
      .finally(() => setIsLoadingAbout(false));
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('bookmarkedPosts', JSON.stringify(Array.from(bookmarkedIds)));
    }
  }, [bookmarkedIds]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 280);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const uniqueTags = useMemo(() => {
    const tagSet = new Set();
    posts.forEach((post) => {
      if (Array.isArray(post.tags)) {
        post.tags.forEach((tag) => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  }, [posts]);

  const uniqueContentTypes = useMemo(() => {
    const typeSet = new Set();
    posts.forEach((post) => {
      if (post.contentType) {
        typeSet.add(post.contentType);
      }
    });
    return Array.from(typeSet).sort((a, b) => a.localeCompare(b));
  }, [posts]);

  useEffect(() => {
    if (selectedTag !== 'All' && !uniqueTags.includes(selectedTag)) {
      setSelectedTag('All');
    }
  }, [uniqueTags, selectedTag]);

  useEffect(() => {
    if (selectedContentType !== 'All' && !uniqueContentTypes.includes(selectedContentType)) {
      setSelectedContentType('All');
    }
  }, [uniqueContentTypes, selectedContentType]);

  const filteredPosts = useMemo(() => {
    if (!Array.isArray(posts)) {
      return [];
    }

    const term = searchTerm.trim().toLowerCase();
    const parseDate = (value) => {
      const result = Date.parse(value);
      return Number.isNaN(result) ? 0 : result;
    };

    let result = posts.slice();

    if (term) {
      result = result.filter((post) => {
        const haystack = [
          post.title || '',
          post.excerpt || '',
          post.plainText || '',
          Array.isArray(post.tags) ? post.tags.join(' ') : '',
          Array.isArray(post.categories) ? post.categories.join(' ') : ''
        ].join(' ').toLowerCase();
        return haystack.includes(term);
      });
    }

    if (selectedTag !== 'All') {
      result = result.filter((post) => Array.isArray(post.tags) && post.tags.includes(selectedTag));
    }

    if (selectedContentType !== 'All') {
      result = result.filter((post) => post.contentType === selectedContentType);
    }

    const sorted = result.slice();
    sorted.sort((a, b) => {
      if (sortOrder === 'oldest') {
        return parseDate(a.date) - parseDate(b.date);
      }
      if (sortOrder === 'shortest') {
        return (a.readingTime || 0) - (b.readingTime || 0);
      }
      if (sortOrder === 'longest') {
        return (b.readingTime || 0) - (a.readingTime || 0);
      }
      return parseDate(b.date) - parseDate(a.date);
    });

    return sorted;
  }, [posts, searchTerm, selectedTag, selectedContentType, sortOrder]);

  const featuredPost = useMemo(
    () => filteredPosts.find((post) => post.featured),
    [filteredPosts]
  );

  const heroEpisode = useMemo(
    () => featuredPost || (filteredPosts.length ? filteredPosts[0] : null),
    [featuredPost, filteredPosts]
  );

  const postsWithoutHeroEpisode = useMemo(() => {
    if (!heroEpisode) {
      return filteredPosts;
    }
    const heroId = getPostIdentifier(heroEpisode);
    return filteredPosts.filter((post) => getPostIdentifier(post) !== heroId);
  }, [filteredPosts, heroEpisode]);

  const bookmarkedPosts = useMemo(
    () => posts.filter((post) => bookmarkedIds.has(getPostIdentifier(post))),
    [posts, bookmarkedIds]
  );

  const scrollToTop = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const focusSearchField = useCallback(() => {
    setIsFilterMenuOpen(true);
    if (searchInputRef.current && typeof searchInputRef.current.focus === 'function') {
      searchInputRef.current.focus({ preventScroll: false });
    }
  }, []);

  const handleChangePage = useCallback((nextPage) => {
    setCurrentPost(null);
    setPage(nextPage);
    scrollToTop();
  }, [scrollToTop]);

  const handleOpenPost = useCallback((post) => {
    setCurrentPost(post);
    setPage('blog');
    scrollToTop();
  }, [scrollToTop]);

  const handleBackToPosts = useCallback(() => {
    setCurrentPost(null);
    scrollToTop();
  }, [scrollToTop]);

  const toggleFilterMenu = useCallback(() => {
    setIsFilterMenuOpen((prev) => !prev);
  }, []);

  const handleToggleBookmark = useCallback((post) => {
    const identifier = getPostIdentifier(post);
    if (!identifier) {
      return;
    }
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(identifier)) {
        next.delete(identifier);
      } else {
        next.add(identifier);
      }
      return next;
    });
  }, []);

  const activePage = currentPost ? 'blog' : page;
  const heroExplore = useCallback(() => handleChangePage('blog'), [handleChangePage]);

  useEffect(() => {
    if (activePage !== 'home' && activePage !== 'blog') {
      setIsFilterMenuOpen(false);
    }
  }, [activePage]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (!(event.metaKey || event.ctrlKey)) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === 'k') {
        event.preventDefault();
        focusSearchField();
      } else if (key === 'j') {
        event.preventDefault();
        handleChangePage('blog');
      } else if (key === 'd') {
        event.preventDefault();
        handleChangePage('downloads');
      } else if (key === 'h') {
        event.preventDefault();
        handleChangePage('home');
      } else if (key === 'arrowup') {
        event.preventDefault();
        scrollToTop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusSearchField, handleChangePage, scrollToTop]);

  let timelineItems = [];

  if (currentPost) {
    timelineItems = [
      React.createElement(EpisodeDetail, {
        key: 'post-detail',
        post: currentPost,
        onBack: handleBackToPosts,
        onToggleBookmark: handleToggleBookmark,
        isBookmarked: bookmarkedIds.has(getPostIdentifier(currentPost))
      })
    ];
  } else if (activePage === 'downloads') {
    const downloadsContent = DownloadsPage({ downloads });
    const baseItems = Array.isArray(downloadsContent) ? downloadsContent : [downloadsContent];
    if (isLoadingDownloads && (!downloads || !downloads.length)) {
      timelineItems = baseItems.slice(0, 1).concat(
        Array.from({ length: 2 }, (_, index) => React.createElement(EpisodeSkeleton, { key: `download-skeleton-${index}` }))
      );
    } else {
      timelineItems = baseItems;
    }
  } else if (activePage === 'about') {
    timelineItems = [React.createElement(AboutPage, { key: 'about', about, isLoading: isLoadingAbout })];
  } else {
    const filterElement = React.createElement(FilterMenu, {
      key: 'filters',
      searchTerm,
      onSearch: setSearchTerm,
      tags: uniqueTags,
      selectedTag,
      onSelectTag: setSelectedTag,
      sortOrder,
      onSortChange: setSortOrder,
      contentTypes: uniqueContentTypes,
      selectedContentType,
      onSelectContentType: setSelectedContentType,
      searchInputRef,
      isOpen: isFilterMenuOpen,
      onToggle: toggleFilterMenu
    });

    const shouldLimitHome = activePage === 'home'
      && !searchTerm
      && selectedTag === 'All'
      && selectedContentType === 'All';

    const postCollection = activePage === 'home'
      ? postsWithoutHeroEpisode.slice(0, shouldLimitHome ? 6 : postsWithoutHeroEpisode.length)
      : postsWithoutHeroEpisode;

    const listItems = isLoadingPosts
      ? Array.from({ length: 3 }, (_, index) => React.createElement(EpisodeSkeleton, { key: `skeleton-${index}` }))
      : EpisodeList({
          posts: postCollection,
          onOpen: handleOpenPost
        });

    timelineItems = [];

    if (activePage === 'home') {
      timelineItems.push(React.createElement(ShowHero, {
        key: 'hero',
        onExplore: heroExplore,
        onPlayEpisode: heroEpisode ? () => handleOpenPost(heroEpisode) : undefined,
        featuredEpisode: heroEpisode,
        totalEpisodes: filteredPosts.length
      }));
    }

    timelineItems.push(filterElement);
    timelineItems.push(
      React.createElement('section', {
        key: `episode-collection-${activePage}`,
        className: 'episode-collection'
      }, listItems)
    );
  }

  const breadcrumbSegments = useMemo(() => {
    if (currentPost) {
      return [
        { id: 'home', label: 'Home', onSelect: () => handleChangePage('home') },
        { id: 'blog', label: 'Episodes', onSelect: () => handleChangePage('blog') },
        { id: 'post', label: currentPost.title }
      ];
    }
    if (activePage === 'home') {
      return [];
    }
    if (activePage === 'blog') {
      return [
        { id: 'home', label: 'Home', onSelect: () => handleChangePage('home') },
        { id: 'blog', label: 'Episodes' }
      ];
    }
    if (activePage === 'downloads') {
      return [
        { id: 'home', label: 'Home', onSelect: () => handleChangePage('home') },
        { id: 'downloads', label: 'Downloads' }
      ];
    }
    if (activePage === 'about') {
      return [
        { id: 'home', label: 'Home', onSelect: () => handleChangePage('home') },
        { id: 'about', label: about && about.title ? about.title : 'About' }
      ];
    }
    return [];
  }, [about, activePage, currentPost, handleChangePage]);

  if (breadcrumbSegments.length) {
    timelineItems.unshift(React.createElement(Breadcrumbs, { key: 'breadcrumbs', segments: breadcrumbSegments }));
  }

  const handleBrandClick = useCallback(() => handleChangePage('home'), [handleChangePage]);

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
      React.createElement(InspectorPanel, {
        key: 'inspector',
        currentPost
      })
    ]),
    React.createElement(BottomNavigation, {
      key: 'bottom-nav',
      currentPage: activePage,
      onPageChange: handleChangePage
    }),
    React.createElement(BackToTopButton, {
      key: 'back-to-top',
      visible: showBackToTop,
      onClick: scrollToTop
    })
  ]);
}

if (typeof window !== 'undefined') {
  window.blogIconCatalog = AVAILABLE_ICONS;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(App)
);
