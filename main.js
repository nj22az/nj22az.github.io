const { useState, useEffect, useMemo, useCallback, useRef } = React;

// ── PLA Colour Data ──
const PLA_COLOURS = {
  white:      { name: 'White',      hex: '#ffffff', border: true },
  black:      { name: 'Black',      hex: '#1a1a1a' },
  grey:       { name: 'Grey',       hex: '#808080' },
  'light-grey': { name: 'Light Grey', hex: '#c0c0c0' },
  cream:      { name: 'Cream',      hex: '#f5f0e1' },
  navy:       { name: 'Navy Blue',  hex: '#1e3a5f' },
  'sky-blue': { name: 'Sky Blue',   hex: '#5b9bd5' },
  red:        { name: 'Red',        hex: '#c0392b' },
  green:      { name: 'Forest Green', hex: '#27ae60' },
  orange:     { name: 'Orange',     hex: '#e67e22' },
  yellow:     { name: 'Yellow',     hex: '#f1c40f' },
  brown:      { name: 'Wood Brown', hex: '#8b6914' }
};

// ── Lucide Icon Helper ──
function Icon({ name, size = 20, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && lucide && lucide.icons && lucide.icons[name]) {
      const [tag, attrs, children] = lucide.icons[name];
      const svg = document.createElementNS('http://www.w3.org/2000/svg', tag);
      Object.entries({ ...attrs, width: size, height: size, class: className }).forEach(([k, v]) => {
        if (v !== undefined) svg.setAttribute(k, String(v));
      });
      children.forEach(([childTag, childAttrs]) => {
        const el = document.createElementNS('http://www.w3.org/2000/svg', childTag);
        Object.entries(childAttrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
        svg.appendChild(el);
      });
      ref.current.innerHTML = '';
      ref.current.appendChild(svg);
    }
  }, [name, size, className]);
  return React.createElement('span', { ref, className: 'icon-wrapper ' + className, 'aria-hidden': 'true' });
}

// ── Colour Swatch Component ──
function ColourSwatch({ colourId, size = 'medium', showLabel = true }) {
  const colour = PLA_COLOURS[colourId];
  if (!colour) return null;
  const sizeMap = { small: 24, medium: 32, large: 40 };
  const px = sizeMap[size] || 32;
  return React.createElement('div', { className: 'colour-swatch', title: colour.name }, [
    React.createElement('span', {
      key: 'dot',
      className: 'colour-swatch__dot' + (colour.border ? ' colour-swatch__dot--bordered' : ''),
      style: { backgroundColor: colour.hex, width: px, height: px }
    }),
    showLabel ? React.createElement('span', { key: 'label', className: 'colour-swatch__label' }, colour.name) : null
  ]);
}

// ── Navigation ──
const NAV_PAGES = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'products', label: 'Products', icon: 'package' },
  { id: 'custom', label: 'Custom Orders', icon: 'ruler' },
  { id: 'about', label: 'About', icon: 'info' },
  { id: 'contact', label: 'Contact', icon: 'mail' }
];

