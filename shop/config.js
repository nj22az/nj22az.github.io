/**
 * Jonsson's Anslagstavla / Jonsson's Board — Shop Configuration
 * Bilingual (Swedish / English) with auto-detect.
 */

var SHOP = {
  currency: "SEK",
  logoImg: "/shop/assets/logo.png",

  /**
   * Email protection — assembled at runtime only.
   * Change these to your real email parts:  _a@_b._c
   */
  _a: "order",
  _b: "jonssons-anslagstavla",
  _c: "se",

  /**
   * External marketplaces — add your URLs here.
   * Entries with an empty url render as "Coming soon" (non-clickable).
   */
  marketplaces: [
    { name: "Tradera", url: "" },
    { name: "Gumroad", url: "" },
    { name: "Etsy", url: "" },
    { name: "Facebook", url: "" },
    { name: "Instagram", url: "" },
  ],

  /** Link back to the main portfolio */
  mainSite: {
    url: "https://nj22az.github.io/",
    label: "nj22az.github.io",
  },

  /** Translations — all visible text lives here */
  i18n: {
    sv: {
      lang: "sv",
      htmlLang: "sv",
      siteTitle: "Jonsson's Anslagstavla",
      siteSubtitle: "3D-printade produkter",
      metaDescription: "Kvalitets-3D-printade produkter tillverkade i Sverige. Beställ online och betala med Swish.",
      tagline: "3D-printade produkter",
      description: "Kvalitets-3D-printade produkter tillverkade i \u00d6rebro. Från praktiska vardagsting till personliga beställningar \u2014 printade med omsorg.",
      location: "\u00d6rebro, Sverige",

      // Nav
      navHome: "Hem",
      navProducts: "Produkter",
      navHowItWorks: "S\u00e5 best\u00e4ller du",
      navAbout: "Om oss",
      langToggle: "EN",
      langToggleLabel: "Byt till engelska",

      // Hero
      heroCtaBrowse: "Se produkter",
      heroCtaHow: "S\u00e5 best\u00e4ller du",

      // Products section
      productsTitle: "V\u00e5ra produkter",
      productsSubtitle: "Katalog",
      productsIntro: "Alla produkter 3D-printas p\u00e5 best\u00e4llning. Priser i SEK. Anpassade \u00f6nskem\u00e5l \u00e4r v\u00e4lkomna.",
      orderBtn: "Best\u00e4ll",
      popularBadge: "Popul\u00e4r",

      // How it works
      howTitle: "S\u00e5 best\u00e4ller du",
      howSubtitle: "Enkel process",
      howIntro: "Det \u00e4r enkelt att f\u00e5 din 3D-printade produkt.",
      step1Title: "Bl\u00e4ddra & v\u00e4lj",
      step1Desc: "V\u00e4lj din produkt i katalogen. Alla artiklar printas p\u00e5 best\u00e4llning.",
      step2Title: "L\u00e4gg best\u00e4llning",
      step2Desc: "Klicka p\u00e5 Best\u00e4ll och fyll i dina uppgifter. Vi \u00e5terkommer snabbt.",
      step3Title: "Betala med Swish",
      step3Desc: "Snabbt, enkelt och s\u00e4kert. Vi skickar v\u00e5rt Swish-nummer med din bekr\u00e4ftelse.",
      step4Title: "F\u00e5 din vara",
      step4Desc: "Vi printar och skickar din produkt. Lokalh\u00e4mtning i \u00d6rebro g\u00e5r ocks\u00e5 bra.",

      // Swish banner
      swishTitle: "Vi tar Swish",
      swishText: "Snabb och s\u00e4ker mobilbetalning. Du f\u00e5r Swish-uppgifterna efter att du lagt din best\u00e4llning.",

      // About
      aboutLabel: "Om oss",
      aboutBio: "Vi \u00e4r grannar som delar ett intresse f\u00f6r 3D-printing. Fr\u00e5n v\u00e5r verkstad i \u00d6rebro designar och printar vi praktiska, snygga produkter f\u00f6r vardagen. Varje artikel printas p\u00e5 best\u00e4llning med omsorg och noggrannhet. Har du en egen id\u00e9? Vi lyssnar g\u00e4rna.",

      // Modal
      modalTitle: "L\u00e4gg best\u00e4llning",
      formName: "Ditt namn *",
      formNamePh: "F\u00f6rnamn Efternamn",
      formEmail: "Din e-post *",
      formEmailPh: "namn@exempel.se",
      formPhone: "Telefon (valfritt)",
      formPhonePh: "07X XXX XX XX",
      formQty: "Antal *",
      formMessage: "Meddelande (valfritt)",
      formMessagePh: "F\u00e4rg, specialbeg\u00e4ran, fr\u00e5gor...",
      formSubmit: "Skicka best\u00e4llning",
      formNote: "Detta \u00f6ppnar din e-postapp med best\u00e4llningen ifylld.<br>Betalningsinfo (Swish) kommer i v\u00e5rt svar.",
      mailGreeting: "Hej Jonsson's Anslagstavla!",
      mailIntro: "Jag skulle vilja best\u00e4lla:",
      mailProduct: "Produkt",
      mailQty: "Antal",
      mailName: "Namn",
      mailEmail: "E-post",
      mailPhone: "Telefon",
      mailPhoneEmpty: "Ej angivet",
      mailMessage: "Meddelande",
      mailClose: "Ser fram emot ert svar!",
      mailSubject: "Best\u00e4llning",

      // Footer
      footerPayment: "Betalning via Swish",
      footerShopCol: "Hitta oss p\u00e5",
      footerMoreCol: "Mer",
      footerBackToMain: "\u2190 Tillbaka till",
      footerComingSoon: "Kommer snart",
      footerTagline: "3D-printade produkter fr\u00e5n \u00d6rebro, Sverige.",
    },

    en: {
      lang: "en",
      htmlLang: "en",
      siteTitle: "Jonsson's Board",
      siteSubtitle: "3D Printed Products",
      metaDescription: "Quality 3D printed products made in Sweden. Order online and pay with Swish.",
      tagline: "Custom 3D Printed Products",
      description: "Quality 3D printed products made in \u00d6rebro, Sweden. From practical everyday items to custom designs \u2014 printed with care.",
      location: "\u00d6rebro, Sweden",

      navHome: "Home",
      navProducts: "Products",
      navHowItWorks: "How to Order",
      navAbout: "About",
      langToggle: "SV",
      langToggleLabel: "Switch to Swedish",

      heroCtaBrowse: "Browse Products",
      heroCtaHow: "How to Order",

      productsTitle: "Our Products",
      productsSubtitle: "Catalog",
      productsIntro: "All items are 3D printed to order. Prices in SEK. Custom requests welcome.",
      orderBtn: "Order",
      popularBadge: "Popular",

      howTitle: "How to Order",
      howSubtitle: "Simple Process",
      howIntro: "Getting your 3D printed product is easy.",
      step1Title: "Browse & Choose",
      step1Desc: "Pick your product from our catalog. All items are 3D printed to order.",
      step2Title: "Place Your Order",
      step2Desc: "Click the Order button and fill in your details. We\u2019ll get back to you quickly.",
      step3Title: "Pay with Swish",
      step3Desc: "Fast, easy, and secure. We\u2019ll send you our Swish number with your confirmation.",
      step4Title: "Receive Your Item",
      step4Desc: "We print and ship your product. Local pickup in \u00d6rebro also available.",

      swishTitle: "We accept Swish",
      swishText: "Fast and secure mobile payment. You\u2019ll receive Swish details after placing your order.",

      aboutLabel: "About Us",
      aboutBio: "We are neighbours who share a passion for 3D printing. From our workshop in \u00d6rebro, Sweden, we design and print practical, beautiful products for everyday life. Every item is printed to order with care and attention to detail. Got a custom idea? We\u2019d love to hear it.",

      modalTitle: "Place Order",
      formName: "Your Name *",
      formNamePh: "First Last",
      formEmail: "Your Email *",
      formEmailPh: "name@example.com",
      formPhone: "Phone (optional)",
      formPhonePh: "Phone number",
      formQty: "Quantity *",
      formMessage: "Message (optional)",
      formMessagePh: "Custom colour, special requests, questions...",
      formSubmit: "Send Order",
      formNote: "This opens your email app with the order details pre-filled.<br>Payment instructions (Swish) will be included in our reply.",
      mailGreeting: "Hi Jonsson's Board!",
      mailIntro: "I would like to order:",
      mailProduct: "Product",
      mailQty: "Quantity",
      mailName: "Name",
      mailEmail: "Email",
      mailPhone: "Phone",
      mailPhoneEmpty: "Not provided",
      mailMessage: "Message",
      mailClose: "Looking forward to hearing from you!",
      mailSubject: "Order",

      footerPayment: "Payment via Swish",
      footerShopCol: "Find us on",
      footerMoreCol: "More",
      footerBackToMain: "\u2190 Back to",
      footerComingSoon: "Coming soon",
      footerTagline: "3D printed products from \u00d6rebro, Sweden.",
    },
  },

  /** Products — each has SV + EN title/description/tags */
  products: [
    {
      id: "phone-stand",
      price: 149,
      image: null,
      featured: true,
      title: { sv: "Telefonst\u00e4ll", en: "Phone Stand" },
      description: {
        sv: "Elegant vinklad st\u00e4llning f\u00f6r alla smartphones. Perfekt p\u00e5 skrivbordet, i k\u00f6ket eller p\u00e5 nattduksbordet.",
        en: "Elegant angled stand for any smartphone. Perfect for your desk, kitchen counter, or bedside table.",
      },
      tags: { sv: ["Skrivbord", "Praktisk"], en: ["Desk", "Practical"] },
    },
    {
      id: "desk-organizer",
      price: 249,
      image: null,
      featured: true,
      title: { sv: "Skrivbordsf\u00f6rvaring", en: "Desk Organizer" },
      description: {
        sv: "F\u00f6rvaring med flera fack f\u00f6r pennor, kablar och sm\u00e5saker. H\u00e5ll ordning p\u00e5 skrivbordet.",
        en: "Multi-compartment organizer for pens, cables, and small items. Keep your workspace tidy.",
      },
      tags: { sv: ["Skrivbord", "F\u00f6rvaring"], en: ["Desk", "Storage"] },
    },
    {
      id: "cable-clips",
      price: 89,
      image: null,
      featured: false,
      title: { sv: "Kabelclips", en: "Cable Management Clips" },
      description: {
        sv: "Set om 6 kabelclips med tejp. Dra och organisera dina laddkablar snyggt.",
        en: "Set of 6 adhesive cable clips. Route and organize your charging cables neatly.",
      },
      tags: { sv: ["Praktisk", "Set om 6"], en: ["Practical", "Set of 6"] },
    },
    {
      id: "headphone-stand",
      price: 179,
      image: null,
      featured: true,
      title: { sv: "H\u00f6rlursst\u00e4ll", en: "Headphone Stand" },
      description: {
        sv: "Minimalistisk h\u00f6rlurshållare som ser bra ut p\u00e5 alla skrivbord. Stabil och st\u00f6rningsfri design.",
        en: "Minimalist headphone holder that looks great on any desk. Sturdy and stable design.",
      },
      tags: { sv: ["Skrivbord", "Ljud"], en: ["Desk", "Audio"] },
    },
    {
      id: "geometric-planter",
      price: 169,
      image: null,
      featured: true,
      title: { sv: "Geometrisk blomkruka", en: "Geometric Planter" },
      description: {
        sv: "Modern geometrisk kruka med integrerat dropp-fat. Perfekt f\u00f6r suckulenter och sm\u00e5 v\u00e4xter.",
        en: "Modern geometric planter with integrated drip tray. Perfect for succulents and small plants.",
      },
      tags: { sv: ["Hem", "V\u00e4xter"], en: ["Home", "Plants"] },
    },
    {
      id: "wall-hooks",
      price: 99,
      image: null,
      featured: false,
      title: { sv: "V\u00e4ggkrokar (set om 3)", en: "Wall Hook Set" },
      description: {
        sv: "Set om 3 dekorativa v\u00e4ggkrokar. Starka, l\u00e4tta och enkla att montera. Bra f\u00f6r nycklar, v\u00e4skor eller jackor.",
        en: "Set of 3 decorative wall hooks. Strong, lightweight, and easy to mount. Great for keys, bags, or coats.",
      },
      tags: { sv: ["Hem", "Set om 3"], en: ["Home", "Set of 3"] },
    },
    {
      id: "custom-keychain",
      price: 59,
      image: null,
      featured: false,
      title: { sv: "Personlig nyckelring", en: "Custom Keychain" },
      description: {
        sv: "Personlig nyckelring med ditt namn eller kort text. En unik g\u00e5va eller vardagstillbeh\u00f6r.",
        en: "Personalized keychain with your name or short text. A unique gift or everyday carry item.",
      },
      tags: { sv: ["Present", "Personlig"], en: ["Gift", "Custom"] },
    },
    {
      id: "business-card-holder",
      price: 79,
      image: null,
      featured: false,
      title: { sv: "Visitkortsh\u00e5llare", en: "Business Card Holder" },
      description: {
        sv: "Ren, professionell korth\u00e5llare till skrivbordet. Rymmer en hel bunt standardvisitkort.",
        en: "Clean, professional card holder for your desk. Holds a full stack of standard business cards.",
      },
      tags: { sv: ["Skrivbord", "Professionell"], en: ["Desk", "Professional"] },
    },
    {
      id: "plant-pot",
      price: 129,
      image: null,
      featured: true,
      title: { sv: "R\u00e4fflad blomkruka", en: "Ribbed Plant Pot" },
      description: {
        sv: "R\u00e4fflad cylindrisk kruka med dr\u00e4neringshål och matchande fat. Finns i flera storlekar.",
        en: "Ribbed cylindrical pot with drainage hole and matching saucer. Available in multiple sizes.",
      },
      tags: { sv: ["Hem", "V\u00e4xter"], en: ["Home", "Plants"] },
    },
    {
      id: "custom-nameplate",
      price: 119,
      image: null,
      featured: true,
      title: { sv: "Personlig namnskylt", en: "Custom Name Plate" },
      description: {
        sv: "Namnskylt f\u00f6r skrivbord eller d\u00f6rr med din text. Perfekt f\u00f6r hemmakontoret eller som present.",
        en: "Desktop or door name plate with your text. Perfect for home offices or as a personalized gift.",
      },
      tags: { sv: ["Personlig", "Present"], en: ["Custom", "Gift"] },
    },
    {
      id: "soap-dish",
      price: 69,
      image: null,
      featured: false,
      title: { sv: "Tv\u00e5lkopp", en: "Soap Dish" },
      description: {
        sv: "Dr\u00e4nerande tv\u00e5lkopp med upph\u00f6jda ribbor. H\u00e5ller tv\u00e5len torr och badrummet rent.",
        en: "Draining soap dish with raised ridges. Keeps your soap dry and your bathroom tidy.",
      },
      tags: { sv: ["Hem", "Badrum"], en: ["Home", "Bathroom"] },
    },
    {
      id: "bookend-set",
      price: 199,
      image: null,
      featured: false,
      title: { sv: "Bokst\u00f6d (par)", en: "Bookend Set" },
      description: {
        sv: "Par med moderna bokst\u00f6d i geometrisk design. Tunga nog att h\u00e5lla en full hylla.",
        en: "Pair of modern bookends with a geometric design. Heavy enough to support a full shelf.",
      },
      tags: { sv: ["Hem", "Set om 2"], en: ["Home", "Set of 2"] },
    },
  ],

  /** SVG icons */
  icons: {
    cube: "M21 16.5V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8.5a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73ZM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12",
    package: "M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16ZM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12",
    swish: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2ZM8 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2Zm8-4c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2Z",
    mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Zm16 2-8 5-8-5",
    home: "M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z",
    user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
    arrow: "M5 12h14M12 5l7 7-7 7",
    menu: "M4 6h16M4 12h16M4 18h16",
    close: "M18 6 6 18M6 6l12 12",
    sun: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
    moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z",
    leaf: "M12 22V8M12 8C12 8 7 3 2 3c0 5 4 9 10 13M12 8c0 0 5-5 10-5 0 5-4 9-10 13",
    mappin: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0ZM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    globe: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20",
  },
};
