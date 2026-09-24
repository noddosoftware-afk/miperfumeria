/* =========================================================
   miperfumeria — comportamiento del maquetado
   Todo vive en el navegador (localStorage). No hay backend:
   el objetivo es mostrar cómo se siente el sitio terminado.
   ========================================================= */

/* ---------- montaje del layout ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  if (typeof loadLiveProducts === "function") await loadLiveProducts();
  const h = document.getElementById("site-header");
  const f = document.getElementById("site-footer");
  if (h) h.innerHTML = buildHeader();
  if (f) f.innerHTML = buildFooter();
  initUI();
  renderCart();
  if (typeof pageInit === "function") pageInit();
  mountDelivery();
  if (typeof apartadoRestante === "function" && apartadoRestante() > 0) startHoldTicker();
});

/* ---------- utilidades ---------- */
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const byId = id => PRODUCTOS.find(p => p.id === id);
const params = () => new URLSearchParams(location.search);

function toast(msg){
  const t = $("#toast"); if(!t) return;
  t.textContent = msg; t.classList.add("is-on");
  clearTimeout(t._t); t._t = setTimeout(()=>t.classList.remove("is-on"), 2400);
}
function stars(r){
  const full = Math.max(0, Math.min(5, Math.round(r || 0)));
  return "★".repeat(full) + "☆".repeat(5-full);
}
function goSearch(e){
  e.preventDefault();
  const v = (e.target.querySelector("input").value || "").trim();
  location.href = "catalogo.html?q=" + encodeURIComponent(v);
  return false;
}

/* ---------- interfaz general ---------- */
function initUI(){
  // barra de avisos rotativa
  const items = $$(".announce-item");
  let ai = 0;
  const show = i => { items.forEach(x=>x.classList.remove("is-on")); items[(i+items.length)%items.length].classList.add("is-on"); };
  if(items.length){
    const timer = setInterval(()=>show(++ai), 4200);
    $$("[data-ann]").forEach(b=>b.addEventListener("click",()=>{ clearInterval(timer); show(ai += +b.dataset.ann); }));
  }

  // apertura de paneles
  const ov = $("#overlay");
  const open = what => {
    if(what==="cart") $("#cartDrawer").classList.add("is-on");
    if(what==="menu") $("#mobileMenu").classList.add("is-on");
    ov.classList.add("is-on");
  };
  const closeAll = () => {
    $("#cartDrawer")?.classList.remove("is-on");
    $("#mobileMenu")?.classList.remove("is-on");
    $(".filters")?.classList.remove("is-on");
    ov.classList.remove("is-on");
  };
  document.addEventListener("click", e => {
    const o = e.target.closest("[data-open]"); if(o) open(o.dataset.open);
    if(e.target.closest("[data-close]")) closeAll();
  });
  ov?.addEventListener("click", closeAll);
  document.addEventListener("keydown", e => { if(e.key==="Escape") closeAll(); });

  // acordeones (footer, ayuda, ficha de producto)
  document.addEventListener("click", e => {
    const fa = e.target.closest("[data-facc]");
    if(fa) fa.parentElement.classList.toggle("is-on");
    const ab = e.target.closest(".acc-btn");
    if(ab) ab.parentElement.classList.toggle("is-on");
  });

  // carruseles horizontales
  $$(".rail-wrap").forEach(w => {
    const rail = $(".rail", w);
    $(".rail-btn.prev", w)?.addEventListener("click", ()=>rail.scrollBy({left:-rail.clientWidth*.8, behavior:"smooth"}));
    $(".rail-btn.next", w)?.addEventListener("click", ()=>rail.scrollBy({left: rail.clientWidth*.8, behavior:"smooth"}));
  });

  // añadir a la bolsa desde cualquier tarjeta
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-add]");
    if(b){ e.preventDefault(); addToCart(b.dataset.add, +(b.dataset.qty||1)); }
    const fv = e.target.closest("[data-fav]");
    if(fv){ e.preventDefault(); const agregado=toggleFavorito(fv.dataset.fav); fv.classList.toggle("is-on", agregado); toast(agregado?"Guardado en favoritos":"Quitado de favoritos"); }
  });
}

