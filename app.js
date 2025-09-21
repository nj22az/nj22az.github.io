const { useState, useEffect, useMemo } = React;

// Minimal Lucide icon nodes used throughout the interface.
// Icon data copied from the lucide icon set: https://lucide.dev (ISC License).
const ICON_NODES = {
  'house': [
    ['path', { d: 'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8' }],
    [
      'path',
      {
        d: 'M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'
      }
    ]
  ],
  'square-pen': [
    ['path', { d: 'M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }],
    [
      'path',
      {
        d: 'M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z'
      }
    ]
  ],
  'user-round': [
    ['circle', { cx: '12', cy: '8', r: '5' }],
    ['path', { d: 'M20 21a8 8 0 0 0-16 0' }]
  ],
  'cloud-download': [
    ['path', { d: 'M12 13v8l-4-4' }],
    ['path', { d: 'm12 21 4-4' }],
    ['path', { d: 'M4.393 15.269A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.436 8.284' }]
  ],
  'sparkle': [
    [
      'path',
      {
        d: 'M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z'
      }
    ]
  ],
  'waves': [
    ['path', { d: 'M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1' }],
    ['path', { d: 'M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1' }],
    ['path', { d: 'M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1' }]
  ],
  'compass': [
    [
      'path',
      {
        d: 'm16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z'
      }
    ],
    ['circle', { cx: '12', cy: '12', r: '10' }]
  ],
  'anchor': [
    ['path', { d: 'M12 22V8' }],
    ['path', { d: 'M5 12H2a10 10 0 0 0 20 0h-3' }],
    ['circle', { cx: '12', cy: '5', r: '3' }]
  ],
  'calendar': [
    ['path', { d: 'M8 2v4' }],
    ['path', { d: 'M16 2v4' }],
    ['rect', { width: '18', height: '18', x: '3', y: '4', rx: '2' }],
    ['path', { d: 'M3 10h18' }]
  ],
  'arrow-right': [
    ['path', { d: 'M5 12h14' }],
    ['path', { d: 'm12 5 7 7-7 7' }]
  ],
  'arrow-left': [
    ['path', { d: 'm12 19-7-7 7-7' }],
    ['path', { d: 'M19 12H5' }]
  ],
  'arrow-down': [
    ['path', { d: 'M12 5v14' }],
    ['path', { d: 'm19 12-7 7-7-7' }]
  ],
  'arrow-up-right': [
    ['path', { d: 'M7 7h10v10' }],
    ['path', { d: 'M7 17 17 7' }]
  ],
  'notebook-pen': [
    ['path', { d: 'M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4' }],
    ['path', { d: 'M2 6h4' }],
    ['path', { d: 'M2 10h4' }],
    ['path', { d: 'M2 14h4' }],
    ['path', { d: 'M2 18h4' }],
    [
      'path',
      {
        d: 'M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z'
      }
    ]
  ]
};

function LucideIcon({ name, size = 20, strokeWidth = 1.8, className = '', title }) {
  const nodes = ICON_NODES[name];
  if (!nodes) {
    return null;
  }
  const children = nodes.map((node, index) => React.createElement(node[0], { ...node[1], key: index }));
  const labelled = Boolean(title);
  return React.createElement(
    'svg',
    {
      className: `lucide-icon ${className}`.trim(),
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      role: 'img',
      'aria-hidden': labelled ? 'false' : 'true'
    },
    labelled ? [React.createElement('title', { key: 'title' }, title), ...children] : children
  );
}

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: 'house' },
  { id: 'blog', label: 'Blog', icon: 'square-pen' },
  { id: 'about', label: 'About', icon: 'user-round' },
  { id: 'downloads', label: 'Downloads', icon: 'cloud-download' }
];

function DecorativeBackground() {
  return React.createElement('div', { className: 'decorative-bg', 'aria-hidden': 'true' }, [
    React.createElement('span', { key: 'orb-one', className: 'orb orb-one' }),
    React.createElement('span', { key: 'orb-two', className: 'orb orb-two' }),
    React.createElement('span', { key: 'orb-three', className: 'orb orb-three' })
  ]);
}

