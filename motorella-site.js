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
    { label: 'Archive', href: P.archive, sub: [
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
    arch: path.indexOf(P.archive) === 0 || path === P.ntf || !!document.querySelector('[data-mtla-archive],[data-mtla-chairs]'),
    looks: path === P.looks || !!document.querySelector('.lk-row')
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
    '@media (max-width:' + NARROW + 'px){html.mh-on.mh-shop .shop-body{padding-top:calc(var(--mh-row) + 22px)!important}html.mh-on.mh-shop .sidebar{position:static!important;top:auto!important}}',
    '@media (prefers-reduced-motion:reduce){.mh *,.mh{transition:none!important}}',
    // the information window, wherever it is opened
    '.info-window{z-index:1100!important}',
    // it drags from anywhere, with the normal arrow (the page's own styles give the title a move cursor: undo that)
    '.info-window .info-text-div,.info-window .info-text,.info-window .info-bg{cursor:default!important}',
    // pages: keep their own labels clear of the header
    'html.mh-on .sidebar{top:calc(var(--mh-row) + 34px)!important}',
    // shop
    'html.mh-shop .products-heading{display:none!important}',
    'html.mh-shop .sidebar-label{padding-left:0!important;margin-left:0!important;margin-bottom:0!important}',
    'html.mh-shop .products-count-row{margin-top:10px!important}',
    'html.mh-shop .mtla-toggle-bar{margin-top:8px!important}',
    // the little plus only lives in the main cart now: not after the mini cart's pictures, not beside product names
    '.mini-cart-plus,.data-size-toggle,.pv-title-icon{display:none!important}',
    '.product-card.is-revealed{will-change:auto}',
    // the main cart opens clear of the header bar
    '#motorella-cart{top:calc(var(--mh-row) + 14px)!important}',
    // the fabric filter's lit states: a grey, then lighter, then white (they were blue, green and pink)
    '.mtla-dot[data-mtla-state="blue"] .mtla-dot-ring{border-color:#8e8e93!important;box-shadow:0 0 4px 0 rgba(142,142,147,.8),inset 0 0 1.3px 0 rgba(255,255,255,.65)!important}',
    '.mtla-dot[data-mtla-state="pink"] .mtla-dot-ring{border-color:#fff!important;box-shadow:0 0 4px 0 rgba(255,255,255,.95),0 0 1px 0 rgba(0,0,0,.28),inset 0 0 1.3px 0 rgba(255,255,255,.65)!important}',
    '.mtla-dot[data-mtla-state="green"] .mtla-dot-ring{border-color:#cfcfd2!important;box-shadow:0 0 4px 0 rgba(207,207,210,.85),inset 0 0 1.3px 0 rgba(255,255,255,.65)!important}',
    // quick add: the sizes sit under the product, centred, each easy to hit
    'html.mh-shop .product-sizes{justify-content:center;flex-wrap:wrap;gap:0 2px;padding-top:4px;box-sizing:border-box;width:100%;left:0}',
    'html.mh-shop .product-sizes .size-option{display:inline-flex;align-items:center;justify-content:center;padding:8px 5px;line-height:1;cursor:pointer}',
    'html.mh-shop .product-sizes .size-option:hover{text-decoration:underline}',
    // pointer screens: they show while the pointer is on the product (and stay while it moves down onto them)
    '@media (any-hover:hover){html.mh-shop .product-card:hover{z-index:6}html.mh-shop .product-card:hover .product-sizes{display:flex!important;animation:mhszin .18s ease}}',
    '@keyframes mhszin{from{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:none}}',
    // touch screens: the first tap opens them under the product, on one line, in the flow, pushing the next row down
    'html.mh-shop .product-card.mh-sz .product-sizes{display:flex!important;position:static!important;flex-wrap:nowrap;justify-content:space-between;gap:0;padding:2px 0 0;animation:mhszin .18s ease}',
    'html.mh-shop .product-card.mh-sz .product-sizes .size-option{flex:0 1 auto;padding:12px 1px;min-height:38px;box-sizing:border-box;white-space:nowrap;letter-spacing:0;font-size:clamp(7px,2.05vw,9px)}',
    // phones: the sizes line is always there under each product, folded to nothing; the first tap opens it smoothly, so
    // the products below glide down to make room (and glide back when it closes)
    '@media (max-width:' + NARROW + 'px){',
    '  html.mh-shop .product-card .product-sizes{display:flex!important;position:static!important;flex-wrap:nowrap;justify-content:space-between;gap:0;padding:0;',
    '    max-height:0;overflow:hidden;opacity:0;pointer-events:none;animation:none!important;',
    '    transition:max-height .38s cubic-bezier(.2,.75,.15,1),padding .38s cubic-bezier(.2,.75,.15,1),opacity .22s ease}',
    '  html.mh-shop .product-card.mh-sz .product-sizes{max-height:44px;padding:2px 0 0;opacity:1;pointer-events:auto;',
    '    transition:max-height .42s cubic-bezier(.2,.75,.15,1),padding .42s cubic-bezier(.2,.75,.15,1),opacity .3s ease .08s}',
    '}',
    '@media (max-width:' + NARROW + 'px){',
    // phones: the fabric filter sits at the bottom of the screen, in the middle, twice the size
    '  html.mh-shop .mtla-toggle-bar{position:fixed!important;left:50%!important;right:auto!important;top:auto!important;bottom:calc(20px + env(safe-area-inset-bottom,0px))!important;margin:0!important;',
    '    transform:translateX(-50%) scale(2.1);transform-origin:50% 100%;z-index:60;filter:drop-shadow(0 3px 6px rgba(0,0,0,.16))}',
    '  html.mh-shop .shop-body{padding-bottom:110px!important}',
    // every row of products sizes to its content (the first two had a fixed height), so open sizes push the next row down
    '  html.mh-shop .product-grid{grid-template-rows:none!important}',
    // the product view: the first screen is the product alone (pictures, the title panel, the size chart button); the
    // other products come after a scroll. Add to cart is a bar fixed to the bottom over everything, and there is enough
    // room at the end for it to sit below the rail. Its first tap opens the sizes.
    '  #product-view .pv-other-products{padding-bottom:calc(84px + env(safe-area-inset-bottom,0px))!important}',
    // (the view's background blur moves onto a layer of its own: on the view itself it pins "fixed" children to the
    // scrolling view instead of the screen, so the bar would ride up with the page)
    '  #product-view{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}',
    // (the blur is a layer of its own just under the view, outside it, fading in and out with it: inside the fading view
    // a blur only takes once the view is fully shown, so the page went white first and then blurred all at once)
    // The blur itself grows from nothing (rather than a finished blur fading in): iPhones only draw a fading blur once
    // the fade is over, which showed as a late, sudden darkening behind the product's box.
    '  .mh-pv-blur{display:block;position:fixed;inset:0;z-index:899;pointer-events:none;visibility:hidden;',
    '    -webkit-backdrop-filter:blur(0px);backdrop-filter:blur(0px);',
    '    transition:-webkit-backdrop-filter .4s ease,backdrop-filter .4s ease,visibility 0s linear .4s}',
    '  .mh-pv-blur.is-on{visibility:visible;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);',
    '    transition:-webkit-backdrop-filter .4s ease,backdrop-filter .4s ease,visibility 0s}',
    // (no band behind the bar: the button floats on its own over the page, so no strip of blur shows between it and the title)
    '  #product-view .pv-section-secondary{position:fixed!important;left:0!important;right:0!important;bottom:0!important;top:auto!important;z-index:50;margin:0!important;',
    '    display:flex!important;flex-direction:column;align-items:center;gap:8px;padding:0 16px calc(18px + env(safe-area-inset-bottom,0px))!important;box-sizing:border-box;',
    '    background:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border:0!important;pointer-events:none}',
    '  #product-view .pv-section-secondary > div{pointer-events:auto}',
    '  #product-view [data-product-view-sizes]{display:none!important}',
    '  #product-view .pv-size-option{height:40px!important}',
    '  #product-view .pv-size-option.pv-size-circle{width:40px!important;min-width:40px!important}',
    // tapping Add to cart opens it out into a box (the same glass, a little darker) holding the sizes; the box grows
    // out of the button and folds back into it (the growing and folding is done in productView)
    '  #product-view.mh-pick [data-product-view-add]{display:none!important}',
    '  #product-view.mh-pick [data-product-view-sizes]{display:flex!important;flex-wrap:wrap;justify-content:center;gap:6px!important;',
    '    width:min(340px,calc(100vw - 32px));box-sizing:border-box;padding:12px;margin:0;',
    '    background:rgba(14,14,17,.56);-webkit-backdrop-filter:blur(18px) saturate(1.4);backdrop-filter:blur(18px) saturate(1.4)}',
    '  #product-view.mh-pick [data-product-view-sizes]::before{content:"Select size";flex:0 0 100%;text-align:center;padding:2px 0 7px;',
    '    font:700 9px/1 "Trebuchet MS","Lucida Grande","Lucida Sans Unicode","Lucida Sans",Tahoma,sans-serif;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.7);',
    '    animation:mhszin .3s ease .1s both}',
    '  #product-view.mh-pick .pv-size-option{flex:1 1 0;min-width:0;padding:0 4px!important;background:rgba(255,255,255,.15)!important;',
    '    -webkit-backdrop-filter:none!important;backdrop-filter:none!important;animation:mhszin .3s ease .14s both}',
    '  #product-view.mh-pick .pv-size-option.pv-size-circle{flex:0 0 40px}',
    // the colourways sit at the left of the "Select size" line, starting where the first size starts
    '  #product-view.mh-pick .mh-cw{top:12px;bottom:auto;left:8px;height:11px;animation:mhszin .3s ease .1s both}',
    '}',
    // Add to cart in the look of the home page's View now: square dark glass, no edge, small white capitals, darker under the pointer
    '#product-view .pv-add-glow,#product-view [data-product-view-add]::before,#product-view [data-product-view-add]::after,',
    '#product-view .pv-size-option::before,#product-view .pv-size-option::after{display:none!important}',
    '#product-view [data-product-view-add]{min-width:170px;height:44px;padding:0 26px!important;box-sizing:border-box;border:0!important;border-radius:0!important;',
    '  box-shadow:none!important;background:rgba(24,24,28,.42)!important;-webkit-backdrop-filter:blur(14px) saturate(1.4)!important;backdrop-filter:blur(14px) saturate(1.4)!important;',
    '  transition:background-color .3s ease;cursor:pointer}',
    '#product-view [data-product-view-add],#product-view [data-product-view-add]:hover,#product-view [data-product-view-add]:active{transform:none!important}',
    '#product-view [data-product-view-add]:hover,#product-view [data-product-view-add]:active{background:rgba(14,14,17,.68)!important}',
    '#product-view .pv-add-text{font-size:10px!important;line-height:1!important;font-weight:700!important;letter-spacing:.18em!important;text-transform:uppercase;color:#fff!important;text-shadow:none!important;margin-right:-.18em}',
    // the sizes in the same look: smaller squares of the same dark glass; the chosen one is a little darker
    '#product-view [data-product-view-sizes]{gap:8px!important}',
    '#product-view .pv-size-glow{display:none!important}',
    '#product-view .pv-size-option{height:36px;padding:0 14px!important;box-sizing:border-box;border:0!important;border-radius:0!important;box-shadow:none!important;transform:none!important;',
    '  background:rgba(24,24,28,.42)!important;-webkit-backdrop-filter:blur(14px) saturate(1.4)!important;backdrop-filter:blur(14px) saturate(1.4)!important;',
    '  transition:background-color .3s ease,box-shadow .3s ease}',
    '#product-view .pv-size-option:hover{background:rgba(14,14,17,.68)!important}',
    '#product-view .pv-size-option.is-selected{background:rgba(14,14,17,.3)!important;box-shadow:none!important}',
    '#product-view .pv-size-option.pv-size-circle{width:36px;min-width:36px;padding:0!important}',
    '#product-view .pv-size-text{font-size:10px!important;line-height:1!important;font-weight:700!important;letter-spacing:.18em!important;text-transform:uppercase;color:#fff!important;text-shadow:none!important;margin-right:-.18em}',
    '@media (max-width:' + NARROW + 'px){#product-view [data-product-view-add]{min-width:min(240px,calc(100vw - 64px));height:46px}}',
    // colourways: a small square in each colour; the one showing is at full strength with a fine light ring round it
    // (each square sits in an 18px target so it is easy to hit)
    '#product-view [data-product-view-sizes]{position:relative}',
    '#product-view .mh-cw{position:absolute;left:-4px;bottom:calc(100% + 8px);display:flex;align-items:center;gap:2px;line-height:0;pointer-events:auto}',
    '#product-view .mh-cw-dot{display:inline-grid;place-items:center;width:18px;height:18px;padding:0;margin:0;font-size:0;line-height:0;text-decoration:none;',
    '  cursor:pointer;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent}',
    '#product-view .mh-cw-dot::before{content:"";width:10px;height:10px;background:currentColor;opacity:.7;outline:1px solid transparent;outline-offset:2px;transition:opacity .2s ease,outline-color .2s ease}',
    '#product-view .mh-cw-dot.is-active::before{opacity:1;outline-color:rgba(255,255,255,.8)}',
    '@media (any-hover:hover){#product-view .mh-cw-dot:hover::before{opacity:1}}',
    // the shop's own colour picker in the same squares (on the light page the ring is dark)
    'html body .mtla-color-dot{display:inline-grid!important;place-items:center;width:14px!important;height:14px!important;font-size:0!important;line-height:0!important;text-decoration:none!important}',
    'html body .mtla-color-dot::before{content:"";width:9px;height:9px;background:currentColor;opacity:.6;outline:1px solid transparent;outline-offset:2px;transition:opacity .2s ease,outline-color .2s ease}',
    'html body .mtla-color-dot.is-active::before{opacity:1;outline-color:rgba(60,60,60,.6)}',
    // desktop: the same box as on phones (the glass a little darker), always open, holding the colourways, "Select size",
    // the sizes and Add to cart
    '@media (min-width:' + (NARROW + 1) + 'px){',
    '  #product-view .pv-section-secondary{display:flex!important;flex-direction:column;align-items:stretch;gap:6px;width:340px!important;max-width:calc(100vw - 48px);',
    '    height:auto!important;min-height:0!important;margin:28px auto 0!important;padding:12px!important;box-sizing:border-box;',
    // (no blur of its own: the view already blurs the page behind it, and a blur inside the fading view only takes once
    // the view is fully shown, so the box used to darken late and all at once)
    '    background:rgba(14,14,17,.56)}',
    '  #product-view [data-product-view-sizes]{display:flex!important;flex-wrap:wrap;justify-content:center;gap:6px!important;width:auto;margin:0!important;padding:0!important}',
    '  #product-view [data-product-view-sizes]::before{content:"Select size";flex:0 0 100%;text-align:center;padding:2px 0 7px;',
    '    font:700 9px/1 "Trebuchet MS","Lucida Grande","Lucida Sans Unicode","Lucida Sans",Tahoma,sans-serif;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.7)}',
    '  #product-view .pv-size-option{flex:1 1 0;min-width:0;padding:0 4px!important;background:rgba(255,255,255,.15)!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}',
    '  #product-view .pv-size-option.pv-size-circle{flex:0 0 36px}',
    '  #product-view [data-product-view-add]{width:100%;min-width:0;margin:0!important;background:rgba(255,255,255,.22)!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}',
    '  #product-view .mh-cw{top:1px;bottom:auto;left:-4px;height:11px}',
    // the product itself now heads the box: its name, the price, then Description and Size chart, each opening with a
    // + that turns to an x. (The panel under the picture and its round size-chart button give way to this.)
    '  #product-view .product-view-panel,#product-view .pv-size-chart-wrap{display:none!important}',
    '  #product-view .mh-pinfo{display:block!important;padding:2px 0 10px;margin-bottom:6px;border-bottom:1px solid rgba(255,255,255,.12);color:#fff;font-family:"Trebuchet MS","Lucida Grande","Lucida Sans Unicode","Lucida Sans",Tahoma,sans-serif}',
    '}',
    '#product-view .mh-pinfo{display:none}',
    '@media (min-width:' + (NARROW + 1) + 'px){.mh-pv-blur{display:none!important}}',
    // the product heading's words, folds and size chart (in the box on wide screens, in a box of its own on phones)
    '#product-view .mh-ptitle{font-size:13px;line-height:1.3;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#fff}',
    '#product-view .mh-pprice{margin-top:6px;font-size:10px;line-height:1;font-weight:700;letter-spacing:.12em;color:rgba(255,255,255,.62)}',
    '#product-view .mh-fold{border-top:1px solid rgba(255,255,255,.12)}',
    '#product-view .mh-pprice + .mh-fold{margin-top:12px}',
    '#product-view .mh-fold-head{display:flex;align-items:center;justify-content:space-between;width:100%;padding:11px 0 10px;margin:0;background:none;border:0;border-radius:0;',
    '  cursor:pointer;color:rgba(255,255,255,.85);font:700 9px/1 "Trebuchet MS","Lucida Grande","Lucida Sans Unicode","Lucida Sans",Tahoma,sans-serif;letter-spacing:.22em;text-transform:uppercase;text-align:left}',
    '#product-view .mh-x{position:relative;flex:none;width:9px;height:9px;transition:transform .35s cubic-bezier(.2,.75,.15,1)}',
    '#product-view .mh-x::before,#product-view .mh-x::after{content:"";position:absolute;left:0;top:4px;width:9px;height:1px;background:currentColor}',
    '#product-view .mh-x::after{transform:rotate(90deg)}',
    '#product-view .mh-fold.is-open .mh-x{transform:rotate(45deg)}',
    '#product-view .mh-fold-clip{display:grid;grid-template-rows:0fr;transition:grid-template-rows .4s cubic-bezier(.2,.75,.15,1)}',
    '#product-view .mh-fold.is-open .mh-fold-clip{grid-template-rows:1fr}',
    '#product-view .mh-fold-body{min-height:0;overflow:hidden}',
    '#product-view .mh-fold-in{padding:0 0 12px;font-size:10px;line-height:1.6;font-weight:400;letter-spacing:.02em;color:rgba(255,255,255,.72)}',
    '#product-view .mh-chart{display:grid;font-size:9px;line-height:1.2;letter-spacing:.06em;color:rgba(255,255,255,.72)}',
    '#product-view .mh-chart div{padding:6px 4px;text-align:center;border-bottom:1px solid rgba(255,255,255,.1);white-space:nowrap}',
    '#product-view .mh-chart .is-label{text-align:left;padding-left:0;color:rgba(255,255,255,.9);font-weight:700}',
    '#product-view .mh-chart .is-head{color:#fff;font-weight:700}',
    '#product-view .mh-chart-note{margin-top:9px;font-size:9px;line-height:1.5;letter-spacing:.04em;color:rgba(255,255,255,.55)}',
    // phones: the sticky Add to cart and its sizes stay as they are; the panel under the pictures becomes a box of its
    // own in the same dark glass, with the name, price and the two folds (its round size-chart button goes)
    '@media (max-width:' + NARROW + 'px){',
    '  #product-view .product-view-panel{display:none!important}',
    // a bigger picture: about two-fifths of the screen's height (it was a small 220px), the side pictures kept just
    // peeking in at the edges
    '  #product-view .product-view-stage{height:min(360px,44vh)!important;height:min(360px,44svh)!important;width:calc(min(360px,44vh) * .7917)!important;',
    '    width:calc(min(360px,44svh) * .7917)!important;max-width:calc(100vw - 48px)!important}',
    '  #product-view .product-view-img{object-fit:contain}',
    '  #product-view .product-view-img.is-inactive.pv-pos-next{transform:translateX(66vw) scale(.6)!important}',
    '  #product-view .product-view-img.is-inactive.pv-pos-prev{transform:translateX(-66vw) scale(.6)!important}',
    // (the sticky Add to cart keeps its frosted glass, so it fades in once the view itself is fully shown)
    '  #product-view .pv-section-secondary [data-product-view-add]{opacity:0;transition:opacity .3s ease,background-color .3s ease}',
    '  #product-view.mh-shown .pv-section-secondary [data-product-view-add]{opacity:1}',
    '  #product-view .mh-pinfo.is-own{display:block!important;position:relative;z-index:2;width:min(340px,calc(100vw - 32px));margin:18px auto 0;padding:14px 12px 2px;box-sizing:border-box;text-align:left;',
    '    color:#fff;font-family:"Trebuchet MS","Lucida Grande","Lucida Sans Unicode","Lucida Sans",Tahoma,sans-serif;background:rgba(14,14,17,.56)}',
    '}',
    // wide screens: the box moves up beside the picture, on the right of the first screen
    '@media (min-width:1220px){',
    '  #product-view .pv-scroll{position:relative}',
    '  #product-view .pv-section-secondary{position:absolute!important;left:max(82.8%,calc(50% + 450px));top:max(84px,17.5vh);transform:translateX(-50%);margin:0!important;z-index:5}',
    '}',
    // the dropdown cart in the header's look: darker frosted glass, square, no edge; the same items in light words, the
    // picture frames lighter so they show; the big blurred CART word gives way to a Checkout button at the foot
    '#motorella-cart{background:rgba(14,14,17,.56)!important;-webkit-backdrop-filter:blur(18px) saturate(1.4)!important;backdrop-filter:blur(18px) saturate(1.4)!important;',
    '  border:0!important;border-radius:0!important;box-shadow:none!important}',
    '#motorella-cart .cart-wordmark{display:none!important}',
    '#motorella-cart .cart-item-image{border-color:rgba(255,255,255,.4)!important}',
    '#motorella-cart .cart-item-title{color:rgba(255,255,255,.9)!important}',
    '#motorella-cart .cart-item-price,#motorella-cart .cart-item-remove{color:rgba(255,255,255,.6)!important}',
    '#motorella-cart .cart-decorative-plus img{filter:invert(1);opacity:.6}',
    // (the panel stacks its contents, so Checkout sits at the foot when there is room and comes after the last item
    // when the cart is long enough to scroll)
    '#motorella-cart{display:flex!important;flex-direction:column}',
    '#motorella-cart > *{flex-shrink:0}',
    '#motorella-cart .cart-decorative-plus{margin-bottom:16px}',
    '#motorella-cart .mh-checkout{position:static;flex:none;width:100%;margin:auto 0 0;height:44px;padding:0 16px;border:0;border-radius:0;cursor:pointer;',
    '  background:rgba(255,255,255,.18);color:#fff;font:700 10px/1 "Trebuchet MS","Lucida Grande","Lucida Sans Unicode","Lucida Sans",Tahoma,sans-serif;letter-spacing:.18em;text-indent:.18em;text-transform:uppercase;',
    '  transition:background-color .3s ease}',
    '#motorella-cart .mh-checkout:hover,#motorella-cart .mh-checkout:active{background:rgba(14,14,17,.68)}',
    // the reminder: a notification in the manner of a phone's, dropping in from the top (phones) or under the cart (wide)
    '.mh-note{position:fixed;z-index:1200;left:8px;right:8px;top:calc(8px + env(safe-area-inset-top,0px));display:flex;align-items:center;gap:11px;',
    '  padding:11px 14px 12px 11px;box-sizing:border-box;border-radius:22px;border:0;cursor:pointer;touch-action:none;user-select:none;-webkit-user-select:none;',
    '  background:rgba(246,246,247,.62);-webkit-backdrop-filter:blur(26px) saturate(1.8);backdrop-filter:blur(26px) saturate(1.8);',
    '  box-shadow:0 10px 34px rgba(0,0,0,.14),0 1px 3px rgba(0,0,0,.05);-webkit-tap-highlight-color:transparent;',
    '  font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","SF Pro Display",Inter,"Helvetica Neue",Helvetica,Arial,sans-serif;color:#2b2b2e;-webkit-font-smoothing:antialiased;',
    '  transform:translateY(calc(-100% - 24px));transition:transform .55s cubic-bezier(.16,1,.3,1),opacity .4s ease}',
    '.mh-note.is-in{transform:none}',
    '.mh-note:not(.is-in){pointer-events:none}',
    '.mh-note.is-dragging{transition:none}',
    '.mh-note.is-still{transition:none}',
    'body:has(#motorella-cart.is-open) .mh-note,body:has(.mh.is-menu) .mh-note{opacity:0!important;pointer-events:none!important}',
    // the icon: an off-black tile with the m cut out of it, so the glass shows through the mark
    '.mh-note-icon{flex:none;width:38px;height:38px;border-radius:9px;background:#2b2b2e;',
    '  -webkit-mask:var(--mh-logo) center/62% auto no-repeat,linear-gradient(#000,#000);-webkit-mask-composite:xor;',
    '  mask:var(--mh-logo) center/62% auto no-repeat,linear-gradient(#000,#000);mask-composite:exclude}',
    '.mh-note-body{flex:1 1 auto;min-width:0}',
    '.mh-note-head{display:flex;align-items:baseline;gap:8px}',
    '.mh-note-head b{flex:1 1 auto;font-size:15px;line-height:20px;font-weight:600;letter-spacing:-.01em;text-transform:lowercase;color:#2b2b2e}',
    '.mh-note-head span{flex:none;font-size:13px;line-height:20px;color:#8a8a8f}',
    '.mh-note-msg{font-size:15px;line-height:20px;letter-spacing:-.01em;color:#2b2b2e}',
    '@media (min-width:' + (NARROW + 1) + 'px){',
    '  .mh-note{left:auto;right:auto;top:0;width:340px;gap:9px;padding:9px 12px 10px 9px;border-radius:15px;opacity:0;transform:translateY(-8px);',
    '    transition:transform .45s cubic-bezier(.16,1,.3,1),opacity .35s ease}',
    '  .mh-note.is-in{opacity:1;transform:none}',
    '  .mh-note-icon{width:30px;height:30px;border-radius:7px}',
    '  .mh-note-head b{font-size:12.5px;line-height:16px}',
    '  .mh-note-head span{font-size:11px;line-height:16px}',
    '  .mh-note-msg{font-size:12.5px;line-height:16px}',
    '}',
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
    '.mhome-model .mhome-over{justify-content:flex-end;padding-bottom:13vh;box-sizing:border-box}',
    '.mhome-video .mhome-over{justify-content:center}',
    '.mhome-video.is-btn-low .mhome-over{justify-content:flex-end;padding-bottom:min(13vh,7vw);box-sizing:border-box}',
    // the film is 16:9 and its action runs to the very top and bottom of the frame, so on wide screens the panel takes
    // the film's own shape and nothing is cropped; on phones it fills the screen and is cropped at the sides instead
    '.mhome-panel.mhome-video{background:#e9e9ea;height:56.25vw;min-height:0}',
    '.mhome-video video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 50%}',
    '@media (max-width:' + NARROW + 'px){.mhome-panel.mhome-video{height:100vh;height:100svh;min-height:520px}}',
    // ambient panels: the film at about three quarters, centred, over a soft blurred spill of itself
    // (one screen tall; the film is as big as fits in about three quarters of it either way)
    '.mhome-panel.mhome-video.is-ambient{background:#dcdcdd;height:100vh;height:100svh;min-height:520px;--mh-fw:min(76vw,calc(74vh * 16 / 9));--mh-fw:min(76vw,calc(74svh * 16 / 9))}',
    '.mhome-video .mhome-amb{position:absolute;left:-8%;top:-8%;width:116%;height:116%;object-fit:cover;filter:blur(38px) saturate(1.05);opacity:.95;pointer-events:none}',
    '.mhome-video .mhome-frame{position:absolute;left:50%;top:50%;width:var(--mh-fw);aspect-ratio:16/9;transform:translate(-50%,-50%);overflow:hidden}',
    '@media (max-width:' + NARROW + 'px){',
    '  .mhome-panel.mhome-video.is-ambient{--mh-fw:calc(100vw - 32px)}',
    '}',
    // the film is the link: under the pointer it dims and softens and the words come up in its middle; a click goes to
    // the shop (on a phone the first tap does the dimming, the second goes)
    '.mhome-hit{overflow:hidden}',
    '.mhome-hit video{transition:filter .55s ease,transform .9s cubic-bezier(.2,.75,.15,1);will-change:filter}',
    '.mhome-cover{position:absolute;inset:0;z-index:2;display:flex;align-items:center;justify-content:center;text-decoration:none!important;cursor:pointer;-webkit-tap-highlight-color:transparent}',
    '.mhome-cover span{font-size:11px;font-weight:700;letter-spacing:.24em;text-transform:uppercase;color:#fff;text-shadow:0 0 14px rgba(0,0,0,.22);',
    '  opacity:0;transform:translateY(5px);filter:blur(3px);transition:opacity .45s ease,transform .6s cubic-bezier(.2,.75,.15,1),filter .5s ease}',
    '.mhome-hit.is-hov video{filter:brightness(.6) blur(5px);transform:scale(1.035)}',
    '.mhome-hit.is-hov .mhome-cover span{opacity:1;transform:none;filter:blur(0)}',
    '.mhome-video.is-ambient .mhome-amb{transition:filter .55s ease,opacity .55s ease}',
    '.mhome-video.is-ambient.is-hov .mhome-amb{filter:blur(38px) saturate(1.05) brightness(.82)}',
    '@media (any-hover:hover){',
    '  .mhome-hit:hover video{filter:brightness(.6) blur(5px);transform:scale(1.035)}',
    '  .mhome-hit:hover .mhome-cover span{opacity:1;transform:none;filter:blur(0)}',
    '  .mhome-video.is-ambient:has(.mhome-hit:hover) .mhome-amb{filter:blur(38px) saturate(1.05) brightness(.82)}',
    '}',
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
    '.mhome-foot.is-over{position:absolute;left:0;right:0;bottom:0;z-index:3;padding:0 var(--mh-pad,40px) 22px;background:none;',
    '  color:rgba(255,255,255,.88);text-shadow:0 0 8px rgba(0,0,0,.28);pointer-events:none}',
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
    H.logo = src;
    var probe = new Image();
    probe.onload = function () { if (probe.naturalHeight) mark.style.width = Math.round(26 * probe.naturalWidth / probe.naturalHeight) + 'px'; };
    probe.src = src;
    h.style.setProperty('--mh-plus', 'url("' + PLUS + '")');
    // default look (A): the darker glass, with light words that follow the page underneath until it shows.
    // Set MOTORELLA_HEADER = 'soft-dark' for the faint glass with soft dark grey words instead.
    var look = window.MOTORELLA_HEADER || 'dark';
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
    // (not on the looks page: there a resize lays the ring out again without its blur-and-fade entrance)
    if (!IS.looks) setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 50);
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
    // drag from anywhere on the window, as on the home page: everything but the tabs, the OK button, links and the
    // text box's scrollbar. The press is claimed outright so the browser never starts a text selection or a native
    // image drag underneath (that is what used to cancel the move on pages other than home).
    var d = null;
    w.style.touchAction = 'none';
    w.style.userSelect = 'none'; w.style.webkitUserSelect = 'none';
    [].forEach.call(w.querySelectorAll('[class*="-scroll"]'), function (sc) { sc.style.touchAction = 'pan-y'; });
    function onBar(e) {
      if (e.target.closest('a,button,input,textarea,select,.close-menu,.info-tab,[class*="-tab "],[class$="-tab"]')) return false;
      var sc = e.target.closest('[class*="-scroll"]');
      if (sc && e.clientX > sc.getBoundingClientRect().left + sc.clientWidth) return false;
      return true;
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
    quickSizes();
    productView();
    colorways();
    productInfo();
    revealNet();
    whenRail(railScroll);
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
    // the fabric button's type dot steps all (no colour) → tops (blue) → shoes (pink) → all …, and its colour changes at
    // once while the cards take a moment to fade, so step by the colour, never by what is on screen yet
    var want = type === 'tops' ? 'blue' : type === 'shoes' ? 'pink' : '';
    var state = function () { return dot.getAttribute('data-mtla-state') || ''; };
    for (var i = 0; i < 3 && state() !== want; i++) dot.click();
    // once the cards have settled, make sure they show what was asked (in case the shop's colours ever change)
    var tries = 0;
    (function check() {
      setTimeout(function () {
        var v = visibleTypes();
        if (type ? v.length === 1 && v[0] === type : v.length > 1) return;
        if (tries++ < 3) { dot.click(); check(); }
      }, 550);
    })();
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

  // ------------------------------------------------------------------------------------------------ shop: quick add
  // Pointer screens show a product's sizes on hover (CSS). Touch screens: the first tap on a product opens its sizes
  // under it (closing any other); a second tap goes through to the product as before; a tap elsewhere closes them.
  // Which kind of press it was is told by the press itself (a finger, or a mouse or trackpad), not by what the screen
  // says it can do: some laptops (touch screens among them) call themselves touch devices, and they must still work by
  // mouse as a computer does. The phone-style first tap applies to finger presses only.
  var TOUCH = !!window.MOTORELLA_TOUCH || (window.matchMedia && matchMedia('(hover: none)').matches);
  var LAST_PTR = '';
  document.addEventListener('pointerdown', function (e) { LAST_PTR = e.pointerType || ''; }, true);
  function byTouch() { return window.MOTORELLA_TOUCH ? true : LAST_PTR ? LAST_PTR === 'touch' : TOUCH; }
  var PASS = false; // set while this script opens a product itself, so the first-tap rule lets it through
  function quickSizes() {
    function closeAll(except) {
      [].forEach.call(document.querySelectorAll('.product-card.mh-sz'), function (c) { if (c !== except) c.classList.remove('mh-sz'); });
    }
    document.addEventListener('click', function (e) {
      if (PASS || !byTouch()) return;
      var card = e.target.closest && e.target.closest('.product-card');
      if (!card) { if (!e.target.closest || !e.target.closest('#product-view,#motorella-cart')) closeAll(); return; }
      if (e.target.closest('.product-sizes')) return;
      if (card.classList.contains('mh-sz')) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      closeAll(card);
      card.classList.add('mh-sz');
    }, true);
  }

  // ------------------------------------------------------------------------------------------------ shop: product view
  // Phones: the add-to-cart bar sits at the bottom of the screen (CSS). Its first tap opens the sizes; tapping a size
  // picks it and adds it straight away; a tap anywhere else in the view closes the sizes again.
  function productView() {
    var bypass = false;
    // (the box round the sizes is part of the product: a click on its edge must not close the view, as a click on
    // the empty page around the product does)
    // phones: the view's background blur, on a layer of its own that fades in and out together with the view (CSS)
    var pvEl = document.getElementById('product-view');
    if (pvEl && 'MutationObserver' in window) {
      var blur = el('div', 'mh-pv-blur');
      pvEl.parentNode.insertBefore(blur, pvEl);
      var shownT = 0;
      var step = function () {
        var c = pvEl.classList;
        // the page hides the view a moment after closing it; if it was opened again within that moment, that late
        // hiding would leave an open view hidden (just the blurred page): an open view is never hidden
        if (c.contains('is-open') && c.contains('is-hidden')) { c.remove('is-hidden'); return; }
        var on = c.contains('is-open') && !c.contains('is-hidden');
        if (blur.classList.contains('is-on') !== on) blur.classList.toggle('is-on', on);
        // fully shown a little after it opens (the view's own fade takes 0.4 s)
        if (!on) {
          clearTimeout(shownT); shownT = 0;
          if (c.contains('mh-shown')) c.remove('mh-shown');
        } else if (!c.contains('mh-shown') && !shownT) {
          shownT = setTimeout(function () { shownT = 0; if (pvEl.classList.contains('is-open')) pvEl.classList.add('mh-shown'); }, 420);
        }
      };
      new MutationObserver(step).observe(pvEl, { attributes: true, attributeFilter: ['class'] });
      step();
    }
    var sec = document.querySelector('#product-view .pv-section-secondary');
    if (sec) sec.addEventListener('click', function (e) { if (e.target === sec || e.target.closest('.mh-pinfo')) e.stopPropagation(); });
    function narrow() { return window.innerWidth <= NARROW; }
    function addEl(pv) { var t = pv.querySelector('.pv-add-text'); return t && t.parentElement; }
    function boxEl(pv) { return pv.querySelector('[data-product-view-sizes]'); }
    // the box's edges pulled in to where the button is (a clip-path inset), so it can grow out of it and fold back
    function inset(from, to) {
      return 'inset(' + [from.top - to.top, to.right - from.right, to.bottom - from.bottom, from.left - to.left]
        .map(function (n) { return Math.max(0, Math.round(n)) + 'px'; }).join(' ') + ')';
    }
    var BTN = 'rgba(24, 24, 28, 0.42)', BOX = 'rgba(14, 14, 17, 0.56)';
    // drop whatever growing or folding is still on the box and the sizes in it
    function settle(pv, b) {
      pv.__mhShut = false;
      if (!b || !b.getAnimations) return;
      [b].concat([].slice.call(b.children)).forEach(function (n) { n.getAnimations().forEach(function (a) { a.cancel(); }); });
    }
    function open(pv, add) {
      var from = add.getBoundingClientRect();
      var b = boxEl(pv);
      settle(pv, b);
      pv.__mhFrom = from;
      pv.classList.add('mh-pick');
      if (!b || !b.animate) return;
      b.animate([{ clipPath: inset(from, b.getBoundingClientRect()), backgroundColor: BTN }, { clipPath: 'inset(0px)', backgroundColor: BOX }],
        { duration: 440, easing: 'cubic-bezier(.2,.75,.15,1)' });
    }
    function shut(pv) {
      if (!pv.classList.contains('mh-pick') || pv.__mhShut) return;
      var b = boxEl(pv), from = pv.__mhFrom;
      if (!b || !b.animate || !from) { pv.classList.remove('mh-pick'); return; }
      pv.__mhShut = true;
      [].forEach.call(b.children, function (k) { k.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: 'forwards' }); });
      var done = false;
      var end = function () {
        if (done) return;
        done = true;
        if (pv.classList.contains('mh-pick')) pv.classList.remove('mh-pick');
        settle(pv, b);
      };
      b.animate([{ clipPath: 'inset(0px)', backgroundColor: BOX }, { clipPath: inset(from, b.getBoundingClientRect()), backgroundColor: BTN }],
        { duration: 300, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }).onfinish = end;
      setTimeout(end, 380); // (in case the page is throttled and the animation never reports back)
    }
    document.addEventListener('click', function (e) {
      if (bypass || !narrow() || !e.target.closest) return;
      var pv = e.target.closest('#product-view');
      if (!pv) return;
      var add = addEl(pv);
      if (add && add.contains(e.target)) {
        if (!pv.classList.contains('mh-pick')) {
          e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
          open(pv, add);
        } else {
          setTimeout(function () { pv.classList.remove('mh-pick'); }, 400);
        }
        return;
      }
      if (e.target.closest('.pv-size-option')) {
        if (!pv.classList.contains('mh-pick')) return;
        // let the view take the size first, then press add for them
        setTimeout(function () {
          var t = pv.querySelector('.pv-add-text');
          if (t) { bypass = true; try { t.click(); } finally { bypass = false; } }
          setTimeout(function () { pv.classList.remove('mh-pick'); }, 350);
        }, 60);
        return;
      }
      if (!e.target.closest('.pv-section-secondary')) shut(pv);
    }, true);
    // whenever the view closes or shows another product, start with the sizes closed
    var pv0 = document.getElementById('product-view');
    if (pv0 && 'MutationObserver' in window) {
      // (only touch the class when it is actually there: removing an absent class still rewrites the attribute,
      // which would wake this observer again, for ever)
      new MutationObserver(function () {
        if (!pv0.classList.contains('is-open') && pv0.classList.contains('mh-pick')) pv0.classList.remove('mh-pick');
      })
        .observe(pv0, { attributes: true, attributeFilter: ['class'] });
    }
  }

  // ------------------------------------------------------------------------------------------------ shop: colourways in the product view
  // A + in each of the product's colours sits above the sizes (in the box with the sizes on phones), as in the shop's
  // colour picker. Pressing one shows that colour of the product. The colours of a product are the cards that share
  // its title; the view rebuilds its sizes each time it shows a product, so the row is put back whenever that happens.
  var CW_HEX = { grey: '#8a8181', gray: '#8a8181', black: '#242121', blue: '#233feb', red: '#eb2365' };
  function colorways() {
    var pv = document.getElementById('product-view');
    var sizes = pv && pv.querySelector('[data-product-view-sizes]');
    if (!sizes) return;
    function norm(s) { return (s || '').replace(/\s+/g, ' ').trim().toLowerCase(); }
    function abs(u) { try { return new URL(u, location.href).href; } catch (e) { return u || ''; } }
    function titleOf(card) { var t = card.querySelector('.product-title'); return norm((t && t.textContent) || card.getAttribute('data-product-title')); }
    function colorOf(card) { return norm(card.getAttribute('data-product-color')); }
    // the card the view is showing: same title, and its picture is the one on the stage
    function current() {
      var t = pv.querySelector('.text-block-6'), im = pv.querySelector('.product-view-img');
      var title = norm(t && t.textContent), src = im ? abs(im.getAttribute('src')) : '';
      var group = [].filter.call(document.querySelectorAll('.product-card'), function (c) { return titleOf(c) === title; });
      if (!group.length) return null;
      var card = group.filter(function (c) {
        var f = c.getAttribute('data-product-image-flat'), img = c.querySelector('.product-image');
        return (f && abs(f) === src) || (img && abs(img.getAttribute('src')) === src);
      })[0];
      return { group: group, card: card || group[0] };
    }
    function colorsOf(group) {
      var seen = {}, out = [];
      function add(c) { if (c && !seen[c]) { seen[c] = true; out.push(c); } }
      [].forEach.call(group[0].querySelectorAll('.mtla-color-dot[data-color]'), function (d) { add(norm(d.getAttribute('data-color'))); });
      group.forEach(function (c) { add(colorOf(c)); });
      return out;
    }
    function show(card) {
      PASS = true;
      try { (card.querySelector('.product-image') || card).click(); } finally { PASS = false; }
    }
    function sync() {
      if (sizes.querySelector('.mh-cw')) return;
      var cur = current();
      if (!cur) return;
      var colors = colorsOf(cur.group);
      if (colors.length < 2) return;
      var now = colorOf(cur.card);
      var row = document.createElement('span');
      row.className = 'mh-cw';
      colors.forEach(function (c) {
        var d = el('span', 'mh-cw-dot' + (c === now ? ' is-active' : ''), row, '+');
        d.style.color = CW_HEX[c] || c;
        d.setAttribute('data-color', c);
        d.setAttribute('role', 'button');
        d.setAttribute('aria-label', c);
        d.addEventListener('click', function (e) {
          e.stopPropagation();
          if (c === now) return;
          var cur2 = current();
          if (!cur2) return;
          var target = cur2.group.filter(function (x) { return colorOf(x) === c; })[0];
          if (target) return show(target);
          // (in the shop's colour-picker view the first card of a product wears the colour picked there, so the other
          // colour may live only in its picker: pick it there, then show that card)
          var dot = cur2.group[0].querySelector('.mtla-color-dot[data-color="' + c + '"]');
          if (dot) { dot.click(); setTimeout(function () { show(cur2.group[0]); }, 230); }
        });
      });
      sizes.insertBefore(row, sizes.firstChild);
    }
    if ('MutationObserver' in window) new MutationObserver(sync).observe(sizes, { childList: true });
    sync();
  }

  // ------------------------------------------------------------------------------------------------ shop: showing the products
  // The page brings each product in (blur and fade) as it comes into view, using the browser's IntersectionObserver.
  // On some Macs no products showed at all, so this is a safety net that does not depend on it: a little after load,
  // and again after any scroll or resize, every product in sight that is still hidden is brought in the same way; and
  // if a few seconds after load none at all has been, they all are. Where the page's own reveal works, it has already
  // shown them and this does nothing.
  function revealNet() {
    var cards = [].slice.call(document.querySelectorAll('.product-card'));
    if (!cards.length) return;
    function inView(c) {
      var r = c.getBoundingClientRect();
      return (r.width || r.height) && r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
    }
    function sweep() {
      var k = 0;
      cards.forEach(function (c) {
        if (c.classList.contains('is-revealed') || c.__mhRev || !inView(c)) return;
        c.__mhRev = true;
        setTimeout(function () { c.classList.add('is-revealed'); }, (k++) * 60);
      });
    }
    var t = 0;
    function soon() { clearTimeout(t); t = setTimeout(sweep, 400); }
    setTimeout(sweep, 1400);
    window.addEventListener('scroll', soon, { passive: true, capture: true });
    window.addEventListener('resize', soon);
    setTimeout(function () {
      if (!cards.some(function (c) { return c.classList.contains('is-revealed'); })) cards.forEach(function (c) { c.classList.add('is-revealed'); });
    }, 3500);
  }

  // ------------------------------------------------------------------------------------------------ shop: the product in the box
  // Wide screens: the box with the sizes starts with the product itself, its name and then its price, and below them two
  // folds, Description and Size chart, each opening with a + that turns to an x. The words are taken from the view as
  // it shows each product; the size chart is drawn from the product's own size-chart line (data-size-chart, with
  // data-size-note under it). The panel under the picture and its round size-chart button are hidden there (CSS).
  function productInfo() {
    var pv = document.getElementById('product-view');
    var sec = pv && pv.querySelector('.pv-section-secondary');
    var sizes = pv && pv.querySelector('[data-product-view-sizes]');
    if (!sec || !sizes) return;
    var box = el('div', 'mh-pinfo');
    // wide screens: at the head of the box with the sizes; phones: a box of its own where the panel under the pictures
    // was (the sticky Add to cart keeps the sizes)
    var panel = pv.querySelector('.product-view-panel');
    var narrow = window.matchMedia ? matchMedia('(max-width: ' + NARROW + 'px)') : { matches: false };
    function home() {
      if (narrow.matches && panel && panel.parentNode) {
        if (box.parentNode !== panel.parentNode) panel.parentNode.insertBefore(box, panel.nextSibling);
        box.classList.add('is-own');
      } else {
        if (box.parentNode !== sec) sec.insertBefore(box, sec.firstChild);
        box.classList.remove('is-own');
      }
    }
    home();
    if (narrow.addEventListener) narrow.addEventListener('change', home);
    else if (narrow.addListener) narrow.addListener(home);
    box.addEventListener('click', function (e) { e.stopPropagation(); });
    var title = el('div', 'mh-ptitle', box);
    var price = el('div', 'mh-pprice', box);
    function fold(name) {
      var f = el('div', 'mh-fold', box);
      var b = el('button', 'mh-fold-head', f);
      b.type = 'button';
      b.setAttribute('aria-expanded', 'false');
      el('span', '', b, name);
      el('i', 'mh-x', b);
      var inner = el('div', 'mh-fold-in', el('div', 'mh-fold-body', el('div', 'mh-fold-clip', f)));
      b.addEventListener('click', function () {
        var on = !f.classList.contains('is-open');
        f.classList.toggle('is-open', on);
        b.setAttribute('aria-expanded', on ? 'true' : 'false');
      });
      return { f: f, inner: inner };
    }
    var desc = fold('Description'), chart = fold('Size chart');
    function txt(sel) { var e = pv.querySelector(sel); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }
    function cardNow() {
      var name = txt('.text-block-6').toLowerCase(), im = pv.querySelector('.product-view-img');
      var src = im ? new URL(im.getAttribute('src') || '', location.href).href : '';
      var group = [].filter.call(document.querySelectorAll('.product-card'), function (c) {
        var t = c.querySelector('.product-title');
        return ((t && t.textContent) || c.getAttribute('data-product-title') || '').replace(/\s+/g, ' ').trim().toLowerCase() === name;
      });
      return group.filter(function (c) {
        var f = c.getAttribute('data-product-image-flat');
        return f && new URL(f, location.href).href === src;
      })[0] || group[0] || null;
    }
    var last = '';
    function sync() {
      title.textContent = txt('.text-block-6');
      price.textContent = txt('.text-block-7');
      var d = txt('.product-view-panel p');
      desc.inner.textContent = d;
      desc.f.style.display = d ? '' : 'none';
      var card = cardNow();
      var raw = (card && card.getAttribute('data-size-chart')) || '', note = (card && card.getAttribute('data-size-note')) || '';
      if (raw + '|' + note === last) return;
      last = raw + '|' + note;
      chart.inner.innerHTML = '';
      var rows = raw.split(';').map(function (r) { return r.split(',').map(function (c) { return c.trim(); }); })
        .filter(function (r) { return r.length && r[0] !== ''; });
      var lines = note.split('|').map(function (x) { return x.trim(); }).filter(Boolean);
      if (rows.length) {
        var cols = rows[0].length;
        var g = el('div', 'mh-chart', chart.inner);
        g.style.gridTemplateColumns = 'auto repeat(' + (cols - 1) + ', 1fr)';
        rows.forEach(function (r, ri) {
          for (var i = 0; i < cols; i++) el('div', (ri === 0 ? 'is-head' : '') + (i === 0 ? ' is-label' : ''), g, r[i] || '');
        });
      }
      if (lines.length) {
        var nn = el('div', 'mh-chart-note', chart.inner);
        lines.forEach(function (l) { el('div', '', nn, l); });
      }
      chart.f.style.display = rows.length || lines.length ? '' : 'none';
    }
    // the view rebuilds its sizes each time it shows a product: that is the moment to read it again
    if ('MutationObserver' in window) {
      new MutationObserver(sync).observe(sizes, { childList: true });
      // folds start closed each time the view opens
      new MutationObserver(function () {
        if (pv.classList.contains('is-open')) return;
        [desc, chart].forEach(function (x) {
          if (x.f.classList.contains('is-open')) { x.f.classList.remove('is-open'); x.f.querySelector('.mh-fold-head').setAttribute('aria-expanded', 'false'); }
        });
      }).observe(pv, { attributes: true, attributeFilter: ['class'] });
    }
    sync();
  }

  // ------------------------------------------------------------------------------------------------ shop: other products rail
  // The rail keeps drifting on its own. Point at it (or touch it) and it stops and becomes scrollable: the wheel, a
  // sideways trackpad swipe or a drag moves it along; let go and it carries on drifting from where it was left.
  function whenRail(fn) {
    var n = 0;
    (function look() {
      var r = document.querySelector('.pv-rail');
      if (r && r.querySelector('.pv-rail-track')) return fn(r);
      if (n++ < 60) setTimeout(look, 500);
    })();
  }
  function railScroll(rail) {
    if (rail.__mh) return;
    rail.__mh = true;
    var track = rail.querySelector('.pv-rail-track');
    var held = false, dist = 0, dur = 0, resumeT = null, drag = null, moved = 0;
    function anim() { var a = track.getAnimations ? track.getAnimations() : []; return a[0] || null; }
    function hold() {
      clearTimeout(resumeT);
      var a = anim();
      if (!a) return false;
      if (!held) {
        a.pause();
        held = true;
        if (!dist) {
          // how far one full loop travels, read off the animation itself
          dur = a.effect.getTiming().duration;
          var t0 = a.currentTime;
          a.currentTime = dur / 2;
          var m = new DOMMatrix(getComputedStyle(track).transform);
          dist = Math.abs(m.m41) * 2;
          a.currentTime = t0;
        }
      }
      return !!dist;
    }
    function move(px) {
      var a = anim();
      if (!a || !dist) return;
      var t = (a.currentTime + px * dur / dist) % dur;
      if (t < 0) t += dur;
      a.currentTime = t;
    }
    function release(ms) {
      clearTimeout(resumeT);
      resumeT = setTimeout(function () { var a = anim(); if (a) a.play(); held = false; }, ms);
    }
    rail.style.touchAction = 'pan-y';
    rail.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { stopGlide(); hold(); } });
    rail.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse' && !drag && !glideF) release(500); });
    rail.addEventListener('wheel', function (e) {
      if (!hold()) return;
      e.preventDefault();
      move(Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY);
    }, { passive: false });
    // a let-go swipe carries on and slows to a stop, as a phone's own scrolling does, before the drift takes over again
    var glideF = 0;
    function stopGlide() { if (glideF) { cancelAnimationFrame(glideF); glideF = 0; } }
    function glide(v, then) {
      var last = performance.now();
      (function step(now) {
        var dt = Math.min(48, now - last);
        last = now;
        move(-v * dt);
        v *= Math.exp(-dt / 325);
        if (Math.abs(v) > 0.02) glideF = requestAnimationFrame(step);
        else { glideF = 0; then(); }
      })(last);
    }
    rail.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || !hold()) return;
      stopGlide();
      drag = { x: e.clientX, id: e.pointerId, s: [] };
      moved = 0;
    });
    window.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x, now = performance.now();
      drag.x = e.clientX;
      drag.s.push({ t: now, dx: dx });
      while (drag.s.length && now - drag.s[0].t > 100) drag.s.shift();
      moved += Math.abs(dx);
      if (moved > 6) { try { rail.setPointerCapture(e.pointerId); } catch (err) {} }
      move(-dx);
    });
    function up(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var s = drag.s, now = performance.now(), v = 0;
      // speed over the last tenth of a second (none if the finger had stopped before letting go)
      if (s.length && now - s[s.length - 1].t < 80) {
        var sum = 0;
        s.forEach(function (x) { sum += x.dx; });
        v = sum / Math.max(16, now - s[0].t);
      }
      drag = null;
      var after = function () {
        if (e.pointerType !== 'mouse') release(2500);
        else if (!rail.matches(':hover')) release(500);
      };
      if (Math.abs(v) > 0.05) glide(Math.max(-4, Math.min(4, v)), after);
      else after();
    }
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    // a drag is not a click on whatever product it ended on
    rail.addEventListener('click', function (e) { if (moved > 6) { e.preventDefault(); e.stopPropagation(); moved = 0; } }, true);
    rail.addEventListener('dragstart', function (e) { e.preventDefault(); });
  }

  // ------------------------------------------------------------------------------------------------ looks: orbit
  // On phones the looks stand in a circle. The circle slowly turns, and dragging round it turns it by hand (with a little
  // momentum). Each look is moved with the separate translate property, so nothing the page does with transforms clashes.
  function looksOrbit() {
    var n = 0;
    (function look() {
      var row = document.querySelector('.lk-row');
      var items = row ? row.querySelectorAll('.look-item') : [];
      if (items.length >= 3) return orbit(row, [].slice.call(items));
      if (n++ < 80) setTimeout(look, 250);
    })();
  }
  function orbit(row, items) {
    var SPEED = (Math.PI * 2) / 70;     // one turn in about 70 seconds
    var g = null, theta = 0, vel = 0, last = 0, drag = null, moved = 0;
    function geometry() {
      var pts = items.map(function (it) { return { x: it.offsetLeft + it.offsetWidth / 2, y: it.offsetTop + it.offsetHeight / 2 }; });
      var cx = 0, cy = 0;
      pts.forEach(function (p) { cx += p.x; cy += p.y; });
      cx /= pts.length; cy /= pts.length;
      var rx = 0, ry = 0;
      pts.forEach(function (p) { rx = Math.max(rx, Math.abs(p.x - cx)); ry = Math.max(ry, Math.abs(p.y - cy)); });
      // only a ring (spread both ways) turns; the row of looks on wide screens stays as it is
      if (rx < 40 || ry < 40) return null;
      return { cx: cx, cy: cy, rx: rx, ry: ry, pts: pts, a: pts.map(function (p) { return Math.atan2((p.y - cy) / ry, (p.x - cx) / rx); }) };
    }
    function place() {
      if (!g) { items.forEach(function (it) { it.style.translate = ''; it.style.zIndex = ''; }); return; }
      items.forEach(function (it, i) {
        var a = g.a[i] + theta;
        var x = g.cx + g.rx * Math.cos(a), y = g.cy + g.ry * Math.sin(a);
        it.style.translate = Math.round((x - g.pts[i].x) * 10) / 10 + 'px ' + Math.round((y - g.pts[i].y) * 10) / 10 + 'px';
        it.style.zIndex = String(100 + Math.round(y));
      });
    }
    function refresh() { items.forEach(function (it) { it.style.translate = ''; }); g = geometry(); place(); }
    // Opening a look (the page lines the looks up and enlarges one): the circle stops, and each look's turn is folded
    // into its own position first, so the page starts its move from exactly where the look stands. When the looks go
    // back into the circle, it starts turning again from the page's own circle.
    var frozen = false, resumeT = 0;
    function freeze() {
      if (frozen) return;
      frozen = true;
      clearTimeout(resumeT);
      drag = null;
      vel = 0;
      items.forEach(function (it) {
        var tr = (it.style.translate || '').split(/\s+/), tx = parseFloat(tr[0]) || 0, ty = parseFloat(tr[1]) || 0;
        if (tx || ty) {
          it.style.left = (parseFloat(it.style.left) || it.offsetLeft) + tx + 'px';
          it.style.top = (parseFloat(it.style.top) || it.offsetTop) + ty + 'px';
        }
        it.style.translate = '';
      });
    }
    if ('MutationObserver' in window) {
      new MutationObserver(function () {
        if (row.classList.contains('is-row-mode')) { freeze(); return; }
        if (!frozen) return;
        clearTimeout(resumeT);
        resumeT = setTimeout(function () {
          if (row.classList.contains('is-row-mode')) return;
          frozen = false;
          theta = 0;
          vel = 0;
          refresh();
        }, 1300);
      }).observe(row, { attributes: true, attributeFilter: ['class'] });
    }
    refresh();
    // (the page may lay the ring out a moment after this runs: until it has, keep looking for it)
    var tries = 0;
    (function again() {
      if (g || tries++ > 60) return;
      refresh();
      if (!g) setTimeout(again, 250);
    })();
    window.addEventListener('resize', function () { setTimeout(refresh, 120); });
    function frame(t) {
      var dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
      last = t;
      if (g && !drag && !frozen) {
        theta += (SPEED + vel) * dt;
        vel *= Math.pow(0.04, dt);       // momentum fades out in about a second
        if (Math.abs(vel) < 0.0005) vel = 0;
        place();
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    function ang(e) { var r = row.getBoundingClientRect(); return Math.atan2((e.clientY - r.top - g.cy) / g.ry, (e.clientX - r.left - g.cx) / g.rx); }
    row.addEventListener('pointerdown', function (e) {
      if (!g || frozen || (e.pointerType === 'mouse' && e.button !== 0)) return;
      drag = { id: e.pointerId, a: ang(e), t: performance.now(), x: e.clientX, y: e.clientY };
      moved = 0;
      vel = 0;
    }, true);
    window.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var a = ang(e), d = a - drag.a;
      if (d > Math.PI) d -= Math.PI * 2;
      if (d < -Math.PI) d += Math.PI * 2;
      var now = performance.now(), dt = Math.max(1, now - drag.t) / 1000;
      moved += Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y);
      drag.x = e.clientX; drag.y = e.clientY;
      theta += d;
      vel = vel * 0.6 + (d / dt) * 0.4;
      drag.a = a; drag.t = now;
      place();
    });
    function up(e) {
      if (!drag || e.pointerId !== drag.id) return;
      drag = null;
      vel = Math.max(-4, Math.min(4, vel));
      last = 0;
    }
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    // a turn of the circle is not a tap on the look it ended on
    row.addEventListener('click', function (e) {
      if (moved > 10) { e.preventDefault(); e.stopPropagation(); moved = 0; return; }
      if (g && !frozen && e.target.closest && e.target.closest('.look-item')) freeze();
    }, true);
  }

  // ------------------------------------------------------------------------------------------------ home
  // Panels after the room. Each is { kind: 'model' | 'video', src, button, href } or a still picture
  // { image, fit (cover|contain), theme (light|dark), small/title (caption), button, href }.
  // Files that ship with this script (the airbag film and its first frame) are served from the same tagged release.
  var MEDIA = (function () {
    var m = /^(https:\/\/cdn\.jsdelivr\.net\/gh\/[^/]+\/[^/@]+@[^/]+\/)/.exec((document.currentScript && document.currentScript.src) || '');
    return m ? m[1] : 'https://cdn.jsdelivr.net/gh/Elijah-Tho/motorella-archive@site-1.4.5/';
  })();
  // After the room: the chair film, then the airbag film. Nothing else.
  var HOME = window.MOTORELLA_HOME || [
    // the chair film (he sits, a quilted pillow comes out of the zipper), smaller, over a blurred spill of itself
    { kind: 'video', src: MEDIA + 'motorella-chair.mp4', poster: MEDIA + 'motorella-chair-poster.jpg', label: 'View now', href: P.shop, ambient: true },
    { kind: 'video', src: MEDIA + 'motorella-airbag.mp4', poster: MEDIA + 'motorella-airbag-poster.jpg', label: 'View now', href: P.shop }
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
  // The film as a link to the shop. With a mouse, hovering dims it and brings up the words (CSS); on a touch screen the
  // first tap does that and the second tap follows the link; a tap anywhere else lets it go.
  function cover(s, box, p) {
    box.classList.add('mhome-hit');
    var a = el('a', 'mhome-cover', box);
    a.href = p.href || P.shop;
    a.setAttribute('aria-label', (p.label || 'View now') + ' (shop)');
    el('span', '', a, p.label || 'View now');
    var set = function (on) {
      box.classList.toggle('is-hov', on);
      if (box !== s) s.classList.toggle('is-hov', on);
    };
    a.addEventListener('click', function (e) {
      if (!byTouch() || box.classList.contains('is-hov')) return;
      e.preventDefault();
      [].forEach.call(document.querySelectorAll('.mhome-hit.is-hov,.mhome-video.is-hov'), function (n) { n.classList.remove('is-hov'); });
      set(true);
    });
    document.addEventListener('click', function (e) {
      if (box.classList.contains('is-hov') && !box.contains(e.target)) set(false);
    }, true);
  }
  // A short film that loops without sound, playing only while it is on screen.
  function videoPanel(main, p) {
    var s = el('section', 'mhome-panel mhome-video' + (p.place === 'bottom' ? ' is-btn-low' : '') + (p.ambient ? ' is-ambient' : ''), main);
    s.setAttribute('data-theme', p.theme || 'light');
    s.setAttribute('data-mh-theme', p.theme || 'light');
    // ambient: the film sits smaller in the middle, and a tiny copy of each frame, stretched and blurred, fills the
    // space around it so the picture seems to run on past its edges (drawn from the playing film, so always in step)
    var amb = p.ambient ? el('canvas', 'mhome-amb', s) : null;
    var box = p.ambient ? el('div', 'mhome-frame', s) : s;
    var v = el('video', '', box);
    v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'none';
    v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
    if (p.poster) v.poster = p.poster;
    if (amb) {
      amb.width = 64; amb.height = 36;
      var cx = amb.getContext('2d');
      var paint = function (src) { try { cx.drawImage(src, 0, 0, 64, 36); } catch (err) {} };
      if (p.poster) { var pi = new Image(); pi.onload = function () { if (v.readyState < 2) paint(pi); }; pi.src = p.poster; }
      var frame = function () { if (v.readyState >= 2) paint(v); };
      v.addEventListener('loadeddata', frame);
      v.addEventListener('seeked', frame);
      if (v.requestVideoFrameCallback) {
        var each = function () { frame(); v.requestVideoFrameCallback(each); };
        v.requestVideoFrameCallback(each);
      } else {
        (function tick() { if (!v.paused) frame(); requestAnimationFrame(tick); })();
      }
    }
    // p.cover (the default): the film itself is the link, with words that come up over it; cover:false puts the old
    // glass button back instead
    if (p.cover === false) overlay(s, p);
    else cover(s, box, p);
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
    // the copyright sits over the bottom of the last panel (the film), so the page ends on it with no strip below
    var lastPanel = main.lastElementChild;
    el('footer', 'mhome-foot' + (lastPanel && lastPanel !== hero ? ' is-over' : ''), lastPanel && lastPanel !== hero ? lastPanel : main, '© ' + new Date().getFullYear() + ', motorella');

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
  // ------------------------------------------------------------------------------------------------ checkout
  // A Checkout button at the foot of the dropdown cart (every page). For now it does nothing: later it will hand the
  // cart (each item and its size) to the Shopify store and go to the matching Shopify cart. To wire that up, set
  // window.MotorellaCheckout = function (items) { ... } before or after this script; it is called with the cart's items.
  function checkoutButton() {
    var n = 0;
    (function find() {
      var panel = document.getElementById('motorella-cart');
      if (!panel) { if (n++ < 40) setTimeout(find, 250); return; }
      if (panel.querySelector('.mh-checkout')) return;
      var b = el('button', 'mh-checkout', panel, 'Checkout');
      b.type = 'button';
      b.setAttribute('data-mh-checkout', '');
      b.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.MotorellaCheckout === 'function') window.MotorellaCheckout(readCart());
      });
    })();
  }

  // ------------------------------------------------------------------------------------------------ the cart reminder
  // The first time someone leaves the shop, a notification drops in 30 to 60 seconds later, in the manner of a
  // phone's: the m mark, "motorella" where the sender goes, and a line about the cart. It stays until it is pressed or
  // swiped away, page after page (the shop included); it only steps aside while the cart or the menu is open. Once
  // dealt with, the next one comes three to five minutes later, while they are away from the shop. Someone who hasn't
  // opened the shop yet is counted from the first page they land on; a visit more than half an hour after the last
  // starts the clock afresh (a notification still waiting stays). Pressing it opens the cart (or goes to the shop when
  // the cart is empty); swiping it up puts it away. On wide screens it is smaller and sits under the cart.
  // window.MotorellaNudge() shows it straight away, for trying it out.
  var NUDGE = { key: 'mh_nudge', first: [30, 60], again: [180, 300], stale: 30 * 60 * 1000 };
  var NUDGE_FULL = 'Would you like to checkout the items in your cart?';
  var NUDGE_EMPTY = 'Your cart is currently empty, would you like to add to it?';
  function nudgeState() { try { return JSON.parse(localStorage.getItem(NUDGE.key) || 'null') || {}; } catch (e) { return {}; } }
  function nudgeSave(st) { try { localStorage.setItem(NUDGE.key, JSON.stringify(st)); } catch (e) {} }
  function between(r) { return (r[0] + Math.random() * (r[1] - r[0])) * 1000; }
  // note this page; on any page but the shop, returns how long until the next reminder is due (ms)
  function nudgePlan() {
    var now = Date.now(), st = nudgeState();
    if (!st.seen || now - st.seen > NUDGE.stale) st = { pending: st.pending || 0 };
    if (IS.shop) { st.shop = true; st.seen = now; nudgeSave(st); return -1; }
    // just left the shop, or arrived somewhere else first: the first one 30-60 s from now; later ones keep their
    // 3-5 minute spacing but never come sooner than 30 s after leaving the shop
    if (st.shop || !st.away) {
      st.away = now;
      st.next = st.next ? Math.max(st.next, now + NUDGE.first[0] * 1000) : now + between(NUDGE.first);
    }
    st.shop = false;
    st.seen = now;
    nudgeSave(st);
    return Math.max(0, st.next - now);
  }
  function nudgeLater(wait) {
    setTimeout(function () {
      var st = nudgeState(), now = Date.now();
      if (st.pending) return; // (one is already up, here or in another tab)
      if (st.next && st.next - now > 1000) return nudgeLater(st.next - now);
      nudgeSoon();
    }, Math.max(2200, wait));
  }
  // pressed or swiped away: the next one three to five minutes on
  function nudgeDone() {
    var st = nudgeState(), t = Date.now();
    st.pending = 0;
    st.next = t + between(NUDGE.again);
    st.seen = t;
    nudgeSave(st);
    if (!IS.shop) nudgeLater(st.next - t);
  }
  function ago(t) {
    var m = Math.floor((Date.now() - t) / 60000);
    return m < 1 ? 'now' : m < 60 ? m + 'm ago' : Math.floor(m / 60) + 'h ago';
  }
  // the phone's own typeface where there is one (Apple); Inter, its closest open relative, everywhere else
  function nudgeFont() {
    if (/Mac|iPhone|iPad|iPod/.test(navigator.platform || '') || document.getElementById('mh-inter')) return;
    var l = document.createElement('link');
    l.id = 'mh-inter';
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap';
    document.head.appendChild(l);
  }
  // still: it was already up on the page before, so it is simply there, without dropping in again
  function nudge(still) {
    if (document.querySelector('.mh-note')) return;
    nudgeFont();
    var st = nudgeState();
    if (!st.pending) { st.pending = Date.now(); nudgeSave(st); }
    var since = st.pending;
    var n = el('div', 'mh-note', document.body);
    n.setAttribute('role', 'status');
    n.setAttribute('tabindex', '0');
    var mark = el('div', 'mh-note-icon', n);
    mark.style.setProperty('--mh-logo', 'url("' + (H.logo || LOGO) + '")');
    var body = el('div', 'mh-note-body', n);
    var head = el('div', 'mh-note-head', body);
    el('b', '', head, 'motorella');
    var stamp = el('span', '', head, ago(since));
    var clock = setInterval(function () { stamp.textContent = ago(since); }, 30000);
    el('div', 'mh-note-msg', body, readCart().length ? NUDGE_FULL : NUDGE_EMPTY);

    // wide screens: as wide as the cart button and the little cart together, just under them
    function place() {
      if (window.innerWidth <= NARROW) { n.style.left = n.style.top = n.style.width = ''; return; }
      var hc = [].filter.call(document.querySelectorAll('.header-cart'), function (x) { return x.offsetParent !== null; })[0];
      var r = hc && hc.getBoundingClientRect();
      if (!r || !r.width) { n.style.left = (window.innerWidth - 356) + 'px'; n.style.top = '74px'; return; }
      var w = Math.max(280, r.width);
      n.style.width = w + 'px';
      n.style.left = Math.max(8, r.right - w) + 'px';
      n.style.top = r.bottom + 10 + 'px';
    }
    place();
    window.addEventListener('resize', place);

    var gone = false, y0 = null, dy = 0, t0 = 0, moved = false;
    // dealt with: it goes up and away, and the next one is set
    function away() {
      if (gone) return;
      gone = true;
      clearInterval(clock);
      n.classList.remove('is-dragging');
      n.style.transform = '';
      n.classList.remove('is-in');
      nudgeDone();
      setTimeout(function () { n.remove(); window.removeEventListener('resize', place); }, 650);
    }
    function go() {
      away();
      if (!readCart().length) { if (!IS.shop) location.href = P.shop; return; }
      setTimeout(function () {
        var t = [].filter.call(document.querySelectorAll('[data-cart-toggle]'), function (x) { return x.offsetParent !== null; })[0];
        if (t) t.click(); else location.href = P.shop + '?cart=open';
      }, 0);
    }
    // up follows the finger; down only gives a little and springs back
    n.addEventListener('pointerdown', function (e) {
      if (gone) return;
      y0 = e.clientY; dy = 0; t0 = Date.now(); moved = false;
      try { n.setPointerCapture(e.pointerId); } catch (err) {}
      n.classList.add('is-dragging');
    });
    n.addEventListener('pointermove', function (e) {
      if (y0 == null) return;
      dy = e.clientY - y0;
      if (Math.abs(dy) > 6) moved = true;
      n.style.transform = 'translateY(' + (dy < 0 ? dy : dy * 0.25) + 'px)';
    });
    function up() {
      if (y0 == null) return;
      y0 = null;
      n.classList.remove('is-dragging');
      if (dy < -32 || (dy < -14 && Date.now() - t0 < 220)) return away();
      n.style.transform = '';
    }
    n.addEventListener('pointerup', up);
    n.addEventListener('pointercancel', up);
    n.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!moved && !gone) go();
    });
    n.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });

    if (still) {
      n.classList.add('is-still', 'is-in');
      requestAnimationFrame(function () { requestAnimationFrame(function () { n.classList.remove('is-still'); }); });
    } else {
      n.getBoundingClientRect();
      requestAnimationFrame(function () { requestAnimationFrame(function () { n.classList.add('is-in'); }); });
    }
  }
  // wait for a quiet moment to drop it in: not while the page is out of sight, or a menu, the cart or a product is open
  function nudgeSoon() {
    nudgeFont();
    (function wait() {
      if (document.hidden) {
        return document.addEventListener('visibilitychange', function again() {
          if (document.hidden) return;
          document.removeEventListener('visibilitychange', again);
          setTimeout(wait, 1200);
        });
      }
      if (document.querySelector('.mh.is-menu,.mh.is-open,#motorella-cart.is-open,#product-view.is-open,.mh-note')) return setTimeout(wait, 1500);
      if (!nudgeState().pending) nudge();
    })();
  }
  window.MotorellaNudge = function () { nudge(); };

  function start() {
    if (IS.home) home();
    buildHeader();
    if (IS.shop) shop();
    if (IS.looks) looksOrbit();
    checkoutButton();
    // the reminder: one still waiting is put straight back; otherwise the next is set
    var due = nudgePlan();
    if (nudgeState().pending) nudge(true);
    else if (due >= 0) nudgeLater(due);
    // the information window: wire it now on the home page, borrow it later elsewhere
    if (document.querySelector('.info-window')) getInfo();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