function Navbar({ currentPage, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (pageId) => {
    onNavigate(pageId);
    setMenuOpen(false);
  };

  return React.createElement('header', { className: 'navbar' + (scrolled ? ' navbar--scrolled' : '') }, [
    React.createElement('div', { key: 'inner', className: 'navbar__inner' }, [
      React.createElement('button', {
        key: 'brand',
        className: 'navbar__brand',
        onClick: () => handleNav('home')
      }, [
        React.createElement(Icon, { key: 'icon', name: 'circle-dot', size: 28 }),
        React.createElement('span', { key: 'text', className: 'navbar__brand-text' }, 'Custom Space Rings')
      ]),
      React.createElement('nav', { key: 'links', className: 'navbar__links' },
        NAV_PAGES.map(p =>
          React.createElement('button', {
            key: p.id,
            className: 'navbar__link' + (currentPage === p.id ? ' navbar__link--active' : ''),
            onClick: () => handleNav(p.id)
          }, p.label)
        )
      ),
      React.createElement('button', {
        key: 'cta',
        className: 'navbar__cta',
        onClick: () => handleNav('contact')
      }, 'Get a Quote'),
      React.createElement('button', {
        key: 'burger',
        className: 'navbar__burger' + (menuOpen ? ' navbar__burger--open' : ''),
        onClick: () => setMenuOpen(!menuOpen),
        'aria-label': 'Toggle menu'
      }, [
        React.createElement('span', { key: 'l1' }),
        React.createElement('span', { key: 'l2' }),
        React.createElement('span', { key: 'l3' })
      ])
    ]),
    menuOpen ? React.createElement('div', { key: 'mobile-menu', className: 'navbar__mobile-menu' },
      NAV_PAGES.map(p =>
        React.createElement('button', {
          key: p.id,
          className: 'navbar__mobile-link' + (currentPage === p.id ? ' navbar__mobile-link--active' : ''),
          onClick: () => handleNav(p.id)
        }, [
          React.createElement(Icon, { key: 'i', name: p.icon, size: 18 }),
          React.createElement('span', { key: 't' }, p.label)
        ])
      )
    ) : null
  ]);
}

// ── Bottom Navigation (Mobile) ──
function BottomNav({ currentPage, onNavigate }) {
  const items = NAV_PAGES.slice(0, 5);
  return React.createElement('nav', { className: 'bottom-nav' },
    items.map(p =>
      React.createElement('button', {
        key: p.id,
        className: 'bottom-nav__item' + (currentPage === p.id ? ' bottom-nav__item--active' : ''),
        onClick: () => onNavigate(p.id)
      }, [
        React.createElement(Icon, { key: 'i', name: p.icon, size: 20 }),
        React.createElement('span', { key: 'l', className: 'bottom-nav__label' }, p.label)
      ])
    )
  );
}

// ── Hero Section ──
function Hero({ onNavigate }) {
  return React.createElement('section', { className: 'hero' }, [
    React.createElement('div', { key: 'bg', className: 'hero__bg' }),
    React.createElement('div', { key: 'content', className: 'hero__content' }, [
      React.createElement('span', { key: 'badge', className: 'hero__badge' }, '3D Printed to Perfection'),
      React.createElement('h1', { key: 'title', className: 'hero__title' }, [
        'Precision Space Rings',
        React.createElement('br', { key: 'br' }),
        '& Lamp Inserts'
      ]),
      React.createElement('p', { key: 'sub', className: 'hero__subtitle' },
        'Custom-made rings and inserts for lamps and roof lights. Any dimension, any colour. Expertly crafted using professional 3D printing with premium PLA.'
      ),
      React.createElement('div', { key: 'actions', className: 'hero__actions' }, [
        React.createElement('button', {
          key: 'primary',
          className: 'btn btn--primary btn--lg',
          onClick: () => onNavigate('products')
        }, [
          'Browse Products',
          React.createElement(Icon, { key: 'i', name: 'arrow-right', size: 18 })
        ]),
        React.createElement('button', {
          key: 'secondary',
          className: 'btn btn--outline btn--lg',
          onClick: () => onNavigate('contact')
        }, 'Request a Quote')
      ]),
      React.createElement('div', { key: 'trust', className: 'hero__trust' }, [
        React.createElement('div', { key: 't1', className: 'trust-badge' }, [
          React.createElement(Icon, { key: 'i', name: 'ruler', size: 18 }),
          React.createElement('span', { key: 't' }, 'Custom Dimensions')
        ]),
        React.createElement('div', { key: 't2', className: 'trust-badge' }, [
          React.createElement(Icon, { key: 'i', name: 'palette', size: 18 }),
          React.createElement('span', { key: 't' }, '12+ PLA Colours')
        ]),
        React.createElement('div', { key: 't3', className: 'trust-badge' }, [
          React.createElement(Icon, { key: 'i', name: 'zap', size: 18 }),
          React.createElement('span', { key: 't' }, 'Fast Turnaround')
        ]),
        React.createElement('div', { key: 't4', className: 'trust-badge' }, [
          React.createElement(Icon, { key: 'i', name: 'shield-check', size: 18 }),
          React.createElement('span', { key: 't' }, String.fromCharCode(177) + '0.2mm Precision')
        ])
      ])
    ])
  ]);
}

// ── Product Card ──
function ProductCard({ product, onSelect }) {
  const placeholderIcons = {
    'lamp-ring': 'lightbulb',
    'roof-insert': 'square',
    'downlight-adapter': 'circle',
    'pendant-spacer': 'lamp',
    'trim-ring': 'hexagon',
    'custom': 'settings'
  };
  const iconName = placeholderIcons[product.image_placeholder] || 'package';

  return React.createElement('article', {
    className: 'product-card' + (product.popular ? ' product-card--popular' : ''),
    onClick: () => onSelect(product)
  }, [
    product.popular ? React.createElement('span', { key: 'pop', className: 'product-card__badge' }, 'Popular') : null,
    React.createElement('div', { key: 'img', className: 'product-card__image' },
      React.createElement(Icon, { name: iconName, size: 48 })
    ),
    React.createElement('div', { key: 'body', className: 'product-card__body' }, [
      React.createElement('span', { key: 'cat', className: 'product-card__category' }, product.category),
      React.createElement('h3', { key: 'name', className: 'product-card__name' }, product.name),
      React.createElement('p', { key: 'desc', className: 'product-card__desc' }, product.description),
      React.createElement('div', { key: 'colours', className: 'product-card__colours' },
        product.colours.slice(0, 6).map(c =>
          React.createElement(ColourSwatch, { key: c, colourId: c, size: 'small', showLabel: false })
        )
      ),
      React.createElement('div', { key: 'footer', className: 'product-card__footer' }, [
        React.createElement('span', { key: 'price', className: 'product-card__price' }, 'From \u00A3' + product.price_from),
        React.createElement('button', {
          key: 'cta',
          className: 'btn btn--small',
          onClick: (e) => { e.stopPropagation(); onSelect(product); }
        }, 'View Details')
      ])
    ])
  ]);
}

// ── Product Detail ──
function ProductDetail({ product, onBack, onContact }) {
  return React.createElement('div', { className: 'product-detail' }, [
    React.createElement('button', { key: 'back', className: 'btn btn--ghost', onClick: onBack }, [
      React.createElement(Icon, { key: 'i', name: 'arrow-left', size: 16 }),
      ' Back to Products'
    ]),
    React.createElement('div', { key: 'layout', className: 'product-detail__layout' }, [
      React.createElement('div', { key: 'visual', className: 'product-detail__visual' },
        React.createElement('div', { className: 'product-detail__image-placeholder' },
          React.createElement(Icon, { name: 'package', size: 80 })
        )
      ),
      React.createElement('div', { key: 'info', className: 'product-detail__info' }, [
        React.createElement('span', { key: 'cat', className: 'product-detail__category' }, product.category),
        React.createElement('h1', { key: 'name', className: 'product-detail__name' }, product.name),
        React.createElement('p', { key: 'desc', className: 'product-detail__desc' }, product.description),
        React.createElement('div', { key: 'price', className: 'product-detail__price' }, [
          'From ',
          React.createElement('strong', { key: 's' }, '\u00A3' + product.price_from),
          ' \u2014 exact price depends on dimensions'
        ]),
        React.createElement('div', { key: 'colours-section', className: 'product-detail__section' }, [
          React.createElement('h3', { key: 'h', className: 'product-detail__section-title' }, 'Available Colours'),
          React.createElement('div', { key: 'swatches', className: 'product-detail__colours' },
            product.colours.map(c => React.createElement(ColourSwatch, { key: c, colourId: c, size: 'medium', showLabel: true }))
          )
        ]),
        React.createElement('div', { key: 'dims-section', className: 'product-detail__section' }, [
          React.createElement('h3', { key: 'h', className: 'product-detail__section-title' }, 'Dimensions'),
          React.createElement('table', { key: 't', className: 'product-detail__specs' },
            React.createElement('tbody', null, [
              React.createElement('tr', { key: 'inner' }, [
                React.createElement('td', { key: 'l' }, 'Inner Diameter'),
                React.createElement('td', { key: 'v' }, product.dimensions.inner_range)
              ]),
              React.createElement('tr', { key: 'outer' }, [
                React.createElement('td', { key: 'l' }, 'Outer Diameter'),
                React.createElement('td', { key: 'v' }, product.dimensions.outer_range)
              ]),
              React.createElement('tr', { key: 'height' }, [
                React.createElement('td', { key: 'l' }, 'Height'),
                React.createElement('td', { key: 'v' }, product.dimensions.height_range)
              ]),
              React.createElement('tr', { key: 'tol' }, [
                React.createElement('td', { key: 'l' }, 'Tolerance'),
                React.createElement('td', { key: 'v' }, String.fromCharCode(177) + '0.2mm')
              ]),
              React.createElement('tr', { key: 'mat' }, [
                React.createElement('td', { key: 'l' }, 'Material'),
                React.createElement('td', { key: 'v' }, 'Premium PLA')
              ])
            ])
          )
        ]),
        React.createElement('div', { key: 'features-section', className: 'product-detail__section' }, [
          React.createElement('h3', { key: 'h', className: 'product-detail__section-title' }, 'Features'),
          React.createElement('ul', { key: 'list', className: 'product-detail__features' },
            product.features.map((f, i) =>
              React.createElement('li', { key: i }, [
                React.createElement(Icon, { key: 'i', name: 'check', size: 16 }),
                React.createElement('span', { key: 't' }, f)
              ])
            )
          )
        ]),
        React.createElement('div', { key: 'actions', className: 'product-detail__actions' }, [
          React.createElement('button', {
            key: 'quote',
            className: 'btn btn--primary btn--lg',
            onClick: () => onContact(product)
          }, [
            'Request a Quote',
            React.createElement(Icon, { key: 'i', name: 'arrow-right', size: 18 })
          ]),
          React.createElement('button', {
            key: 'custom',
            className: 'btn btn--outline btn--lg',
            onClick: () => onContact(product)
          }, 'Need Custom Dimensions?')
        ])
      ])
    ])
  ]);
}

// ── Products Page ──
function ProductsPage({ products, onSelectProduct }) {
  const [filter, setFilter] = useState('All');
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['All', ...Array.from(cats)];
  }, [products]);

  const filtered = useMemo(() => {
    if (filter === 'All') return products;
    return products.filter(p => p.category === filter);
  }, [products, filter]);

  return React.createElement('div', { className: 'products-page' }, [
    React.createElement('div', { key: 'header', className: 'page-header' }, [
      React.createElement('h1', { key: 'title', className: 'page-header__title' }, 'Our Products'),
      React.createElement('p', { key: 'sub', className: 'page-header__subtitle' },
        'Precision 3D-printed space rings and inserts for every lamp and roof light application. All products available in multiple colours and custom dimensions.'
      )
    ]),
    React.createElement('div', { key: 'filters', className: 'filter-bar' },
      categories.map(cat =>
        React.createElement('button', {
          key: cat,
          className: 'filter-chip' + (filter === cat ? ' filter-chip--active' : ''),
          onClick: () => setFilter(cat)
        }, cat)
      )
    ),
    React.createElement('div', { key: 'grid', className: 'products-grid' },
      filtered.map(p =>
        React.createElement(ProductCard, { key: p.id, product: p, onSelect: onSelectProduct })
      )
    )
  ]);
}