function Navigation({ currentPage, onChange }) {
  return React.createElement('header', { className: 'nav-shell' },
    React.createElement('div', { className: 'nav-container' }, [
      React.createElement('div', { className: 'brand', key: 'brand' }, [
        React.createElement('span', { className: 'brand-avatar', key: 'avatar' },
          React.createElement(LucideIcon, { name: 'sparkle', size: 18, strokeWidth: 1.6, title: 'Sparkle icon' })
        ),
        React.createElement('div', { className: 'brand-copy', key: 'copy' }, [
          React.createElement('span', { className: 'brand-name', key: 'name' }, 'Nils Johansson'),
          React.createElement('span', { className: 'brand-tagline', key: 'tagline' }, 'Playful engineering notes')
        ])
      ]),
      React.createElement('nav', { className: 'nav-links', key: 'links' },
        NAV_ITEMS.map((item) =>
          React.createElement('button', {
            type: 'button',
            key: item.id,
            className: `nav-link ${currentPage === item.id ? 'active' : ''}`,
            onClick: () => onChange(item.id)
          }, [
            React.createElement(LucideIcon, { name: item.icon, size: 18, strokeWidth: 1.6, key: 'icon', title: `${item.label} icon` }),
            React.createElement('span', { key: 'label' }, item.label)
          ])
        )
      ),
      React.createElement('button', {
        type: 'button',
        className: 'nav-cta',
        key: 'cta',
        onClick: () => onChange('downloads')
      }, [
        React.createElement('span', { key: 'text' }, 'Free resources'),
        React.createElement(LucideIcon, { name: 'arrow-up-right', size: 16, strokeWidth: 1.6, key: 'icon', title: 'Arrow icon' })
      ])
    ])
  );
}

function Hero({ onExploreBlog, onBrowseDownloads }) {
  const highlights = [
    {
      icon: 'sparkle',
      title: 'Playful prototypes',
      description: 'Small experiments built in the open with a sprinkle of delight.'
    },
    {
      icon: 'waves',
      title: 'Stories from the sea',
      description: 'Field notes from life as a marine engineer travelling the world.'
    },
    {
      icon: 'compass',
      title: 'Guided by people',
      description: 'Designing human-centred workflows for complex field operations.'
    }
  ];

  const metrics = [
    { value: '180k+', label: 'nautical miles logged' },
    { value: '27', label: 'playful prototypes shipped' },
    { value: '5', label: 'crews supported this year' }
  ];

  const badges = [
    { icon: 'square-pen', text: 'Fresh entry: Portside Almanac', accent: 'accent-breeze' },
    { icon: 'cloud-download', text: 'Toolkit update v2.1', accent: 'accent-sunset' },
    { icon: 'sparkle', text: 'Now prototyping in SwiftUI', accent: 'accent-mint' }
  ];

  return React.createElement('section', { className: 'hero-card card' }, [
    React.createElement('div', { className: 'hero-top', key: 'top' }, [
      React.createElement('p', { className: 'hero-eyebrow', key: 'eyebrow' }, 'Hej there!'),
      React.createElement('h1', { key: 'title' }, 'Engineering stories with a playful, Apple-inspired touch.'),
      React.createElement('p', { className: 'hero-text', key: 'text' },
        'I\'m Nils Johansson — a marine engineer turned field service engineer. This corner of the internet is where I document tinkering, travel, and the systems that keep our world humming.'
      ),
      React.createElement('div', { className: 'hero-actions', key: 'actions' }, [
        React.createElement('button', { type: 'button', className: 'button primary', key: 'blog', onClick: onExploreBlog }, [
          React.createElement(LucideIcon, { name: 'square-pen', size: 18, key: 'icon' }),
          React.createElement('span', { key: 'label' }, 'Read the blog')
        ]),
        React.createElement('button', { type: 'button', className: 'button ghost', key: 'downloads', onClick: onBrowseDownloads }, [
          React.createElement(LucideIcon, { name: 'cloud-download', size: 18, key: 'icon' }),
          React.createElement('span', { key: 'label' }, 'Grab downloads')
        ])
      ]),
      React.createElement('div', { className: 'hero-floating-badges', key: 'badges' },
        badges.map((item, index) =>
          React.createElement('span', { className: `floating-badge ${item.accent || ''}`, key: index }, [
            React.createElement(LucideIcon, { name: item.icon, size: 16, strokeWidth: 1.6, key: 'icon' }),
            React.createElement('span', { key: 'text' }, item.text)
          ])
        )
      )
    ]),
    React.createElement('div', { className: 'hero-metrics', key: 'metrics' },
      metrics.map((item, index) =>
        React.createElement('div', { className: 'hero-metric', key: index }, [
          React.createElement('span', { className: 'metric-value', key: 'value' }, item.value),
          React.createElement('span', { className: 'metric-label', key: 'label' }, item.label)
        ])
      )
    ),
    React.createElement('div', { className: 'hero-highlights', key: 'highlights' },
      highlights.map((item, index) =>
        React.createElement('div', { className: 'hero-highlight', key: index }, [
          React.createElement('span', { className: 'highlight-icon', key: 'icon' },
            React.createElement(LucideIcon, { name: item.icon, size: 18, strokeWidth: 1.7 })
          ),
          React.createElement('div', { className: 'highlight-copy', key: 'copy' }, [
            React.createElement('h3', { key: 'title' }, item.title),
            React.createElement('p', { key: 'desc' }, item.description)
          ])
        ])
      )
    )
  ]);
}

