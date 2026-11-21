
const gtmHeadSnippet = `  <!-- Google Tag Manager -->
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-MJ7L3PCD');</script>
  <!-- End Google Tag Manager -->`;

const gtmBodySnippet = `  <!-- Google Tag Manager (noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MJ7L3PCD"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <!-- End Google Tag Manager (noscript) -->`;
const fs = require('fs');
const path = require('path');

// 1. Authoritative pricebooks and datasets
const pricing = JSON.parse(fs.readFileSync('assets/data/uniform-pricing.json', 'utf8'));
const ext = JSON.parse(fs.readFileSync('assets/data/verified-extension-pricing.json', 'utf8'));
const allPricing = [...pricing.products, ...(ext.products || [])];
const hiddenHandles = new Set(pricing.hiddenProductHandles || []);

const rec = JSON.parse(fs.readFileSync('assets/data/recovered-products.json', 'utf8'));
const restoredRaw = JSON.parse(fs.readFileSync('assets/data/restored-products.json', 'utf8'));
const restored = Array.isArray(restoredRaw) ? restoredRaw : Object.values(restoredRaw);

const catalogProds = [...rec.products, ...restored];
const prodMap = new Map(catalogProds.map(p => [p.handle, p]));

// Resolve product image helper
function resolveProductImage(p) {
  let imgUrl = null;
  let altText = p.title || p.itemType || 'School Uniform';
  
  if (p.imageProductHandle && prodMap.has(p.imageProductHandle)) {
    const parent = prodMap.get(p.imageProductHandle);
    if (parent.images && parent.images.length > 0) {
      imgUrl = parent.images[0].url;
      if (parent.images[0].alt) altText = parent.images[0].alt;
    }
  }
  if (!imgUrl && p.images && p.images.length > 0) {
    imgUrl = p.images[0].url;
    if (p.images[0].alt) altText = p.images[0].alt;
  }
  if (!imgUrl && p.image) {
    imgUrl = p.image;
  }
  if (!imgUrl && prodMap.has(p.handle)) {
    const direct = prodMap.get(p.handle);
    if (direct.images && direct.images.length > 0) {
      imgUrl = direct.images[0].url;
      if (direct.images[0].alt) altText = direct.images[0].alt;
    }
  }
  return {
    url: imgUrl || 'assets/images/bachpan-garments-logo.png',
    alt: altText
  };
}

// School description dictionary with unique, genuine school content for Gwalior
const schoolDescriptions = {
  'gwalior-glory-school': {
    intro: 'Official school uniforms for Gwalior Glory School students. Bachpan Garments stocks complete everyday summer wear, winter fleece sweatshirts, comfortable track pants, sports house t-shirts, and accessories tailored to school guidelines.',
    address: 'Neemchandoha, Shivpuri Link Road, Gwalior',
    highlights: ['Comfortable cotton-rich fabrics', 'Accurate house colour trims', 'Durable double-stitched seams', 'Full winter collection available']
  },
  'gwalior-glory-high-school': {
    intro: 'Premium uniform collection for Gwalior Glory High School (GGHS) boys and girls. Featuring formal shirts, grey trousers, regulation blazers, sports vests, and winter jackets made with superior school-prescribed fabrics.',
    address: 'Neemchandoha, Shivpuri Link Road, Gwalior',
    highlights: ['Official tailored blazers with school crest', 'Prescribed grey trousers and white shirts', 'Sports polo and track suits', 'Sizes available from Grade 1 through 12']
  },
  'gwalior-glory-pride-school': {
    intro: 'Complete uniform range for Gwalior Glory Pride School. High-grade tracksuits, comfortable polos, and everyday uniforms designed for active school days and sports activities.',
    address: 'Gwalior, Madhya Pradesh',
    highlights: ['All-weather tracksuits', 'Breathable sports fabrics', 'Fade-resistant colours', 'Full size range available']
  },
  'little-angels-high-school': {
    intro: 'Authorised school uniform store for Little Angels High School (LAHS), Gwalior. Separate options for Junior Wing and Senior Wing including regular uniform shirts, trousers, skirts, ties, belts, and winter warmers.',
    address: 'Shivpuri Link Road / City Center, Gwalior',
    highlights: ['Dedicated Junior & Senior Wing uniforms', 'Regulation school crest embroidery', 'Stitched with durable stress points', 'All accessories in stock']
  },
  'little-angels-junior-school': {
    intro: 'Gentle, comfortable, and easy-to-wear uniforms for Little Angels Junior School kids. Soft cotton blends, comfortable elasticated waistbands, and child-safe finishes designed for young learners.',
    address: 'Gwalior, Madhya Pradesh',
    highlights: ['Soft, non-irritant fabrics', 'Easy-care machine washable', 'Winter sweaters & warm track wear', 'Junior sock sizes and accessories']
  },
  'little-angels-school-dal-bazar': {
    intro: 'Uniform collection for Little Angels School (Dal Bazar & City Center branches). Quality shirts, lowers, polos, half-zip hoodies, and winterwear meeting exact branch standards.',
    address: 'Dal Bazar & City Center, Gwalior',
    highlights: ['Dal Bazar branch certified uniform sets', 'Half-zip warm winter hoodies', 'Durable trousers and lowers', 'Fair, fixed pricing']
  },
  'birla-open-minds-international-school': {
    intro: 'Contemporary international standard school uniforms for Birla Open Minds International School (BOMIS) Gwalior. Includes modern cut shirts, shorts, trousers, pinafores, sports house jerseys, and winter jackets.',
    address: 'Gwalior, Madhya Pradesh',
    highlights: ['International curriculum uniform styling', 'Premium moisture-wicking sports kits', 'Smart formal blazers and sweaters', 'Nursery to Senior secondary sizes']
  },
  'oxford-public-school': {
    intro: 'Official uniform store for Oxford Public School Gwalior. Full selection of royal blue and sky blue hooded track jackets, school shirts, trousers, skirts, and winter accessories.',
    address: 'Gwalior, Madhya Pradesh',
    highlights: ['Hooded track jackets with school crest', 'Distinctive Oxford royal blue uniform', 'Durable, colorfast fabric', 'Comprehensive size charts']
  },
  'ramshree-international-school': {
    intro: 'Uniform sets for Ramshree International School Gwalior. Bachpan Garments provides durable everyday school dresses, comfortable sports uniforms, and winter apparel for all grade levels.',
    address: 'Gwalior, Madhya Pradesh',
    highlights: ['Official Ramshree school uniform sets', 'Premium stitching and finish', 'Full winter and summer range', 'Doorstep delivery across Gwalior']
  },
  'ramshree-kids-school': {
    intro: 'Soft, playful, and comfortable uniforms for little ones at Ramshree Kids School. Made with child-friendly breathable cottons to keep young children happy throughout the school day.',
    address: 'Gwalior, Madhya Pradesh',
    highlights: ['Extra soft cotton fabrics', 'Comfortable elastic fits', 'Vibrant colors and durable prints', 'Convenient sizing for pre-primary']
  },
  'carmel-convent-senior-secondary-school': {
    intro: 'Trusted uniform provider for Carmel Convent Senior Secondary School, Gwalior. Explore formal pinafores, shirts, blazers, sweaters, ties, and accessories matching strict convent dress codes.',
    address: 'Bhind Road / Lashkar, Gwalior',
    highlights: ['Convent regulation pinafores & shirts', 'Official winter blazers & knits', 'Strict color and cut compliance', 'Custom tailoring support']
  },
  'carmel-convent-kindergarten-school': {
    intro: 'Uniforms for Carmel Convent Kindergarten young students. Soft, practical, and compliant school wear crafted for early kindergarten comfort and neat appearance.',
    address: 'Gwalior, Madhya Pradesh',
    highlights: ['Neat kindergarten dress code', 'Soft, skin-friendly cottons', 'Easy-wear buttons and fits', 'Available in our Lashkar store']
  },
  'kiddys-corner-public-school': {
    intro: 'School uniform collection for Kiddy\'s Corner Public School Gwalior. Everyday uniforms, ties, belts, sportswear, and winter cardigans available in-store and online.',
    address: 'Gwalior, Madhya Pradesh',
    highlights: ['Complete everyday uniform sets', 'Accurate school colors & monograms', 'Durable fabric for active children', 'WhatsApp ordering available']
  },
  'st-josephs-convent-school': {
    intro: 'Official uniform solutions for St. Joseph\'s Convent School, Gwalior. Providing approved shirts, skirts, trousers, sweaters, and convent crest badges with superior stitching.',
    address: 'Gwalior, Madhya Pradesh',
    highlights: ['Convent-approved pattern & styling', 'High-durability twill fabrics', 'Full winter warmth range', '30-year trust in Gwalior']
  },
  'sanskar-public-school': {
    intro: 'Uniform store for Sanskar Public School students in Gwalior. Find summer uniforms, house sports kits, winter blazers, and socks designed to last through daily school routines.',
    address: 'Gwalior, Madhya Pradesh',
    highlights: ['Quality everyday uniforms', 'Complete house t-shirt options', 'Affordable, fixed pricing', 'Convenient store pickup & delivery']
  },
  'new-kidzie-school': {
    intro: 'Cute, comfortable, and durable school dresses for New Kidzie School pre-primary and primary students in Gwalior.',
    address: 'Gwalior, Madhya Pradesh',
    highlights: ['Gentle cotton materials', 'Stain-resistant and easy wash', 'Comfortable waistbands', 'Fast local delivery']
  },
  'new-aurobindo-school': {
    intro: 'School uniforms for New Aurobindo School Gwalior. Premium quality shirts, trousers, belts, and winter knitwear made to official school specifications.',
    address: 'Gwalior, Madhya Pradesh',
    highlights: ['Official school uniform specification', 'Colorfast and shrink-resistant', 'All sizes in stock', 'Direct store purchase in Lashkar']
  },
  'santa-claus-school': {
    intro: 'School dress and uniform collection for Santa Claus School Gwalior. Soft, well-tailored uniforms for kindergarten and primary students at attractive prices.',
    address: 'Gwalior, Madhya Pradesh',
    highlights: ['High-comfort pre-primary wear', 'Accurate school monogram crests', 'Winter hoodies and sweaters', 'Personalized sizing support']
  }
};