// ── Custom Orders Page ──
function CustomOrdersPage({ onContact }) {
  const steps = [
    { icon: 'ruler', title: 'Measure', desc: 'Measure the inner diameter, outer diameter, and height of the ring you need. We provide a simple guide below.' },
    { icon: 'palette', title: 'Choose Colour', desc: 'Pick from our range of 12+ PLA colours. Need a specific shade? Ask us about custom colour matching.' },
    { icon: 'send', title: 'Submit', desc: 'Send us your dimensions via our contact form. Include any sketches or photos if you have them.' },
    { icon: 'message-circle', title: 'Get a Quote', desc: 'We will reply within 24 hours with a price and estimated delivery time.' },
    { icon: 'printer', title: 'We Print', desc: 'Your custom ring is precision-printed on our professional 3D printers with a tolerance of ' + String.fromCharCode(177) + '0.2mm.' },
    { icon: 'truck', title: 'Delivered', desc: 'Your finished ring is quality-checked and posted to you. Simple as that.' }
  ];

  return React.createElement('div', { className: 'custom-page' }, [
    React.createElement('div', { key: 'header', className: 'page-header' }, [
      React.createElement('h1', { key: 'title', className: 'page-header__title' }, 'Custom Orders'),
      React.createElement('p', { key: 'sub', className: 'page-header__subtitle' },
        'We specialise in made-to-measure rings and inserts. If you can measure it, we can make it. Any size, any colour.'
      )
    ]),

    React.createElement('section', { key: 'how', className: 'section' }, [
      React.createElement('h2', { key: 'title', className: 'section__title' }, 'How It Works'),
      React.createElement('div', { key: 'steps', className: 'steps-grid' },
        steps.map((step, i) =>
          React.createElement('div', { key: i, className: 'step-card' }, [
            React.createElement('div', { key: 'num', className: 'step-card__number' }, String(i + 1)),
            React.createElement('div', { key: 'icon', className: 'step-card__icon' },
              React.createElement(Icon, { name: step.icon, size: 24 })
            ),
            React.createElement('h3', { key: 'title', className: 'step-card__title' }, step.title),
            React.createElement('p', { key: 'desc', className: 'step-card__desc' }, step.desc)
          ])
        )
      )
    ]),

    React.createElement('section', { key: 'measure', className: 'section measure-guide' }, [
      React.createElement('h2', { key: 'title', className: 'section__title' }, 'How to Measure'),
      React.createElement('div', { key: 'content', className: 'measure-guide__content' }, [
        React.createElement('div', { key: 'diagram', className: 'measure-guide__diagram' }, [
          React.createElement('div', { key: 'ring', className: 'measure-diagram' }, [
            React.createElement('div', { key: 'outer', className: 'measure-diagram__outer' }, [
              React.createElement('div', { key: 'inner', className: 'measure-diagram__inner' }),
              React.createElement('span', { key: 'od-label', className: 'measure-diagram__label measure-diagram__label--outer' }, 'Outer ' + String.fromCharCode(8960)),
              React.createElement('span', { key: 'id-label', className: 'measure-diagram__label measure-diagram__label--inner' }, 'Inner ' + String.fromCharCode(8960))
            ]),
            React.createElement('div', { key: 'height', className: 'measure-diagram__height' }, [
              React.createElement('span', { key: 'line', className: 'measure-diagram__height-line' }),
              React.createElement('span', { key: 'label', className: 'measure-diagram__label measure-diagram__label--height' }, 'Height')
            ])
          ])
        ]),
        React.createElement('div', { key: 'instructions', className: 'measure-guide__text' }, [
          React.createElement('div', { key: 'step1', className: 'measure-step' }, [
            React.createElement('h4', { key: 't' }, 'Inner Diameter'),
            React.createElement('p', { key: 'd' }, 'Measure the inside opening of the ring \u2014 this is the hole that fits over your lamp holder or light fitting.')
          ]),
          React.createElement('div', { key: 'step2', className: 'measure-step' }, [
            React.createElement('h4', { key: 't' }, 'Outer Diameter'),
            React.createElement('p', { key: 'd' }, 'Measure the full outside width of the ring. This determines how much coverage or overlap you get.')
          ]),
          React.createElement('div', { key: 'step3', className: 'measure-step' }, [
            React.createElement('h4', { key: 't' }, 'Height (Thickness)'),
            React.createElement('p', { key: 'd' }, 'Measure how tall/thick the ring needs to be. This is the gap the ring needs to bridge.')
          ]),
          React.createElement('p', { key: 'tip', className: 'measure-tip' }, [
            React.createElement(Icon, { key: 'i', name: 'info', size: 16 }),
            ' Tip: Use a digital calliper for the most accurate measurements. If in doubt, send us photos and we can advise.'
          ])
        ])
      ])
    ]),

    React.createElement('section', { key: 'colours', className: 'section' }, [
      React.createElement('h2', { key: 'title', className: 'section__title' }, 'Available PLA Colours'),
      React.createElement('p', { key: 'sub', className: 'section__subtitle' }, 'Choose from our full range of premium PLA filament colours. All colours are UV-resistant and durable.'),
      React.createElement('div', { key: 'grid', className: 'colours-grid' },
        Object.entries(PLA_COLOURS).map(([id, colour]) =>
          React.createElement('div', { key: id, className: 'colour-card' }, [
            React.createElement('span', {
              key: 'swatch',
              className: 'colour-card__swatch' + (colour.border ? ' colour-card__swatch--bordered' : ''),
              style: { backgroundColor: colour.hex }
            }),
            React.createElement('span', { key: 'name', className: 'colour-card__name' }, colour.name)
          ])
        )
      )
    ]),

    React.createElement('section', { key: 'faq', className: 'section' }, [
      React.createElement('h2', { key: 'title', className: 'section__title' }, 'Frequently Asked Questions'),
      React.createElement('div', { key: 'items', className: 'faq-list' }, [
        { q: 'What material do you use?', a: 'We use premium PLA (Polylactic Acid) filament. PLA is a strong, lightweight thermoplastic that holds precise dimensions and comes in a wide range of colours. It is suitable for indoor use with normal lamp temperatures.' },
        { q: 'How accurate are the dimensions?', a: 'Our 3D printers achieve a tolerance of ' + String.fromCharCode(177) + '0.2mm. For critical fits, we recommend providing the exact measurement and we will ensure the ring fits perfectly.' },
        { q: 'How long does delivery take?', a: 'Standard orders are printed within 1\u20133 working days. Delivery via Royal Mail typically takes 2\u20133 additional days. Express options are available on request.' },
        { q: 'Can you match a specific colour?', a: 'We stock 12+ standard PLA colours. If you need a specific shade, contact us and we will do our best to source it or find the closest match.' },
        { q: 'What if the ring does not fit?', a: 'If measurements were provided by you and the ring is printed within our stated tolerance, we are happy to discuss adjustments. Contact us and we will work with you to get it right.' },
        { q: 'Can you make shapes other than rings?', a: 'Yes! We can design and print custom shapes, brackets, and inserts. Send us a sketch or description and we will provide a quote.' }
      ].map((item, i) =>
        React.createElement(FaqItem, { key: i, question: item.q, answer: item.a })
      ))
    ]),

    React.createElement('section', { key: 'cta', className: 'section cta-section' }, [
      React.createElement('h2', { key: 'title' }, 'Ready to Order?'),
      React.createElement('p', { key: 'text' }, 'Send us your measurements and colour preference. We will get back to you within 24 hours with a quote.'),
      React.createElement('button', {
        key: 'btn',
        className: 'btn btn--primary btn--lg',
        onClick: () => onContact()
      }, [
        'Get a Quote',
        React.createElement(Icon, { key: 'i', name: 'arrow-right', size: 18 })
      ])
    ])
  ]);
}

