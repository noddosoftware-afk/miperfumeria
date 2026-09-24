/* =========================================================
   miperfumeria — cabecera, navegación y pie compartidos
   Se inyectan por JS para que todas las páginas del
   maquetado compartan exactamente el mismo encabezado.
   ========================================================= */

const ICON = {
  lupa:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
  user:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/></svg>',
  fav:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20.5s-7.5-4.7-7.5-10A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.5 2.9c0 5.3-7.5 10-7.5 10z"/></svg>',
  bolsa:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  menu:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  x:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 5l14 14M19 5L5 19"/></svg>',
  flechaI:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M15 5l-7 7 7 7"/></svg>',
  flechaD:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 5l7 7-7 7"/></svg>',
  camion:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 7h11v9H2z"/><path d="M13 10h4l3 3v3h-7z"/><circle cx="6" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/></svg>',
  escudo:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 3l7 3v6c0 4.4-3 7.9-7 9-4-1.1-7-4.6-7-9V6l7-3z"/><path d="M9 12l2 2 4-4"/></svg>',
  billete:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="6" width="20" height="12"/><circle cx="12" cy="12" r="2.6"/></svg>',
  chat:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.1A8 8 0 1 1 21 12z"/></svg>',
  caja:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/></svg>',
  tarjeta:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="5" width="20" height="14"/><path d="M2 10h20"/></svg>',
  banco:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 10l9-5 9 5"/><path d="M5 10v8M10 10v8M14 10v8M19 10v8"/><path d="M3 21h18"/></svg>',
  reloj:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  gota:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 3s6 6.4 6 10.4A6 6 0 0 1 6 13.4C6 9.4 12 3 12 3z"/></svg>',
  ig:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/></svg>',
  fb:'<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-8h2.7l.4-3h-3.1V8.2c0-.9.3-1.5 1.6-1.5h1.6V4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1V10H7.5v3h2.8v8h3.2z"/></svg>',
  tk:'<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3c.4 2.1 1.7 3.5 3.8 3.7v2.6c-1.3.1-2.5-.3-3.8-1v5.9c0 3.6-2.7 6-6 5.8-3.2-.2-5.3-3.1-4.8-6.2.4-2.6 2.8-4.5 5.6-4.2v2.8c-1.6-.4-3 .7-3 2.1 0 1.3 1 2.3 2.3 2.3 1.4 0 2.3-1 2.3-2.6V3h3.6z"/></svg>',
  wa:'<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm5.6 14.1c-.2.7-1.3 1.3-1.8 1.3-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.4-1.1-2.7s.7-1.9.9-2.2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.7 1.2 1.6 2 1.1.9 2 1.2 2.3 1.4.3.1.4.1.6-.1l.9-1c.2-.2.4-.2.6-.1l2 .9c.2.1.4.2.4.3.1.2.1.6-.1 1.2z"/></svg>'
};

function logoSVG(color){
  const c = color || "#101C3A";
  return `
<svg viewBox="0 0 300 46" aria-label="miperfumeria">
  <text x="0" y="33" font-family="Montserrat, Arial, sans-serif" font-size="31" font-weight="800"
        letter-spacing="-0.5" fill="${c}" textLength="236" lengthAdjust="spacingAndGlyphs">MI PERFUMERI</text>
  <g fill="none" stroke="${c}" stroke-width="2.4" stroke-linejoin="round">
    <rect x="244" y="18" width="29" height="15"/>
    <path d="M251 18 L258.5 8 L266 18"/>
    <circle cx="258.5" cy="5" r="3"/>
  </g>
</svg>`;
}