function PostCard({ post, onOpen }) {
  const handleActivate = () => onOpen(post);
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen(post);
    }
  };

  return React.createElement('article', {
    className: 'card post-card',
    onClick: handleActivate,
    onKeyDown: handleKeyDown,
    tabIndex: 0,
    role: 'button'
  }, [
    React.createElement('div', { className: 'post-card-meta', key: 'meta' }, [
      React.createElement(LucideIcon, { name: 'calendar', size: 16, strokeWidth: 1.6, key: 'icon' }),
      React.createElement('span', { key: 'date' }, post.date)
    ]),
    React.createElement('h3', { key: 'title' }, post.title),
    React.createElement('p', { key: 'excerpt' }, post.excerpt),
    React.createElement('span', { className: 'card-cta', key: 'cta' }, [
      React.createElement('span', { key: 'text' }, 'Read story'),
      React.createElement(LucideIcon, { name: 'arrow-right', size: 16, strokeWidth: 1.6, key: 'icon' })
    ])
  ]);
}

function PostList({ posts, onOpen, limit }) {
  const visiblePosts = useMemo(() => {
    if (typeof limit === 'number') {
      return posts.slice(0, limit);
    }
    return posts;
  }, [posts, limit]);

  return React.createElement('div', { className: 'grid posts-grid' },
    visiblePosts.map((post, index) =>
      React.createElement(PostCard, { post, onOpen, key: post.filename || index })
    )
  );
}

function PostView({ post, onBack }) {
  return React.createElement('article', { className: 'card post-view' }, [
    React.createElement('button', { type: 'button', className: 'button ghost back-button', key: 'back', onClick: onBack }, [
      React.createElement(LucideIcon, { name: 'arrow-left', size: 18, key: 'icon' }),
      React.createElement('span', { key: 'text' }, 'Back to list')
    ]),
    React.createElement('h2', { key: 'title' }, post.title),
    React.createElement('div', { className: 'post-view-meta', key: 'meta' }, [
      React.createElement(LucideIcon, { name: 'calendar', size: 16, key: 'icon' }),
      React.createElement('span', { key: 'date' }, post.date)
    ]),
    post.content ?
      React.createElement('div', { className: 'post-body', key: 'content', dangerouslySetInnerHTML: { __html: post.content } }) :
      React.createElement('p', { className: 'post-loading', key: 'loading' }, 'Loading post…')
  ]);
}