/* ---------- tarjeta de producto ---------- */
function cardHTML(p){
  const off = p.lista ? Math.round((1 - p.precio/p.lista)*100) : 0;
  const badges = [];
  if(p.best)   badges.push('<span class="badge">Más vendido</span>');
  if(p.nuevo)  badges.push('<span class="badge soft">Nuevo</span>');
  if(off >= 15) badges.push(`<span class="badge sale">-${off}%</span>`);
  return `
<article class="card" data-product="${p.id}">
  <a class="card-media" href="producto.html?id=${p.id}">
    <div class="card-badges">${badges.join("")}</div>
    ${cardArt(p)}
    <span class="card-quick" data-add="${p.id}">Agregar a la bolsa</span>
  </a>
  <button class="card-fav ${esFavorito(p.id)?'is-on':''}" data-fav="${p.id}" aria-label="Guardar en favoritos">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20.5s-7.5-4.7-7.5-10A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.5 2.9c0 5.3-7.5 10-7.5 10z"/></svg>
  </button>
  <div class="card-body">
    <a href="producto.html?id=${p.id}" class="card-brand">${p.marca}</a>
    <a href="producto.html?id=${p.id}" class="card-name">${p.nombre}</a>
    <span class="card-meta">${p.ml}${p.familia && p.familia!=="Por descubrir" ? " · "+p.familia : ""}</span>
    <div class="card-price">
      <span class="price-now">${MONEDA(p.precio)}</span>
      ${p.lista ? `<span class="price-was">${MONEDA(p.lista)}</span><span class="price-off">-${off}%</span>` : ""}
    </div>
    <div class="card-stock ${p.stock===1?'last-unit':''}">${stockText(p)}</div>
    <div class="card-buy">${purchaseActions([{id:p.id,q:1}],p.id)}</div>
  </div>
</article>`;
}
const renderCards = (arr, sel) => { const n = $(sel); if(n) n.innerHTML = arr.map(cardHTML).join(""); };

/* ---------- bolsa de compra ---------- */
const CART_KEY = "mp_cart";
const getCart = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY));
    if(!Array.isArray(raw)) return [];
    return raw.filter(i=>byId(i.id) && Number.isInteger(i.q) && i.q>0).map(i=>({id:i.id,q:Math.min(i.q,byId(i.id).stock ?? Infinity)})).filter(i=>i.q>0);
  } catch(e){ return []; }
};
const setCart = c => { try { localStorage.setItem(CART_KEY, JSON.stringify(c)); } catch(e){} renderCart(); if(typeof onCartChange === "function") onCartChange(); };

/* ---------- favoritos ---------- */
const FAV_KEY = "mp_favoritos";
const getFavoritos = () => { try{ const f=JSON.parse(localStorage.getItem(FAV_KEY)); return Array.isArray(f)?f:[]; }catch{ return []; } };
const esFavorito = id => getFavoritos().includes(id);
function toggleFavorito(id){
  const f = getFavoritos(), i = f.indexOf(id);
  if(i>-1) f.splice(i,1); else f.push(id);
  try{ localStorage.setItem(FAV_KEY, JSON.stringify(f)); }catch{}
  return i<0; // true si se acaba de agregar
}

