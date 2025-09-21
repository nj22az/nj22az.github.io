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
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'blog', label: 'Journal', icon: 'journal' },
  { id: 'downloads', label: 'Downloads', icon: 'download' },
  { id: 'about', label: 'About', icon: 'about' }
];

function FilterBar({
  searchTerm,
  onSearch,
  tags,
  selectedTag,
  onSelectTag,
  sortOrder,
  onSortChange,
  contentTypes,
  selectedContentType,
  onSelectContentType
}) {
  const hasTags = Array.isArray(tags) && tags.length > 0;
  const hasContentTypes = Array.isArray(contentTypes) && contentTypes.length > 0;

  const tagButtons = hasTags
    ? React.createElement('div', { key: 'tags', className: 'tag-list tag-list--filters' },
        ['All', ...tags].map((tag) => React.createElement('button', {
          key: tag,
          type: 'button',
          className: 'filter-chip' + (selectedTag === tag ? ' filter-chip--active' : ''),
          onClick: () => onSelectTag(tag)
        }, tag))
      )
    : null;

  const controls = React.createElement('div', { key: 'controls', className: 'filter-bar__controls' }, [
    React.createElement('div', { key: 'sort', className: 'filter-bar__control' }, [
      React.createElement('label', {
        key: 'label',
        htmlFor: 'sort-order',
        className: 'filter-bar__label'
      }, 'Sort'),
      React.createElement('select', {
        key: 'input',
        id: 'sort-order',
        className: 'filter-bar__select',
        value: sortOrder,
        onChange: (event) => onSortChange(event.target.value)
      }, SORT_OPTIONS.map(({ id, label }) =>
        React.createElement('option', { key: id, value: id }, label)
      ))
    ]),
    hasContentTypes
      ? React.createElement('div', { key: 'type', className: 'filter-bar__control' }, [
          React.createElement('label', {
            key: 'label',
            htmlFor: 'content-type',
            className: 'filter-bar__label'
          }, 'Content type'),
          React.createElement('select', {
            key: 'input',
            id: 'content-type',
            className: 'filter-bar__select',
            value: selectedContentType,
            onChange: (event) => onSelectContentType(event.target.value)
          }, ['All', ...contentTypes].map((type) =>
            React.createElement('option', { key: type, value: type }, type)
          ))
        ])
      : null
  ].filter(Boolean));

  return React.createElement('div', { className: 'filter-bar app-frame' }, [
    React.createElement('div', { key: 'primary', className: 'filter-bar__row' }, [
      React.createElement('label', {
        key: 'search-label',
        htmlFor: 'search-field',
        className: 'visually-hidden'
      }, 'Search posts'),
      React.createElement('div', { key: 'search', className: 'search-field' },
        React.createElement('input', {
          id: 'search-field',
          type: 'search',
          value: searchTerm,
          placeholder: 'Search posts and resources…',
          onChange: (event) => onSearch(event.target.value),
          className: 'search-field__input'
        })
      ),
      controls
    ]),
    tagButtons
  ].filter(Boolean));
}

