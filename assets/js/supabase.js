/* Conexión a la base de datos real (Supabase) vía REST directo, sin librería externa.
   Productos: lectura pública. Pedidos y escritura de productos: solo con sesión (panel admin). */
const SB_URL = 'https://mmwtujdojaxxtretrpju.supabase.co';
const SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1td3R1amRvamF4eHRyZXRycGp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxMDU5MDMsImV4cCI6MjEwNTY4MTkwM30.5ffkTR7zvsiLfdEH6Bogl6govMLWJtelP5RcIrnUUcQ';

/* Admin (panel de la tienda) y cliente (cuenta.html) son dos sesiones
   independientes en el mismo navegador, cada una en su propia llave de
   localStorage — así Damián puede probar el sitio como cliente sin perder
   su sesión de administrador, y viceversa. */
function crearSesion(storageKey){
  const session = () => { try{ return JSON.parse(localStorage.getItem(storageKey)); }catch{ return null; } };
  const setSession = s => { try{ localStorage.setItem(storageKey, JSON.stringify(s)); }catch{} };
  const clearSession = () => { try{ localStorage.removeItem(storageKey); }catch{} };
  return {
    session, setSession, clearSession,
    isAuthenticated(){ const s = session(); return !!(s && s.access_token && s.expires_at > Date.now()); },
    signOut(){ clearSession(); },
    async signIn(email, password){
      const res = await fetch(SB_URL + '/auth/v1/token?grant_type=password', {
        method: 'POST', headers: {apikey: SB_ANON, 'Content-Type': 'application/json'},
        body: JSON.stringify({email, password})
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data.error_description || data.msg || 'No se pudo iniciar sesión.');
      setSession({access_token: data.access_token, refresh_token: data.refresh_token, expires_at: Date.now() + data.expires_in * 1000, email, user_id: data.user?.id, nombre: data.user?.user_metadata?.nombre});
      return data;
    },
    async signUp(email, password, datos={}){
      const res = await fetch(SB_URL + '/auth/v1/signup', {
        method: 'POST', headers: {apikey: SB_ANON, 'Content-Type': 'application/json'},
        body: JSON.stringify({email, password, data: datos})
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data.error_description || data.msg || 'No se pudo crear la cuenta.');
      if(data.access_token){
        setSession({access_token: data.access_token, refresh_token: data.refresh_token, expires_at: Date.now() + data.expires_in * 1000, email, user_id: data.user?.id, nombre: datos.nombre});
      }
      return data;
    },
    async request(path, opts={}){
      const s = session();
      const authed = s && s.access_token && s.expires_at > Date.now();
      const headers = Object.assign({
        apikey: SB_ANON,
        Authorization: 'Bearer ' + (authed ? s.access_token : SB_ANON),
        'Content-Type': 'application/json'
      }, opts.headers || {});
      const res = await fetch(SB_URL + path, Object.assign({}, opts, {headers}));
      if(res.status === 401 && authed) clearSession();
      if(!res.ok){
        const text = await res.text().catch(()=>'');
        throw new Error('Supabase ' + res.status + ': ' + text);
      }
      const text = await res.text();
      if(!text) return null;
      try{ return JSON.parse(text); }catch{ return null; }
    }
  };
}

const sbAuth = crearSesion('mp_session'); // panel admin
async function sbRequest(path, opts={}){ return sbAuth.request(path, opts); }

const sbCustomerAuth = crearSesion('mp_customer_session'); // cuenta del cliente
sbCustomerAuth.signUpCliente = async function({nombre, email, password}){
  return sbCustomerAuth.signUp(email, password, {nombre});
};

function dbToProduct(r){
  return {
    id: r.id, marca: r.marca, nombre: r.nombre, ml: r.ml, genero: r.genero, cat: r.cat, familia: r.familia,
    precio: Number(r.precio), mayoreo: r.mayoreo == null ? undefined : Number(r.mayoreo),
    distribuidor: r.distribuidor == null ? undefined : Number(r.distribuidor),
    stock: r.stock == null ? null : Number(r.stock), contenido: r.contenido || undefined,
    imagen: r.imagen, desc: r.descripcion, best: r.best || 0, nuevo: r.nuevo || 0,
    concentracion: r.concentracion || undefined, datosDemo: !!r.datos_demo
  };
}
function productToDb(p){
  return {
    id: p.id, marca: p.marca, nombre: p.nombre, ml: p.ml, genero: p.genero, cat: p.cat, familia: p.familia,
    precio: p.precio, mayoreo: p.mayoreo ?? null, distribuidor: p.distribuidor ?? null,
    stock: p.stock ?? null, contenido: p.contenido || null, imagen: p.imagen, descripcion: p.desc || '',
    best: p.best || 0, nuevo: p.nuevo || 0, concentracion: p.concentracion || null, datos_demo: !!p.datosDemo
  };
}
function dbToOrder(r){
  return {
    id: r.id, customer: r.customer, recipient: r.recipient, city: r.city, address: r.address, reference: r.reference,
    channel: r.channel, method: r.method, payment: r.payment, status: r.status, date: r.date, requested: r.requested,
    confirmed: r.confirmed, courier: r.courier, tracking: r.tracking, items: r.items || [], example: !!r.example,
    customer_user_id: r.customer_user_id || null
  };
}

const sbProducts = {
  async fetchAll(){ return (await sbRequest('/rest/v1/products?select=*&order=marca.asc')).map(dbToProduct); },
  async upsert(product){
    await sbRequest('/rest/v1/products?on_conflict=id', {
      method: 'POST', headers: {Prefer: 'resolution=merge-duplicates'}, body: JSON.stringify(productToDb(product))
    });
  }
};

/* Fotografías de producto: se suben al almacenamiento de Supabase (bucket público "productos")
   y en la base sólo se guarda la URL, no la imagen completa. */
const sbStorage = {
  async uploadProductImage(file, productId){
    const session = sbAuth.session();
    if(!(session && session.access_token && session.expires_at > Date.now())) throw new Error('Inicia sesión para subir fotografías.');
    const ext = ({'image/png':'png','image/jpeg':'jpg','image/webp':'webp'})[file.type];
    if(!ext) throw new Error('Usa PNG, JPG o WebP.');
    const path = (productId || 'producto-' + Date.now()) + '-' + Date.now() + '.' + ext;
    const res = await fetch(SB_URL + '/storage/v1/object/productos/' + path, {
      method: 'POST',
      headers: {apikey: SB_ANON, Authorization: 'Bearer ' + session.access_token, 'Content-Type': file.type, 'x-upsert': 'true'},
      body: file
    });
    if(!res.ok) throw new Error('No se pudo subir la fotografía: ' + (await res.text().catch(()=>res.status)));
    return SB_URL + '/storage/v1/object/public/productos/' + path;
  }
};

/* Apartado temporal de inventario. Cuando alguien confirma que va a pagar
   (checkout final), sus piezas quedan reservadas 10 minutos en la base;
   si no concreta, se liberan solas. Mientras solo esté explorando o
   agregando productos, no se aparta nada ni corre la cuenta regresiva.
   La tabla no se toca directamente: todo pasa por funciones del servidor. */
const APARTADO_MINUTOS = 10;
const sbReservations = {
  sessionId(){
    let s = null;
    try{ s = localStorage.getItem('mp_reserva_sesion'); }catch{}
    if(!s || s.length < 8){
      s = 'mp-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12);
      try{ localStorage.setItem('mp_reserva_sesion', s); }catch{}
    }
    return s;
  },
  async availability(){
    return await sbRequest('/rest/v1/rpc/availability', {
      method: 'POST', body: JSON.stringify({p_session: this.sessionId()})
    });
  },
  async reserve(items){
    const clean = (items || [])
      .filter(i => i && i.id && Number.isInteger(i.q) && i.q > 0)
      .map(i => ({id: i.id, q: Math.min(i.q, 10)}))
      .slice(0, 20);
    if(!clean.length) return null;
    return await sbRequest('/rest/v1/rpc/reserve_items', {
      method: 'POST',
      body: JSON.stringify({p_session: this.sessionId(), p_items: clean, p_minutes: APARTADO_MINUTOS})
    });
  },
  async release(){
    return await sbRequest('/rest/v1/rpc/release_reservation', {
      method: 'POST', body: JSON.stringify({p_session: this.sessionId()})
    });
  },
  /* Panel del dueño: ver y liberar apartados a mano. Requiere sesión. */
  async adminList(){ return await sbRequest('/rest/v1/rpc/admin_reservations', {method: 'POST', body: '{}'}); },
  async adminRelease(id){ return await sbRequest('/rest/v1/rpc/admin_release', {method: 'POST', body: JSON.stringify({p_id: id})}); }
};

/* Cotización real de envío (Skydropx). Pública: cualquier visitante puede pedir precio.
   Generar guía y rastrear siguen siendo solo del panel admin, aquí no se exponen. */
const sbSkydrop = {
  async cotizar({cp_destino, estado, ciudad, colonia, piezas}){
    return await sbRequest('/functions/v1/skydrop', {
      method: 'POST',
      body: JSON.stringify({accion: 'cotizar', cp_destino, estado, ciudad, colonia, piezas})
    });
  }
};

const sbOrders = {
  async fetchAll(){ return (await sbRequest('/rest/v1/orders?select=*&order=created_at.desc')).map(dbToOrder); },
  async upsert(order){
    await sbRequest('/rest/v1/orders?on_conflict=id', {
      method: 'POST', headers: {Prefer: 'resolution=merge-duplicates'}, body: JSON.stringify(order)
    });
  }
};

/* Pedidos propios del cliente (cuenta.html): solo puede crear y leer los suyos,
   nunca editarlos — el estado, pago y guía los controla Damián desde el panel. */
const sbCustomerOrders = {
  async create(order){
    const s = sbCustomerAuth.session();
    if(!(s && s.access_token && s.expires_at > Date.now())) throw new Error('Inicia sesión para registrar tu pedido.');
    const conId = {...order, customer_user_id: s.user_id};
    await sbCustomerAuth.request('/rest/v1/orders', {
      method: 'POST', headers: {Prefer: 'return=minimal'}, body: JSON.stringify(conId)
    });
    return conId.id;
  },
  async mine(){
    return (await sbCustomerAuth.request('/rest/v1/orders?select=*&order=created_at.desc')).map(dbToOrder);
  }
};