// Common header HTML generator
function getCommonHeader(depth = '../../') {
  return `
  <header class="relative z-30 bg-highlight text-highlight-text shadow">
    <div class="flex items-center justify-between gap-3 md:gap-8 min-h-16 md:min-h-20 px-margin py-2 max-w-page mx-auto w-full">
      <div class="flex items-center gap-3">
        <a href="${depth}" class="flex items-center gap-3 no-underline text-highlight-text">
          <img src="${depth}assets/images/bachpan-garments-logo.png" alt="Bachpan Garments Logo" width="48" height="48" class="size-10 md:size-12 object-contain rounded-full bg-white p-1">
          <div>
            <span class="block font-heading font-bold text-lg md:text-xl tracking-tight leading-tight">BACHPAN GARMENTS</span>
            <span class="block text-xs opacity-90">School Uniform Store • Gwalior</span>
          </div>
        </a>
      </div>
      <nav class="hidden md:flex items-center gap-6 text-sm font-semibold">
        <a href="${depth}" class="text-highlight-text no-underline hover:opacity-80">Home</a>
        <a href="${depth}shop-by-school.html" class="text-highlight-text no-underline hover:opacity-80">Shop by School</a>
        <a href="${depth}size-guide.html" class="text-highlight-text no-underline hover:opacity-80">Size Guide</a>
        <a href="${depth}uniform-guide.html" class="text-highlight-text no-underline hover:opacity-80">Buying Guide</a>
        <a href="${depth}about.html" class="text-highlight-text no-underline hover:opacity-80">About Us</a>
        <a href="${depth}contact.html" class="text-highlight-text no-underline hover:opacity-80">Contact</a>
      </nav>
      <div class="flex items-center gap-3">
        <a href="tel:+917722943675" class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/10 text-xs font-semibold no-underline hover:bg-black/20">
          <svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z"/></svg>
          +91 7722943675
        </a>
        <a href="${depth}checkout.html" class="relative inline-flex items-center justify-center size-10 rounded-full bg-surface text-on-surface no-underline hover:shadow">
          <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          <span class="sr-only">Cart</span>
        </a>
      </div>
    </div>
  </header>`;
}

// Common footer HTML generator
function getCommonFooter(depth = '../../') {
  return `
  <footer class="bg-surface-secondary border-t border-border mt-auto text-on-surface py-12 px-margin">
    <div class="max-w-page mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
      <div class="space-y-3">
        <h3 class="font-heading font-bold text-lg">Bachpan Garments</h3>
        <p class="text-sm text-on-surface-secondary leading-relaxed">
          Gwalior's trusted destination for school uniforms since 1996. Serving 18+ schools with high quality, certified fabrics, fair prices, and local doorstep delivery.
        </p>
        <p class="text-xs text-on-surface-secondary">
          Opposite Old High Court, near Girraj Mandir, Lashkar, Gwalior, MP 474001.
        </p>
      </div>
      <div>
        <h4 class="font-heading font-semibold text-sm uppercase tracking-wider mb-3">Popular Schools</h4>
        <ul class="space-y-1.5 text-sm">
          <li><a href="${depth}schools/gwalior-glory-high-school/" class="hover:underline">Gwalior Glory High School</a></li>
          <li><a href="${depth}schools/little-angels-high-school/" class="hover:underline">Little Angels High School</a></li>
          <li><a href="${depth}schools/birla-open-minds-international-school/" class="hover:underline">Birla Open Minds</a></li>
          <li><a href="${depth}schools/oxford-public-school/" class="hover:underline">Oxford Public School</a></li>
          <li><a href="${depth}schools/ramshree-international-school/" class="hover:underline">Ramshree International</a></li>
          <li><a href="${depth}shop-by-school.html" class="hover:underline font-semibold">View All 18 Schools →</a></li>
        </ul>
      </div>
      <div>
        <h4 class="font-heading font-semibold text-sm uppercase tracking-wider mb-3">Help & Guides</h4>
        <ul class="space-y-1.5 text-sm">
          <li><a href="${depth}size-guide.html" class="hover:underline">Size Selection Chart</a></li>
          <li><a href="${depth}uniform-guide.html" class="hover:underline">Uniform Buying Guide</a></li>
          <li><a href="${depth}about.html" class="hover:underline">About Our Store</a></li>
          <li><a href="${depth}contact.html" class="hover:underline">Store Directions & Hours</a></li>
          <li><a href="${depth}privacy-policy.html" class="hover:underline">Privacy & Policies</a></li>
        </ul>
      </div>
      <div>
        <h4 class="font-heading font-semibold text-sm uppercase tracking-wider mb-3">Visit & Contact</h4>
        <p class="text-sm mb-2"><strong>Hours:</strong> 10:30 AM – 9:00 PM (All 7 Days)</p>
        <p class="text-sm mb-2"><strong>Phone:</strong> <a href="tel:+917722943675" class="hover:underline">+91 7722943675</a></p>
        <p class="text-sm mb-4"><strong>WhatsApp:</strong> <a href="https://wa.me/919575590932" target="_blank" rel="noopener" class="hover:underline">+91 9575590932</a></p>
        <a href="https://www.google.com/maps/search/?api=1&query=BACHPAN+GARMENTS%2C+Opposite+Old+High+Court%2C+near+Girraj+Mandir%2C+Lashkar%2C+Gwalior." target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded bg-interactive text-interactive-text no-underline hover:opacity-90">
          📍 Get Google Map Directions
        </a>
      </div>
    </div>
    <div class="max-w-page mx-auto mt-8 pt-6 border-t border-border/50 text-center text-xs text-on-surface-secondary">
      © 2026 Bachpan Garments, Gwalior. All rights reserved. Professional School Uniform Supplier.
    </div>
  </footer>`;
}

// 2. Generate School Pages
const sitemapUrls = [
  { loc: 'https://bachpangarments.in/', priority: '1.0', changefreq: 'weekly' },
  { loc: 'https://bachpangarments.in/shop-by-school.html', priority: '0.9', changefreq: 'weekly' },
  { loc: 'https://bachpangarments.in/about.html', priority: '0.8', changefreq: 'monthly' },
  { loc: 'https://bachpangarments.in/contact.html', priority: '0.8', changefreq: 'monthly' },
  { loc: 'https://bachpangarments.in/size-guide.html', priority: '0.8', changefreq: 'monthly' },
  { loc: 'https://bachpangarments.in/uniform-guide.html', priority: '0.8', changefreq: 'monthly' },
  { loc: 'https://bachpangarments.in/privacy-policy.html', priority: '0.5', changefreq: 'yearly' }
];

const allProductsList = [];