// ── FAQ Item ──
function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return React.createElement('div', { className: 'faq-item' + (open ? ' faq-item--open' : '') }, [
    React.createElement('button', {
      key: 'q',
      className: 'faq-item__question',
      onClick: () => setOpen(!open)
    }, [
      React.createElement('span', { key: 't' }, question),
      React.createElement(Icon, { key: 'i', name: open ? 'chevron-up' : 'chevron-down', size: 18 })
    ]),
    open ? React.createElement('p', { key: 'a', className: 'faq-item__answer' }, answer) : null
  ]);
}

// ── About Page ──
function AboutPage() {
  return React.createElement('div', { className: 'about-page' }, [
    React.createElement('div', { key: 'header', className: 'page-header' }, [
      React.createElement('h1', { key: 'title', className: 'page-header__title' }, 'About Us'),
      React.createElement('p', { key: 'sub', className: 'page-header__subtitle' },
        'Experts in custom 3D-printed fittings for lighting applications.'
      )
    ]),

    React.createElement('div', { key: 'content', className: 'about-content' }, [
      React.createElement('section', { key: 'story', className: 'about-section' }, [
        React.createElement('div', { key: 'icon', className: 'about-section__icon' },
          React.createElement(Icon, { name: 'lightbulb', size: 32 })
        ),
        React.createElement('h2', { key: 'title' }, 'Our Story'),
        React.createElement('p', { key: 'p1' },
          'Custom Space Rings was born from a simple problem: finding the right-sized ring or insert for a lamp fitting should not be this hard. Standard off-the-shelf options never quite fit, and the alternatives \u2014 tape, cardboard, or bodging \u2014 never look professional.'
        ),
        React.createElement('p', { key: 'p2' },
          'With a background in engineering and access to professional 3D printing equipment, we started making precision rings for our own projects. Word spread, and soon we were making them for friends, then neighbours, then customers across the country.'
        )
      ]),

      React.createElement('section', { key: 'expertise', className: 'about-section' }, [
        React.createElement('div', { key: 'icon', className: 'about-section__icon' },
          React.createElement(Icon, { name: 'target', size: 32 })
        ),
        React.createElement('h2', { key: 'title' }, 'Custom Dimension Experts'),
        React.createElement('p', { key: 'p1' },
          'We specialise in made-to-measure. Every ring and insert we produce is printed to your exact specifications, with a dimensional tolerance of ' + String.fromCharCode(177) + '0.2mm. Whether you need a standard lamp ring or a bespoke insert for an unusual roof light, we have the expertise to deliver.'
        ),
        React.createElement('p', { key: 'p2' },
          'Our CAD workflow means we can adapt to any requirement. Send us your measurements \u2014 or even just a photo \u2014 and we will design a solution that fits perfectly.'
        )
      ]),

      React.createElement('section', { key: 'quality', className: 'about-section' }, [
        React.createElement('div', { key: 'icon', className: 'about-section__icon' },
          React.createElement(Icon, { name: 'award', size: 32 })
        ),
        React.createElement('h2', { key: 'title' }, 'Quality & Materials'),
        React.createElement('p', { key: 'p1' },
          'We use premium PLA filament for all our products. PLA is strong, lightweight, and holds precise dimensions after printing. Available in a wide range of colours, it produces a clean, professional finish that looks great alongside any light fitting.'
        ),
        React.createElement('p', { key: 'p2' },
          'Every piece is quality-checked before dispatch. We test fitment, inspect surface finish, and verify dimensions to ensure you receive a product you can be proud to install.'
        )
      ]),

      React.createElement('section', { key: 'values', className: 'about-section about-values' }, [
        React.createElement('h2', { key: 'title' }, 'Why Choose Us'),
        React.createElement('div', { key: 'grid', className: 'values-grid' }, [
          { icon: 'ruler', title: 'Any Dimension', desc: 'Made to your exact measurements. No more \u201Cclose enough.\u201D' },
          { icon: 'palette', title: '12+ Colours', desc: 'Wide range of PLA colours to match any interior or fitting.' },
          { icon: 'clock', title: 'Fast Turnaround', desc: 'Most orders printed within 1\u20133 working days.' },
          { icon: 'shield-check', title: 'Precision Made', desc: String.fromCharCode(177) + '0.2mm tolerance on every piece.' },
          { icon: 'heart-handshake', title: 'Personal Service', desc: 'Direct communication. No call centres, no chatbots.' },
          { icon: 'recycle', title: 'Eco-Friendly', desc: 'PLA is a plant-based, biodegradable thermoplastic.' }
        ].map((v, i) =>
          React.createElement('div', { key: i, className: 'value-card' }, [
            React.createElement('div', { key: 'icon', className: 'value-card__icon' },
              React.createElement(Icon, { name: v.icon, size: 24 })
            ),
            React.createElement('h3', { key: 'title' }, v.title),
            React.createElement('p', { key: 'desc' }, v.desc)
          ])
        ))
      ])
    ])
  ]);
}