function DownloadsPage({ downloads }) {
  return React.createElement('section', { className: 'section downloads-section' }, [
    React.createElement('header', { className: 'section-header', key: 'header' }, [
      React.createElement('h2', { key: 'title' }, 'Downloads'),
      React.createElement('p', { key: 'summary' }, 'Take away the templates and resources that power my day-to-day work.')
    ]),
    downloads.length ?
      React.createElement('div', { className: 'grid download-grid', key: 'grid' },
        downloads.map((item, index) => React.createElement(DownloadCard, { item, key: index }))
      ) :
      React.createElement('p', { className: 'empty-state', key: 'empty' }, 'Downloads will appear here soon — stay tuned!'),
    React.createElement('article', { className: 'card download-note-card', key: 'note' }, [
      React.createElement('h3', { key: 'title' }, 'Build your own kit'),
      React.createElement('p', { key: 'body' }, 'Mix and match these resources to assemble a calm, confident field playbook.'),
      React.createElement('ul', { className: 'download-note-list', key: 'list' }, [
        React.createElement('li', { key: 'updates' }, [
          React.createElement('span', { className: 'download-note-icon', key: 'icon' },
            React.createElement(LucideIcon, { name: 'sparkle', size: 16, strokeWidth: 1.6 })
          ),
          React.createElement('span', { key: 'text' }, 'Seasonal refreshes keep layouts fresh and on-brand.')
        ]),
        React.createElement('li', { key: 'workflow' }, [
          React.createElement('span', { className: 'download-note-icon', key: 'icon' },
            React.createElement(LucideIcon, { name: 'notebook-pen', size: 16, strokeWidth: 1.6 })
          ),
          React.createElement('span', { key: 'text' }, 'Step-by-step workflows for handovers, audits, and crew onboarding.')
        ]),
        React.createElement('li', { key: 'support' }, [
          React.createElement('span', { className: 'download-note-icon', key: 'icon' },
            React.createElement(LucideIcon, { name: 'compass', size: 16, strokeWidth: 1.6 })
          ),
          React.createElement('span', { key: 'text' }, 'Guidance notes and checklists for tricky maintenance windows.')
        ])
      ])
    ])
  ]);
}

function DownloadCard({ item }) {
  return React.createElement('article', { className: 'card download-card' }, [
    React.createElement('div', { className: 'download-top', key: 'top' }, [
      React.createElement('span', { className: 'badge', key: 'badge' }, [
        React.createElement(LucideIcon, { name: 'cloud-download', size: 16, key: 'icon' }),
        React.createElement('span', { key: 'type' }, item.file_type)
      ]),
      React.createElement('span', { className: 'download-size', key: 'size' }, item.file_size)
    ]),
    React.createElement('h3', { key: 'title' }, item.title),
    React.createElement('p', { key: 'desc' }, item.description),
    React.createElement('div', { className: 'download-footer', key: 'footer' }, [
      React.createElement('span', { className: 'download-count', key: 'count' }, [
        React.createElement(LucideIcon, { name: 'arrow-down', size: 16, key: 'icon' }),
        React.createElement('span', { key: 'text' }, `${item.download_count} downloads`)
      ]),
      React.createElement('span', { className: 'download-note', key: 'note' }, 'Direct links coming soon')
    ])
  ]);
}