const NAV = [
  {t:"Ofertas", h:"catalogo.html?f=oferta", sale:true},
  {t:"Hombre", h:"catalogo.html?f=hombre", mega:[
    {h:"Por familia", items:[["Frescos","catalogo.html?f=hombre&fam=Fresco"],["Amaderados","catalogo.html?f=hombre&fam=Amaderado"],["Orientales","catalogo.html?f=hombre&fam=Oriental"],["Dulces","catalogo.html?f=hombre&fam=Dulce"]]},
    {h:"Por marca", items:[["Rasasi","catalogo.html?f=hombre&m=Rasasi"],["Armaf","catalogo.html?f=hombre&m=Armaf"],["Lattafa","catalogo.html?f=hombre&m=Lattafa"],["Dior","catalogo.html?f=hombre&m=Dior"],["Versace","catalogo.html?f=hombre&m=Versace"],["Azzaro","catalogo.html?f=hombre&m=Azzaro"]]},
    {h:"Destacados", items:[["Los más vendidos","catalogo.html?f=best"],["Novedades","catalogo.html?f=nuevo"],["Menos de $1,500","catalogo.html?f=hombre&max=1500"],["Ver todo hombre","catalogo.html?f=hombre"]]}
  ]},
  {t:"Mujer", h:"catalogo.html?f=mujer", mega:[
    {h:"Por familia", items:[["Florales","catalogo.html?f=mujer&fam=Floral"],["Dulces","catalogo.html?f=mujer&fam=Dulce"],["Orientales","catalogo.html?f=mujer&fam=Oriental"],["Cítricos","catalogo.html?f=mujer&fam=Cítrico"]]},
    {h:"Por marca", items:[["Carolina Herrera","catalogo.html?f=mujer&m=Carolina Herrera"],["Yves Saint Laurent","catalogo.html?f=mujer&m=Yves Saint Laurent"],["Lancôme","catalogo.html?f=mujer&m=Lancôme"],["Chanel","catalogo.html?f=mujer&m=Chanel"],["Lattafa","catalogo.html?f=mujer&m=Lattafa"],["Rasasi","catalogo.html?f=mujer&m=Rasasi"]]},
    {h:"Destacados", items:[["Los más vendidos","catalogo.html?f=best"],["Novedades","catalogo.html?f=nuevo"],["Ideas de regalo","catalogo.html?f=mujer"],["Ver todo mujer","catalogo.html?f=mujer"]]}
  ]},
  {t:"Árabes", h:"catalogo.html?f=arabe", mega:[
    {h:"Casas", items:[["Rasasi","catalogo.html?m=Rasasi"],["Armaf","catalogo.html?m=Armaf"],["Lattafa","catalogo.html?m=Lattafa"]]},
    {h:"Los imperdibles", items:[["Hawas Ice","producto.html?id=hawas-ice"],["Hawas Malibú","producto.html?id=hawas-malibu"],["Khamrah","producto.html?id=khamrah"],["Club de Nuit Intense","producto.html?id=club-de-nuit-intense"],["Odyssey Mega","producto.html?id=odyssey-mega"]]}
  ]},
  {t:"Diseñador", h:"catalogo.html?f=disenador", mega:[
    {h:"Marcas A–Z", items:[["Azzaro","catalogo.html?m=Azzaro"],["Carolina Herrera","catalogo.html?m=Carolina Herrera"],["Chanel","catalogo.html?m=Chanel"],["Dior","catalogo.html?m=Dior"],["Jean Paul Gaultier","catalogo.html?m=Jean Paul Gaultier"],["Paco Rabanne","catalogo.html?m=Paco Rabanne"],["Versace","catalogo.html?m=Versace"],["Yves Saint Laurent","catalogo.html?m=Yves Saint Laurent"]]},
    {h:"Colecciones", items:[["Eau de Parfum","catalogo.html?f=disenador"],["Clásicos de noche","catalogo.html?fam=Oriental"],["Para oficina","catalogo.html?fam=Amaderado"],["Ver todo diseñador","catalogo.html?f=disenador"]]}
  ]},
  {t:"Más vendidos", h:"catalogo.html?f=best"},
  {t:"Mayoreo", h:"mayoreo.html"}
];