console.log('Building school pages...');
rec.schools.forEach(school => {
  const schoolSlug = school.slug;
  const schoolName = school.name;
  const descInfo = schoolDescriptions[schoolSlug] || {
    intro: `Official school uniforms for ${schoolName} in Gwalior. Quality school dresses, sportswear, winterwear and accessories available at Bachpan Garments.`,
    address: 'Gwalior, Madhya Pradesh',
    highlights: ['Quality cotton-rich fabrics', 'Approved school styling', 'Durable double stitching', 'Complete size selection']
  };

  // Find products for this school
  const schoolPricing = allPricing.filter(p => !hiddenHandles.has(p.handle) && p.schoolSlug === schoolSlug);
  const otherProds = [...rec.products, ...restored].filter(p => !hiddenHandles.has(p.handle) && p.schoolSlug === schoolSlug);
  
  // Combine unique products
  const products = [];
  const addedHandles = new Set();
  
  schoolPricing.forEach(p => {
    addedHandles.add(p.handle);
    const imgInfo = resolveProductImage(p);
    const minPrice = p.prices ? Math.min(...Object.values(p.prices)) : null;
    const maxPrice = p.prices ? Math.max(...Object.values(p.prices)) : null;
    products.push({
      handle: p.handle,
      title: p.itemType ? `${schoolName} ${p.itemType}` : p.title,
      itemType: p.itemType || p.title,
      schoolSlug,
      schoolName,
      uniformType: p.uniformType || 'Regular Uniform',
      gradeRange: p.gradeRange || 'All Grades',
      sizes: p.sizes || [],
      prices: p.prices || {},
      minPrice,
      maxPrice,
      image: imgInfo.url,
      imageAlt: imgInfo.alt,
      isPriced: true
    });
  });

  otherProds.forEach(p => {
    if (!addedHandles.has(p.handle)) {
      addedHandles.add(p.handle);
      const imgInfo = resolveProductImage(p);
      products.push({
        handle: p.handle,
        title: p.title || p.itemType || `${schoolName} Uniform Item`,
        itemType: p.category || p.itemType || 'Uniform',
        schoolSlug,
        schoolName,
        uniformType: p.category || 'School Uniform',
        gradeRange: 'All Grades',
        sizes: p.sizes || (p.variants ? p.variants.map(v => v.size).filter(Boolean) : []),
        prices: p.prices || {},
        minPrice: null,
        maxPrice: null,
        image: imgInfo.url,
        imageAlt: imgInfo.alt,
        isPriced: false
      });
    }
  });

  products.forEach(prod => allProductsList.push(prod));

  const canonicalUrl = `https://bachpangarments.in/schools/${schoolSlug}/`;
  sitemapUrls.push({
    loc: canonicalUrl,
    priority: '0.85',
    changefreq: 'weekly',
    images: products.map(p => ({
      loc: `https://bachpangarments.in/${p.image}`,
      title: `${p.title} - Bachpan Garments Gwalior`,
      caption: `${p.title} for ${schoolName} in Gwalior`
    }))
  });

  // Schema JSON-LD for School page
  const schemaLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://bachpangarments.in/" },
          { "@type": "ListItem", "position": 2, "name": "Shop by School", "item": "https://bachpangarments.in/shop-by-school.html" },
          { "@type": "ListItem", "position": 3, "name": `${schoolName} Uniforms`, "item": canonicalUrl }
        ]
      },
      {
        "@type": "CollectionPage",
        "@id": `${canonicalUrl}#collection`,
        "url": canonicalUrl,
        "name": `${schoolName} Uniforms in Gwalior | Bachpan Garments`,
        "description": descInfo.intro,
        "mainEntity": {
          "@type": "ItemList",
          "itemListElement": products.map((p, idx) => {
            const itemSchema = {
              "@type": "Product",
              "name": p.title,
              "image": `https://bachpangarments.in/${p.image}`,
              "description": `${p.title} for ${schoolName} students in Gwalior. Available at Bachpan Garments.`,
              "url": `https://bachpangarments.in/products/${p.handle}/`
            };
            if (p.isPriced && p.minPrice) {
              itemSchema.offers = {
                "@type": "AggregateOffer",
                "priceCurrency": "INR",
                "lowPrice": p.minPrice,
                "highPrice": p.maxPrice || p.minPrice,
                "offerCount": p.sizes.length || 1,
                "availability": "https://schema.org/InStock"
              };
            }
            return {
              "@type": "ListItem",
              "position": idx + 1,
              "item": itemSchema
            };
          })
        }
      },
      {
        "@type": "ClothingStore",
        "@id": "https://bachpangarments.in/#store",
        "name": "Bachpan Garments",
        "telephone": "+91-7722943675",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Opposite Old High Court, near Girraj Mandir, Lashkar",
          "addressLocality": "Gwalior",
          "addressRegion": "Madhya Pradesh",
          "postalCode": "474001",
          "addressCountry": "IN"
        }
      }
    ]
  };

  // Build product cards HTML
  let productsHtml = '';
  if (products.length > 0) {
    productsHtml = `
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      ${products.map(p => `
      <article class="flex flex-col rounded-card bg-surface border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <a href="../../products/${p.handle}/" class="block relative aspect-square bg-surface-secondary/40 overflow-hidden group">
          <img src="../../${p.image}" alt="${p.imageAlt} - ${schoolName} Uniform Bachpan Garments" class="size-full object-contain p-4 group-hover:scale-105 transition-transform duration-300" loading="lazy" width="300" height="300">
          <span class="absolute top-2 left-2 px-2 py-0.5 rounded text-[11px] font-semibold bg-interactive/80 text-interactive-text">
            ${p.uniformType}
          </span>
          ${p.isPriced ? '<span class="absolute top-2 right-2 px-2 py-0.5 rounded text-[11px] font-semibold bg-green-700 text-white">In Stock</span>' : ''}
        </a>
        <div class="flex flex-col flex-1 p-4">
          <h3 class="font-heading font-semibold text-base leading-snug mb-1">
            <a href="../../products/${p.handle}/" class="text-on-surface hover:text-highlight-text no-underline">
              ${p.title}
            </a>
          </h3>
          <p class="text-xs text-on-surface-secondary mb-3">${p.gradeRange} • ${schoolName}</p>
          
          <div class="mt-auto pt-2 border-t border-border/50">
            ${p.isPriced && p.minPrice ? `
              <div class="flex items-baseline justify-between mb-3">
                <span class="text-xs text-on-surface-secondary">Price:</span>
                <span class="font-heading font-bold text-lg text-interactive">₹${p.minPrice}${p.maxPrice && p.maxPrice > p.minPrice ? ` - ₹${p.maxPrice}` : ''}</span>
              </div>
              <div class="text-[11px] text-on-surface-secondary mb-3 line-clamp-1">
                Sizes: ${p.sizes.join(', ')}
              </div>
              <div class="grid grid-cols-2 gap-2">
                <a href="../../products/${p.handle}/" class="inline-flex items-center justify-center h-9 px-3 rounded-button bg-interactive text-interactive-text text-xs font-semibold no-underline hover:opacity-90">
                  Select Size
                </a>
                <a href="../../shop-by-school.html?school=${schoolSlug}&product=${p.handle}#school-catalog" class="inline-flex items-center justify-center h-9 px-3 rounded-button bg-highlight text-highlight-text text-xs font-semibold no-underline hover:opacity-90">
                  Quick Buy
                </a>
              </div>
            ` : `
              <p class="text-xs text-on-surface-secondary mb-3">Available at Lashkar Store & via WhatsApp</p>
              <a href="https://wa.me/919575590932?text=Hello%20Bachpan%20Garments!%20I%20am%20enquiring%20about%20${encodeURIComponent(p.title)}%20for%20${encodeURIComponent(schoolName)}." target="_blank" rel="noopener" class="inline-flex items-center justify-center gap-1.5 w-full h-9 px-3 rounded-button bg-green-600 text-white text-xs font-semibold no-underline hover:bg-green-700">
                Enquire on WhatsApp
              </a>
            `}
          </div>
        </div>
      </article>
      `).join('')}
    </div>`;
  } else {
    productsHtml = `
    <div class="rounded-card bg-surface-secondary/40 border border-border p-8 text-center max-w-2xl mx-auto space-y-4">
      <div class="size-16 mx-auto rounded-full bg-highlight/20 flex items-center justify-center text-highlight-text">
        <svg class="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
      </div>
      <h3 class="font-heading font-bold text-xl">${schoolName} Uniforms in Gwalior</h3>
      <p class="text-sm text-on-surface-secondary leading-relaxed">
        We carry and tailor uniforms for ${schoolName} students directly at our Lashkar, Gwalior store. Because dress codes and house colors can vary by grade, please contact us with your child's grade and requirements for instant sizing and pricing.
      </p>
      <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
        <a href="https://wa.me/919575590932?text=Hello%20Bachpan%20Garments!%20I%20need%20uniforms%20for%20${encodeURIComponent(schoolName)}%20in%20Gwalior." target="_blank" rel="noopener" class="inline-flex items-center gap-2 h-11 px-6 rounded-button bg-green-600 text-white text-sm font-semibold no-underline hover:bg-green-700">
          WhatsApp Order & Enquiry
        </a>
        <a href="tel:+917722943675" class="inline-flex items-center gap-2 h-11 px-6 rounded-button bg-interactive text-interactive-text text-sm font-semibold no-underline hover:opacity-90">
          Call Store (+91 7722943675)
        </a>
      </div>
    </div>`;
  }

  // Complete HTML template for school landing page
  const pageHtml = `<!doctype html>
<html lang="en" dir="ltr">
<head>
${gtmHeadSnippet}
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <link rel="icon" type="image/png" href="../../assets/images/bachpan-garments-logo.png">

  <title>${schoolName} Uniforms in Gwalior | Bachpan Garments</title>
  <meta name="description" content="Shop official ${schoolName} school uniforms online in Gwalior. High quality shirts, trousers, winter blazers, sweaters, tracksuits and accessories at Bachpan Garments.">
  <meta name="keywords" content="${schoolName} Uniform Gwalior, ${schoolName} School Dress, Buy ${schoolName} Uniform Online, School Uniform Shop in Gwalior, Bachpan Garments">
  <link rel="canonical" href="${canonicalUrl}">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Bachpan Garments">
  <meta property="og:title" content="${schoolName} Uniforms in Gwalior | Bachpan Garments">
  <meta property="og:description" content="Official school uniforms for ${schoolName} in Gwalior. Quality fabrics, durable stitching and all sizes at Bachpan Garments.">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="https://bachpangarments.in/assets/images/${schoolSlug}-logo.png">
  <meta property="og:locale" content="en_IN">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${schoolName} Uniforms in Gwalior | Bachpan Garments">
  <meta name="twitter:description" content="Official school uniforms for ${schoolName} in Gwalior. Available at Bachpan Garments.">
  <meta name="twitter:image" content="https://bachpangarments.in/assets/images/${schoolSlug}-logo.png">

  <!-- Local SEO -->
  <meta name="geo.region" content="IN-MP">
  <meta name="geo.placename" content="Gwalior">
  <meta name="geo.position" content="26.2057;78.1566">
  <meta name="ICBM" content="26.2057, 78.1566">

  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
  ${JSON.stringify(schemaLd, null, 2)}
  </script>

  <link rel="stylesheet" href="../../assets/css/site.css">
  <link rel="stylesheet" href="../../assets/css/checkout-upgrade.css?v=20261104-cart-reopen">
  <link rel="stylesheet" href="../../assets/css/school-catalog.css?v=20261104-guest-cart">
  <link rel="stylesheet" href="../../assets/css/motion.css">
  <script src="../../assets/js/seo-analytics.js" defer></script>
</head>
<body class="flex flex-col min-h-svh bg-surface text-on-surface font-body antialiased">
${gtmBodySnippet}

  ${getCommonHeader('../../')}

  <main id="main-content" class="flex-1 w-full max-w-page mx-auto px-margin py-8">
    <!-- Breadcrumb -->
    <nav aria-label="Breadcrumb" class="mb-6 text-xs text-on-surface-secondary">
      <ol class="flex flex-wrap items-center gap-2" role="list">
        <li><a href="../../" class="hover:underline text-interactive">Home</a></li>
        <li><span class="opacity-50">/</span></li>
        <li><a href="../../shop-by-school.html" class="hover:underline text-interactive">Shop by School</a></li>
        <li><span class="opacity-50">/</span></li>
        <li class="font-semibold text-on-surface" aria-current="page">${schoolName}</li>
      </ol>
    </nav>

    <!-- School Hero Header -->
    <section class="rounded-card bg-surface-secondary/40 border border-border p-6 md:p-8 mb-10">
      <div class="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div class="size-20 md:size-24 shrink-0 rounded-full border border-border bg-white p-2 shadow-sm flex items-center justify-center">
          <img src="../../assets/images/${schoolSlug}-logo.png" alt="${schoolName} crest - Bachpan Garments Gwalior" class="size-full object-contain" width="96" height="96" onerror="this.src='../../assets/images/bachpan-garments-logo.png'">
        </div>
        <div class="flex-1 space-y-2">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-highlight/30 text-highlight-text text-xs font-semibold">
            <span>📍 Gwalior, Madhya Pradesh</span>
            <span>•</span>
            <span>Verified School Collection</span>
          </div>
          <h1 class="font-heading font-bold text-2xl md:text-3xl text-on-surface">
            ${schoolName} Uniforms in Gwalior
          </h1>
          <p class="text-sm md:text-base text-on-surface-secondary max-w-3xl leading-relaxed">
            ${descInfo.intro}
          </p>
          <div class="flex flex-wrap gap-2 pt-2">
            ${descInfo.highlights.map(h => `<span class="inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-surface border border-border font-medium">✓ ${h}</span>`).join('')}
          </div>
        </div>
      </div>
    </section>

    <!-- Product Grid Section -->
    <section class="mb-14" aria-labelledby="school-products-heading">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 id="school-products-heading" class="font-heading font-bold text-xl md:text-2xl text-on-surface">
            ${schoolName} Uniform Products (${products.length})
          </h2>
          <p class="text-xs text-on-surface-secondary">Order online with door delivery or visit our Lashkar, Gwalior store.</p>
        </div>
        <a href="../../size-guide.html" class="hidden sm:inline-flex items-center text-xs font-semibold text-interactive hover:underline">
          📏 View Size Guide
        </a>
      </div>

      ${productsHtml}
    </section>

    <!-- School Information & Buying Guide Section -->
    <section class="border-t border-border pt-10 mb-12">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="space-y-4">
          <h2 class="font-heading font-bold text-xl text-on-surface">
            About ${schoolName} Uniform Guidelines
          </h2>
          <p class="text-sm text-on-surface-secondary leading-relaxed">
            At Bachpan Garments, we manufacture and supply approved school dresses conforming exactly to ${schoolName}'s official dress code in Gwalior. From the prescribed collar cuts and sleeve lengths to exact Pantone-matched fabric shades, our uniforms ensure your child looks smart and feels comfortable all day long.
          </p>
          <ul class="space-y-2 text-sm text-on-surface-secondary">
            <li><strong>Summer Uniform:</strong> Breathable, sweat-absorbent poly-cotton shirts and trousers suited for Gwalior's summer climate.</li>
            <li><strong>Winter Uniform:</strong> Warm fleece tracksuits, woolen sweaters, cardigans, and blazers with high thermal retention.</li>
            <li><strong>Sports & House Kits:</strong> Regulation house color t-shirts, track pants, and comfortable sports socks.</li>
          </ul>
        </div>
        <div class="space-y-4">
          <h2 class="font-heading font-bold text-xl text-on-surface">
            Why Buy from Bachpan Garments, Gwalior?
          </h2>
          <p class="text-sm text-on-surface-secondary leading-relaxed">
            Serving students across Gwalior for over 30 years from our landmark store in Lashkar, Bachpan Garments is synonymous with uniform durability, fair transparent pricing, and zero hassle sizing.
          </p>
          <div class="grid grid-cols-2 gap-3 text-xs">
            <div class="p-3 rounded bg-surface-secondary/50 border border-border">
              <span class="font-bold block text-sm mb-1">₹ Fixed Fair Prices</span>
              <span>Transparent catalog prices without seasonal markups.</span>
            </div>
            <div class="p-3 rounded bg-surface-secondary/50 border border-border">
              <span class="font-bold block text-sm mb-1">🚚 Gwalior Delivery</span>
              <span>Fast local delivery or convenient pickup at our store.</span>
            </div>
            <div class="p-3 rounded bg-surface-secondary/50 border border-border">
              <span class="font-bold block text-sm mb-1">🔄 Easy Exchanges</span>
              <span>Hassle-free size exchanges to ensure a perfect fit.</span>
            </div>
            <div class="p-3 rounded bg-surface-secondary/50 border border-border">
              <span class="font-bold block text-sm mb-1">💬 Instant WhatsApp</span>
              <span>Live sizing support on WhatsApp at +91 9575590932.</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Other School Collections Link Section -->
    <section class="rounded-card bg-surface-secondary/30 border border-border p-6">
      <h3 class="font-heading font-semibold text-base mb-3">Explore Other School Uniforms in Gwalior:</h3>
      <div class="flex flex-wrap gap-2 text-xs">
        ${rec.schools.filter(s => s.slug !== schoolSlug).map(s => `
          <a href="../${s.slug}/" class="px-3 py-1.5 rounded-full bg-surface border border-border text-on-surface hover:border-interactive hover:text-interactive no-underline">
            ${s.name}
          </a>
        `).join('')}
      </div>
    </section>
  </main>

  ${getCommonFooter('../../')}

  <!-- Cart Core and Checkout script for instant buy -->
  <script src="../../assets/js/cart-core.js"></script>
  <script src="../../assets/js/product-text.js"></script>
</body>
</html>`;

  // Write to schools/[school-slug]/index.html
  const schoolDir = path.join('schools', schoolSlug);
  fs.mkdirSync(schoolDir, { recursive: true });
  fs.writeFileSync(path.join(schoolDir, 'index.html'), pageHtml, 'utf8');

  // Also support schools/[school-slug]-uniform/index.html
  const schoolAliasDir = path.join('schools', `${schoolSlug}-uniform`);
  fs.mkdirSync(schoolAliasDir, { recursive: true });
  fs.writeFileSync(path.join(schoolAliasDir, 'index.html'), pageHtml, 'utf8');
});