function addToCart(id, qty=1){
  const p=byId(id); if(!p || !Number.isInteger(qty) || qty<1) return;
  const c = getCart();
  const hit = c.find(i => i.id === id);
  if(p.stock!=null && (hit?.q||0)+qty>p.stock){toast('Existencia disponible: '+p.stock+' '+(p.contenido?'set(s)':'pieza(s)'));return;}
  hit ? hit.q += qty : c.push({id, q:qty});
  setCart(c);
  toast(byId(id).marca + " agregado a tu bolsa");
  $("#cartDrawer")?.classList.add("is-on");
  $("#overlay")?.classList.add("is-on");
}
const cartCount = () => getCart().reduce((s,i)=>s+i.q, 0);
const cartBaseTotal = () => getCart().reduce((s,i)=>s + byId(i.id).precio*i.q, 0);
/* Mayoreo y distribuidor se aplican solos según el subtotal del pedido,
   igual de automático uno que el otro — nadie tiene que pedirlo aparte. */
const cartTier = () => {
  const base = cartBaseTotal();
  if(base >= TIENDA.distribuidorMonto) return 'distribuidor';
  if(base >= TIENDA.mayoreoMonto) return 'mayoreo';
  return 'normal';
};
const cartWholesale = () => cartTier() !== 'normal';
const cartUnitPrice = p => {
  const tier = cartTier();
  if(tier === 'distribuidor' && p.distribuidor) return p.distribuidor;
  if(tier === 'mayoreo' && p.mayoreo) return p.mayoreo;
  return p.precio;
};
const cartTotal = () => getCart().reduce((s,i)=>s + cartUnitPrice(byId(i.id))*i.q, 0);
/* Sin inventario capturado (null) = disponible, se vende sin llevar conteo.
   Solo 0 exacto es agotado: en ese caso se oculta de todo listado (ver
   `disponible()`), así que esto solo se ve si alguien entra por el link
   directo del producto. */
const disponible = p => p.stock !== 0;
const stockText = p => p.stock==null ? '' : p.stock===0 ? 'Agotado' : p.stock===1 ? (p.contenido?'Último set disponible':'Última pieza disponible') : p.stock+' '+(p.contenido?'sets disponibles':'piezas disponibles');

function renderCart(){
  const c = getCart();
  const cc = $("#cartCount"); if(cc) cc.textContent = cartCount();
  const body = $("#cartBody"), foot = $("#cartFoot");
  if(!body) return;

  if(!c.length){
    body.innerHTML = apartadoBanner() + `<div class="empty-state"><p>Tu bolsa está vacía.</p>
      <a class="btn btn-ghost btn-sm" href="catalogo.html">Ver catálogo</a></div>`;
    foot.innerHTML = "";
  } else {
    const piezas = cartCount();
    const faltan = Math.max(0, TIENDA.envioGratisPiezas - piezas);
    body.innerHTML = apartadoBanner() + `
      <div class="ship-bar">
        ${faltan ? `Agrega <b>${faltan}</b> pieza${faltan>1?"s":""} más y tu envío es <b>gratis</b>.`
                 : `<b>¡Listo!</b> Tu envío es gratis.`}
        <div class="track"><div class="fill" style="width:${Math.min(100, piezas/TIENDA.envioGratisPiezas*100)}%"></div></div>
      </div>` + c.map(i=>{
      const p = byId(i.id);
      return `<div class="mini-item">
        <div class="thumb">${cardArt(p)}</div>
        <div>
          <h5>${p.marca}</h5>
          <p>${p.nombre}</p>
          <p style="color:var(--muted-2);font-size:11px">${p.ml}</p>
          <div class="qty">
            <button onclick="changeQty('${p.id}',-1)" aria-label="Quitar uno">−</button>
            <span>${i.q}</span>
            <button onclick="changeQty('${p.id}',1)" aria-label="Agregar uno">+</button>
          </div>
          <br><a class="rm" onclick="removeItem('${p.id}')">Eliminar</a>
        </div>
        <strong style="font-family:var(--f-brand);font-size:13px">${MONEDA(cartUnitPrice(p)*i.q)}</strong>
      </div>`;
    }).join("");

    const sub = cartTotal();
    const envio = piezas >= TIENDA.envioGratisPiezas ? 0 : 149;
    foot.innerHTML = `
      <div class="sum-row"><span>Subtotal (${piezas} pza)</span><span>${MONEDA(sub)}</span></div>
      <div class="sum-row"><span>${deliveryData().method==='personal'?'Entrega personal':'Envío'}</span><span>${deliveryData().method==='personal'?'Por confirmar':envio? MONEDA(envio) : 'Gratis'}</span></div>
      ${cartTier()!=='normal' ? `<div class="sum-row" style="color:var(--ok)"><span>Precio ${cartTier()} aplicado</span><span>✓</span></div>` : ""}
      <div class="sum-row total"><span>${deliveryData().method==='personal'?'Subtotal sin entrega':'Total con paquetería'}</span><span>${MONEDA(sub+(deliveryData().method==='personal'?0:envio))}</span></div>
      <div class="purchase-actions">${purchaseActions(c,null,false)}</div>
      <a class="btn btn-block btn-ghost" href="carrito.html" style="margin-top:8px">${ICON.carrito}Ver carrito</a>`;
  }
}
function changeQty(id, d){
  const c = getCart(); const i = c.find(x=>x.id===id); if(!i) return;
  if(byId(id).stock!=null && i.q+d>byId(id).stock){toast('Ya agregaste toda la existencia disponible');return;}
  i.q += d; if(i.q < 1) return removeItem(id);
  setCart(c);
}
function removeItem(id){
  const rest = getCart().filter(i=>i.id!==id);
  setCart(rest);
  // La bolsa quedó vacía: devolvemos de inmediato lo apartado al catálogo.
  if(!rest.length && typeof sbReservations !== 'undefined' && apartadoRestante() > 0){
    sbReservations.release().catch(()=>{});
    MI_APARTADO = {expira: null, piezas: {}};
    clearInterval(HOLD_TICKER);
  }
}