function buildHeader(){
  const nav = NAV.map(n=>{
    let mega = "";
    if(n.mega){
      mega = `<div class="mega"><div class="mega-cols">${
        n.mega.map(col=>`<div><h4>${col.h}</h4><ul>${
          col.items.map(i=>`<li><a href="${i[1]}">${i[0]}</a></li>`).join("")
        }</ul></div>`).join("")
      }<div class="mega-promo"><div class="promo-card">
          <div class="eyebrow">Beneficio</div>
          <p>3 piezas o más:<br><strong>envío gratis</strong> a todo México.</p>
          <a class="btn btn-sm btn-ghost" href="catalogo.html">Ver catálogo</a>
        </div></div></div></div>`;
    }
    return `<li class="nav-item"><a class="nav-link ${n.sale?"is-sale":""}" href="${n.h}">${n.t}</a>${mega}</li>`;
  }).join("");

  return `
<div class="announce">
  <div class="wrap">
    <button class="announce-nav" data-ann="-1" aria-label="Aviso anterior">‹</button>
    <div class="announce-track">
      <div class="announce-item is-on"><strong>ENVÍO GRATIS</strong> comprando 3 piezas o más · a todo México</div>
      <div class="announce-item">Precio de <strong>MAYOREO</strong> en pedidos desde $4,000 MXN</div>
      <div class="announce-item"><strong>100% ORIGINALES</strong> · Garantía de autenticidad en cada pedido</div>
      <div class="announce-item">Compra por <strong>WhatsApp</strong> · Pago por transferencia</div>
    </div>
    <button class="announce-nav" data-ann="1" aria-label="Siguiente aviso">›</button>
  </div>
</div>

<div class="utility">
  <div class="wrap">
    <a href="ayuda.html#rastreo">Rastrea tu pedido</a>
    <a href="mayoreo.html">Mayoreo</a>
    <a href="autenticidad.html">Garantía de autenticidad</a>
    <a href="ayuda.html#envios">Envíos y pagos</a>
    <a href="contacto.html">Contacto</a>
  </div>
</div>

<header class="site-header">
  <div class="wrap">
    <div class="header-main">
      <div class="header-search">
        <button class="burger" data-open="menu" aria-label="Abrir menú">${ICON.menu}</button>
        <form class="search-field" role="search" onsubmit="return goSearch(event)">
          ${ICON.lupa}
          <input type="search" id="q" placeholder="Buscar por marca, nombre o nota olfativa" aria-label="Buscar">
        </form>
      </div>
      <a class="brand" href="index.html" aria-label="miperfumeria — inicio">${logoSVG()}</a>
      <div class="header-actions">
        <a class="hicon" href="cuenta.html">${ICON.user}<span>Mi compra</span></a>
        <a class="hicon" href="catalogo.html">${ICON.fav}<span class="sr">Favoritos</span></a>
        <button class="hicon" data-open="cart">${ICON.bolsa}<span class="sr">Bolsa</span><em class="cart-count" id="cartCount">0</em></button>
      </div>
    </div>
  </div>
  <div class="mobile-search">
    <form class="search-field" role="search" onsubmit="return goSearch(event)">
      ${ICON.lupa}<input type="search" placeholder="Buscar perfume, marca o nota" aria-label="Buscar">
    </form>
  </div>
  <nav class="mainnav"><ul>${nav}</ul></nav>
</header>

<div class="mobile-menu" id="mobileMenu">
  <div class="mm-head">${logoSVG()}<button data-close="menu" aria-label="Cerrar">${ICON.x}</button></div>
  <div class="wrap" style="padding:16px 20px 0">
    <form class="search-field" onsubmit="return goSearch(event)">
      ${ICON.lupa}<input type="search" id="qm" placeholder="Buscar perfume" aria-label="Buscar">
    </form>
  </div>
  <nav>
    ${NAV.map(n=>`<a href="${n.h}">${n.t}</a>`).join("")}
    <div class="mm-sub">
      <a href="contacto.html">Contacto</a>
      <a href="${TIENDA.instagram}" target="_blank" rel="noopener">Instagram ${TIENDA.instagramUser}</a>
    </div>
  </nav>
</div>`;
}