console.log(`Generated all 18 school pages and aliases. Total products in catalog: ${allProductsList.length}`);

// 3. Generate Individual Product Pages
console.log('Building individual product pages...');
allProductsList.forEach(prod => {
  const prodHandle = prod.handle;
  const canonicalUrl = `https://bachpangarments.in/products/${prodHandle}/`;

  sitemapUrls.push({
    loc: canonicalUrl,
    priority: '0.75',
    changefreq: 'weekly',
    images: [{
      loc: `https://bachpangarments.in/${prod.image}`,
      title: `${prod.title} - Bachpan Garments Gwalior`,
      caption: `${prod.title} for ${prod.schoolName}`
    }]
  });

  // Product Schema
  const prodSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://bachpangarments.in/" },
          { "@type": "ListItem", "position": 2, "name": "Shop by School", "item": "https://bachpangarments.in/shop-by-school.html" },
          { "@type": "ListItem", "position": 3, "name": `${prod.schoolName} Uniforms`, "item": `https://bachpangarments.in/schools/${prod.schoolSlug}/` },
          { "@type": "ListItem", "position": 4, "name": prod.title, "item": canonicalUrl }
        ]
      },
      {
        "@type": "Product",
        "@id": `${canonicalUrl}#product`,
        "name": prod.title,
        "image": `https://bachpangarments.in/${prod.image}`,
        "description": `Official ${prod.title} for ${prod.schoolName} students in Gwalior. Premium quality, comfortable fit, verified school dress code specification.`,
        "sku": prodHandle,
        "brand": {
          "@type": "Brand",
          "name": "Bachpan Garments"
        },
        "category": prod.uniformType || "School Uniform",
        ...(prod.isPriced && prod.minPrice ? {
          "offers": {
            "@type": "AggregateOffer",
            "priceCurrency": "INR",
            "lowPrice": prod.minPrice,
            "highPrice": prod.maxPrice || prod.minPrice,
            "offerCount": prod.sizes.length || 1,
            "availability": "https://schema.org/InStock",
            "seller": {
              "@type": "ClothingStore",
              "name": "Bachpan Garments"
            }
          }
        } : {})
      }
    ]
  };

  const productHtml = `<!doctype html>
<html lang="en" dir="ltr">
<head>
${gtmHeadSnippet}
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <link rel="icon" type="image/png" href="../../assets/images/bachpan-garments-logo.png">

  <title>${prod.title} | ${prod.schoolName} Uniform Gwalior</title>
  <meta name="description" content="Buy ${prod.title} for ${prod.schoolName} at Bachpan Garments Gwalior. Available in sizes ${prod.sizes ? prod.sizes.join(', ') : 'all'}. Official school uniform quality and fair pricing.">
  <meta name="keywords" content="${prod.title}, ${prod.schoolName} Uniform, School Uniform in Gwalior, Buy School Uniform Online, Bachpan Garments">
  <link rel="canonical" href="${canonicalUrl}">

  <!-- Open Graph -->
  <meta property="og:type" content="product">
  <meta property="og:site_name" content="Bachpan Garments">
  <meta property="og:title" content="${prod.title} | ${prod.schoolName} Uniform">
  <meta property="og:description" content="Official ${prod.title} for ${prod.schoolName} in Gwalior. Available at Bachpan Garments.">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="https://bachpangarments.in/${prod.image}">
  <meta property="og:locale" content="en_IN">

  <!-- Local SEO -->
  <meta name="geo.region" content="IN-MP">
  <meta name="geo.placename" content="Gwalior">
  <meta name="geo.position" content="26.2057;78.1566">

  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
  ${JSON.stringify(prodSchema, null, 2)}
  </script>

  <link rel="stylesheet" href="../../assets/css/site.css">
  <link rel="stylesheet" href="../../assets/css/checkout-upgrade.css?v=20261104-cart-reopen">
  <link rel="stylesheet" href="../../assets/css/school-catalog.css?v=20261104-guest-cart">
  <link rel="stylesheet" href="../../assets/css/size-chart.css">
  <link rel="stylesheet" href="../../assets/css/motion.css">
  <script src="../../assets/js/seo-analytics.js" defer></script>
</head>
<body class="flex flex-col min-h-svh bg-surface text-on-surface font-body antialiased">

  ${getCommonHeader('../../')}

  <main id="main-content" class="flex-1 w-full max-w-page mx-auto px-margin py-8">
    <!-- Breadcrumb -->
    <nav aria-label="Breadcrumb" class="mb-6 text-xs text-on-surface-secondary">
      <ol class="flex flex-wrap items-center gap-2" role="list">
        <li><a href="../../" class="hover:underline text-interactive">Home</a></li>
        <li><span class="opacity-50">/</span></li>
        <li><a href="../../shop-by-school.html" class="hover:underline text-interactive">Shop by School</a></li>
        <li><span class="opacity-50">/</span></li>
        <li><a href="../../schools/${prod.schoolSlug}/" class="hover:underline text-interactive">${prod.schoolName}</a></li>
        <li><span class="opacity-50">/</span></li>
        <li class="font-semibold text-on-surface" aria-current="page">${prod.title}</li>
      </ol>
    </nav>

    <!-- Product Detail Layout -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-12">
      <!-- Product Image -->
      <div class="flex flex-col items-center justify-center p-6 rounded-card bg-surface-secondary/40 border border-border">
        <img src="../../${prod.image}" alt="${prod.imageAlt} - ${prod.schoolName} Bachpan Garments Gwalior" class="max-h-[420px] w-auto object-contain rounded" width="450" height="450">
        <div class="mt-4 flex items-center gap-2 text-xs text-on-surface-secondary">
          <span>✓ Genuine School Uniform</span>
          <span>•</span>
          <span>Prescribed Colors & Crest</span>
        </div>
      </div>

      <!-- Product Information -->
      <div class="flex flex-col space-y-4">
        <div class="inline-flex items-center gap-2">
          <a href="../../schools/${prod.schoolSlug}/" class="px-2.5 py-1 rounded-full bg-interactive/10 text-interactive text-xs font-semibold no-underline hover:underline">
            ${prod.schoolName}
          </a>
          <span class="px-2.5 py-1 rounded-full bg-surface border border-border text-xs font-medium">
            ${prod.uniformType}
          </span>
        </div>

        <h1 class="font-heading font-bold text-2xl md:text-3xl text-on-surface">
          ${prod.title}
        </h1>

        <div class="flex items-baseline gap-3 py-2 border-y border-border">
          ${prod.isPriced && prod.minPrice ? `
            <span class="font-heading font-bold text-2xl md:text-3xl text-interactive">
              ₹${prod.minPrice}${prod.maxPrice && prod.maxPrice > prod.minPrice ? ` - ₹${prod.maxPrice}` : ''}
            </span>
            <span class="text-xs text-on-surface-secondary">(Includes all taxes)</span>
            <span class="ms-auto inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded">
              ● In Stock
            </span>
          ` : `
            <span class="text-sm font-semibold text-interactive">Available for In-Store Purchase & WhatsApp Order</span>
          `}
        </div>

        <div class="space-y-2 text-sm text-on-surface-secondary">
          <p><strong>Grade / Wing:</strong> ${prod.gradeRange}</p>
          <p><strong>Target School:</strong> ${prod.schoolName}, Gwalior</p>
          ${prod.sizes && prod.sizes.length > 0 ? `
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <strong class="text-on-surface">Available Sizes:</strong>
                <button type="button" class="bsc-size-chart-link inline-flex items-center gap-1 text-xs font-semibold text-interactive hover:underline bg-transparent border-0 cursor-pointer p-0" data-open-size-chart>
                  <svg class="size-3.5 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0l12.6 12.6z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/></svg>
                  Size Chart / Size Guide
                </button>
              </div>
              <div class="flex flex-wrap gap-1.5">
                ${prod.sizes.map(s => {
                  const sPrice = prod.prices && prod.prices[s] ? ` (₹${prod.prices[s]})` : '';
                  return `<span class="px-3 py-1 rounded border border-border bg-surface text-xs font-semibold">${s}${sPrice}</span>`;
                }).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Action Buttons -->
        <div class="pt-4 space-y-3">
          ${prod.isPriced ? `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a href="../../shop-by-school.html?school=${prod.schoolSlug}&product=${prod.handle}#school-catalog" class="inline-flex items-center justify-center h-12 px-6 rounded-button bg-highlight text-highlight-text font-heading font-semibold text-sm no-underline hover:opacity-90 shadow-sm">
                Add to Cart / Select Size
              </a>
              <a href="../../checkout.html" class="inline-flex items-center justify-center h-12 px-6 rounded-button bg-interactive text-interactive-text font-heading font-semibold text-sm no-underline hover:opacity-90">
                Go to Checkout
              </a>
            </div>
          ` : ''}

          <a href="https://wa.me/919575590932?text=Hello%20Bachpan%20Garments!%20I%20am%20interested%20in%20${encodeURIComponent(prod.title)}%20for%20${encodeURIComponent(prod.schoolName)}." target="_blank" rel="noopener" class="inline-flex items-center justify-center gap-2 w-full h-11 px-4 rounded-button bg-green-600 text-white text-sm font-semibold no-underline hover:bg-green-700">
            <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21l1.7-5A8.5 8.5 0 1 1 8 19.3L3 21Z"/></svg>
            Order / Enquire on WhatsApp (+91 9575590932)
          </a>
        </div>

        <!-- Store Benefits -->
        <div class="rounded bg-surface-secondary/50 border border-border p-4 text-xs space-y-2 mt-4">
          <p class="font-bold text-on-surface">Bachpan Garments Assurance:</p>
          <ul class="space-y-1 text-on-surface-secondary">
            <li>✓ 100% compliant with ${prod.schoolName} uniform guidelines</li>
            <li>✓ Soft, durable and colourfast fabric tested for school wear</li>
            <li>✓ Delivery available across Gwalior or pickup at Lashkar shop</li>
            <li>✓ Easy size replacement at our shop (Opposite Old High Court, Lashkar)</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Related Products from Same School -->
    <section class="border-t border-border pt-10">
      <h2 class="font-heading font-bold text-xl mb-6">More Uniforms for ${prod.schoolName}</h2>
      <p class="text-sm text-on-surface-secondary mb-4">
        <a href="../../schools/${prod.schoolSlug}/" class="text-interactive font-semibold hover:underline">
          View Complete ${prod.schoolName} Collection →
        </a>
      </p>
    </section>
  </main>

  ${getCommonFooter('../../')}

  <script src="../../assets/js/cart-core.js"></script>
  <script src="../../assets/js/product-text.js"></script>
  <script src="../../assets/js/size-chart-modal.js" defer></script>
</body>
</html>`;

  const prodDir = path.join('products', prodHandle);
  fs.mkdirSync(prodDir, { recursive: true });
  fs.writeFileSync(path.join(prodDir, 'index.html'), productHtml, 'utf8');
});

console.log(`Generated all product pages.`);

// 4. Generate Size Guide Page (Priority 10)
const sizeGuideHtml = `<!doctype html>
<html lang="en" dir="ltr">
<head>
${gtmHeadSnippet}
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <link rel="icon" type="image/png" href="assets/images/bachpan-garments-logo.png">

  <title>How to Choose School Uniform Size for Children | Bachpan Garments Gwalior</title>
  <meta name="description" content="Complete school uniform size chart and guide for Gwalior schools. Learn how to accurately measure chest, waist, length and select the right uniform size for boys and girls.">
  <meta name="keywords" content="School Uniform Size Chart, How to measure school uniform, Kids uniform size guide Gwalior, School dress sizes Bachpan Garments">
  <link rel="canonical" href="https://bachpangarments.in/size-guide.html">

  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Bachpan Garments">
  <meta property="og:title" content="How to Choose School Uniform Size for Children | Bachpan Garments">
  <meta property="og:description" content="Accurate size guide and measurement chart for school uniforms in Gwalior.">
  <meta property="og:url" content="https://bachpangarments.in/size-guide.html">
  <meta property="og:image" content="https://bachpangarments.in/assets/images/bachpan-garments-logo.png">

  <!-- Local SEO -->
  <meta name="geo.region" content="IN-MP">
  <meta name="geo.placename" content="Gwalior">

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Measure and Choose the Right School Uniform Size for Children",
    "description": "Step-by-step measurement guide for parents ordering school uniforms in Gwalior.",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Measure Chest Size",
        "text": "Wrap the measuring tape around the fullest part of the child's chest under the armpits. Keep the tape comfortably snug, not tight."
      },
      {
        "@type": "HowToStep",
        "name": "Measure Waist Size",
        "text": "Measure around the natural waistline where trousers or skirts sit comfortably."
      },
      {
        "@type": "HowToStep",
        "name": "Measure Length",
        "text": "For shirts, measure from the base of the collar to the hip. For trousers, measure along the outseam from waist to ankle."
      }
    ]
  }
  </script>

  <link rel="stylesheet" href="assets/css/site.css">
  <link rel="stylesheet" href="assets/css/school-catalog.css">
  <link rel="stylesheet" href="assets/css/size-chart.css">
  <script src="assets/js/seo-analytics.js" defer></script>