/* ---------- catálogo (PLP) ---------- */
function filtrar(){
  const q  = params();
  const f  = q.get("f"), m = q.get("m"), fam = q.get("fam"), max = +q.get("max") || 0;
  const txt = (q.get("q") || "").toLowerCase().trim();

  let arr = PRODUCTOS.filter(disponible);
  if(f === "inventario") arr = arr.filter(p=>p.stock>0);
  else if(f === "best")   arr = arr.filter(p=>p.best);
  else if(f === "nuevo")  arr = arr.filter(p=>p.nuevo);
  else if(f === "oferta") arr = arr.filter(p=>p.oferta || (p.lista && p.lista > p.precio));
  else if(f === "favoritos") arr = arr.filter(p=>esFavorito(p.id));
  else if(["hombre","mujer","unisex"].includes(f)) arr = arr.filter(p=>p.genero===f);
  else if(["arabe","disenador"].includes(f)) arr = arr.filter(p=>p.cat===f);
  if(m)   arr = arr.filter(p=>p.marca===m);
  if(fam) arr = arr.filter(p=>p.familia===fam);
  if(max) arr = arr.filter(p=>p.precio<=max);
  if(txt) arr = arr.filter(p => (p.marca+" "+p.nombre+" "+p.familia+" "+JSON.stringify(p.notas)).toLowerCase().includes(txt));

  // filtros marcados en la barra lateral
  const sel = k => $$(`input[data-k="${k}"]:checked`).map(i=>i.value);
  const sg = sel("genero"), sm = sel("marca"), sf = sel("familia"), sp = sel("precio");
  if(sg.length) arr = arr.filter(p=>sg.includes(p.genero));
  if(sm.length) arr = arr.filter(p=>sm.includes(p.marca));
  if(sf.length) arr = arr.filter(p=>sf.includes(p.familia));
  if(sp.length) arr = arr.filter(p=>sp.some(r=>{
    const [a,b] = r.split("-").map(Number);
    return p.precio >= a && p.precio <= (b||1e9);
  }));

  const orden = $("#orden")?.value;
  if(orden === "precio-asc")  arr.sort((a,b)=>a.precio-b.precio);
  if(orden === "precio-desc") arr.sort((a,b)=>b.precio-a.precio);
  if(orden === "rating")      arr.sort((a,b)=>(b.rating||0)-(a.rating||0));
  if(orden === "nuevo")       arr.sort((a,b)=>(b.nuevo||0)-(a.nuevo||0));
  return arr;
}

