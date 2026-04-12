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

  /** Path to the products JSON (fetched at runtime) */
  productsUrl: "/shop/products.json",

  /**
   * Stripe publishable key — safe to expose in the browser.
   * Leave empty until Cloudflare Pages + Stripe is set up. When empty,
   * the order form falls back to opening the customer's mail client
   * via the runtime-assembled address below (_a@_b._c).
   * Test keys start with pk_test_, live keys with pk_live_.
   */
  stripePublishableKey: "",

  /**
   * Shipping options live in shop/shipping.json so the Cloudflare
   * Pages Function can parse the same list cleanly (no regex over JS).
   * Fetched at runtime like productsUrl.
   */
  shippingUrl: "/shop/shipping.json",

  /**
   * Product categories — used by the filter pills.
   * "All" is added automatically at the start of the list.
   */
  categories: [
    { id: "desk",   sv: "Skrivbord", en: "Desk" },
    { id: "home",   sv: "Hem",       en: "Home" },
    { id: "plants", sv: "V\u00e4xter", en: "Plants" },
    { id: "gifts",  sv: "Presenter", en: "Gifts" },
  ],

  /** Translations — all visible text lives here */
  i18n: {
    sv: {
      lang: "sv",
      htmlLang: "sv",
      siteTitle: "Jonsson's Anslagstavla",
      siteSubtitle: "Produkter fr\u00e5n verkstaden",
      metaDescription: "Kvalitetsprodukter tillverkade i Stora Mell\u00f6sa, Sverige. Best\u00e4ll online och betala med Swish.",
      tagline: "Produkter fr\u00e5n verkstaden",
      description: "Praktiska och snygga produkter, skapade med omsorg i Stora Mell\u00f6sa. Fr\u00e5n vardagsprylar till personliga best\u00e4llningar.",
      location: "Stora Mell\u00f6sa, Sverige",

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
      productsIntro: "Alla produkter g\u00f6rs p\u00e5 best\u00e4llning. Priser i SEK. Anpassade \u00f6nskem\u00e5l \u00e4r v\u00e4lkomna.",
      orderBtn: "Best\u00e4ll",
      popularBadge: "Popul\u00e4r",

      // How it works
      howTitle: "S\u00e5 best\u00e4ller du",
      howSubtitle: "Enkel process",
      howIntro: "Det \u00e4r enkelt att f\u00e5 din 3D-printade produkt.",
      step1Title: "Bl\u00e4ddra & v\u00e4lj",
      step1Desc: "V\u00e4lj din produkt i katalogen. Alla artiklar g\u00f6rs p\u00e5 best\u00e4llning.",
      step2Title: "L\u00e4gg best\u00e4llning",
      step2Desc: "Klicka p\u00e5 Best\u00e4ll och fyll i dina uppgifter. Vi \u00e5terkommer snabbt.",
      step3Title: "Betala med Swish",
      step3Desc: "Snabbt, enkelt och s\u00e4kert. Vi skickar v\u00e5rt Swish-nummer med din bekr\u00e4ftelse.",
      step4Title: "F\u00e5 din vara",
      step4Desc: "Vi f\u00e4rdigst\u00e4ller och skickar din produkt. Lokalh\u00e4mtning i Stora Mell\u00f6sa g\u00e5r ocks\u00e5 bra.",

      // Swish banner
      swishTitle: "Vi tar Swish",
      swishText: "Snabb och s\u00e4ker mobilbetalning. Du f\u00e5r Swish-uppgifterna efter att du lagt din best\u00e4llning.",

      // About
      aboutLabel: "Om oss",
      aboutBio: "Vi \u00e4r grannar som delar en passion f\u00f6r att g\u00f6ra saker. Fr\u00e5n v\u00e5r verkstad i Stora Mell\u00f6sa designar och tillverkar vi praktiska, snygga produkter f\u00f6r vardagen. Varje artikel g\u00f6rs p\u00e5 best\u00e4llning med omsorg och noggrannhet. Har du en egen id\u00e9? Vi lyssnar g\u00e4rna.",

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
      mailShipping: "Frakt",
      mailTotal: "Summa",
      mailName: "Namn",
      mailEmail: "E-post",
      mailPhone: "Telefon",
      mailPhoneEmpty: "Ej angivet",
      mailMessage: "Meddelande",
      mailClose: "Ser fram emot ert svar!",
      mailSubject: "Best\u00e4llning",

      // Footer
      footerPayment: "Betalning via Swish (efter bekr\u00e4ftelse)",
      footerShopCol: "Hitta oss p\u00e5",
      footerMoreCol: "Mer",
      footerBackToMain: "\u2190 Tillbaka till",
      footerComingSoon: "Kommer snart",
      footerPrivacy: "Integritetspolicy",
      footerTagline: "Produkter fr\u00e5n Stora Mell\u00f6sa, Sverige.",

      // Filters & search
      filterAll: "Alla",
      searchPlaceholder: "S\u00f6k produkter...",
      noResults: "Inga produkter matchade s\u00f6kningen.",

      // Custom order card
      customTitle: "Har du en egen id\u00e9?",
      customDesc: "Beh\u00f6ver du n\u00e5got som inte finns i katalogen? Vi kan 3D-printa egna designer \u2014 ber\u00e4tta vad du t\u00e4nker dig s\u00e5 tar vi fram det tillsammans.",
      customBtn: "Best\u00e4ll anpassat",
      customProductName: "Anpassad best\u00e4llning",
      customPriceLabel: "Pris p\u00e5 beg\u00e4ran",

      // Checkout flow
      shippingLabel: "Frakt *",
      shippingHelper: "V\u00e4lj leveranss\u00e4tt. Priserna \u00e4r Postnords porto.",
      shippingFree: "Gratis",
      orderTotal: "Summa",
      checkoutErrorGeneric: "N\u00e5got gick fel. F\u00f6rs\u00f6k igen eller kontakta oss.",
      checkoutPoweredBy: "S\u00e4ker kortbetalning via Stripe. Ditt kortnummer l\u00e4mnar aldrig Stripe.",
      formSubmitPay: "Fortsätt till betalning",

      // Success page
      successTitle: "Tack f\u00f6r din best\u00e4llning!",
      successBody: "Vi har tagit emot din best\u00e4llning och din betalning. Du f\u00e5r snart en bekr\u00e4ftelse via e-post \u2014 kolla gärna skräpposten om den dr\u00f6jer.",
      successBackHome: "Tillbaka till butiken",

      // Cancel page
      cancelTitle: "Best\u00e4llningen avbr\u00f6ts",
      cancelBody: "Ingen betalning har dragits. Du kan alltid g\u00e5 tillbaka och f\u00f6rs\u00f6ka igen.",
      cancelBackHome: "Tillbaka till butiken",

      // Privacy page
      privacyTitle: "Integritetspolicy",
      privacyIntro: "Vi samlar bara in de uppgifter vi beh\u00f6ver f\u00f6r att hantera din best\u00e4llning.",
      privacyWhatH: "Vad vi samlar in",
      privacyWhatBody: "Namn, e-post, telefonnummer och leveransadress som du anger i best\u00e4llningsformul\u00e4ret. Betalningsuppgifter hanteras av Stripe \u2014 vi ser dem aldrig.",
      privacyWhyH: "Varf\u00f6r",
      privacyWhyBody: "F\u00f6r att packa och skicka din best\u00e4llning, skicka kvitto och svara p\u00e5 fr\u00e5gor om ordern.",
      privacyKeepH: "Hur l\u00e4nge",
      privacyKeepBody: "Orderuppgifter sparas i enlighet med bokf\u00f6ringslagen (7 \u00e5r). Marknadsf\u00f6ringsutskick eller liknande g\u00f6r vi inte.",
      privacyContactH: "Kontakt",
      privacyContactBody: "Vill du veta vilka uppgifter vi har om dig, eller att vi raderar dem? H\u00f6r av dig.",
    },

    en: {
      lang: "en",
      htmlLang: "en",
      siteTitle: "Jonsson's Board",
      siteSubtitle: "Products from the workshop",
      metaDescription: "Quality products made in Stora Mell\u00f6sa, Sweden. Order online and pay with Swish.",
      tagline: "Products from the workshop",
      description: "Practical and beautiful products, made with care in Stora Mell\u00f6sa, Sweden. From everyday essentials to personal commissions.",
      location: "Stora Mell\u00f6sa, Sweden",

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
      productsIntro: "All items are made to order. Prices in SEK. Custom requests welcome.",
      orderBtn: "Order",
      popularBadge: "Popular",

      howTitle: "How to Order",
      howSubtitle: "Simple Process",
      howIntro: "Getting your 3D printed product is easy.",
      step1Title: "Browse & Choose",
      step1Desc: "Pick your product from our catalog. All items are made to order.",
      step2Title: "Place Your Order",
      step2Desc: "Click the Order button and fill in your details. We\u2019ll get back to you quickly.",
      step3Title: "Pay with Swish",
      step3Desc: "Fast, easy, and secure. We\u2019ll send you our Swish number with your confirmation.",
      step4Title: "Receive Your Item",
      step4Desc: "We prepare and ship your product. Local pickup in Stora Mell\u00f6sa also available.",

      swishTitle: "We accept Swish",
      swishText: "Fast and secure mobile payment. You\u2019ll receive Swish details after placing your order.",

      aboutLabel: "About Us",
      aboutBio: "We are neighbours who share a love of making things. From our workshop in Stora Mell\u00f6sa, Sweden, we design and produce practical, beautiful products for everyday life. Every item is made to order with care and attention to detail. Got a custom idea? We\u2019d love to hear it.",

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
      mailShipping: "Shipping",
      mailTotal: "Total",
      mailName: "Name",
      mailEmail: "Email",
      mailPhone: "Phone",
      mailPhoneEmpty: "Not provided",
      mailMessage: "Message",
      mailClose: "Looking forward to hearing from you!",
      mailSubject: "Order",

      footerPayment: "Payment via Swish (after confirmation)",
      footerShopCol: "Find us on",
      footerMoreCol: "More",
      footerBackToMain: "\u2190 Back to",
      footerComingSoon: "Coming soon",
      footerPrivacy: "Privacy policy",
      footerTagline: "Products from Stora Mell\u00f6sa, Sweden.",

      // Filters & search
      filterAll: "All",
      searchPlaceholder: "Search products...",
      noResults: "No products matched your search.",

      // Custom order card
      customTitle: "Got a custom idea?",
      customDesc: "Need something not in the catalog? We can 3D print custom designs \u2014 tell us what you have in mind and we\u2019ll bring it to life.",
      customBtn: "Request custom order",
      customProductName: "Custom Order",
      customPriceLabel: "Price on request",

      // Checkout flow
      shippingLabel: "Shipping *",
      shippingHelper: "Choose how you\u2019d like it delivered. Prices are Postnord\u2019s current rates.",
      shippingFree: "Free",
      orderTotal: "Total",
      checkoutErrorGeneric: "Something went wrong. Please try again or contact us.",
      checkoutPoweredBy: "Secure card payment via Stripe. Your card number never leaves Stripe.",
      formSubmitPay: "Continue to payment",

      // Success page
      successTitle: "Thank you for your order!",
      successBody: "We\u2019ve received your order and payment. You\u2019ll get a confirmation by email shortly \u2014 check your spam folder if it doesn\u2019t arrive.",
      successBackHome: "Back to the shop",

      // Cancel page
      cancelTitle: "Order cancelled",
      cancelBody: "No payment was taken. You can go back and try again any time.",
      cancelBackHome: "Back to the shop",

      // Privacy page
      privacyTitle: "Privacy policy",
      privacyIntro: "We only collect what\u2019s needed to handle your order.",
      privacyWhatH: "What we collect",
      privacyWhatBody: "Name, email, phone number and delivery address from the order form. Payment details are handled by Stripe \u2014 we never see them.",
      privacyWhyH: "Why",
      privacyWhyBody: "To pack and ship your order, send receipts, and answer questions about it.",
      privacyKeepH: "For how long",
      privacyKeepBody: "Order records are kept as required by Swedish accounting law (7 years). We don\u2019t send marketing emails.",
      privacyContactH: "Contact",
      privacyContactBody: "Want to know what we have on file, or have it deleted? Get in touch.",
    },
  },


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