</head>
<body class="flex flex-col min-h-svh bg-surface text-on-surface font-body antialiased">
${gtmBodySnippet}
  ${getCommonHeader('')}

  <main class="flex-1 w-full max-w-page mx-auto px-margin py-8 md:py-12">
    <div class="max-w-4xl mx-auto space-y-8">
      <div class="space-y-3 text-center">
        <span class="inline-flex items-center px-3 py-1 rounded-full bg-highlight/30 text-highlight-text text-xs font-semibold">
          Parent Sizing Guide • Bachpan Garments Gwalior
        </span>
        <h1 class="font-heading font-bold text-3xl md:text-4xl text-on-surface">
          How to Choose the Correct School Uniform Size
        </h1>
        <p class="text-base text-on-surface-secondary max-w-2xl mx-auto">
          Growing children need comfortable, durable uniforms. Use our standard measurement chart below to find the perfect fit for shirts, trousers, blazers, and tracksuits across Gwalior schools.
        </p>
      </div>

      <!-- Interactive 2-Tab Sizing Container -->
      <div class="bg-surface rounded-card border border-border shadow-sm overflow-hidden">
        <!-- Tab Navigation -->
        <nav class="bsc-tabs-nav" role="tablist" aria-label="Size guide tabs">
          <button type="button" role="tab" id="sg-tab-dimensions" class="bsc-tab-btn bsc-active" aria-selected="true" aria-controls="sg-panel-dimensions" onclick="switchSgTab('dimensions')">
            <span>📏 TAB 1 – Product Dimensions</span>
            <span class="bsc-tab-badge">11 Sizes</span>
          </button>
          <button type="button" role="tab" id="sg-tab-measure" class="bsc-tab-btn" aria-selected="false" aria-controls="sg-panel-measure" onclick="switchSgTab('measure')">
            <span>📐 TAB 2 – How to Measure</span>
            <span class="bsc-tab-badge">Illustrated Guide</span>
          </button>
        </nav>

        <div class="p-4 sm:p-6 md:p-8">
          <!-- TAB 1: Product Dimensions -->
          <div id="sg-panel-dimensions" class="space-y-6" role="tabpanel" aria-labelledby="sg-tab-dimensions">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 class="font-heading font-bold text-2xl text-on-surface">Standard School Uniform Size Chart</h2>
                <p class="text-xs text-on-surface-secondary mt-1">Official dimensions covering pre-primary nursery through grade 12 senior classes.</p>
              </div>

              <!-- Inch / CM Unit Toggle -->
              <div class="bsc-toolbar m-0!">
                <span class="bsc-toolbar-label">
                  <strong>Unit:</strong>
                </span>
                <div class="bsc-unit-toggle" role="group" aria-label="Measurement unit switcher">
                  <button type="button" class="bsc-unit-btn bsc-active" id="sg-btn-both" onclick="switchSgUnit('both')">All Units</button>
                  <button type="button" class="bsc-unit-btn" id="sg-btn-in" onclick="switchSgUnit('in')">Inches (in)</button>
                  <button type="button" class="bsc-unit-btn" id="sg-btn-cm" onclick="switchSgUnit('cm')">Centimeters (cm)</button>
                </div>
              </div>
            </div>

            <!-- Size Table with All 11 Exact Rows -->
            <div class="bsc-table-container">
              <table class="bsc-table" aria-label="Standard uniform size reference table">
                <thead>
                  <tr>
                    <th scope="col">Uniform Size</th>
                    <th scope="col" class="bsc-col-group-inch sg-col-in">Approx. Chest (inches)</th>
                    <th scope="col" class="bsc-col-group-cm sg-col-cm">Chest (cm)</th>
                    <th scope="col" class="bsc-col-group-inch sg-col-in">Approx. Waist (inches)</th>
                    <th scope="col" class="bsc-col-group-cm sg-col-cm">Waist (cm)</th>
                    <th scope="col">Recommended Age</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border">
                  <tr><td><span class="bsc-size-badge">22</span></td><td class="sg-col-in">22"</td><td class="sg-col-cm">55.9 cm</td><td class="sg-col-in">20"</td><td class="sg-col-cm">50.8 cm</td><td><strong>3–4 yrs</strong></td></tr>
                  <tr><td><span class="bsc-size-badge">24</span></td><td class="sg-col-in">24"</td><td class="sg-col-cm">61.0 cm</td><td class="sg-col-in">21"</td><td class="sg-col-cm">53.3 cm</td><td><strong>4–5 yrs</strong></td></tr>
                  <tr><td><span class="bsc-size-badge">26</span></td><td class="sg-col-in">26"</td><td class="sg-col-cm">66.0 cm</td><td class="sg-col-in">22"</td><td class="sg-col-cm">55.9 cm</td><td><strong>5–6 yrs</strong></td></tr>
                  <tr><td><span class="bsc-size-badge">28</span></td><td class="sg-col-in">28"</td><td class="sg-col-cm">71.1 cm</td><td class="sg-col-in">24"</td><td class="sg-col-cm">61.0 cm</td><td><strong>6–7 yrs</strong></td></tr>
                  <tr><td><span class="bsc-size-badge">30</span></td><td class="sg-col-in">30"</td><td class="sg-col-cm">76.2 cm</td><td class="sg-col-in">26"</td><td class="sg-col-cm">66.0 cm</td><td><strong>7–8 yrs</strong></td></tr>
                  <tr><td><span class="bsc-size-badge">32</span></td><td class="sg-col-in">32"</td><td class="sg-col-cm">81.3 cm</td><td class="sg-col-in">28"</td><td class="sg-col-cm">71.1 cm</td><td><strong>8–9 yrs</strong></td></tr>
                  <tr><td><span class="bsc-size-badge">34</span></td><td class="sg-col-in">34"</td><td class="sg-col-cm">86.4 cm</td><td class="sg-col-in">30"</td><td class="sg-col-cm">76.2 cm</td><td><strong>9–11 yrs</strong></td></tr>
                  <tr><td><span class="bsc-size-badge">36</span></td><td class="sg-col-in">36"</td><td class="sg-col-cm">91.4 cm</td><td class="sg-col-in">32"</td><td class="sg-col-cm">81.3 cm</td><td><strong>11–13 yrs</strong></td></tr>
                  <tr><td><span class="bsc-size-badge">38</span></td><td class="sg-col-in">38"</td><td class="sg-col-cm">96.5 cm</td><td class="sg-col-in">34"</td><td class="sg-col-cm">86.4 cm</td><td><strong>13–15 yrs</strong></td></tr>
                  <tr><td><span class="bsc-size-badge">40</span></td><td class="sg-col-in">40"</td><td class="sg-col-cm">101.6 cm</td><td class="sg-col-in">36"</td><td class="sg-col-cm">91.4 cm</td><td><strong>15–17 yrs</strong></td></tr>
                  <tr><td><span class="bsc-size-badge">42</span></td><td class="sg-col-in">42"</td><td class="sg-col-cm">106.7 cm</td><td class="sg-col-in">38"</td><td class="sg-col-cm">96.5 cm</td><td><strong>17+ yrs</strong></td></tr>
                </tbody>
              </table>
            </div>

            <!-- Important Reference Notice -->
            <div class="bsc-notice">
              <span class="bsc-notice-icon" aria-hidden="true">📌</span>
              <div>
                <strong>Important:</strong> Do not change any existing approved product sizes or prices. This chart is a general reference, not permission to replace school-specific product measurements or pricing.
              </div>
            </div>

            <!-- Size Guide and Tips -->
            <div class="bsc-tips-section">
              <h3 class="bsc-tips-title">💡 Size Guide and Tips (सलाह और सुझाव)</h3>
              <div class="bsc-tips-grid">
                <div class="bsc-tip-item">
                  <span class="bsc-tip-bullet">•</span>
                  <div><strong>Age is approximate:</strong> Children of the same age vary in height and build; always treat age as a general guideline. (उम्र केवल अनुमानित है).</div>
                </div>
                <div class="bsc-tip-item">
                  <span class="bsc-tip-bullet">•</span>
                  <div><strong>Always prioritize actual body measurements:</strong> Physical tape measurements around chest and waist yield the best fit. (हमेशा वास्तविक शारीरिक माप को प्राथमिकता दें).</div>
                </div>
                <div class="bsc-tip-item">
                  <span class="bsc-tip-bullet">•</span>
                  <div><strong>If between two sizes, consider the larger size for comfort:</strong> Gives your child comfort and allows room for growth throughout the year. (यदि दो साइज़ के बीच उलझन हो, तो बड़ा साइज़ चुनें).</div>
                </div>
                <div class="bsc-tip-item">
                  <span class="bsc-tip-bullet">•</span>
                  <div><strong>Shirts/T-shirts:</strong> Check chest measurements primarily for comfortable buttoning and shoulder movement. (शर्ट / टी-शर्ट: चेस्ट का माप अवश्य देखें).</div>
                </div>
                <div class="bsc-tip-item">
                  <span class="bsc-tip-bullet">•</span>
                  <div><strong>Pants/skirts:</strong> Check waist measurements where trousers or skirts are normally worn. (पैंट / स्कर्ट: कमर का माप जांचें).</div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 2: How to Measure -->
          <div id="sg-panel-measure" class="space-y-6" style="display:none;" role="tabpanel" aria-labelledby="sg-tab-measure">
            <div class="bsc-measure-intro">
              <h3>3 Simple Measurement Steps</h3>
              <p>Follow these 3 illustrated steps using a soft tape to take exact measurements before ordering.</p>
            </div>

            <div class="bsc-measure-grid">
              <!-- Step 1: Chest -->
              <div class="bsc-measure-card">
                <div class="bsc-measure-num">1</div>
                <div class="bsc-measure-svg-wrap" aria-hidden="true">
                  <svg viewBox="0 0 140 120" fill="none" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <path d="M40 25 L55 35 L85 35 L100 25 L120 45 L105 58 L98 50 L98 105 L42 105 L42 50 L35 58 L20 45 Z" fill="#e0e7ff" stroke="#1e3a8a" stroke-width="2.5" stroke-linejoin="round"/>
                    <path d="M55 35 Q70 45 85 35" stroke="#1e3a8a" stroke-width="2" fill="none"/>
                    <path d="M70 39 L70 70" stroke="#1e3a8a" stroke-width="2" stroke-linecap="round"/>
                    <path d="M30 64 L110 64" stroke="#eab308" stroke-width="3.5" stroke-dasharray="4 3" stroke-linecap="round"/>
                    <circle cx="30" cy="64" r="4.5" fill="#ca8a04"/>
                    <circle cx="110" cy="64" r="4.5" fill="#ca8a04"/>
                    <rect x="52" y="55" width="36" height="18" rx="4" fill="#ffeb00" stroke="#ca8a04" stroke-width="1.5"/>
                    <text x="70" y="68" fill="#713f12" font-size="10" font-weight="bold" text-anchor="middle" font-family="sans-serif">CHEST</text>
                  </svg>
                </div>
                <h4 class="bsc-measure-card-title">
                  Chest <span class="bsc-hindi-label">(सीना नापें)</span>
                </h4>
                <p class="bsc-measure-text-en">
                  Measure around the fullest part of the chest. Keep the measuring tape comfortably fitted.
                </p>
                <p class="bsc-measure-text-hi">
                  सीने (Chest) के सबसे उभरे हिस्से के चारों ओर नापें। इंची टेप को आरामदायक और हल्का ढीला रखें।
                </p>
              </div>

              <!-- Step 2: Waist -->
              <div class="bsc-measure-card">
                <div class="bsc-measure-num">2</div>
                <div class="bsc-measure-svg-wrap" aria-hidden="true">
                  <svg viewBox="0 0 140 120" fill="none" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <path d="M44 32 L96 32 L102 105 L78 105 L70 55 L62 105 L38 105 Z" fill="#f1f5f9" stroke="#1e3a8a" stroke-width="2.5" stroke-linejoin="round"/>
                    <rect x="43" y="27" width="54" height="10" rx="2" fill="#cbd5e1" stroke="#1e3a8a" stroke-width="2"/>
                    <line x1="53" y1="27" x2="53" y2="37" stroke="#1e3a8a" stroke-width="1.5"/>
                    <line x1="87" y1="27" x2="87" y2="37" stroke="#1e3a8a" stroke-width="1.5"/>
                    <path d="M33 32 L107 32" stroke="#eab308" stroke-width="3.5" stroke-dasharray="4 3" stroke-linecap="round"/>
                    <circle cx="33" cy="32" r="4.5" fill="#ca8a04"/>
                    <circle cx="107" cy="32" r="4.5" fill="#ca8a04"/>
                    <rect x="52" y="23" width="36" height="18" rx="4" fill="#ffeb00" stroke="#ca8a04" stroke-width="1.5"/>
                    <text x="70" y="36" fill="#713f12" font-size="10" font-weight="bold" text-anchor="middle" font-family="sans-serif">WAIST</text>
                  </svg>
                </div>
                <h4 class="bsc-measure-card-title">
                  Waist <span class="bsc-hindi-label">(कमर नापें)</span>
                </h4>
                <p class="bsc-measure-text-en">
                  Measure around the waist where trousers or skirts are normally worn.
                </p>
                <p class="bsc-measure-text-hi">
                  कमर (Waist) के उस हिस्से पर नापें जहाँ पैंट या स्कर्ट सामान्य रूप से पहनी जाती है।
                </p>
              </div>

              <!-- Step 3: Length -->
              <div class="bsc-measure-card">
                <div class="bsc-measure-num">3</div>
                <div class="bsc-measure-svg-wrap" aria-hidden="true">
                  <svg viewBox="0 0 140 120" fill="none" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <path d="M44 24 L56 32 L84 32 L96 24 L110 38 L98 48 L92 42 L92 98 L48 98 L48 42 L42 48 L30 38 Z" fill="#f8fafc" stroke="#64748b" stroke-width="2" stroke-linejoin="round"/>
                    <path d="M118 24 L118 98" stroke="#eab308" stroke-width="3" stroke-dasharray="4 3"/>
                    <path d="M114 28 L118 20 L122 28" fill="#ca8a04" stroke="#ca8a04" stroke-width="1.5"/>
                    <path d="M114 94 L118 102 L122 94" fill="#ca8a04" stroke="#ca8a04" stroke-width="1.5"/>
                    <rect x="100" y="52" width="36" height="18" rx="4" fill="#ffeb00" stroke="#ca8a04" stroke-width="1.5"/>
                    <text x="118" y="65" fill="#713f12" font-size="9" font-weight="bold" text-anchor="middle" font-family="sans-serif">LENGTH</text>
                  </svg>
                </div>
                <h4 class="bsc-measure-card-title">
                  Length <span class="bsc-hindi-label">(लंबाई नापें)</span>
                </h4>
                <p class="bsc-measure-text-en">
                  Measure an existing well-fitting uniform garment from the appropriate starting point.
                </p>
                <p class="bsc-measure-text-hi">
                  बच्चे की किसी अच्छी फिटिंग वाली पुरानी यूनिफॉर्म की लंबाई नापें (कॉलर से नीचे तक अथवा कमर से टखने तक)।
                </p>
              </div>
            </div>

            <!-- Pro-tips for Parents -->
            <div class="bsc-checklist-box">
              <h4>Expert Sizing Advice for Parents:</h4>
              <ul>
                <li><strong>Do not pull tape too tight:</strong> Allow one finger's width inside the tape for comfortable breathing.</li>
                <li><strong>Measure over lightweight clothing:</strong> Avoid taking measurements over thick winter jackets.</li>
                <li><strong>Consider mid-year growth:</strong> Children in primary grades typically grow 1-2 inches in height during the school session.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Need Help CTA -->
      <div class="rounded-card bg-highlight/20 border border-highlight/40 p-6 text-center space-y-3">
        <h3 class="font-heading font-bold text-xl text-on-surface">Unsure about size? Let us help!</h3>
        <p class="text-sm text-on-surface-secondary max-w-xl mx-auto">
          Bring your child to our shop in Lashkar, Gwalior for trial rooms and custom tailoring, or message us their height and weight on WhatsApp for expert size recommendation.
        </p>
        <div class="flex justify-center flex-wrap gap-3 pt-2">
          <a href="https://wa.me/919575590932?text=Hello%20Bachpan%20Garments!%20I%20need%20help%20selecting%20uniform%20size%20for%20my%20child." target="_blank" rel="noopener" class="inline-flex items-center gap-2 h-10 px-5 rounded-button bg-green-600 text-white text-xs font-semibold no-underline hover:bg-green-700">
            Ask Size on WhatsApp
          </a>
          <button type="button" class="inline-flex items-center gap-2 h-10 px-5 rounded-button bg-surface border border-border text-on-surface text-xs font-semibold hover:bg-surface-secondary cursor-pointer" onclick="window.BachpanSizeChart ? window.BachpanSizeChart.open() : null">
            📐 Open Size Chart Popup
          </button>
          <a href="shop-by-school.html" class="inline-flex items-center gap-2 h-10 px-5 rounded-button bg-interactive text-interactive-text text-xs font-semibold no-underline hover:opacity-90">
            Browse School Collections
          </a>
        </div>
      </div>
    </div>
  </main>

  ${getCommonFooter('')}

  <script src="assets/js/size-chart-modal.js" defer></script>
  <script>
    function switchSgTab(tab) {
      const isDim = tab === 'dimensions';
      document.getElementById('sg-panel-dimensions').style.display = isDim ? 'block' : 'none';
      document.getElementById('sg-panel-measure').style.display = isDim ? 'none' : 'block';
      document.getElementById('sg-tab-dimensions').classList.toggle('bsc-active', isDim);
      document.getElementById('sg-tab-dimensions').setAttribute('aria-selected', String(isDim));
      document.getElementById('sg-tab-measure').classList.toggle('bsc-active', !isDim);
      document.getElementById('sg-tab-measure').setAttribute('aria-selected', String(!isDim));
    }

    function switchSgUnit(unit) {
      const btnBoth = document.getElementById('sg-btn-both');
      const btnIn = document.getElementById('sg-btn-in');
      const btnCm = document.getElementById('sg-btn-cm');
      btnBoth.classList.toggle('bsc-active', unit === 'both');
      btnIn.classList.toggle('bsc-active', unit === 'in');
      btnCm.classList.toggle('bsc-active', unit === 'cm');

      document.querySelectorAll('.sg-col-in').forEach(el => {
        el.classList.toggle('bsc-highlight-unit', unit === 'in' || unit === 'both');
      });
      document.querySelectorAll('.sg-col-cm').forEach(el => {
        el.classList.toggle('bsc-highlight-unit', unit === 'cm' || unit === 'both');
      });
    }
  </script>