/* ---------- fondos decorativos ---------- */
document.addEventListener("DOMContentLoaded", () => {
  $$("[data-bg]").forEach((n,i) => n.innerHTML = artBg(n.dataset.bg, i));
  $$("[data-tile]").forEach((n,i) => n.innerHTML = artTile(n.dataset.tile, i));
});


/* Compra asistida: abrir WhatsApp prepara el mensaje, nunca lo envía. */
function purchaseItems(items){
  return items.filter(i=>byId(i.id) && Number.isInteger(i.q) && i.q>0 && byId(i.id).stock!==0)
    .map(i=>({id:i.id,q:Math.min(i.q,byId(i.id).stock ?? 99)}));
}
function purchaseQuote(items){
  const clean=purchaseItems(items);
  const base=clean.reduce((s,i)=>s+byId(i.id).precio*i.q,0);
  const tier=base>=TIENDA.distribuidorMonto?'distribuidor':base>=TIENDA.mayoreoMonto?'mayoreo':'normal';
  const lines=clean.map(i=>{const p=byId(i.id);const unit=(tier==='distribuidor'&&p.distribuidor)?p.distribuidor:(tier==='mayoreo'&&p.mayoreo)?p.mayoreo:p.precio;return {...i,p,unit};});
  const units=lines.reduce((s,i)=>s+i.q,0);
  const subtotal=lines.reduce((s,i)=>s+i.unit*i.q,0);
  const shipping=units && units<TIENDA.envioGratisPiezas?149:0;
  return {lines,units,subtotal,shipping,total:subtotal+shipping,tier,wholesale:tier!=='normal'};
}
function purchaseMessage(items,receipt=false){
  const q=purchaseQuote(items);
  if(!q.lines.length)return '';
  return [receipt?'Hola, miperfumeria. Quiero enviar el comprobante de transferencia de esta compra:':'Hola, miperfumeria. Me gustaría comprar:',
    '',...q.lines.map(i=>`${i.q} × ${i.p.marca} ${i.p.nombre} (${i.p.ml})\nSKU: ${i.id}\nPrecio unitario: ${MONEDA(i.unit)} MXN · Importe: ${MONEDA(i.unit*i.q)} MXN${i.p.contenido?'\nIncluye: '+i.p.contenido.join(', '):''}`),
    '',q.tier==='distribuidor'?'Precio de distribuidor aplicado según el monto.':q.tier==='mayoreo'?'Precio de mayoreo aplicado según el monto.':'Precio normal.',
    `Subtotal: ${MONEDA(q.subtotal)} MXN`,
    deliveryData().method==='personal'?'Entrega personal: costo por confirmar.':`Envío por paquetería: ${q.shipping?MONEDA(q.shipping)+' MXN':'gratis (3 piezas o más)'}`,
    deliveryData().method==='personal'?`Subtotal de perfumes: ${MONEDA(q.subtotal)} MXN (entrega pendiente de cotizar).`:`Total con paquetería: ${MONEDA(q.total)} MXN`,
    ...deliveryMessage(),
    receipt?'Adjuntaré el comprobante en este chat. ¿Me ayudan a verificar el pago y coordinar la entrega?':'¿Me confirman disponibilidad y forma de entrega? El pago sería por transferencia.'
  ].join('\n');
}
function purchaseURL(items,receipt=false){
  return TIENDA.whatsapp+'?text='+encodeURIComponent(purchaseMessage(items,receipt));
}
function purchaseActions(items,id=null,mostrarBolsa=true,botonAgregar=false){
  const clean=purchaseItems(items);if(!clean.length)return '<p class="purchase-note">No hay productos disponibles para continuar.</p>';
  const confirmar='checkout.html'+(id?'?id='+encodeURIComponent(id)+'&qty='+clean[0].q:'');
  const bolsa=!mostrarBolsa?'':botonAgregar&&id
    ?`<button type="button" class="btn btn-block btn-ghost" data-add="${id}" data-qty="${clean[0].q}">Añadir a la bolsa</button>`
    :`<a class="btn btn-block btn-ghost" href="carrito.html">${ICON.carrito}Ver carrito</a>`;
  return bolsa
    +`<a class="btn btn-block confirm-buy" href="${confirmar}">Confirmar</a>`;
}
/* ---------- apartado temporal ----------
   Al confirmar el pedido en el paso de transferencia (checkout.html) las
   piezas se apartan 10 minutos. Mientras el cliente solo explora o sigue
   agregando productos no se aparta nada. El contador es informativo: la base
   libera el apartado sola al vencer. */
