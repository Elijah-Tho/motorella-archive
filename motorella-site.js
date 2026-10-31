/*!
 * MOTORELLA — site script (header, menus, shop, home)
 * One script for every page. In Webflow: Site settings > Custom code > Footer code:
 *   <script src="https://cdn.jsdelivr.net/gh/Elijah-Tho/motorella-archive@site-1.0.0/motorella-site.js" defer></script>
 *
 * - A header on every page: logo, the pages, the cart. Clear over the top of a page; once the page scrolls it turns
 *   to frosted glass, and its text switches light or dark to stay readable over what is behind it. Hovering a page
 *   name opens it downward, just as far as its links need. On a phone it is a MENU button that opens the same links.
 * - Shipping / Contact / Socials open the information window (the one on the home page) on any page.
 * - Shop: the PRODUCTS heading goes, the count and the fabric button sit under the collection name; ?type=tops or
 *   ?type=shoes opens the catalogue filtered; cards marked data-sold-out="true" read SOLD OUT.
 * - Home: a scrolling page of full-screen pictures, each with a glass button to where it leads.
 *
 * Everything the header lists lives in NAV below (or window.MOTORELLA_NAV, set before this script, to override).
 */
(function () {
  'use strict';
  if (window.__motorellaSite) return;
  // only on the Motorella pages (the site holds other pages too); set window.MOTORELLA_SITE = true to force it on
  if (!window.MOTORELLA_SITE && !/^\/motorella/.test(location.pathname)) return;
  window.__motorellaSite = true;

  // ------------------------------------------------------------------------------------------------ pages & links
  var P = {
    home: '/motorella-home',
    shop: '/motorella-shop',
    looks: '/motorella-looks',
    archive: '/motorella-archive',
    c01: '/motorella-archive-01',
    ntf: '/motorella-nine-to-five'
  };
  var NAV = window.MOTORELLA_NAV || [
    { label: 'Catalogue', href: P.shop, sub: [
      { label: 'View catalogue', href: P.shop },
      { label: 'Tops', href: P.shop + '?type=tops', type: 'tops' },
      { label: 'Shoes', href: P.shop + '?type=shoes', type: 'shoes' }
    ] },
    { label: 'Archive +', href: P.archive, sub: [
      { label: 'View archive', href: P.archive },
      { label: 'Collection 01', ways: { classic: '', legacy: P.c01 } },
      { label: 'Nine to Five', ways: { classic: '', legacy: P.ntf } },
      { label: 'Black Mesa', soon: true },
      { label: 'Consumer', soon: true }
    ] },
    { label: 'Looks', href: P.looks, sub: [
      { label: 'View looks', href: P.looks }
    ] },
    { label: 'Shipping', info: 'shipping' },
    { label: 'Contact', info: 'contact' },
    { label: 'Socials', info: 'socials' }
  ];
  var LOGO = 'https://cdn.prod.website-files.com/695c3941708641fce1ce0631/6a7fa4c948a7ec3ac972eb0d_web%20logo.png';
  var CART_KEY = 'motorella_cart_v1';

  var path = location.pathname.replace(/\/+$/, '') || '/';
  var IS = {
    home: path === P.home || path === '/' || !!document.querySelector('[data-mtla-home]'),
    shop: path === P.shop || !!document.querySelector('.product-grid'),
    arch: path.indexOf(P.archive) === 0 || path === P.ntf || !!document.querySelector('[data-mtla-archive],[data-mtla-chairs]')
  };
  var NARROW = 760; // px: below this the header is a MENU button

  // ------------------------------------------------------------------------------------------------ styles
  var CSS = [
    // the header
    ':root{--mh-row:64px;--mh-ink:#4a4a4d;--mh-ink-soft:rgba(74,74,77,.55);--mh-line:#3c3c3f;--mh-pad:40px}',
    'html.mh-on .shop-header,html.mh-on .header-left,html.mh-on .nav .nav-links,html.mh-on .back-link{display:none!important}',
    '.mh{position:fixed;left:0;right:0;top:0;z-index:1000;font-family:"Trebuchet MS","Lucida Grande","Lucida Sans Unicode","Lucida Sans",Tahoma,sans-serif;',
    '  color:var(--mh-ink);-webkit-font-smoothing:antialiased;pointer-events:none}',
    '.mh[data-theme=dark]{--mh-ink:#f2f2f2;--mh-ink-soft:rgba(242,242,242,.62)}',
    '.mh-glass{position:absolute;left:0;right:0;top:0;height:var(--mh-h,var(--mh-row));pointer-events:none;',
    '  background:transparent;-webkit-backdrop-filter:none;backdrop-filter:none;',
    '  transition:height .48s cubic-bezier(.2,.75,.15,1),background-color .45s ease,-webkit-backdrop-filter .45s ease,backdrop-filter .45s ease}',
    // a darker, see-through pane with a soft blur: only once the page has scrolled, or while the pointer is on the header
    '.mh.is-scrolled .mh-glass,.mh:hover .mh-glass{background:rgba(22,22,26,var(--mh-tint,.36));',
    '  -webkit-backdrop-filter:blur(10px) saturate(1.1);backdrop-filter:blur(10px) saturate(1.1)}',
    '.mh.is-open .mh-glass{background:rgba(22,22,26,calc(var(--mh-tint,.36) + .06));-webkit-backdrop-filter:blur(12px) saturate(1.1);backdrop-filter:blur(12px) saturate(1.1)}',
    // once the pane shows: text, logo and cart go a soft near-white
    '.mh.is-scrolled,.mh:hover,.mh.is-open,.mh.is-menu{--mh-ink:#e6e6e7;--mh-ink-soft:rgba(230,230,231,.62);--mh-line:#cfcfd1}',
    '.mh.is-scrolled .mh-row,.mh:hover .mh-row,.mh.is-open .mh-sub{text-shadow:0 0 10px rgba(0,0,0,.18)}',
    '.mh.is-soft{--mh-tint:.08}',
    // 'soft-dark': the same faint glass, but the words stay soft dark grey (the faint tint can't carry light text on pale pages)
    '.mh.is-soft-dark.is-scrolled,.mh.is-soft-dark:hover,.mh.is-soft-dark.is-open{--mh-ink:#4a4a4d;--mh-ink-soft:rgba(74,74,77,.55);--mh-line:#3c3c3f}',
    '.mh.is-soft-dark .mh-row,.mh.is-soft-dark .mh-sub{text-shadow:none!important}',
    // the phone menu keeps its own dark glass with light words, whichever look is chosen
    '.mh.is-soft-dark.is-menu.is-menu{--mh-ink:#e6e6e7;--mh-ink-soft:rgba(230,230,231,.62);--mh-line:#cfcfd1}',
    '.mh-row{position:relative;height:var(--mh-row);display:flex;align-items:center;gap:44px;padding:0 var(--mh-pad);box-sizing:border-box;pointer-events:auto}',
    '.mh-logo{display:block;flex:none;line-height:0;margin-right:6px}',
    // the logo is drawn in the text colour (its own picture used as a stencil), so it always matches the words
    '.mh-mark{display:block;height:26px;width:26px;background-color:var(--mh-ink);-webkit-mask:var(--mh-logo) left center/contain no-repeat;mask:var(--mh-logo) left center/contain no-repeat;transition:background-color .45s ease}',
    '.mh-nav{display:flex;align-items:flex-start;gap:28px;height:100%}',
    '.mh-item{position:relative;height:100%;display:flex;align-items:center}',
    '.mh-top,.mh-cart,.mh-menu{font:inherit;font-size:11px;line-height:1;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--mh-ink);',
    '  text-decoration:none;background:none;border:0;padding:6px 0;cursor:pointer;white-space:nowrap;transition:color .45s ease,opacity .25s ease}',
    '.mh-top:focus-visible,.mh-link:focus-visible,.mh-cart:focus-visible,.mh-menu:focus-visible{outline:1px solid var(--mh-ink-soft);outline-offset:3px}',
    '.mh-nav:hover .mh-top{opacity:.55}.mh-nav .mh-item:hover .mh-top,.mh-item.is-open .mh-top{opacity:1}',
    '.mh-top u{text-decoration:none}',
    '.mh-sub{position:absolute;left:0;top:calc(var(--mh-row) - 6px);display:flex;flex-direction:column;align-items:flex-start;gap:9px;padding:8px 0 22px;',
    '  visibility:hidden;pointer-events:none}',
    '.mh-item.is-open .mh-sub{visibility:visible;pointer-events:auto}',
    '.mh-line{display:flex;align-items:baseline;gap:14px;white-space:nowrap;opacity:0;filter:blur(6px);transform:translateY(-4px);',
    '  transition:opacity .3s ease,filter .4s ease,transform .4s cubic-bezier(.2,.75,.15,1)}',
    '.mh-item.is-open .mh-line{opacity:1;filter:blur(0);transform:none}',
    '.mh-link{font:inherit;font-size:10px;line-height:14px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--mh-ink);',
    '  text-decoration:none;background:none;border:0;padding:0;cursor:pointer;transition:color .45s ease,opacity .2s ease}',
    '.mh-link:hover{opacity:.6}',

    '.mh-ways{display:inline-flex;gap:12px;opacity:0;filter:blur(7px);transform:translateX(-4px);pointer-events:none;',
    '  transition:opacity .35s ease,filter .45s ease,transform .45s cubic-bezier(.2,.75,.15,1)}',
    '.mh-line.is-ways .mh-ways{opacity:1;filter:blur(0);transform:none;pointer-events:auto}',
    '.mh-way{font-size:10px;line-height:14px;font-weight:400;letter-spacing:.1em;text-transform:uppercase;color:var(--mh-ink);text-decoration:none}',
    'a.mh-way:hover{opacity:.6}',
    '.mh-way.is-soon,.mh-soon{color:var(--mh-ink-soft);cursor:default}',
    '.mh-way small,.mh-soon{font-size:8px;letter-spacing:.12em;margin-left:5px;text-transform:uppercase}',
    '.mh-line,.mh-ways,.mh-soon{line-height:14px}',
    '.mh-right{margin-left:auto;display:flex;align-items:center;gap:22px}',
    '.mh-cart-slot .header-cart{display:flex!important;align-items:center;gap:10px;position:static!important;margin:0!important}',
    '.mh-cart-slot .cart-toggle{color:var(--mh-ink)!important;cursor:pointer;transition:color .45s ease}',
    // the mini cart box: a touch darker than the text; its plus drawn in the text colour
    '.mh-cart-slot .mini-cart-box{border-color:var(--mh-line)!important;transition:border-color .45s ease}',
    '.mh-cart-slot .mini-cart-thumb{border-right-color:var(--mh-line)!important;transition:border-color .45s ease}',
    '.mh-cart-slot .cart-toggle:hover{text-decoration:none!important}',
    '.mh-cart-slot .mini-cart-plus{object-position:-999px 0;background-color:var(--mh-ink);-webkit-mask:var(--mh-plus) center/contain no-repeat;mask:var(--mh-plus) center/contain no-repeat;transition:background-color .45s ease}',
    '.cart-panel{z-index:1001!important}',
    '.mh-menu{display:none}',
    // phones: the MENU button opens a full-screen sheet with the same links
    '@media (max-width:' + NARROW + 'px){',
    '  :root{--mh-row:58px;--mh-pad:20px}',
    '  .mh-nav{display:none}.mh-menu{display:inline-block}.mh-row{gap:16px}',
    '  .mh-cart-slot .mini-cart-box{width:96px!important}',
    '  .mh-sheet{position:fixed;left:0;right:0;top:var(--mh-row);bottom:0;overflow-y:auto;-webkit-overflow-scrolling:touch;',
    '    padding:18px var(--mh-pad) 40px;box-sizing:border-box;pointer-events:auto;display:flex;flex-direction:column;gap:6px;',
    '    opacity:0;visibility:hidden;transition:opacity .35s ease,filter .45s ease,visibility 0s linear .35s}',
    '  .mh.is-menu .mh-sheet{opacity:1;visibility:visible;transition:opacity .35s ease,filter .45s ease}',
    '  .mh.is-menu .mh-glass,.mh.is-menu:hover .mh-glass{height:100vh;height:100dvh;background:rgba(14,14,16,.5);-webkit-backdrop-filter:blur(10px) saturate(1.1);backdrop-filter:blur(10px) saturate(1.1)}',
    '  .mh-sitem{padding:12px 0}',
    '  .mh-sitem>.mh-top{font-size:13px;padding:4px 0;display:flex;align-items:center;justify-content:space-between;width:100%;text-align:left}',
    // the plus is drawn with two bars so it turns about its true centre: a quarter and a half round, and it is an x
    '  .mh-sitem>.mh-top b{position:relative;display:block;flex:none;width:11px;height:11px;font-size:0;transition:transform .5s cubic-bezier(.2,.75,.15,1)}',
    '  .mh-sitem>.mh-top b:before,.mh-sitem>.mh-top b:after{content:"";position:absolute;left:0;top:50%;width:100%;height:1.5px;margin-top:-.75px;background:currentColor}',
    '  .mh-sitem>.mh-top b:after{transform:rotate(90deg)}',
    '  .mh-sitem.is-open>.mh-top b{transform:rotate(135deg)}',
    '  .mh-sheet{filter:blur(6px)}.mh.is-menu .mh-sheet{filter:blur(0)}',
    '  .mh-ssub{display:grid;grid-template-rows:0fr;transition:grid-template-rows .4s cubic-bezier(.2,.75,.15,1)}',
    '  .mh-sitem.is-open .mh-ssub{grid-template-rows:1fr}',
    '  .mh-ssub>div{overflow:hidden;display:flex;flex-direction:column;gap:12px}',
    '  .mh-ssub>div:before{content:"";display:block;height:4px}',
    '  .mh-sitem .mh-line{opacity:0;filter:blur(6px)}.mh-sitem.is-open .mh-line{opacity:1;filter:blur(0);transform:none}',
    '  .mh-sitem .mh-link{font-size:11px;line-height:16px}',
    '  .mh-sitem .mh-line{flex-wrap:wrap;row-gap:8px}',
    '}',
    '@media (min-width:' + (NARROW + 1) + 'px){.mh-sheet{display:none}}',
    // phones: the shop's sticky collection label sits under the header and the products start below it
    '@media (max-width:' + NARROW + 'px){html.mh-on.mh-arch .sidebar{top:12px!important}html.mh-on .mtla-archive .mtla-info-btn{margin-top:calc(var(--mh-row) - 4px)}}',
    '@media (max-width:' + NARROW + 'px){html.mh-on.mh-shop .shop-body{padding-top:calc(var(--mh-row) + 22px)!important}html.mh-on.mh-shop .sidebar{top:var(--mh-row)!important}}',
    '@media (prefers-reduced-motion:reduce){.mh *,.mh{transition:none!important}}',
    // the information window, wherever it is opened
    '.info-window{z-index:1100!important}',
    '.info-window .info-text-div{cursor:move}',
    // pages: keep their own labels clear of the header
    'html.mh-on .sidebar{top:calc(var(--mh-row) + 34px)!important}',
    // shop
    'html.mh-shop .products-heading{display:none!important}',
    'html.mh-shop .sidebar-label{padding-left:0!important;margin-left:0!important;margin-bottom:0!important}',
    'html.mh-shop .products-count-row{margin-top:10px!important}',
    'html.mh-shop .mtla-toggle-bar{margin-top:8px!important}',
    '.mh-soldout{position:absolute;left:50%;top:8px;transform:translateX(-50%);z-index:2;box-sizing:content-box;margin:0;padding:4px 7px 3px;font-size:9px;line-height:11px;font-weight:700;',
    '  letter-spacing:.09em;color:#3c3c3c;background:rgba(241,241,241,.88);border:1px solid rgba(60,60,60,.12);border-radius:3px;white-space:nowrap;',
    '  font-family:"Trebuchet MS","Lucida Grande","Lucida Sans Unicode","Lucida Sans",Tahoma,sans-serif;pointer-events:none}',
    '.product-card.is-sold-out .product-image{opacity:.7;filter:grayscale(.3);transition:opacity .3s ease}',
    '.size-option.is-sold-out{opacity:.4;text-decoration:line-through;pointer-events:none}',
    '.mh-tip{position:fixed;left:0;top:0;z-index:1200;box-sizing:content-box;margin:0;padding:4px 7px 3px;font-size:9px;line-height:11px;font-weight:700;letter-spacing:.09em;',
    '  color:#3c3c3c;background:rgba(241,241,241,.88);border:1px solid rgba(60,60,60,.12);border-radius:3px;white-space:nowrap;pointer-events:none;',
    '  font-family:"Trebuchet MS","Lucida Grande","Lucida Sans Unicode","Lucida Sans",Tahoma,sans-serif;opacity:0;transition:opacity .15s ease}',
    '.mh-tip.is-on{opacity:1}',
    // home
    'html.mh-home,html.mh-home body{height:auto!important;overflow-x:hidden!important;overflow-y:auto!important}',
    'html.mh-home.mh-built .nav{display:none!important}',
    '.mhome{position:relative;font-family:"Trebuchet MS","Lucida Grande","Lucida Sans Unicode","Lucida Sans",Tahoma,sans-serif;color:#3c3c3c}',
    '.mhome-panel{position:relative;height:100vh;height:100svh;min-height:520px;overflow:hidden;background:#e9e9ea}',
    '.mhome-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scale(1.04);opacity:0;',
    '  transition:opacity 1.1s ease,transform 1.6s cubic-bezier(.2,.75,.15,1)}',
    '.mhome-panel.is-in .mhome-img{opacity:1;transform:scale(1)}',
    '.mhome-panel[data-fit=contain] .mhome-img{object-fit:contain;padding:10vh 8vw 10vh;box-sizing:border-box}',
    '.mhome-panel[data-fit=contain]{background:#f1f1f1}',
    // the first screen is the page's own background (the room), exactly where it always was: the bubbles line up with it
    '.mhome-panel.mhome-hero{background:transparent}',
    '.mhome-panel.mhome-model{background:#fff}',
    '.mhome-model .mhome-stage{position:absolute;inset:0;opacity:0;filter:blur(10px);transform:scale(.97);transition:opacity 1.1s ease,filter 1.3s ease,transform 1.4s cubic-bezier(.2,.75,.15,1)}',
    '.mhome-model .mhome-stage canvas{display:block;width:100%!important;height:100%!important;outline:none;cursor:grab}',
    '.mhome-model .mhome-stage canvas:active{cursor:grabbing}',
    '.mhome-model.is-loaded .mhome-stage{opacity:1;filter:blur(0);transform:none}',
    '.mhome-model .mhome-over,.mhome-video .mhome-over{justify-content:flex-end;padding-bottom:13vh;box-sizing:border-box}',
    // the film is 16:9 and its action runs to the very top and bottom of the frame, so on wide screens the panel takes
    // the film's own shape and nothing is cropped; on phones it fills the screen and is cropped at the sides instead
    '.mhome-panel.mhome-video{background:#e9e9ea;height:56.25vw;min-height:0}',
    '.mhome-video video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 50%}',
    '@media (max-width:' + NARROW + 'px){.mhome-panel.mhome-video{height:100vh;height:100svh;min-height:520px}}',
    '@media (max-width:' + NARROW + 'px){html.mh-home body{background-image:none!important}.mhome-panel.mhome-hero{background:var(--mh-room) 69% 50%/cover no-repeat}}',
    '.mhome-wordmark{position:absolute;left:var(--mh-pad,40px);top:calc(var(--mh-row) + 54px);width:min(300px,52vw);height:auto;z-index:2}',
    '.mhome-over{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;text-align:center;pointer-events:none}',
    '.mhome-over a{pointer-events:auto}',
    '.mhome-cap{position:relative;display:flex;flex-direction:column;align-items:center;gap:6px;',
    '  opacity:0;filter:blur(6px);transform:translateY(8px);transition:opacity .7s ease .15s,filter .8s ease .15s,transform .8s cubic-bezier(.2,.75,.15,1) .15s}',
    '.mhome-panel.is-in .mhome-cap{opacity:1;filter:blur(0);transform:none}',
    '.mhome-cap small{font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;opacity:.65}',
    '.mhome-cap b{font-size:20px;font-weight:700;letter-spacing:.04em;text-transform:uppercase}',
    '.mhome-panel[data-theme=dark] .mhome-cap{color:#f2f2f2}',
    // square glass, no edge, white letters; it darkens under the pointer
    '.mhome-btn{position:relative;transform:translateY(8px);display:inline-flex;align-items:center;justify-content:center;',
    '  min-width:170px;height:44px;padding:0 26px;box-sizing:border-box;border:0;border-radius:0;text-decoration:none;',
    '  font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#fff!important;',
    '  background:rgba(24,24,28,.42);-webkit-backdrop-filter:blur(14px) saturate(1.4);backdrop-filter:blur(14px) saturate(1.4);',
    '  opacity:0;transition:opacity .7s ease .3s,transform .8s cubic-bezier(.2,.75,.15,1) .3s,background-color .3s ease}',
    '.mhome-panel.is-in .mhome-btn{opacity:1;transform:none}',
    '.mhome-btn:hover,.mhome-btn:focus-visible{background-color:rgba(14,14,17,.68)}',
    '.mhome-btn:focus-visible{outline:1px solid rgba(255,255,255,.7);outline-offset:3px}',
    '.mhome-cue{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);z-index:2;font-size:8px;font-weight:700;letter-spacing:.2em;color:rgba(60,60,60,.5);',
    '  animation:mhcue 2.4s ease-in-out infinite}',
    '@keyframes mhcue{0%,100%{transform:translate(-50%,0);opacity:.5}50%{transform:translate(-50%,4px);opacity:1}}',
    '.mhome-foot{padding:28px var(--mh-pad,40px) 34px;font-size:9px;letter-spacing:.12em;color:rgba(60,60,60,.55);text-align:center;background:#f1f1f1}',
    '@media (max-width:' + NARROW + 'px){',
    '  .mhome-cap b{font-size:16px}',
    '  .mhome-btn{min-width:150px;height:42px}',
    '  .mhome-panel[data-fit=contain] .mhome-img{padding:12vh 6vw 22vh}',
    '  .mhome-wordmark{width:min(220px,58vw);top:calc(var(--mh-row) + 30px)}',
    '}'
  ].join('\n');

  // ------------------------------------------------------------------------------------------------ helpers
  function el(tag, cls, parent, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function samePage(href) {
    var a = document.createElement('a');
    a.href = href;
    return a.pathname.replace(/\/+$/, '') === path;
  }
  function cartCount() {
    try {
      var v = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      if (Array.isArray(v)) return v.reduce(function (n, x) { return n + (x && x.qty ? +x.qty : 1); }, 0);
      if (v && Array.isArray(v.items)) return v.items.length;
    } catch (e) {}
    return 0;
  }

  var PLUS = 'https://cdn.prod.website-files.com/695c3941708641fce1ce0631/6a80237125f6e04430d59ef1_trigger%20web%203.png';

  // ------------------------------------------------------------------------------------------------ the cart, on every page
  // The shop page has its own cart (MotorellaCartStore and its panel). Elsewhere the same pieces are built here with
  // the same classes, so the site's own styles dress them, and they read and write the same saved cart.
  function readCart() {
    try { var v = JSON.parse(localStorage.getItem(CART_KEY) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; }
  }
  // The shop page carries these rules in its own embed; other pages don't, so the built cart brings a copy.
  var CART_CSS = [
    '.mini-cart-box{display:flex;align-items:center;gap:0;min-width:300px;height:32px;padding:0;border:1px solid rgba(0,0,0,.3);box-sizing:border-box;overflow:hidden}',
    '.mini-cart-thumb{width:32px;height:32px;padding:3px;box-sizing:border-box;flex-shrink:0;object-fit:contain;border-right:1px solid rgba(0,0,0,.15)}',
    '.mini-cart-plus{width:7px;height:7px;object-fit:contain;pointer-events:none;margin:0 8px 0 3px;flex-shrink:0}',
    '.cart-toggle{letter-spacing:.05em;font-size:11px}',
    '[data-cart-toggle],[data-remove-id]{cursor:pointer}',
    '[data-remove-id]:hover,#motorella-cart .cart-item-remove:hover{text-decoration:underline}',
    '#motorella-cart{position:fixed;width:323px;height:276px;min-height:276px;max-height:80vh;overflow-y:hidden;background:rgba(255,255,255,.35);-webkit-backdrop-filter:blur(4px) saturate(1.1);backdrop-filter:blur(4px) saturate(1.1);border:1px solid rgba(255,255,255,.5);border-radius:4px;padding:16px;box-sizing:border-box;opacity:0;transform:translateY(-8px);filter:blur(4px);pointer-events:none;transition:opacity .35s,transform .35s,filter .4s ease,height .4s cubic-bezier(.22,.9,.32,1)}',
    '#motorella-cart.is-open{opacity:1;transform:none;filter:blur(0);pointer-events:auto}',
    '.cart-item{display:flex;gap:12px;margin-bottom:20px}.cart-item:last-child{margin-bottom:0}',
    '.cart-item-image{width:96px;height:96px;padding:8px;box-sizing:border-box;object-fit:contain;background:transparent;border:1px solid rgba(0,0,0,.3);border-radius:8px;flex-shrink:0}',
    '.cart-item-info{position:relative;flex:1 1 0%;height:76px;text-align:center}',
    '.cart-item-title{margin:6px 0 0;line-height:1.1;font-family:"Trebuchet MS",sans-serif;font-weight:700;font-size:10px;color:#737373}',
    '.cart-item-price{margin:7px 0 0;line-height:1.1;font-family:"Trebuchet MS",sans-serif;font-weight:700;font-size:9px;color:#aeaeae}',
    '#motorella-cart .cart-item-remove{background:none;border:0;padding:0;margin:0;line-height:1;font-family:"Trebuchet MS",sans-serif;font-weight:700;font-size:9px;letter-spacing:.05em;color:#aeaeae;position:absolute;left:50%;top:44px;transform:translateX(-50%)}',
    '.cart-decorative-plus{width:96px;display:flex;justify-content:center;margin-top:15px}.cart-decorative-plus.is-empty{display:none}',
    '.cart-decorative-plus img{width:7px;height:7px;opacity:.55}',
    '.cart-wordmark{position:absolute;left:16px;right:16px;bottom:16px;text-align:center;height:60px;pointer-events:none}',
    '.cart-wordmark-glow,.cart-wordmark-text{position:absolute;top:0;left:0;right:0;display:block;font-family:"Trebuchet MS",sans-serif;font-size:42px;font-weight:700;letter-spacing:.04em}',
    '.cart-wordmark-glow{color:rgba(0,0,0,.28);filter:blur(6px)}.cart-wordmark-text{color:rgba(0,0,0,.16)}',
    '@media (max-width:767px){#motorella-cart{left:50%!important;right:auto!important;width:min(323px,100vw - 32px);max-height:60vh;transform:translateX(-50%) translateY(-8px)}#motorella-cart.is-open{transform:translateX(-50%)}',
    '.mini-cart-box{min-width:100px;max-width:38vw}.mini-cart-thumb,.mini-cart-plus{max-width:100%}}'
  ].join('\n');

  function buildCart(slot) {
    el('style', '', document.head, CART_CSS);
    var hc = el('div', 'header-cart', slot);
    var tg = el('div', 'cart-toggle', hc, 'CART');
    tg.setAttribute('data-cart-toggle', '');
    var box = el('div', 'mini-cart-box', hc);
    box.setAttribute('data-mini-cart-items', '');
    box.setAttribute('data-cart-toggle', '');
    var panel = el('div', 'cart-panel', document.body);
    panel.id = 'motorella-cart';
    var items = el('div', 'cart-items', panel);
    items.setAttribute('data-cart-items', '');
    var deco = el('div', 'cart-decorative-plus', panel);
    var di = el('img', 'image-3', deco);
    di.src = PLUS;
    di.alt = '';
    var wm = el('div', 'cart-wordmark', panel);
    el('div', 'cart-wordmark-glow', wm, 'CART');
    el('div', 'cart-wordmark-text', wm, 'CART');

    function render() {
      var cart = readCart();
      items.innerHTML = '';
      cart.forEach(function (it) {
        var row = el('div', 'cart-item', items);
        var im = el('img', 'cart-item-image', row);
        im.src = it.image || '';
        im.alt = '';
        var info = el('div', 'cart-item-info', row);
        el('div', 'cart-item-title', info, it.title || '');
        el('div', 'cart-item-price', info, it.price || '');
        var rm = el('button', 'cart-item-remove', info, 'REMOVE');
        rm.setAttribute('data-remove-id', it.cartId || '');
      });
      panel.style.overflowY = 'hidden';
      panel.style.height = Math.max(276, 32 + items.scrollHeight + 100) + 'px';
      deco.classList.toggle('is-empty', cart.length === 0);
      box.innerHTML = '';
      cart.forEach(function (it) {
        var t = el('img', 'mini-cart-thumb', box);
        t.src = it.image || '';
        t.alt = '';
      });
      var plus = el('img', 'mini-cart-plus', box);
      plus.src = PLUS;
      plus.alt = '';
    }
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-cart-toggle]')) {
        e.preventDefault();
        var opening = !panel.classList.contains('is-open');
        if (opening) {
          var r = box.getBoundingClientRect();
          panel.style.top = r.bottom + 8 + 'px';
          panel.style.right = Math.max(8, window.innerWidth - r.right) + 'px';
        }
        panel.classList.toggle('is-open', opening);
        return;
      }
      var rm = e.target.closest('[data-remove-id]');
      if (rm && panel.contains(rm)) {
        var id = rm.getAttribute('data-remove-id');
        try { localStorage.setItem(CART_KEY, JSON.stringify(readCart().filter(function (x) { return x.cartId !== id; }))); } catch (err) {}
        render();
        return;
      }
      if (panel.classList.contains('is-open') && !panel.contains(e.target)) panel.classList.remove('is-open');
    });
    window.addEventListener('storage', function (e) { if (e.key === CART_KEY) render(); });
    render();
  }

  // ------------------------------------------------------------------------------------------------ the header
  var H = {};
  function buildHeader() {
    var st = el('style');
    st.id = 'mh-css';
    st.textContent = CSS;
    document.head.appendChild(st);
    document.documentElement.classList.add('mh-on');
    if (IS.arch) document.documentElement.classList.add('mh-arch');

    var h = (H.root = el('header', 'mh'));
    h.setAttribute('data-theme', 'light');
    el('div', 'mh-glass', h);
    var row = el('div', 'mh-row', h);
    var logo = el('a', 'mh-logo', row);
    logo.href = P.home;
    logo.setAttribute('aria-label', 'Motorella home');
    var old = document.querySelector('.header-left img, .link-block-2 img');
    var src = (old && (old.currentSrc || old.src)) || LOGO;
    var mark = el('span', 'mh-mark', logo);
    mark.style.setProperty('--mh-logo', 'url("' + src + '")');
    var probe = new Image();
    probe.onload = function () { if (probe.naturalHeight) mark.style.width = Math.round(26 * probe.naturalWidth / probe.naturalHeight) + 'px'; };
    probe.src = src;
    h.style.setProperty('--mh-plus', 'url("' + PLUS + '")');
    // default look: very slightly darker glass, soft dark grey words Set MOTORELLA_HEADER = 'dark' for the darker glass with light words.
    var look = window.MOTORELLA_HEADER || 'soft-dark';
    if (look === 'soft' || look === 'soft-dark') h.classList.add('is-soft');
    if (look === 'soft-dark') h.classList.add('is-soft-dark');

    var nav = (H.nav = el('nav', 'mh-nav', row));
    nav.setAttribute('aria-label', 'Main');
    var sheet = (H.sheet = el('div', 'mh-sheet', h));
    NAV.forEach(function (it, i) {
      buildItem(nav, it, i, false);
      buildItem(sheet, it, i, true);
    });

    var right = el('div', 'mh-right', row);
    var slot = el('div', 'mh-cart-slot', right);
    var shopCart = document.querySelector('.header-cart');
    if (shopCart) {
      // the shop's own cart (it keeps its own behaviour): moved into the header
      slot.appendChild(shopCart);
    } else {
      buildCart(slot);
    }
    var menu = (H.menu = el('button', 'mh-menu', right, 'Menu'));
    menu.type = 'button';
    menu.setAttribute('aria-expanded', 'false');
    menu.addEventListener('click', function () { setMenu(!h.classList.contains('is-menu')); });

    document.body.appendChild(h);

    // hover: open the item under the pointer, close a moment after the pointer leaves the header
    var closeT = 0;
    nav.addEventListener('pointerover', function (e) {
      if (e.pointerType === 'touch') return;
      var item = e.target.closest('.mh-item');
      if (item) { clearTimeout(closeT); openItem(item); }
    });
    h.addEventListener('pointerleave', function (e) {
      if (e.pointerType === 'touch') return;
      clearTimeout(closeT);
      closeT = setTimeout(function () { openItem(null); }, 160);
    });
    h.addEventListener('pointerenter', function () { clearTimeout(closeT); });
    row.addEventListener('pointerover', function (e) {
      if (e.pointerType === 'touch') return;
      if (!e.target.closest('.mh-item') && !e.target.closest('.mh-sub')) {
        clearTimeout(closeT);
        closeT = setTimeout(function () { openItem(null); }, 160);
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { openItem(null); setMenu(false); }
    });
    document.addEventListener('pointerdown', function (e) {
      if (!h.contains(e.target)) openItem(null);
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { if (H.open) sizeOpen(H.open); onScroll(); });
    onScroll();
    setTimeout(onScroll, 400);
    // pages that lay themselves out around the old header (the chairs) measure again now it has gone
    setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 50);
  }

  function buildItem(parent, it, i, inSheet) {
    var wrap = el('div', inSheet ? 'mh-sitem' : 'mh-item', parent);
    var top;
    if (it.sub && !inSheet) {
      top = el('a', 'mh-top', wrap);
      top.href = it.href;
      top.innerHTML = '<u></u>';
      top.firstChild.textContent = it.label;
      top.setAttribute('aria-haspopup', 'true');
      // keyboard / touch on a wide screen: first activation opens, second follows the link
      top.addEventListener('click', function (e) {
        if (!wrap.classList.contains('is-open')) { e.preventDefault(); openItem(wrap); }
      });
      top.addEventListener('focus', function () { openItem(wrap); });
    } else if (it.sub && inSheet) {
      top = el('button', 'mh-top', wrap);
      top.type = 'button';
      top.innerHTML = '<span></span><b aria-hidden="true">+</b>';
      top.firstChild.textContent = it.label;
      top.addEventListener('click', function () {
        var was = wrap.classList.contains('is-open');
        [].forEach.call(H.sheet.querySelectorAll('.mh-sitem.is-open'), function (x) { x.classList.remove('is-open'); });
        if (!was) wrap.classList.add('is-open');
      });
    } else {
      top = el(it.info ? 'button' : 'a', 'mh-top', wrap);
      if (it.info) {
        top.type = 'button';
        top.addEventListener('click', function () { openItem(null); setMenu(false); openInfo(it.info); });
      } else top.href = it.href;
      top.innerHTML = '<u></u>';
      top.firstChild.textContent = it.label;
    }
    if (it.href && samePage(it.href) && !inSheet) wrap.classList.add('is-here');
    if (!it.sub) return;

    var sub = el('div', inSheet ? 'mh-ssub' : 'mh-sub', wrap);
    var box = inSheet ? el('div', '', sub) : sub;
    it.sub.forEach(function (s, k) {
      var line = el('div', 'mh-line', box);
      line.style.transitionDelay = (inSheet ? 0.03 : 0.05) * k + 0.06 + 's';
      var a;
      if (s.href) {
        a = el('a', 'mh-link', line, s.label);
        a.href = s.href;
        if (samePage(s.href) && (!s.type || location.search.indexOf('type=' + s.type) >= 0) && (s.type || location.search.indexOf('type=') < 0)) a.classList.add('is-here');
        if (s.type && IS.shop) {
          a.addEventListener('click', function (e) {
            e.preventDefault();
            setShopType(s.type);
            openItem(null);
            setMenu(false);
          });
        } else if (!s.type && IS.shop && samePage(s.href)) {
          a.addEventListener('click', function (e) { e.preventDefault(); setShopType(null); openItem(null); setMenu(false); });
        }
      } else {
        a = el('button', 'mh-link', line, s.label);
        a.type = 'button';
        var ways = el('span', 'mh-ways', line);
        if (s.soon) {
          el('span', 'mh-soon', ways, 'Coming soon');
        } else {
          [['Classic', s.ways.classic], ['Legacy', s.ways.legacy]].forEach(function (w) {
            var x = el(w[1] ? 'a' : 'span', 'mh-way' + (w[1] ? '' : ' is-soon'), ways, w[0]);
            if (w[1]) x.href = w[1];
            else el('small', '', x, 'coming soon');
          });
        }
        a.setAttribute('aria-expanded', 'false');
        a.addEventListener('click', function () {
          var on = !line.classList.contains('is-ways');
          [].forEach.call(box.querySelectorAll('.mh-line.is-ways'), function (x) { x.classList.remove('is-ways'); });
          line.classList.toggle('is-ways', on);
          a.setAttribute('aria-expanded', on ? 'true' : 'false');
          if (!inSheet && H.open) sizeOpen(H.open);
        });
      }
    });
  }

  function sizeOpen(item) {
    var sub = item.querySelector('.mh-sub');
    var row = H.root.querySelector('.mh-row').offsetHeight;
    var need = sub ? sub.offsetTop + sub.scrollHeight - 6 : row;
    H.root.style.setProperty('--mh-h', Math.max(row, Math.ceil(need)) + 'px');
  }
  function openItem(item) {
    if (item && !item.querySelector('.mh-sub')) item = null;
    if (H.open === item) return;
    if (H.open) {
      H.open.classList.remove('is-open');
      [].forEach.call(H.open.querySelectorAll('.mh-line.is-ways'), function (x) { x.classList.remove('is-ways'); });
    }
    H.open = item;
    if (item) {
      item.classList.add('is-open');
      H.root.classList.add('is-open');
      sizeOpen(item);
    } else {
      H.root.classList.remove('is-open');
      H.root.style.removeProperty('--mh-h');
    }
  }
  function setMenu(on) {
    if (!H.root) return;
    H.root.classList.toggle('is-menu', !!on);
    H.menu.textContent = on ? 'Close' : 'Menu';
    H.menu.setAttribute('aria-expanded', on ? 'true' : 'false');
    document.documentElement.style.overflow = on ? 'hidden' : '';
    if (!on) [].forEach.call(H.sheet.querySelectorAll('.mh-sitem.is-open'), function (x) { x.classList.remove('is-open'); });
    onScroll();
  }

  // glass once the page has moved; light or dark text by what sits behind the header
  var themeT = 0, lastY = 0;
  function onScroll() {
    if (!H.root) return;
    var y = window.scrollY || document.documentElement.scrollTop || 0;
    // an open menu folds away once the page is scrolled
    if (H.open && Math.abs(y - lastY) > 40) openItem(null);
    if (!H.open) lastY = y;
    H.root.classList.toggle('is-scrolled', y > 8);
    cancelAnimationFrame(themeT);
    themeT = requestAnimationFrame(pickTheme);
  }
  function pickTheme() {
    var theme = document.body.getAttribute('data-mh-theme') || 'light';
    var row = H.root.querySelector('.mh-row').offsetHeight;
    var y = Math.round(row / 2);
    var xs = [window.innerWidth * 0.25, window.innerWidth * 0.5, window.innerWidth * 0.8];
    var dark = 0, seen = 0;
    H.root.style.visibility = 'hidden';
    for (var i = 0; i < xs.length; i++) {
      var e = document.elementFromPoint(xs[i], y);
      var s = e && e.closest && e.closest('[data-mh-theme]');
      if (s) { seen++; if (s.getAttribute('data-mh-theme') === 'dark') dark++; }
    }
    H.root.style.visibility = '';
    if (seen) theme = dark * 2 > seen ? 'dark' : 'light';
    if (H.root.classList.contains('is-menu')) theme = 'dark';
    if (H.root.classList.contains('is-menu') || H.root.classList.contains('is-open')) theme = theme; // glass follows theme too
    H.root.setAttribute('data-theme', theme);
  }

  // ------------------------------------------------------------------------------------------------ information window
  var infoReady = null;
  function getInfo() {
    if (infoReady) return infoReady;
    var w = document.querySelector('.info-window');
    if (w) { infoReady = Promise.resolve(wireInfo(w)); return infoReady; }
    // not on this page: borrow it from the home page (its text is edited there, once, in Webflow)
    infoReady = fetch(P.home, { credentials: 'same-origin' })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var src = doc.querySelector('.info-window');
        if (!src) throw new Error('no info window');
        var w2 = document.importNode(src, true);
        w2.style.display = 'none';
        [].forEach.call(w2.querySelectorAll('img'), function (im) { im.removeAttribute('loading'); });
        document.body.appendChild(w2);
        return wireInfo(w2);
      })
      .catch(function () { infoReady = null; return null; });
    return infoReady;
  }
  function wireInfo(w) {
    if (w.__mh) return w;
    w.__mh = true;
    var tabs = ['shipping', 'contact', 'socials'];
    tabs.forEach(function (t) {
      var b = w.querySelector('.' + t + '-tab');
      if (b) b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); showTab(w, t); });
    });
    var ok = w.querySelector('.close-menu');
    if (ok) ok.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); w.style.display = 'none'; });
    // drag by the title bar (the "information" strip along the top), the same on every page.
    // The press is claimed outright so the browser never starts a text selection or a native
    // image drag underneath, which is what used to cancel the move on pages other than home.
    var d = null;
    var t0 = w.querySelector('.info-text');
    if (t0) { t0.style.touchAction = 'none'; t0.style.userSelect = 'none'; t0.style.webkitUserSelect = 'none'; }
    function onBar(e) {
      if (e.target.closest('a,button,input,textarea,select,[class*="-tab"],[class*="-content"],.close-menu')) return false;
      if (e.target.closest('.info-text-div,.info-text')) return true;
      return e.clientY - w.getBoundingClientRect().top < 30;
    }
    w.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || !onBar(e)) return;
      // taken in the capture phase so no other drag code on the page starts a second, competing move
      e.preventDefault();
      e.stopPropagation();
      var r = w.getBoundingClientRect();
      d = { x: e.clientX - r.left, y: e.clientY - r.top, id: e.pointerId };
      w.style.left = r.left + 'px';
      w.style.top = r.top + 'px';
      w.style.right = 'auto';
      w.style.bottom = 'auto';
      w.style.margin = '0';
      w.style.transform = 'none';
      try { w.setPointerCapture(e.pointerId); } catch (err) {}
    }, true);
    w.addEventListener('pointermove', function (e) {
      if (!d || e.pointerId !== d.id) return;
      e.preventDefault();
      var r = w.getBoundingClientRect();
      w.style.left = Math.max(-r.width + 60, Math.min(window.innerWidth - 60, e.clientX - d.x)) + 'px';
      w.style.top = Math.max(0, Math.min(window.innerHeight - 40, e.clientY - d.y)) + 'px';
    });
    function end() { d = null; }
    w.addEventListener('pointerup', end);
    w.addEventListener('pointercancel', end);
    w.addEventListener('lostpointercapture', end);
    w.addEventListener('dragstart', function (e) { e.preventDefault(); });
    return w;
  }
  function showTab(w, t) {
    ['shipping', 'contact', 'socials'].forEach(function (k) {
      var bg = w.querySelector('.' + k + '-bg');
      var ct = w.querySelector('.' + k + '-content');
      if (bg) bg.style.display = k === t ? 'block' : 'none';
      if (ct) ct.style.display = k === t ? 'block' : 'none';
    });
  }
  function openInfo(t) {
    getInfo().then(function (w) {
      if (!w) return;
      showTab(w, t);
      w.style.display = 'block';
    });
  }

  // ------------------------------------------------------------------------------------------------ shop
  var tip;
  function shop() {
    document.documentElement.classList.add('mh-shop');
    // the catalogue filtered by ?type=… (TOPS / SHOES in the header), through the shop's own fabric button
    var m = /[?&]type=([a-z-]+)/.exec(location.search);
    if (m) whenReady(function () { setShopType(m[1], true); });
    if (/[?&]cart=open/.test(location.search)) whenReady(function () {
      var t = document.querySelector('.cart-toggle');
      if (t) t.click();
    });
    soldOut();
  }
  function whenReady(fn) {
    var n = 0;
    (function go() {
      if (document.querySelector('.mtla-dot[data-mtla-role="type"]') || n++ > 40) fn();
      else setTimeout(go, 100);
    })();
  }
  function visibleTypes() {
    var set = {};
    [].forEach.call(document.querySelectorAll('.product-card'), function (c) {
      if (getComputedStyle(c).display !== 'none') set[c.getAttribute('data-product-type') || '?'] = 1;
    });
    return Object.keys(set);
  }
  function setShopType(type, quiet) {
    var dot = document.querySelector('.mtla-dot[data-mtla-role="type"]');
    if (!dot) return;
    // the fabric button's type dot steps through all → tops → shoes → all …: step until it shows what was asked
    for (var i = 0; i < 8; i++) {
      var v = visibleTypes();
      if (type ? v.length === 1 && v[0] === type : v.length > 1) break;
      dot.click();
    }
    if (!quiet || true) {
      var u = new URL(location.href);
      if (type) u.searchParams.set('type', type);
      else u.searchParams.delete('type');
      history.replaceState(null, '', u.pathname + u.search + u.hash);
    }
    [].forEach.call(document.querySelectorAll('.mh-link'), function (a) {
      var t = /[?&]type=([a-z-]+)/.exec(a.getAttribute('href') || '');
      if (a.getAttribute('href') && samePage(a.getAttribute('href'))) a.classList.toggle('is-here', type ? !!(t && t[1] === type) : !t);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function isSoldOut(c) {
    var v = (c.getAttribute('data-sold-out') || '').toLowerCase();
    if (v === 'true' || v === 'yes' || v === '1' || c.classList.contains('is-sold-out')) return true;
    var sizes = c.querySelectorAll('.size-option');
    if (!sizes.length) return false;
    var out = c.querySelectorAll('.size-option[data-sold-out="true"],.size-option.is-sold-out');
    return out.length === sizes.length;
  }
  function soldOut() {
    tip = el('div', 'mh-tip', document.body, 'SOLD OUT');
    [].forEach.call(document.querySelectorAll('.size-option[data-sold-out="true"]'), function (s) { s.classList.add('is-sold-out'); });
    [].forEach.call(document.querySelectorAll('.product-card'), function (c) {
      if (!isSoldOut(c)) return;
      c.classList.add('is-sold-out');
      if (getComputedStyle(c).position === 'static') c.style.position = 'relative';
      var tag = el('span', 'mh-soldout', c, 'SOLD OUT');
      var pic = c.querySelector('.product-image');
      var place = function () {
        if (!pic || !pic.offsetWidth) return;
        tag.style.left = pic.offsetLeft + pic.offsetWidth / 2 + 'px';
        tag.style.top = pic.offsetTop + 10 + 'px';
      };
      place();
      if (pic && !pic.complete) pic.addEventListener('load', place);
      window.addEventListener('resize', place);
      c.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        tip.style.transform = 'translate(' + (e.clientX + 14) + 'px,' + (e.clientY + 14) + 'px)';
        tip.classList.add('is-on');
      });
      c.addEventListener('pointerleave', function () { tip.classList.remove('is-on'); });
      c.addEventListener('click', function () { window.__mhSoldOutCard = c; }, true);
    });
    // an open product that is sold out can't be added to the cart
    document.addEventListener('click', function (e) {
      var add = e.target.closest('.pv-section-secondary');
      var last = window.__mhSoldOutCard;
      if (!add || !last || !last.classList.contains('is-sold-out')) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      tip.style.transform = 'translate(' + (e.clientX + 14) + 'px,' + (e.clientY + 14) + 'px)';
      tip.classList.add('is-on');
      setTimeout(function () { tip.classList.remove('is-on'); }, 1200);
    }, true);
    document.addEventListener('click', function (e) {
      var c = e.target.closest('.product-card');
      if (c && !c.classList.contains('is-sold-out')) window.__mhSoldOutCard = null;
    }, true);
    // label the product view's button while a sold-out product is open
    var mo = new MutationObserver(function () {
      var last = window.__mhSoldOutCard;
      [].forEach.call(document.querySelectorAll('.pv-add-glow,.pv-add-text'), function (s) {
        if (!s.__mhText) s.__mhText = s.textContent;
        s.textContent = last && last.classList.contains('is-sold-out') ? 'SOLD OUT' : s.__mhText;
      });
    });
    mo.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class', 'style'] });
  }

  // ------------------------------------------------------------------------------------------------ home
  // Panels after the room. Each is { kind: 'model' | 'video', src, button, href } or a still picture
  // { image, fit (cover|contain), theme (light|dark), small/title (caption), button, href }.
  // Files that ship with this script (the airbag film and its first frame) are served from the same tagged release.
  var MEDIA = (function () {
    var m = /^(https:\/\/cdn\.jsdelivr\.net\/gh\/[^/]+\/[^/@]+@[^/]+\/)/.exec((document.currentScript && document.currentScript.src) || '');
    return m ? m[1] : 'https://cdn.jsdelivr.net/gh/Elijah-Tho/motorella-archive@site-1.1.0/';
  })();
  // After the room: the cap in 3D, then the airbag film. Nothing else.
  var HOME = window.MOTORELLA_HOME || [
    { kind: 'model', src: 'https://d8j0ntlcm91z4.cloudfront.net/user_37rM5MKDTigahhjI4yQJMOQzK2I/hf_20261031_062113_e249cc94-1885-40c1-8296-07b2b5b50a87.glb', alt: 'motorella cap', button: 'View now', href: P.shop },
    // no button on the film: anywhere it sits, it covers the fall or the airbag
    { kind: 'video', src: MEDIA + 'motorella-airbag.mp4', poster: MEDIA + 'motorella-airbag-poster.jpg', button: false }
  ];
  // A 3D piece on white: turns by itself, can be dragged round, and goes back to turning a moment after it is let go.
  // Drawn with three.js, loaded only when the panel is about to come into view. A brushed metal clasp engraved with
  // the m mark is built here and set on the back strap (p.clasp: its place on the model, or false for none).
  var TB = 'https://cdn.jsdelivr.net/npm/three@0.160.0/';
  function overlay(s, p) {
    var over = el('div', 'mhome-over', s);
    if (p.small || p.title) {
      var cap = el('div', 'mhome-cap', over);
      if (p.small) el('small', '', cap, p.small);
      if (p.title) el('b', '', cap, p.title);
    }
    if (p.button === false) return;
    var b = el('a', 'mhome-btn', over, p.button || 'View now');
    b.href = p.href || P.shop;
  }
  function whenNear(node, fn) {
    if (!('IntersectionObserver' in window)) return fn();
    var io = new IntersectionObserver(function (en) {
      if (en.some(function (x) { return x.isIntersecting; })) { io.disconnect(); fn(); }
    }, { rootMargin: '100% 0px' });
    io.observe(node);
  }
  function modelPanel(main, p) {
    var s = el('section', 'mhome-panel mhome-model', main);
    s.setAttribute('data-theme', 'light');
    s.setAttribute('data-mh-theme', 'light');
    var stage = el('div', 'mhome-stage', s);
    stage.setAttribute('aria-label', p.alt || 'motorella');
    overlay(s, p);
    whenNear(s, function () {
      Promise.all([
        import(TB + '+esm'),
        import(TB + 'examples/jsm/loaders/GLTFLoader.js/+esm'),
        import(TB + 'examples/jsm/controls/OrbitControls.js/+esm'),
        import(TB + 'examples/jsm/environments/RoomEnvironment.js/+esm'),
        import(TB + 'examples/jsm/geometries/RoundedBoxGeometry.js/+esm')
      ]).then(function (m) { return build(m[0], m[1].GLTFLoader, m[2].OrbitControls, m[3].RoomEnvironment, m[4].RoundedBoxGeometry); })
        .catch(function (e) { if (window.console) console.warn('motorella 3d', e); });
    });

    function build(THREE, GLTFLoader, OrbitControls, RoomEnvironment, RoundedBoxGeometry) {
      var r = new THREE.WebGLRenderer({ antialias: true });
      r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      r.outputColorSpace = THREE.SRGBColorSpace;
      r.toneMapping = THREE.ACESFilmicToneMapping;
      r.toneMappingExposure = 0.95;
      stage.appendChild(r.domElement);
      var scene = new THREE.Scene();
      scene.background = new THREE.Color(0xffffff);
      var pm = new THREE.PMREMGenerator(r);
      scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d8dc, 0.9));
      var key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(-2, 3, -2); scene.add(key);
      var fill = new THREE.DirectionalLight(0xffffff, 0.6); fill.position.set(2, 2, 3); scene.add(fill);
      var cam = new THREE.PerspectiveCamera(30, 1, 0.01, 100);

      return new GLTFLoader().loadAsync(p.src).then(function (g) {
        var piece = new THREE.Group();
        piece.add(g.scene);
        g.scene.traverse(function (o) { if (o.isMesh && o.material) { o.material.metalness = 0; o.material.needsUpdate = true; } });
        if (p.clasp !== false) piece.add(clasp(THREE, RoundedBoxGeometry, p.clasp || [-0.2, -0.2, -0.885]));
        var box = new THREE.Box3().setFromObject(piece);
        var c = box.getCenter(new THREE.Vector3());
        piece.position.sub(c);
        scene.add(piece);
        var rad = box.getSize(new THREE.Vector3()).length() / 2;
        // p.scale: how much of the screen the piece fills (smaller number = smaller piece)
        var dist = rad / Math.sin(THREE.MathUtils.degToRad(cam.fov / 2)) / (p.scale || 0.5);
        var az = THREE.MathUtils.degToRad(p.azimuth == null ? 35 : p.azimuth), el2 = THREE.MathUtils.degToRad(14);
        cam.position.set(Math.sin(az) * Math.cos(el2) * dist, Math.sin(el2) * dist, Math.cos(az) * Math.cos(el2) * dist);
        var ctl = new OrbitControls(cam, r.domElement);
        ctl.enableZoom = false; ctl.enablePan = false; ctl.enableDamping = true; ctl.dampingFactor = 0.08;
        ctl.minPolarAngle = Math.PI * 0.3; ctl.maxPolarAngle = Math.PI * 0.6;
        ctl.autoRotate = true; ctl.autoRotateSpeed = 2.2;
        r.domElement.style.touchAction = 'pan-y';
        var back = 0;
        ctl.addEventListener('start', function () { clearTimeout(back); ctl.autoRotate = false; });
        ctl.addEventListener('end', function () { clearTimeout(back); back = setTimeout(function () { ctl.autoRotate = true; }, 1200); });

        function size() {
          var w = stage.clientWidth || 1, h = stage.clientHeight || 1;
          r.setSize(w, h, false); cam.aspect = w / h;
          // keep the whole piece in frame on a narrow screen
          cam.fov = w < h ? 30 * Math.min(1.6, h / w * 0.75) : 30;
          cam.updateProjectionMatrix();
        }
        size();
        window.addEventListener('resize', size);
        var on = true, raf = 0, first = true;
        function loop() {
          raf = requestAnimationFrame(loop);
          ctl.update(); r.render(scene, cam);
          if (first) { first = false; s.classList.add('is-loaded'); }
        }
        if ('IntersectionObserver' in window) {
          new IntersectionObserver(function (en) {
            var vis = en.some(function (x) { return x.isIntersecting; });
            if (vis && !raf) loop();
            if (!vis && raf) { cancelAnimationFrame(raf); raf = 0; }
          }).observe(s);
        } else loop();
      });
    }
  }
  // the back clasp: rounded brushed-metal plate, the m mark engraved in its face
  function clasp(THREE, RoundedBoxGeometry, at) {
    var grp = new THREE.Group();
    var metal = new THREE.MeshPhysicalMaterial({ color: 0xc4c7cc, metalness: 0.85, roughness: 0.32, envMapIntensity: 1.6, clearcoat: 0.2 });
    grp.add(new THREE.Mesh(new RoundedBoxGeometry(0.15, 0.1, 0.02, 3, 0.008), metal));
    var cv = document.createElement('canvas'); cv.width = 512; cv.height = 342;
    var tex = new THREE.CanvasTexture(cv);
    var mark = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.1), new THREE.MeshPhysicalMaterial({ color: 0x55585d, metalness: 0.7, roughness: 0.75, alphaMap: tex, transparent: true, opacity: 0.95, depthWrite: false }));
    mark.position.z = -0.0102; mark.rotation.y = Math.PI;
    grp.add(mark);
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      var c = cv.getContext('2d'), k = Math.min(cv.width * 0.62 / img.width, cv.height * 0.62 / img.height);
      var w = img.width * k, h = img.height * k;
      c.drawImage(img, (cv.width - w) / 2, (cv.height - h) / 2, w, h);
      c.globalCompositeOperation = 'source-in'; c.fillStyle = '#fff'; c.fillRect(0, 0, cv.width, cv.height);
      c.globalCompositeOperation = 'destination-over'; c.fillStyle = '#000'; c.fillRect(0, 0, cv.width, cv.height);
      tex.needsUpdate = true;
    };
    img.src = LOGO;
    grp.position.set(at[0], at[1], at[2]);
    grp.scale.setScalar(0.85);
    return grp;
  }
  // A short film that loops without sound, playing only while it is on screen.
  function videoPanel(main, p) {
    var s = el('section', 'mhome-panel mhome-video', main);
    s.setAttribute('data-theme', p.theme || 'light');
    s.setAttribute('data-mh-theme', p.theme || 'light');
    var v = el('video', '', s);
    v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'none';
    v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
    if (p.poster) v.poster = p.poster;
    overlay(s, p);
    whenNear(s, function () { v.src = p.src; v.preload = 'auto'; });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        en.forEach(function (x) { if (x.isIntersecting) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); } else v.pause(); });
      }, { threshold: 0.2 }).observe(s);
    } else v.autoplay = true;
  }

  function home() {
    document.documentElement.classList.add('mh-home');
    // panels can also be laid out in Webflow: [data-mtla-home] > [data-panel] with data-image, data-fit, data-theme,
    // data-small, data-title, data-button, data-href
    var custom = document.querySelector('[data-mtla-home]');
    var list = HOME;
    if (custom && custom.querySelector('[data-panel]')) {
      list = [].map.call(custom.querySelectorAll('[data-panel]'), function (p) {
        var d = p.dataset;
        var im = p.querySelector('img');
        return { image: d.image || (im && (im.currentSrc || im.src)), fit: d.fit || 'cover', theme: d.theme || 'light', small: d.small || '', title: d.title || '', button: d.button || 'Shop all', href: d.href || P.shop };
      });
      custom.style.display = 'none';
    }

    var main = el('main', 'mhome');
    var bg = /url\(["']?(.*?)["']?\)/.exec(getComputedStyle(document.body).backgroundImage || '');
    if (bg) main.style.setProperty('--mh-room', 'url("' + bg[1] + '")');
    // 1 · the room, as it was: the whole first screen, the bubbles floating in it
    var hero = el('section', 'mhome-panel mhome-hero is-in', main);
    hero.setAttribute('data-mh-theme', 'light');
    hero.setAttribute('data-theme', 'light');
    // the big wordmark stays exactly where it was in the first screen
    var wm = document.querySelector('.motorella-logo');
    if (wm) {
      var wr = wm.getBoundingClientRect();
      var w = el('img', 'mhome-wordmark', hero);
      w.src = wm.currentSrc || wm.src;
      w.alt = 'motorella';
      if (wr.width) {
        w.style.left = wr.left + 'px';
        w.style.top = wr.top + 'px';
        w.style.width = wr.width + 'px';
      }
    }

    list.forEach(function (p) {
      if (p.kind === 'model') return modelPanel(main, p);
      if (p.kind === 'video') return videoPanel(main, p);
      var s = el('section', 'mhome-panel', main);
      s.setAttribute('data-fit', p.fit || 'cover');
      s.setAttribute('data-theme', p.theme || 'light');
      s.setAttribute('data-mh-theme', p.theme || 'light');
      var im = el('img', 'mhome-img', s);
      im.loading = 'lazy';
      im.decoding = 'async';
      im.src = p.image;
      im.alt = p.title || '';
      var over = el('div', 'mhome-over', s);
      if (p.small || p.title) {
        var cap = el('div', 'mhome-cap', over);
        if (p.small) el('small', '', cap, p.small);
        if (p.title) el('b', '', cap, p.title);
      }
      var b = el('a', 'mhome-btn', over, p.button || 'Shop all');
      b.href = p.href || P.shop;
    });
    el('footer', 'mhome-foot', main, '© ' + new Date().getFullYear() + ', motorella');

    // the page goes first in the body; the old fixed navigation hides (its links are in the header now)
    document.body.insertBefore(main, document.body.firstChild);
    document.documentElement.classList.add('mh-built');

    // the bubbles stay where they are in the first screen and scroll away with it
    var mat = document.querySelector('.motorella-material');
    if (mat && mat.parentElement) {
      var holder = mat.parentElement;
      holder.style.setProperty('position', 'absolute', 'important');
      holder.style.top = '0';
      holder.style.left = '0';
      holder.style.zIndex = '3';
      hero.appendChild(holder);
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) {
        en.forEach(function (x) { if (x.isIntersecting) x.target.classList.add('is-in'); });
      }, { threshold: 0.25 });
      [].forEach.call(main.querySelectorAll('.mhome-panel'), function (s) { io.observe(s); });
    } else {
      [].forEach.call(main.querySelectorAll('.mhome-panel'), function (s) { s.classList.add('is-in'); });
    }
  }

  // ------------------------------------------------------------------------------------------------ start
  function start() {
    if (IS.home) home();
    buildHeader();
    if (IS.shop) shop();
    // the information window: wire it now on the home page, borrow it later elsewhere
    if (document.querySelector('.info-window')) getInfo();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