</body>
</html>`;
fs.writeFileSync('size-guide.html', sizeGuideHtml, 'utf8');
console.log('size-guide.html generated.');

// 5. Generate Uniform Buying Guide Page (Priority 10)
const uniformGuideHtml = `<!doctype html>
<html lang="en" dir="ltr">
<head>
${gtmHeadSnippet}
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <link rel="icon" type="image/png" href="assets/images/bachpan-garments-logo.png">

  <title>School Uniform Buying Guide for Gwalior Parents | Summer vs Winter Uniforms</title>
  <meta name="description" content="Expert guide for parents buying school uniforms in Gwalior. Compare summer vs winter uniforms, fabric durability, school dress codes, blazers, and washing tips.">
  <meta name="keywords" content="School Uniform Buying Guide Gwalior, Summer vs winter school uniforms, Gwalior school dress code, Bachpan Garments buying guide">
  <link rel="canonical" href="https://bachpangarments.in/uniform-guide.html">

  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Bachpan Garments">
  <meta property="og:title" content="School Uniform Buying Guide for Gwalior Parents | Bachpan Garments">
  <meta property="og:description" content="Compare summer vs winter uniforms, fabric qualities, and tips for parents.">
  <meta property="og:url" content="https://bachpangarments.in/uniform-guide.html">
  <meta property="og:image" content="https://bachpangarments.in/assets/images/bachpan-garments-logo.png">

  <!-- Local SEO -->
  <meta name="geo.region" content="IN-MP">
  <meta name="geo.placename" content="Gwalior">

  <link rel="stylesheet" href="assets/css/site.css">
  <link rel="stylesheet" href="assets/css/school-catalog.css">
  <script src="assets/js/seo-analytics.js" defer></script>