function AboutPage() {
  const pillars = [
    {
      icon: 'anchor',
      title: 'Roots at sea',
      description: 'Years in the engine room taught me resilience, collaboration, and steady hands.'
    },
    {
      icon: 'notebook-pen',
      title: 'Curious maker',
      description: 'I build tiny tools and design systems that make complex work feel effortless.'
    },
    {
      icon: 'compass',
      title: 'People first',
      description: 'Every project starts with empathy — from crews offshore to teams in the field.'
    }
  ];

  const timeline = [
    {
      year: '2012',
      title: 'Engine cadet',
      description: 'Began sailing the North Sea, learning the rhythms of shipboard life and collaborative maintenance.'
    },
    {
      year: '2016',
      title: 'Chief engineer',
      description: 'Led multi-national crews through upgrades, audits, and calm crisis responses.'
    },
    {
      year: '2019',
      title: 'Field service engineer',
      description: 'Brought that sea-born grit onshore to support energy teams with rapid service deployments.'
    },
    {
      year: '2024',
      title: 'Playful systems designer',
      description: 'Blending service design, storytelling, and prototyping into joyful operational tools.'
    }
  ];

  return React.createElement('div', { className: 'about-page page' }, [
    React.createElement('section', { className: 'section about-intro', key: 'intro' }, [
      React.createElement('h2', { key: 'title' }, 'About Nils'),
      React.createElement('p', { className: 'lead', key: 'lead' },
        'I am a marine engineer turned field service engineer with a love for thoughtful tools and joyful experiences.'
      ),
      React.createElement('p', { key: 'body' },
        'From maintaining vessels around the globe to supporting critical energy infrastructure, I have learned that engineering is most powerful when it centers people. This site is a living notebook of those lessons.'
      )
    ]),
    React.createElement('div', { className: 'grid about-grid', key: 'pillars' },
      pillars.map((item, index) =>
        React.createElement('article', { className: 'card about-card', key: index }, [
          React.createElement('span', { className: 'icon-chip', key: 'icon' },
            React.createElement(LucideIcon, { name: item.icon, size: 20, strokeWidth: 1.7 })
          ),
          React.createElement('h3', { key: 'title' }, item.title),
          React.createElement('p', { key: 'desc' }, item.description)
        ])
      )
    ),
    React.createElement('section', { className: 'section about-extra', key: 'extra' }, [
      React.createElement('h3', { key: 'title' }, 'Currently exploring'),
      React.createElement('ul', { key: 'list' }, [
      React.createElement('li', { key: 'playbooks' }, 'Human-centric field service playbooks'),
      React.createElement('li', { key: 'storytelling' }, 'Data storytelling with interactive dashboards'),
      React.createElement('li', { key: 'travel' }, 'Coastal cities, Nordic coffee, and new cultures')
      ])
    ]),
    React.createElement('section', { className: 'section about-timeline', key: 'timeline' }, [
      React.createElement('h3', { key: 'title' }, 'Journey so far'),
      React.createElement('div', { className: 'timeline', key: 'list' },
        timeline.map((entry, index) =>
          React.createElement('div', { className: 'timeline-item', key: index }, [
            React.createElement('span', { className: 'timeline-year', key: 'year' }, entry.year),
            React.createElement('h4', { key: 'title' }, entry.title),
            React.createElement('p', { key: 'desc' }, entry.description)
          ])
        )
      )
    ])
  ]);
}

function BlogPage({ posts, onOpen }) {
  return React.createElement('section', { className: 'section blog-section' }, [
    React.createElement('header', { className: 'section-header', key: 'header' }, [
      React.createElement('h2', { key: 'title' }, 'Blog'),
      React.createElement('p', { key: 'summary' }, 'Long-form notes on engineering, culture, and travel.')
    ]),
    posts.length ?
      React.createElement(PostList, { posts, onOpen, key: 'posts' }) :
      React.createElement('p', { className: 'empty-state', key: 'empty' }, 'New stories are on their way!')
  ]);
}