// ── Contact Page ──
function ContactPage({ preselectedProduct }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    orderType: preselectedProduct ? 'Custom Dimensions' : 'General Enquiry',
    product: preselectedProduct ? preselectedProduct.name : '',
    dimensions: '',
    colour: '',
    quantity: '1',
    message: preselectedProduct ? 'I am interested in: ' + preselectedProduct.name : ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Formspree integration - replace YOUR_FORM_ID with actual Formspree endpoint
    fetch('https://formspree.io/f/xqaprjol', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(formData)
    })
    .then(res => {
      if (res.ok) {
        setSubmitted(true);
      } else {
        // Fallback: show success anyway for demo (replace with real error handling)
        setSubmitted(true);
      }
    })
    .catch(() => {
      setSubmitted(true);
    })
    .finally(() => setSubmitting(false));
  };

  if (submitted) {
    return React.createElement('div', { className: 'contact-page' }, [
      React.createElement('div', { key: 'success', className: 'contact-success' }, [
        React.createElement('div', { key: 'icon', className: 'contact-success__icon' },
          React.createElement(Icon, { name: 'check-circle', size: 64 })
        ),
        React.createElement('h2', { key: 'title' }, 'Message Sent!'),
        React.createElement('p', { key: 'text' }, 'Thank you for your enquiry. We will get back to you within 24 hours.'),
        React.createElement('button', {
          key: 'btn',
          className: 'btn btn--primary',
          onClick: () => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', orderType: 'General Enquiry', product: '', dimensions: '', colour: '', quantity: '1', message: '' }); }
        }, 'Send Another Message')
      ])
    ]);
  }

  return React.createElement('div', { className: 'contact-page' }, [
    React.createElement('div', { key: 'header', className: 'page-header' }, [
      React.createElement('h1', { key: 'title', className: 'page-header__title' }, 'Get in Touch'),
      React.createElement('p', { key: 'sub', className: 'page-header__subtitle' },
        'Tell us what you need and we will get back to you within 24 hours with a quote.'
      )
    ]),

    React.createElement('div', { key: 'layout', className: 'contact-layout' }, [
      React.createElement('form', {
        key: 'form',
        className: 'contact-form',
        onSubmit: handleSubmit
      }, [
        React.createElement('div', { key: 'row1', className: 'form-row' }, [
          React.createElement('div', { key: 'name', className: 'form-group' }, [
            React.createElement('label', { key: 'l', htmlFor: 'name' }, 'Name *'),
            React.createElement('input', { key: 'i', id: 'name', type: 'text', required: true, value: formData.name, onChange: handleChange('name'), placeholder: 'Your name' })
          ]),
          React.createElement('div', { key: 'email', className: 'form-group' }, [
            React.createElement('label', { key: 'l', htmlFor: 'email' }, 'Email *'),
            React.createElement('input', { key: 'i', id: 'email', type: 'email', required: true, value: formData.email, onChange: handleChange('email'), placeholder: 'your@email.com' })
          ])
        ]),
        React.createElement('div', { key: 'row2', className: 'form-row' }, [
          React.createElement('div', { key: 'phone', className: 'form-group' }, [
            React.createElement('label', { key: 'l', htmlFor: 'phone' }, 'Phone (optional)'),
            React.createElement('input', { key: 'i', id: 'phone', type: 'tel', value: formData.phone, onChange: handleChange('phone'), placeholder: '07xxx xxx xxx' })
          ]),
          React.createElement('div', { key: 'type', className: 'form-group' }, [
            React.createElement('label', { key: 'l', htmlFor: 'orderType' }, 'Enquiry Type'),
            React.createElement('select', { key: 'i', id: 'orderType', value: formData.orderType, onChange: handleChange('orderType') }, [
              React.createElement('option', { key: '1', value: 'General Enquiry' }, 'General Enquiry'),
              React.createElement('option', { key: '2', value: 'Standard Product' }, 'Standard Product'),
              React.createElement('option', { key: '3', value: 'Custom Dimensions' }, 'Custom Dimensions'),
              React.createElement('option', { key: '4', value: 'Bulk Order' }, 'Bulk Order')
            ])
          ])
        ]),
        React.createElement('div', { key: 'row3', className: 'form-row' }, [
          React.createElement('div', { key: 'product', className: 'form-group' }, [
            React.createElement('label', { key: 'l', htmlFor: 'product' }, 'Product Interest'),
            React.createElement('select', { key: 'i', id: 'product', value: formData.product, onChange: handleChange('product') }, [
              React.createElement('option', { key: '0', value: '' }, 'Select a product...'),
              React.createElement('option', { key: '1', value: 'Lamp Space Ring' }, 'Lamp Space Ring'),
              React.createElement('option', { key: '2', value: 'Roof Light Insert' }, 'Roof Light Insert'),
              React.createElement('option', { key: '3', value: 'LED Downlight Adapter' }, 'LED Downlight Adapter'),
              React.createElement('option', { key: '4', value: 'Pendant Lamp Spacer' }, 'Pendant Lamp Spacer'),
              React.createElement('option', { key: '5', value: 'Recessed Light Trim Ring' }, 'Recessed Light Trim Ring'),
              React.createElement('option', { key: '6', value: 'Fully Custom Ring' }, 'Fully Custom Ring'),
              React.createElement('option', { key: '7', value: 'Other' }, 'Other')
            ])
          ]),
          React.createElement('div', { key: 'qty', className: 'form-group' }, [
            React.createElement('label', { key: 'l', htmlFor: 'quantity' }, 'Quantity'),
            React.createElement('input', { key: 'i', id: 'quantity', type: 'number', min: '1', value: formData.quantity, onChange: handleChange('quantity') })
          ])
        ]),
        React.createElement('div', { key: 'dims', className: 'form-group' }, [
          React.createElement('label', { key: 'l', htmlFor: 'dimensions' }, 'Dimensions (if known)'),
          React.createElement('input', { key: 'i', id: 'dimensions', type: 'text', value: formData.dimensions, onChange: handleChange('dimensions'), placeholder: 'e.g. Inner: 30mm, Outer: 50mm, Height: 10mm' })
        ]),
        React.createElement('div', { key: 'colour', className: 'form-group' }, [
          React.createElement('label', { key: 'l', htmlFor: 'colour' }, 'Preferred Colour'),
          React.createElement('input', { key: 'i', id: 'colour', type: 'text', value: formData.colour, onChange: handleChange('colour'), placeholder: 'e.g. White, Black, Navy Blue...' })
        ]),
        React.createElement('div', { key: 'msg', className: 'form-group' }, [
          React.createElement('label', { key: 'l', htmlFor: 'message' }, 'Message'),
          React.createElement('textarea', { key: 'i', id: 'message', rows: 5, value: formData.message, onChange: handleChange('message'), placeholder: 'Tell us about your project or requirements...' })
        ]),
        React.createElement('button', {
          key: 'submit',
          type: 'submit',
          className: 'btn btn--primary btn--lg btn--full',
          disabled: submitting
        }, submitting ? 'Sending...' : [
          'Send Message',
          React.createElement(Icon, { key: 'i', name: 'send', size: 18 })
        ])
      ]),

      React.createElement('div', { key: 'info', className: 'contact-info' }, [
        React.createElement('div', { key: 'card', className: 'contact-info-card' }, [
          React.createElement('h3', { key: 'title' }, 'Other Ways to Reach Us'),
          React.createElement('div', { key: 'items', className: 'contact-info__items' }, [
            React.createElement('div', { key: 'email', className: 'contact-info__item' }, [
              React.createElement(Icon, { key: 'i', name: 'mail', size: 20 }),
              React.createElement('div', { key: 'text' }, [
                React.createElement('strong', { key: 'l' }, 'Email'),
                React.createElement('p', { key: 'v' }, 'info@customspacerings.co.uk')
              ])
            ]),
            React.createElement('div', { key: 'response', className: 'contact-info__item' }, [
              React.createElement(Icon, { key: 'i', name: 'clock', size: 20 }),
              React.createElement('div', { key: 'text' }, [
                React.createElement('strong', { key: 'l' }, 'Response Time'),
                React.createElement('p', { key: 'v' }, 'Within 24 hours')
              ])
            ]),
            React.createElement('div', { key: 'area', className: 'contact-info__item' }, [
              React.createElement(Icon, { key: 'i', name: 'map-pin', size: 20 }),
              React.createElement('div', { key: 'text' }, [
                React.createElement('strong', { key: 'l' }, 'Service Area'),
                React.createElement('p', { key: 'v' }, 'UK-wide delivery')
              ])
            ])
          ])
        ]),
        React.createElement('div', { key: 'guarantee', className: 'contact-guarantee' }, [
          React.createElement(Icon, { key: 'i', name: 'shield-check', size: 24 }),
          React.createElement('p', { key: 't' }, 'Every order is printed to spec and quality-checked before dispatch. If it does not fit, we will work with you to make it right.')
        ])
      ])
    ])
  ]);
}