</head>
<body class="flex flex-col min-h-svh bg-surface text-on-surface font-body antialiased">
${gtmBodySnippet}
  ${getCommonHeader('')}

  <main class="flex-1 w-full max-w-page mx-auto px-margin py-10">
    <article class="max-w-3xl mx-auto space-y-8">
      <div class="space-y-3">
        <span class="inline-flex items-center px-3 py-1 rounded-full bg-highlight/30 text-highlight-text text-xs font-semibold">
          Gwalior Uniform Guide • Bachpan Garments
        </span>
        <h1 class="font-heading font-bold text-3xl md:text-4xl text-on-surface">
          School Uniform Buying Guide for Gwalior Parents
        </h1>
        <p class="text-base text-on-surface-secondary leading-relaxed">
          Choosing school uniforms is an important seasonal task for every parent in Gwalior. A well-fitted, durable uniform ensures comfort through long academic days, sports periods, and weather shifts between blazing Gwalior summers and chilly winter mornings.
        </p>
      </div>

      <!-- Summer vs Winter -->
      <section class="space-y-4">
        <h2 class="font-heading font-bold text-2xl text-on-surface">Summer vs. Winter School Uniforms in Gwalior</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="rounded-card bg-surface-secondary/40 border border-border p-6 space-y-3">
            <h3 class="font-heading font-bold text-lg text-interactive">☀️ Summer Uniforms (March – October)</h3>
            <p class="text-sm text-on-surface-secondary leading-relaxed">
              With Gwalior temperatures frequently crossing 40°C in May and June, summer uniforms must emphasize breathability and moisture absorption.
            </p>
            <ul class="text-xs text-on-surface-secondary space-y-1.5 list-disc list-inside">
              <li>65/35 Poly-Cotton blends for wrinkle resistance without heat trapping</li>
              <li>Pre-shrunk cotton pique polo shirts for sports activities</li>
              <li>Lightweight, double-stitched half-sleeve shirts and breathable skirts</li>
              <li>Moisture-wicking combed cotton socks</li>
            </ul>
          </div>
          <div class="rounded-card bg-surface-secondary/40 border border-border p-6 space-y-3">
            <h3 class="font-heading font-bold text-lg text-interactive">❄️ Winter Uniforms (November – February)</h3>
            <p class="text-sm text-on-surface-secondary leading-relaxed">
              Gwalior mornings in December and January are cold. School winter uniforms require reliable thermal layers matching exact school dress regulations.
            </p>
            <ul class="text-xs text-on-surface-secondary space-y-1.5 list-disc list-inside">
              <li>Heavyweight blazers with crest embroidery and inner satin lining</li>
              <li>Branded acrylic-wool blend sweaters, vests, and cardigans</li>
              <li>Fleece-lined hooded jackets and full-zip tracksuits</li>
              <li>Warm wool-blend trousers and full-sleeve formal shirts</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Checklist -->
      <section class="space-y-4">
        <h2 class="font-heading font-bold text-2xl text-on-surface">Parent's Back-to-School Uniform Checklist</h2>
        <div class="rounded-card border border-border p-6 space-y-3">
          <p class="text-sm text-on-surface-secondary">For a hassle-free school term, we recommend maintaining:</p>
          <ul class="space-y-2 text-sm text-on-surface-secondary">
            <li>✓ <strong>Regular Uniform:</strong> 2–3 pairs of shirts and trousers/skirts so laundry cycles don't cause morning stress.</li>
            <li>✓ <strong>Sports House Kit:</strong> 1–2 house color t-shirts and track pants for PT days.</li>
            <li>✓ <strong>Winter Essentials:</strong> 1 blazer and 1 daily sweater/hoodie depending on school grade rules.</li>
            <li>✓ <strong>Accessories:</strong> 3–4 pairs of official socks, 1 school belt, 1 tie, and 1 badge.</li>
          </ul>
        </div>
      </section>

      <!-- School navigation -->
      <section class="space-y-4">
        <h2 class="font-heading font-bold text-2xl text-on-surface">Select Your Child's School in Gwalior</h2>
        <p class="text-sm text-on-surface-secondary">
          Bachpan Garments maintains inventory for 18 prominent Gwalior schools. Select your school below to view full collections:
        </p>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          ${rec.schools.map(s => `
            <a href="schools/${s.slug}/" class="p-2.5 rounded bg-surface-secondary/40 border border-border hover:bg-highlight/20 text-on-surface font-semibold no-underline">
              ${s.name} →
            </a>
          `).join('')}
        </div>
      </section>
    </article>
  </main>

  ${getCommonFooter('')}