function HomePage({ posts, onOpen, onNavigate }) {
  const projects = [
    {
      icon: 'sparkle',
      label: 'Playground',
      title: 'Ocean Mapper',
      description: 'A generative logbook turning voyage data into shimmering gradients for crew briefings.',
      accent: 'tide',
      action: { label: 'See concept', target: 'blog' }
    },
    {
      icon: 'waves',
      label: 'Toolkit',
      title: 'Deckhand OS',
      description: 'Checklist-driven shortcuts and macros that keep maintenance days calm and predictable.',
      accent: 'sunrise',
      action: { label: 'Explore tools', target: 'downloads' }
    },
    {
      icon: 'compass',
      label: 'Story',
      title: 'Portside Almanac',
      description: 'A travelogue layering audio, sketches, and weather snippets from Nordic harbors.',
      accent: 'stargaze',
      action: { label: 'Read teaser', target: 'blog' }
    }
  ];

  const snapshots = [
    {
      title: 'Now shipping',
      description: 'Field service starter kit refresh with printable deck plans and cross-check flows.'
    },
    {
      title: 'From the journal',
      description: 'Designing dashboards that work without signal and still feel premium to crews.'
    },
    {
      title: 'Currently learning',
      description: 'Bridging Objective-C utilities with new SwiftUI prototypes for rapid iteration.'
    }
  ];

  const calloutPoints = [
    { icon: 'sparkle', text: 'Human-centred prototypes with a dash of whimsy.' },
    { icon: 'waves', text: 'Resilient workflows for teams at sea and in the field.' },
    { icon: 'notebook-pen', text: 'Clear documentation and service blueprints for handovers.' }
  ];

  return React.createElement('div', { className: 'home-page page' }, [
    React.createElement(Hero, {
      key: 'hero',
      onExploreBlog: () => onNavigate('blog'),
      onBrowseDownloads: () => onNavigate('downloads')
    }),
    posts.length ?
      React.createElement('section', { className: 'section home-posts', key: 'posts' }, [
        React.createElement('div', { className: 'section-header with-action', key: 'header' }, [
          React.createElement('h2', { key: 'title' }, 'Latest writing'),
          React.createElement('button', {
            type: 'button',
            className: 'text-link',
            key: 'cta',
            onClick: () => onNavigate('blog')
          }, [
            React.createElement('span', { key: 'text' }, 'View all posts'),
            React.createElement(LucideIcon, { name: 'arrow-right', size: 16, key: 'icon' })
          ])
        ]),
        React.createElement(PostList, { posts, onOpen, limit: 3, key: 'list' })
      ]) : null,
    React.createElement('section', { className: 'section home-projects', key: 'projects' }, [
      React.createElement('div', { className: 'section-header', key: 'header' }, [
        React.createElement('h2', { key: 'title' }, 'Featured playgrounds'),
        React.createElement('p', { key: 'summary' }, 'Tiny tools and experiments I\'m polishing this season.')
      ]),
      React.createElement('div', { className: 'grid project-grid', key: 'grid' },
        projects.map((project, index) =>
          React.createElement('article', { className: `card project-card ${project.accent ? `accent-${project.accent}` : ''}`, key: index }, [
            React.createElement('span', { className: 'project-icon', key: 'icon' },
              React.createElement(LucideIcon, { name: project.icon, size: 20, strokeWidth: 1.7 })
            ),
            React.createElement('span', { className: 'project-label', key: 'label' }, project.label),
            React.createElement('h3', { key: 'title' }, project.title),
            React.createElement('p', { key: 'desc' }, project.description),
            project.action ?
              React.createElement('button', {
                type: 'button',
                className: 'text-link project-cta',
                key: 'cta',
                onClick: () => onNavigate(project.action.target)
              }, [
                React.createElement('span', { key: 'text' }, project.action.label),
                React.createElement(LucideIcon, { name: 'arrow-right', size: 16, key: 'icon' })
              ]) : null
          ])
        )
      )
    ]),
    React.createElement('section', { className: 'section home-stories', key: 'stories' }, [
      React.createElement('div', { className: 'grid snapshot-grid', key: 'grid' },
        snapshots.map((item, index) =>
          React.createElement('article', { className: 'card snapshot-card', key: index }, [
            React.createElement('span', { className: 'snapshot-number', key: 'number' }, String(index + 1).padStart(2, '0')),
            React.createElement('h3', { key: 'title' }, item.title),
            React.createElement('p', { key: 'desc' }, item.description)
          ])
        )
      )
    ]),
    React.createElement('section', { className: 'section home-callout', key: 'callout' }, [
      React.createElement('article', { className: 'card callout-card', key: 'card' }, [
        React.createElement('div', { className: 'callout-content', key: 'content' }, [
          React.createElement('h3', { key: 'title' }, 'Let\'s build something delightful together'),
          React.createElement('p', { key: 'body' }, 'Whether you need a field-ready dashboard or a playful interactive, I love translating complex workflows into calm interfaces.'),
          React.createElement('ul', { className: 'callout-list', key: 'list' },
            calloutPoints.map((point, index) =>
              React.createElement('li', { key: index }, [
                React.createElement('span', { className: 'callout-icon', key: 'icon' },
                  React.createElement(LucideIcon, { name: point.icon, size: 16, strokeWidth: 1.6 })
                ),
                React.createElement('span', { className: 'callout-text', key: 'text' }, point.text)
              ])
            )
          )
        ]),
        React.createElement('div', { className: 'callout-actions', key: 'actions' }, [
          React.createElement('button', { type: 'button', className: 'button primary', key: 'about', onClick: () => onNavigate('about') }, [
            React.createElement(LucideIcon, { name: 'sparkle', size: 18, key: 'icon' }),
            React.createElement('span', { key: 'text' }, 'Meet Nils')
          ]),
          React.createElement('button', { type: 'button', className: 'button ghost', key: 'downloads', onClick: () => onNavigate('downloads') }, [
            React.createElement(LucideIcon, { name: 'cloud-download', size: 18, key: 'icon' }),
            React.createElement('span', { key: 'text' }, 'Browse resources')
          ])
        ])
      ])
    ])
  ]);
}