function buildFooter(){
  const cols = [
    {t:"Comprar", l:[["Los más vendidos","catalogo.html?f=best"],["Novedades","catalogo.html?f=nuevo"],["Perfumes para él","catalogo.html?f=hombre"],["Perfumes para ella","catalogo.html?f=mujer"],["Perfumes árabes","catalogo.html?f=arabe"],["Diseñador","catalogo.html?f=disenador"],["Ofertas","catalogo.html?f=oferta"]]},
    {t:"Ayuda", l:[["Preguntas frecuentes","ayuda.html"],["Envíos y tiempos de entrega","ayuda.html#envios"],["Formas de pago","ayuda.html#pagos"],["Rastrea tu pedido","ayuda.html#rastreo"],["Cambios y devoluciones","ayuda.html#devoluciones"],["Contacto","contacto.html"]]},
    {t:"Mayoreo", l:[["Precios de mayoreo","mayoreo.html"],["Cómo pedir por volumen","mayoreo.html#como"],["Catálogo para revendedores","mayoreo.html#catalogo"],["Solicitar lista de precios","contacto.html"]]},
    {t:"La tienda", l:[["Quiénes somos","autenticidad.html#nosotros"],["Garantía de autenticidad","autenticidad.html"],["Cómo elegir tu perfume","autenticidad.html#guia"],["Aviso de privacidad","ayuda.html#privacidad"],["Términos y condiciones","ayuda.html#terminos"]]}
  ];
  return `
<footer class="site-footer">
  <div class="wrap">
    <div class="footer-social">
      <a href="${TIENDA.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${ICON.ig}</a>
      <a href="${TIENDA.tiktok}" target="_blank" rel="noopener" aria-label="TikTok">${ICON.tk}</a>
    </div>
    <div class="footer-cols">
      ${cols.map(c=>`
      <div class="footer-col">
        <h4>${c.t}</h4>
        <button class="acc-toggle" data-facc>${c.t}<span>+</span></button>
        <ul>${c.l.map(i=>`<li><a href="${i[1]}">${i[0]}</a></li>`).join("")}</ul>
      </div>`).join("")}
    </div>
    <div class="footer-contact">
      <div><b>Atención a clientes</b><p>WhatsApp e Instagram directo<br>Consulta disponibilidad y coordina tu entrega</p></div>
      <div><b>Envíos</b><p>Guías con ${TIENDA.paqueteria}: Estafeta, FedEx, DHL, Paquetexpress y Redpack<br>Envío gratis desde 3 piezas</p></div>
      <div><b>Síguenos</b><p><a href="${TIENDA.instagram}" target="_blank" rel="noopener">${TIENDA.instagramUser}</a><br>Nuevas llegadas y disponibilidad diaria</p></div>
    </div>
    <div class="footer-legal">
      <div class="links">
        <a href="ayuda.html#terminos">Términos y condiciones</a>
        <a href="ayuda.html#privacidad">Aviso de privacidad</a>
        <a href="ayuda.html#devoluciones">Políticas de cambio</a>
      </div>
      <div class="trust">
        <span class="pill">Compra segura</span>
        <span class="pill">100% original</span>
        <span class="pill">Envíos ${TIENDA.paqueteria}</span>
      </div>
      <span>© ${new Date().getFullYear()} miperfumeria</span>
    </div>
  </div>
</footer>

<div class="overlay" id="overlay"></div>

<aside class="drawer" id="cartDrawer" aria-label="Bolsa de compra">
  <div class="drawer-head">
    <h3>Tu bolsa</h3>
    <button data-close="cart" aria-label="Cerrar">${ICON.x}</button>
  </div>
  <div class="drawer-body" id="cartBody"></div>
  <div class="drawer-foot" id="cartFoot"></div>
</aside>

<a class="wa-float" href="${TIENDA.whatsapp}" target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp">${ICON.wa}</a>
<div class="toast" id="toast"></div>`;
}