function Navigation({ currentPage, onPageChange, onBrandClick }) {
  return React.createElement('header', { className: 'masthead' },
    React.createElement('div', { className: 'masthead__inner' }, [
      React.createElement('button', {
        type: 'button',
        className: 'masthead__brand',
        onClick: onBrandClick,
        key: 'brand'
      }, [
        React.createElement('span', { key: 'glyph', className: 'masthead__glyph', 'aria-hidden': 'true' }),
        React.createElement('span', { key: 'copy', className: 'masthead__text' }, [
          React.createElement('span', { key: 'name', className: 'masthead__name' }, 'Nils Johansson'),
          React.createElement('span', { key: 'role', className: 'masthead__meta' }, 'Field Service Engineer')
        ])
      ]),
      React.createElement('nav', { className: 'masthead__nav', key: 'nav', 'aria-label': 'Primary navigation' },
        NAV_ITEMS.map(({ id, label, icon }) =>
          React.createElement('button', {
            type: 'button',
            key: id,
            className: 'masthead__link',
            'aria-current': currentPage === id ? 'page' : undefined,
            onClick: () => onPageChange(id)
          }, [
            React.createElement(MonoIcon, {
              key: 'icon',
              name: icon,
              className: 'masthead__icon',
              tone: currentPage === id ? ICON_TONES.active : ICON_TONES.neutral
            }),
            React.createElement('span', { key: 'label' }, label)
          ])
        )
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

function Hero({ onExplore }) {
  const handleExplore = () => {
    if (typeof onExplore === 'function') {
      onExplore();
    }
  };

  return React.createElement('section', { className: 'hero app-frame' }, [
    React.createElement('div', { key: 'content', className: 'hero__content' }, [
      React.createElement('span', { key: 'badge', className: 'hero__badge' }, 'Field service engineer · Global deployments'),
      React.createElement('h1', { key: 'headline', className: 'hero__headline' }, 'Field operations journal'),
      React.createElement('p', { key: 'subhead', className: 'hero__subhead' }, 'Carefully captured dispatches from live deployments—use them to brief teams, align expectations, and ship confidently.'),
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
    ])
  ]);
}

function FeaturedPostCard({ post, onOpen, onToggleBookmark, isBookmarked }) {
  if (!post) {
    return null;
  }

  const handleClick = () => onOpen(post);
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen(post);
    }
  };

  const handleBookmark = (event) => {
    event.stopPropagation();
    if (typeof onToggleBookmark === 'function') {
      onToggleBookmark(post);
    }
  };

  const hasTags = Array.isArray(post.tags) && post.tags.length;
  const primaryTag = hasTags ? post.tags[0] : undefined;
  const additionalTagCount = hasTags && post.tags.length > 1 ? ` +${post.tags.length - 1}` : '';

  const stats = [
    { id: 'read', icon: 'clock', label: `${post.readingTime} min` }
  ];

  if (primaryTag) {
    stats.push({ id: 'tag', icon: 'tag', label: `${primaryTag}${additionalTagCount}` });
  }

  return React.createElement('article', {
    className: 'featured-card app-frame',
    role: 'button',
    tabIndex: 0,
    onClick: handleClick,
    onKeyDown: handleKeyDown
  }, [
    React.createElement('header', { key: 'head', className: 'featured-card__header' }, [
      React.createElement('div', { key: 'icon', className: 'featured-card__icon' },
        React.createElement(MonoIcon, { name: post.coverIcon || 'journal', tone: ICON_TONES.active })
      ),
      React.createElement('div', { key: 'meta', className: 'featured-card__meta-block' }, [
        React.createElement('span', { key: 'badge', className: 'featured-card__badge' }, 'Featured dispatch'),
        React.createElement('span', { key: 'category', className: 'featured-card__category' }, `${post.categoryLabel} · ${post.displayDate}`),
        React.createElement('h2', { key: 'title', className: 'featured-card__title' }, post.title)
      ]),
      React.createElement('button', {
        key: 'bookmark',
        type: 'button',
        className: 'icon-button icon-button--bookmark featured-card__bookmark',
        onClick: handleBookmark,
        'aria-pressed': isBookmarked
      }, [
        React.createElement('span', { key: 'label', className: 'visually-hidden' }, isBookmarked ? 'Remove bookmark' : 'Save for later'),
        React.createElement(MonoIcon, {
          key: 'icon',
          name: isBookmarked ? 'bookmark-filled' : 'bookmark',
          className: 'icon-button__glyph',
          tone: isBookmarked ? ICON_TONES.active : ICON_TONES.neutral
        })
      ])
    ]),
    React.createElement('p', { key: 'excerpt', className: 'featured-card__excerpt' }, post.excerpt),
    stats.length
      ? React.createElement('div', { key: 'stats', className: 'timeline-card__stats' },
          stats.map(({ id, icon, label }) => React.createElement('span', { className: 'timeline-card__stat', key: id }, [
            React.createElement(MonoIcon, { key: 'icon', name: icon, className: 'timeline-card__stat-icon' }),
            React.createElement('span', { key: 'label' }, label)
          ]))
        )
      : null,
    React.createElement('div', { key: 'footer', className: 'featured-card__footer' }, [
      React.createElement('span', { key: 'cta', className: 'featured-card__cta' }, 'Read the full field report'),
      React.createElement('button', {
        key: 'bookmark',
        type: 'button',
        className: 'pill-button pill-button--ghost',
        onClick: handleBookmark
      }, isBookmarked ? 'Bookmarked' : 'Save for later')
    ])
  ]);
}

function PostCard({ post, onOpen, onToggleBookmark, isBookmarked, accent }) {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen(post);
    }
  };

  const handleBookmark = (event) => {
    event.stopPropagation();
    if (typeof onToggleBookmark === 'function') {
      onToggleBookmark(post);
    }
  };

  const hasTags = Array.isArray(post.tags) && post.tags.length;
  const primaryTag = hasTags ? post.tags[0] : undefined;
  const additionalTagCount = hasTags && post.tags.length > 1 ? ` +${post.tags.length - 1}` : '';

  const stats = [
    { id: 'read', icon: 'clock', label: `${post.readingTime} min` }
  ];

  if (primaryTag) {
    stats.push({ id: 'tag', icon: 'tag', label: `${primaryTag}${additionalTagCount}` });
  }

  return React.createElement('article', {
    className: 'timeline-card timeline-card--post',
    role: 'button',
    tabIndex: 0,
    onClick: () => onOpen(post),
    onKeyDown: handleKeyDown
  }, [
    React.createElement('header', { key: 'head', className: 'timeline-card__header' }, [
      React.createElement('div', { key: 'icon', className: 'timeline-card__icon' },
        React.createElement(MonoIcon, { name: post.coverIcon || 'journal', tone: accent })
      ),
      React.createElement('div', { key: 'heading', className: 'timeline-card__meta-block' }, [
        React.createElement('span', { key: 'category', className: 'timeline-card__category' }, `${post.categoryLabel} · ${post.displayDate}`),
        React.createElement('h3', { key: 'title', className: 'timeline-card__title' }, post.title)
      ]),
      React.createElement('button', {
        key: 'bookmark',
        type: 'button',
        className: 'icon-button icon-button--bookmark',
        onClick: handleBookmark,
        'aria-pressed': isBookmarked
      }, [
        React.createElement('span', {
          key: 'label',
          className: 'visually-hidden'
        }, isBookmarked ? 'Remove bookmark' : 'Save for later'),
        React.createElement(MonoIcon, {
          key: 'icon',
          name: isBookmarked ? 'bookmark-filled' : 'bookmark',
          className: 'icon-button__glyph',
          tone: isBookmarked ? ICON_TONES.active : ICON_TONES.neutral
        })
      ])
    ]),
    React.createElement('p', { key: 'excerpt', className: 'timeline-card__excerpt' }, post.excerpt),
    stats.length
      ? React.createElement('div', { key: 'stats', className: 'timeline-card__stats' },
          stats.map(({ id, icon, label }) => React.createElement('span', { className: 'timeline-card__stat', key: id }, [
            React.createElement(MonoIcon, { key: 'icon', name: icon, className: 'timeline-card__stat-icon' }),
            React.createElement('span', { key: 'label' }, label)
          ]))
        )
      : null,
    React.createElement('div', { key: 'action', className: 'timeline-card__actions' }, [
      React.createElement('span', { key: 'hint', className: 'timeline-card__action' }, 'Open post'),
      React.createElement(MonoIcon, {
        key: 'chevron',
        name: 'chevron',
        className: 'timeline-card__chevron'
      })
    ])
  ]);
}

function PostList({ posts, onOpen, onToggleBookmark, bookmarkedIds }) {
  if (!Array.isArray(posts) || !posts.length) {
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
      onToggleBookmark,
      isBookmarked: Boolean(bookmarkedIds && bookmarkedIds.has(getPostIdentifier(post))),
      accent: CARD_COLOR_POOL[index % CARD_COLOR_POOL.length],
      key: getPostIdentifier(post) || index
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

function PostView({ post, onBack, onToggleBookmark, isBookmarked }) {
  const handleBookmark = () => {
    if (typeof onToggleBookmark === 'function') {
      onToggleBookmark(post);
    }
  };

  return React.createElement('article', { className: 'timeline-card post-detail-card' }, [
    React.createElement('header', { key: 'head', className: 'timeline-card__header timeline-card__header--detail' }, [
      React.createElement('div', { key: 'icon', className: 'timeline-card__icon' },
        React.createElement(MonoIcon, { name: post.coverIcon || 'journal', tone: ICON_TONES.active })
      ),
      React.createElement('div', { key: 'heading', className: 'timeline-card__heading' }, [
        React.createElement('span', { key: 'category', className: 'timeline-card__badge' }, post.categoryLabel),
        React.createElement('h1', { key: 'title', className: 'timeline-card__title' }, post.title),
        React.createElement('span', { key: 'meta', className: 'timeline-card__meta' }, `${post.displayDate} · ${post.readingTime} min read`)
      ]),
      React.createElement('div', { key: 'actions', className: 'timeline-card__detail-actions' }, [
        React.createElement('button', {
          key: 'bookmark',
          type: 'button',
          className: 'icon-button icon-button--bookmark',
          onClick: handleBookmark,
          'aria-pressed': isBookmarked
        }, [
          React.createElement('span', {
            key: 'label',
            className: 'visually-hidden'
          }, isBookmarked ? 'Remove bookmark' : 'Save for later'),
          React.createElement(MonoIcon, {
            key: 'icon',
            name: isBookmarked ? 'bookmark-filled' : 'bookmark',
            className: 'icon-button__glyph',
            tone: isBookmarked ? ICON_TONES.active : ICON_TONES.neutral
          })
        ]),
        React.createElement('button', {
          key: 'back',
          type: 'button',
          className: 'pill-button',
          onClick: onBack
        }, 'Back')
      ])
    ]),
    post.tags && post.tags.length
      ? React.createElement('div', { key: 'meta', className: 'tag-list tag-list--detail' },
          post.tags.map((tag) => React.createElement('span', { className: 'tag-chip', key: tag }, tag))
        )
      : null,
    React.createElement(ShareBar, { key: 'share', post }),
    React.createElement('div', {
      key: 'body',
      className: 'timeline-card__body content',
      dangerouslySetInnerHTML: { __html: post.content }
    })
  ]);
}

function DownloadCard({ item, accent, relatedItems }) {
  const metaItems = [
    item.file_type ? `Format: ${item.file_type}` : null,
    item.file_size ? `Size: ${item.file_size}` : null,
    typeof item.download_count === 'number' ? `${item.download_count} downloads` : null
  ].filter(Boolean);

  const isExternal = typeof item.url === 'string' && /^https?:\/\//i.test(item.url);

  return React.createElement('article', { className: 'download-card app-frame' }, [
    React.createElement('div', { key: 'preview', className: 'download-card__preview' },
      item.thumbnail
        ? React.createElement('img', { src: item.thumbnail, alt: `${item.title} preview` })
        : React.createElement(MonoIcon, { name: 'download', tone: accent })
    ),
    React.createElement('div', { key: 'body', className: 'download-card__body' }, [
      React.createElement('header', { key: 'header', className: 'download-card__header' }, [
        React.createElement('span', { key: 'category', className: 'download-card__badge' }, item.category || 'Resources'),
        React.createElement('h3', { key: 'title', className: 'download-card__title' }, item.title),
        metaItems.length
          ? React.createElement('span', { key: 'meta', className: 'download-card__meta' }, metaItems.join(' · '))
          : null
      ]),
      React.createElement('p', { key: 'description', className: 'download-card__description' }, item.description),
      item.tags && item.tags.length
        ? React.createElement('div', { key: 'tags', className: 'tag-list tag-list--inline' },
            item.tags.map((tag) => React.createElement('span', { className: 'tag-chip', key: tag }, tag))
          )
        : null,
      React.createElement('div', { key: 'actions', className: 'download-card__actions' }, [
        item.url
          ? React.createElement('a', {
              key: 'download',
              className: 'primary-button primary-button--small',
              href: item.url,
              target: isExternal ? '_blank' : undefined,
              rel: isExternal ? 'noreferrer noopener' : undefined
            }, 'Download')
          : null,
        metaItems[2]
          ? React.createElement('span', { key: 'count', className: 'download-card__counter' }, metaItems[2])
          : null
      ]),
      relatedItems && relatedItems.length
        ? React.createElement('div', { key: 'related', className: 'download-card__related' }, [
            React.createElement('span', { key: 'label', className: 'download-card__related-label' }, 'Related resources'),
            React.createElement('ul', { key: 'list' },
              relatedItems.map((resource) =>
                React.createElement('li', { key: resource.title }, resource.title)
              )
            )
          ])
        : null
    ])
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

  const byTitle = new Map(downloads.map((item) => [item.title, item]));
  const grouped = downloads.reduce((acc, item) => {
    const key = item.category || 'Resources';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

  const sections = Object.entries(grouped).map(([category, items], sectionIndex) =>
    React.createElement('section', { key: category, className: 'downloads-section app-frame' }, [
      React.createElement('header', { key: 'header', className: 'downloads-section__header' }, [
        React.createElement('h2', { key: 'title' }, category),
        React.createElement('span', { key: 'count', className: 'downloads-section__count' }, `${items.length} resource${items.length > 1 ? 's' : ''}`)
      ]),
      React.createElement('div', { key: 'grid', className: 'downloads-grid' },
        items.map((item, index) => {
          const relatedItems = Array.isArray(item.related)
            ? item.related.map((name) => byTitle.get(name)).filter(Boolean)
            : [];
          return React.createElement(DownloadCard, {
            item,
            relatedItems,
            accent: CARD_COLOR_POOL[(sectionIndex + index) % CARD_COLOR_POOL.length],
            key: item.title
          });
        })
      )
    ])
  );

  return [headerCard, ...sections];
}

function AboutPage({ about, isLoading }) {
  if (isLoading) {
    return React.createElement(PostSkeleton, { key: 'about-skeleton' });
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

function SecondaryPanel({ page, downloads, bookmarkedPosts, onOpenBookmark }) {
  const hasDownloads = Array.isArray(downloads) && downloads.length && page !== 'downloads';
  const hasBookmarks = Array.isArray(bookmarkedPosts) && bookmarkedPosts.length;

  if (!hasDownloads && !hasBookmarks) {
    return null;
  }

  const featuredDownloads = hasDownloads ? downloads.slice(0, 3) : [];
  const bookmarkDisplay = hasBookmarks ? bookmarkedPosts.slice(0, 5) : [];
  const bookmarkOverflow = hasBookmarks && bookmarkedPosts.length > 5 ? bookmarkedPosts.length - 5 : 0;

  return React.createElement('aside', { className: 'context-panel' }, [
    hasBookmarks
      ? React.createElement('div', { key: 'bookmarks', className: 'context-card' }, [
          React.createElement('h3', { key: 'title', className: 'context-card__title' }, 'Bookmarked'),
          React.createElement('ul', { key: 'list', className: 'context-card__list' },
            bookmarkDisplay.map((post) =>
              React.createElement('li', { key: getPostIdentifier(post) },
                React.createElement('button', {
                  type: 'button',
                  onClick: () => onOpenBookmark(post)
                }, post.title)
              )
            ).concat(bookmarkOverflow
              ? [React.createElement('li', { key: 'more', className: 'context-card__more' }, `+${bookmarkOverflow} more`)]
              : []
            )
          )
        ])
      : null,
    hasDownloads
      ? React.createElement('div', { key: 'downloads', className: 'context-card' }, [
          React.createElement('h3', { key: 'title', className: 'context-card__title' }, 'Downloads'),
          React.createElement('ul', { key: 'list', className: 'context-card__list' },
            featuredDownloads.map((item) =>
              React.createElement('li', { key: item.title }, item.title)
            )
          )
        ])
      : null
  ].filter(Boolean));
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

function PostSkeleton() {
  return React.createElement('div', { className: 'timeline-card skeleton-card' }, [
    React.createElement('div', { key: 'header', className: 'skeleton-card__header' }),
    React.createElement('div', { key: 'line1', className: 'skeleton-card__line skeleton-card__line--wide' }),
    React.createElement('div', { key: 'line2', className: 'skeleton-card__line' }),
    React.createElement('div', { key: 'line3', className: 'skeleton-card__line skeleton-card__line--short' })
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

  useEffect(() => {
    setIsLoadingPosts(true);
    fetch('posts.json')
      .then((res) => res.json())
      .then((data) => setPosts(data.map(enhancePost)))
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

  const postsWithoutFeatured = useMemo(() => {
    if (!featuredPost) {
      return filteredPosts;
    }
    const featuredId = getPostIdentifier(featuredPost);
    return filteredPosts.filter((post) => getPostIdentifier(post) !== featuredId);
  }, [filteredPosts, featuredPost]);

  const bookmarkedPosts = useMemo(
    () => posts.filter((post) => bookmarkedIds.has(getPostIdentifier(post))),
    [posts, bookmarkedIds]
  );

  const scrollToTop = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  let timelineItems = [];

  if (currentPost) {
    timelineItems = [
      React.createElement(PostView, {
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
        Array.from({ length: 2 }, (_, index) => React.createElement(PostSkeleton, { key: `download-skeleton-${index}` }))
      );
    } else {
      timelineItems = baseItems;
    }
  } else if (activePage === 'about') {
    timelineItems = [React.createElement(AboutPage, { key: 'about', about, isLoading: isLoadingAbout })];
  } else {
    const filterElement = React.createElement(FilterBar, {
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
      onSelectContentType: setSelectedContentType
    });

    const shouldLimitHome = activePage === 'home'
      && !searchTerm
      && selectedTag === 'All'
      && selectedContentType === 'All';

    const postCollection = activePage === 'home'
      ? postsWithoutFeatured.slice(0, shouldLimitHome ? 6 : postsWithoutFeatured.length)
      : postsWithoutFeatured;

    const listItems = isLoadingPosts
      ? Array.from({ length: 3 }, (_, index) => React.createElement(PostSkeleton, { key: `skeleton-${index}` }))
      : PostList({
          posts: postCollection,
          onOpen: handleOpenPost,
          onToggleBookmark: handleToggleBookmark,
          bookmarkedIds
        });

    timelineItems = [];

    if (activePage === 'home') {
      timelineItems.push(React.createElement(Hero, { key: 'hero', onExplore: heroExplore }));
      if (!isLoadingPosts && featuredPost) {
        timelineItems.push(React.createElement(FeaturedPostCard, {
          key: 'featured',
          post: featuredPost,
          onOpen: handleOpenPost,
          onToggleBookmark: handleToggleBookmark,
          isBookmarked: bookmarkedIds.has(getPostIdentifier(featuredPost))
        }));
      }
    }

    timelineItems.push(filterElement);
    timelineItems = timelineItems.concat(listItems);
  }

  const breadcrumbSegments = useMemo(() => {
    if (currentPost) {
      return [
        { id: 'home', label: 'Home', onSelect: () => handleChangePage('home') },
        { id: 'blog', label: 'Journal', onSelect: () => handleChangePage('blog') },
        { id: 'post', label: currentPost.title }
      ];
    }
    if (activePage === 'home') {
      return [];
    }
    if (activePage === 'blog') {
      return [
        { id: 'home', label: 'Home', onSelect: () => handleChangePage('home') },
        { id: 'blog', label: 'Journal' }
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
      React.createElement(SecondaryPanel, {
        key: 'panel',
        page: activePage,
        downloads,
        bookmarkedPosts,
        onOpenBookmark: handleOpenPost
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