</body>
</html>`;
fs.writeFileSync('uniform-guide.html', uniformGuideHtml, 'utf8');
console.log('uniform-guide.html generated.');

// 6. Generate Complete XML Sitemap (Priority 5)
console.log(`Generating sitemap.xml with ${sitemapUrls.length} canonical URLs...`);
let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

sitemapUrls.forEach(item => {
  sitemapXml += `  <url>\n    <loc>${item.loc}</loc>\n    <lastmod>2026-11-19</lastmod>\n    <changefreq>${item.changefreq}</changefreq>\n    <priority>${item.priority}</priority>\n`;
  if (item.images && item.images.length > 0) {
    item.images.forEach(img => {
      sitemapXml += `    <image:image>\n      <image:loc>${img.loc}</image:loc>\n      <image:title>${escapeXml(img.title)}</image:title>\n      <image:caption>${escapeXml(img.caption)}</image:caption>\n    </image:image>\n`;
    });
  }
  sitemapXml += `  </url>\n`;
});

sitemapXml += `</urlset>\n`;
fs.writeFileSync('sitemap.xml', sitemapXml, 'utf8');
console.log('sitemap.xml generated successfully.');

function escapeXml(unsafe) {
  return unsafe ? unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  }) : '';
}

// 7. Generate robots.txt (Priority 5)
const robotsTxt = `# Bachpan Garments - robots.txt
User-agent: *
Allow: /
Allow: /assets/
Allow: /schools/
Allow: /products/

# Protect checkout, customer profile, and internal backend
Disallow: /admin/
Disallow: /api/
Disallow: /invoices/
Disallow: /checkout.html
Disallow: /account.html
Disallow: /database/
Disallow: /tests/
Disallow: /bachpan-private/

# Sitemap location
Sitemap: https://bachpangarments.in/sitemap.xml
`;
fs.writeFileSync('robots.txt', robotsTxt, 'utf8');
console.log('robots.txt generated successfully.');

// 8. Generate Google Analytics 4 (GA4) Tracking Module (Priority 12)
const ga4Js = `/**
 * Bachpan Garments - SEO & GA4 E-commerce Tracking Engine
 * Tracks view_item_list, view_item, add_to_cart, begin_checkout, and purchase.
 * Strict privacy: zero PII leakage, deduplicated transaction events.
 */
(function() {
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = gtag;

  // Track product list view on school pages or catalog
  window.trackGA4ViewItemList = function(schoolName, items) {
    if (!window.gtag || !Array.isArray(items)) return;
    gtag('event', 'view_item_list', {
      item_list_id: schoolName.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      item_list_name: schoolName,
      items: items.map(function(item, index) {
        return {
          item_id: item.handle || item.id,
          item_name: item.title,
          item_category: item.uniformType || item.category,
          price: item.priceRupees || item.minPrice || 0,
          quantity: 1,
          index: index + 1
        };
      })
    });
  };

  // Track single product view
  window.trackGA4ViewItem = function(product, selectedSize) {
    if (!window.gtag || !product) return;
    gtag('event', 'view_item', {
      currency: 'INR',
      value: (product.prices && selectedSize ? product.prices[selectedSize] : product.minPrice) || 0,
      items: [{
        item_id: product.handle,
        item_name: product.title,
        item_category: product.schoolName,
        item_variant: selectedSize || '',
        price: (product.prices && selectedSize ? product.prices[selectedSize] : product.minPrice) || 0,
        quantity: 1
      }]
    });
  };

  // Track add to cart
  window.trackGA4AddToCart = function(item, size, price, quantity) {
    if (!window.gtag) return;
    gtag('event', 'add_to_cart', {
      currency: 'INR',
      value: (price || 0) * (quantity || 1),
      items: [{
        item_id: item.handle || item.id,
        item_name: item.title,
        item_variant: size,
        price: price || 0,
        quantity: quantity || 1
      }]
    });
  };

  // Track checkout initiation
  window.trackGA4BeginCheckout = function(cartItems, totalValue) {
    if (!window.gtag || !Array.isArray(cartItems)) return;
    gtag('event', 'begin_checkout', {
      currency: 'INR',
      value: totalValue || 0,
      items: cartItems.map(function(i) {
        return {
          item_id: i.handle || i.productId,
          item_name: i.title,
          item_variant: i.size,
          price: i.priceRupees || 0,
          quantity: i.quantity || 1
        };
      })
    });
  };

  // Track purchase (deduplicated by orderId via sessionStorage)
  window.trackGA4Purchase = function(orderId, totalValue, items, deliveryCharge) {
    if (!window.gtag || !orderId) return;
    var trackedKey = 'ga4_order_tracked_' + orderId;
    if (sessionStorage.getItem(trackedKey)) return; // prevent duplicate

    gtag('event', 'purchase', {
      transaction_id: orderId,
      value: totalValue || 0,
      tax: 0,
      shipping: deliveryCharge || 0,
      currency: 'INR',
      items: (items || []).map(function(i) {
        return {
          item_id: i.handle || i.productId,
          item_name: i.title,
          item_variant: i.size,
          price: i.priceRupees || 0,
          quantity: i.quantity || 1
        };
      })
    });
    sessionStorage.setItem(trackedKey, '1');
  };
})();
`;
if (!fs.existsSync('assets/js/seo-analytics.js')) {
  fs.writeFileSync('assets/js/seo-analytics.js', ga4Js, 'utf8');
  console.log('assets/js/seo-analytics.js generated.');
}