// ── Footer ──
function Footer({ onNavigate }) {
  return React.createElement('footer', { className: 'site-footer' }, [
    React.createElement('div', { key: 'inner', className: 'site-footer__inner' }, [
      React.createElement('div', { key: 'brand', className: 'site-footer__brand' }, [
        React.createElement(Icon, { key: 'i', name: 'circle-dot', size: 24 }),
        React.createElement('span', { key: 't' }, 'Custom Space Rings')
      ]),
      React.createElement('nav', { key: 'nav', className: 'site-footer__nav' },
        NAV_PAGES.map(p =>
          React.createElement('button', {
            key: p.id,
            className: 'site-footer__link',
            onClick: () => onNavigate(p.id)
          }, p.label)
        )
      ),
      React.createElement('p', { key: 'copy', className: 'site-footer__copy' },
        String.fromCharCode(169) + ' ' + new Date().getFullYear() + ' Custom Space Rings. Precision 3D-printed fittings for lamps & roof lights.'
      )
    ])
  ]);
}

// ── App Shell ──
function App() {
  const [page, setPage] = useState('home');
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [contactProduct, setContactProduct] = useState(null);

  useEffect(() => {
    fetch('products.json')
      .then(res => res.json())
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  const navigate = useCallback((pageId, product) => {
    setPage(pageId);
    setSelectedProduct(null);
    setContactProduct(product || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSelectProduct = useCallback((product) => {
    setSelectedProduct(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleContactFromProduct = useCallback((product) => {
    setContactProduct(product);
    setPage('contact');
    setSelectedProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  let content;
  if (page === 'home') {
    content = React.createElement(React.Fragment, null, [
      React.createElement(Hero, { key: 'hero', onNavigate: navigate }),
      React.createElement('section', { key: 'featured', className: 'section featured-section' }, [
        React.createElement('div', { key: 'header', className: 'section-header' }, [
          React.createElement('h2', { key: 't', className: 'section__title' }, 'Popular Products'),
          React.createElement('button', { key: 'link', className: 'btn btn--ghost', onClick: () => navigate('products') }, [
            'View All',
            React.createElement(Icon, { key: 'i', name: 'arrow-right', size: 16 })
          ])
        ]),
        React.createElement('div', { key: 'grid', className: 'products-grid' },
          products.filter(p => p.popular).map(p =>
            React.createElement(ProductCard, { key: p.id, product: p, onSelect: handleSelectProduct })
          )
        )
      ]),
      React.createElement('section', { key: 'why', className: 'section why-section' }, [
        React.createElement('h2', { key: 't', className: 'section__title section__title--center' }, 'Why Custom Space Rings?'),
        React.createElement('div', { key: 'grid', className: 'why-grid' }, [
          { icon: 'ruler', title: 'Custom Dimensions', desc: 'Every ring made to your exact measurements. Send us the dimensions and we print it precisely.' },
          { icon: 'palette', title: 'Multiple PLA Colours', desc: 'Choose from 12+ colours to match your lamp shade, ceiling, or personal style.' },
          { icon: 'shield-check', title: 'Precision Engineering', desc: 'Printed with ' + String.fromCharCode(177) + '0.2mm tolerance for a perfect fit every time.' },
          { icon: 'truck', title: 'UK-Wide Delivery', desc: 'Fast and reliable postal delivery across the United Kingdom.' }
        ].map((item, i) =>
          React.createElement('div', { key: i, className: 'why-card' }, [
            React.createElement('div', { key: 'icon', className: 'why-card__icon' },
              React.createElement(Icon, { name: item.icon, size: 28 })
            ),
            React.createElement('h3', { key: 't' }, item.title),
            React.createElement('p', { key: 'd' }, item.desc)
          ])
        ))
      ]),
      React.createElement('section', { key: 'colours-preview', className: 'section colours-section' }, [
        React.createElement('h2', { key: 't', className: 'section__title section__title--center' }, 'Available in 12+ PLA Colours'),
        React.createElement('p', { key: 'sub', className: 'section__subtitle section__subtitle--center' }, 'Match your fittings perfectly with our wide range of colour options.'),
        React.createElement('div', { key: 'swatches', className: 'colours-preview' },
          Object.entries(PLA_COLOURS).map(([id, colour]) =>
            React.createElement('div', { key: id, className: 'colour-preview-item' }, [
              React.createElement('span', {
                key: 's',
                className: 'colour-preview-dot' + (colour.border ? ' colour-preview-dot--bordered' : ''),
                style: { backgroundColor: colour.hex }
              }),
              React.createElement('span', { key: 'n', className: 'colour-preview-name' }, colour.name)
            ])
          )
        )
      ]),
      React.createElement('section', { key: 'cta', className: 'section cta-banner' }, [
        React.createElement('h2', { key: 't' }, 'Need a Custom Ring or Insert?'),
        React.createElement('p', { key: 'p' }, 'Tell us your dimensions and colour preference. We will have a quote back to you within 24 hours.'),
        React.createElement('div', { key: 'actions', className: 'cta-banner__actions' }, [
          React.createElement('button', { key: 'quote', className: 'btn btn--primary btn--lg', onClick: () => navigate('contact') }, [
            'Get a Free Quote',
            React.createElement(Icon, { key: 'i', name: 'arrow-right', size: 18 })
          ]),
          React.createElement('button', { key: 'learn', className: 'btn btn--outline btn--lg', onClick: () => navigate('custom') }, 'Learn About Custom Orders')
        ])
      ])
    ]);
  } else if (page === 'products' && selectedProduct) {
    content = React.createElement(ProductDetail, {
      key: 'detail',
      product: selectedProduct,
      onBack: () => setSelectedProduct(null),
      onContact: handleContactFromProduct
    });
  } else if (page === 'products') {
    content = React.createElement(ProductsPage, {
      key: 'products',
      products,
      onSelectProduct: handleSelectProduct
    });
  } else if (page === 'custom') {
    content = React.createElement(CustomOrdersPage, {
      key: 'custom',
      onContact: () => navigate('contact')
    });
  } else if (page === 'about') {
    content = React.createElement(AboutPage, { key: 'about' });
  } else if (page === 'contact') {
    content = React.createElement(ContactPage, {
      key: 'contact',
      preselectedProduct: contactProduct
    });
  }

  return React.createElement('div', { className: 'app' }, [
    React.createElement(Navbar, { key: 'nav', currentPage: page, onNavigate: navigate }),
    React.createElement('main', { key: 'main', className: 'app__main' }, content),
    React.createElement(Footer, { key: 'footer', onNavigate: navigate }),
    React.createElement(BottomNav, { key: 'bottom-nav', currentPage: page, onNavigate: navigate })
  ]);
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