function apartadoRestante(){
  const exp = typeof MI_APARTADO !== 'undefined' ? MI_APARTADO.expira : null;
  if(!exp) return 0;
  return Math.max(0, Math.floor((new Date(exp) - Date.now())/1000));
}
function apartadoTexto(){
  const s = apartadoRestante(); if(!s) return '';
  const m = Math.floor(s/60), r = s%60;
  return m + ':' + String(r).padStart(2,'0');
}
function apartadoBanner(){
  const t = apartadoTexto(); if(!t) return '';
  return `<div class="hold-bar" id="holdBar">Tus piezas están apartadas <b>${t}</b> más.
    <span class="hold-note">Si la compra no se concreta, vuelven al catálogo.</span></div>`;
}
async function apartarBolsa(items){
  if(typeof sbReservations === 'undefined') return;
  try{
    const res = await sbReservations.reserve(items);
    if(res && res.expira){
      MI_APARTADO.expira = res.expira;
      (res.articulos||[]).forEach(a => { if(a.apartado) MI_APARTADO.piezas[a.id] = a.apartado; });
      const corto = (res.articulos||[]).filter(a => a.apartado < a.solicitado);
      if(corto.length) toast('Alguien más está comprando parte de lo que pediste; se apartó lo disponible.');
      else toast('Tus piezas quedan apartadas 10 minutos para completar tu compra.');
      renderCart();
      startHoldTicker();
    }
  }catch(e){ console.warn('No se pudo apartar el inventario.', e); }
}
let HOLD_TICKER = null;
function startHoldTicker(){
  clearInterval(HOLD_TICKER);
  HOLD_TICKER = setInterval(async () => {
    const bar = document.getElementById('holdBar');
    if(apartadoRestante() <= 0){
      clearInterval(HOLD_TICKER);
      MI_APARTADO = {expira: null, piezas: {}};
      if(typeof applyAvailability === 'function') await applyAvailability();
      renderCart();
      return;
    }
    if(bar) bar.innerHTML = `Tus piezas están apartadas <b>${apartadoTexto()}</b> más.
      <span class="hold-note">Si la compra no se concreta, vuelven al catálogo.</span>`;
  }, 1000);
}
document.addEventListener('click', e => {
  const a = e.target.closest('a.wa-buy'); if(!a) return;
  try{ apartarBolsa(JSON.parse(decodeURIComponent(a.dataset.purchase || '[]'))); }catch{}
}, true);

function selectedPurchase(){
  const id=params().get('id');
  if(id){const raw=params().get('qty');const qty=raw===null?1:Number(raw);return purchaseItems([{id,q:qty}]);}
  return getCart();
}