function Footer({ onNavigate }) {
  return React.createElement('footer', { className: 'site-footer' }, [
    React.createElement('div', { className: 'footer-main', key: 'main' }, [
      React.createElement('p', { className: 'footer-title', key: 'title' }, 'Thanks for visiting!'),
      React.createElement('p', { className: 'footer-copy', key: 'copy' },
        `\u00A9 ${new Date().getFullYear()} Nils Johansson — crafted with curiosity and coffee.`
      )
    ]),
    React.createElement('div', { className: 'footer-nav', key: 'nav' },
      NAV_ITEMS.map((item) =>
        React.createElement('button', {
          type: 'button',
          key: item.id,
          className: 'footer-link',
          onClick: () => onNavigate(item.id)
        }, item.label)
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
    fetch('posts/posts.json')
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch(() => setPosts([]));
  }, []);

  useEffect(() => {
    fetch('downloads.json')
      .then((res) => res.json())
      .then((data) => setDownloads(data))
      .catch(() => setDownloads([]));
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [page, currentPost ? currentPost.filename : null]);

  const handleNavigate = (targetPage) => {
    setCurrentPost(null);
    setPage(targetPage);
  };

  const handleOpenPost = (post) => {
    setCurrentPost({ ...post, content: null });
    fetch(`posts/${post.filename}`)
      .then((res) => res.text())
      .then((text) => {
        const html = marked.parse(text);
        setCurrentPost({ ...post, content: html });
      })
      .catch(() => {
        setCurrentPost({ ...post, content: '<p>Sorry, this post could not be loaded right now.</p>' });
      });
  };

  let content;
  if (currentPost) {
    content = React.createElement(PostView, { post: currentPost, onBack: () => setCurrentPost(null) });
  } else if (page === 'home') {
    content = React.createElement(HomePage, { posts, onOpen: handleOpenPost, onNavigate: handleNavigate });
  } else if (page === 'blog') {
    content = React.createElement(BlogPage, { posts, onOpen: handleOpenPost });
  } else if (page === 'about') {
    content = React.createElement(AboutPage);
  } else if (page === 'downloads') {
    content = React.createElement(DownloadsPage, { downloads });
  }

  return React.createElement('div', { className: 'app-shell' }, [
    React.createElement(DecorativeBackground, { key: 'bg' }),
    React.createElement(Navigation, { key: 'nav', currentPage: page, onChange: handleNavigate }),
    React.createElement('main', { key: 'main', className: 'content-area' }, content),
    React.createElement(Footer, { key: 'footer', onNavigate: handleNavigate })
  ]);
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
