/* Conexión a la base de datos real (Supabase) vía REST directo, sin librería externa.
   Productos: lectura pública. Pedidos y escritura de productos: solo con sesión (panel admin). */
const SB_URL = 'https://mmwtujdojaxxtretrpju.supabase.co';
const SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1td3R1amRvamF4eHRyZXRycGp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxMDU5MDMsImV4cCI6MjEwNTY4MTkwM30.5ffkTR7zvsiLfdEH6Bogl6govMLWJtelP5RcIrnUUcQ';

function sbSession(){ try{ return JSON.parse(localStorage.getItem('mp_session')); }catch{ return null; } }
function sbSetSession(s){ try{ localStorage.setItem('mp_session', JSON.stringify(s)); }catch{} }
function sbClearSession(){ try{ localStorage.removeItem('mp_session'); }catch{} }

async function sbRequest(path, opts={}){
  const session = sbSession();
  const authed = session && session.access_token && session.expires_at > Date.now();
  const headers = Object.assign({
    apikey: SB_ANON,
    Authorization: 'Bearer ' + (authed ? session.access_token : SB_ANON),
    'Content-Type': 'application/json'
  }, opts.headers || {});
  const res = await fetch(SB_URL + path, Object.assign({}, opts, {headers}));
  if(res.status === 401 && authed) sbClearSession();
  if(!res.ok){
    const text = await res.text().catch(()=>'');
    throw new Error('Supabase ' + res.status + ': ' + text);
  }
  const text = await res.text();
  if(!text) return null;
  try{ return JSON.parse(text); }catch{ return null; }
}

const sbAuth = {
  async signIn(email, password){
    const res = await fetch(SB_URL + '/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: {apikey: SB_ANON, 'Content-Type': 'application/json'},
      body: JSON.stringify({email, password})
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data.error_description || data.msg || 'No se pudo iniciar sesión.');
    sbSetSession({access_token: data.access_token, refresh_token: data.refresh_token, expires_at: Date.now() + data.expires_in * 1000, email});
    return data;
  },
  signOut(){ sbClearSession(); },
  isAuthenticated(){
    const s = sbSession();
    return !!(s && s.access_token && s.expires_at > Date.now());
  }
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
    confirmed: r.confirmed, courier: r.courier, tracking: r.tracking, items: r.items || [], example: !!r.example
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

const sbOrders = {
  async fetchAll(){ return (await sbRequest('/rest/v1/orders?select=*&order=created_at.desc')).map(dbToOrder); },
  async upsert(order){
    await sbRequest('/rest/v1/orders?on_conflict=id', {
      method: 'POST', headers: {Prefer: 'resolution=merge-duplicates'}, body: JSON.stringify(order)
    });
  }
};