/* Preferencias de entrega de la sesión. El horario se solicita, no se confirma. */
function deliveryData(){try{return JSON.parse(sessionStorage.getItem('mp_delivery'))||{};}catch{return {};}}
function deliveryMessage(){const d=deliveryData();return [
 'Modalidad: '+(d.method==='personal'?'entrega personal':d.method==='paqueteria'?'paquetería':'por acordar'),
 ...[['recipient','Recibe'],['city','Ciudad'],['estado','Estado'],['colonia','Colonia'],['postcode','Código postal'],['address','Dirección'],['reference','Referencias'],['schedule','Horario solicitado (pendiente de confirmar)']].filter(([k])=>d[k]&&(k!=='schedule'||d.method==='personal')).map(([k,l])=>l+': '+d[k])];}
function mountDelivery(){
 const target=document.getElementById('deliveryChoice');if(!target)return;
 target.innerHTML=`<details class="delivery-box" ${location.pathname.endsWith('checkout.html')?'open':''}><summary>Elige cómo recibir tu compra</summary><p>Opcional. Puedes acordar los detalles por WhatsApp.</p><label class="field"><span>Modalidad de entrega</span><select name="method"><option value="">Por acordar</option><option value="personal">Entrega personal</option><option value="paqueteria">Envío por paquetería</option></select></label><div class="form-grid">
 <label class="field"><span>Persona que recibe</span><input name="recipient" autocomplete="name" maxlength="100"></label>
 <label class="field"><span>Estado</span><input name="estado" autocomplete="address-level1" maxlength="100"></label>
 <label class="field"><span>Ciudad o municipio</span><input name="city" autocomplete="address-level2" maxlength="100"></label>
 <label class="field"><span>Colonia</span><input name="colonia" autocomplete="address-level3" maxlength="100"></label>
 <label class="field"><span>Código postal</span><input name="postcode" inputmode="numeric" maxlength="5" autocomplete="postal-code"></label>
 <label class="field"><span>Horario preferido (entrega personal)</span><input name="schedule" placeholder="Por ejemplo, viernes por la tarde" maxlength="120"></label>
 <label class="field full"><span>Dirección</span><input name="address" autocomplete="street-address" maxlength="220"></label>
 <label class="field full"><span>Referencias</span><input name="reference" maxlength="220"></label></div>
 <p class="purchase-note" id="deliveryExplanation"></p><div id="deliveryPersonalContact"></div></details>`;
 const data=deliveryData();target.querySelectorAll('input,select').forEach(el=>{el.value=data[el.name]||'';el.addEventListener('input',()=>{const next={};target.querySelectorAll('input,select').forEach(x=>next[x.name]=x.value.trim());try{sessionStorage.setItem('mp_delivery',JSON.stringify(next));}catch{}refreshDelivery();});});refreshDelivery();
}
function refreshDelivery(){
 document.querySelectorAll('[data-purchase]').forEach(a=>{try{a.href=purchaseURL(JSON.parse(decodeURIComponent(a.dataset.purchase)),a.dataset.receipt==='true');}catch{}});
 const esPersonal=deliveryData().method==='personal';
 const note=document.getElementById('deliveryExplanation');if(note)note.textContent=esPersonal?'Entrega personal disponible en Salamanca, Irapuato y Valle de Santiago. Se solicita 30% de anticipo por transferencia; el resto se liquida al recibir. La hora indicada es una solicitud.':'Paquetería: $149, gratis desde 3 piezas. El tiempo de llegada se confirma según destino.';
 const contacto=document.getElementById('deliveryPersonalContact');
 if(contacto)contacto.innerHTML=esPersonal?`<a class="btn btn-ghost btn-block" href="${TIENDA.whatsapp}?text=${encodeURIComponent('Hola, quiero coordinar el lugar y horario de mi entrega personal.')}" target="_blank" rel="noopener">Coordinar lugar y horario por WhatsApp</a>`:'';
 const schedule=document.querySelector('#deliveryChoice [name="schedule"]');if(schedule)schedule.disabled=deliveryData().method!=='personal';
 renderCart();
 if(typeof onDeliveryChange === 'function') onDeliveryChange();
}
