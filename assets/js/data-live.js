/* Reemplaza el catálogo estático de data.js con el inventario real de la base de datos,
   antes de que la página termine de montarse. Si la base de datos no responde a tiempo,
   la tienda sigue funcionando con los datos estáticos como respaldo. */
async function loadLiveProducts(){
  const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000));
  try{
    const live = await Promise.race([sbProducts.fetchAll(), timeout]);
    if(Array.isArray(live) && live.length){
      PRODUCTOS.length = 0;
      PRODUCTOS.push(...live);
    }
  }catch(e){
    console.warn('No se pudo cargar el inventario en vivo, usando datos estáticos.', e);
  }
  await applyAvailability();
}

/* Descuenta del catálogo las piezas que otra persona tiene apartadas en este momento.
   Lo que esta misma sesión tiene apartado NO se descuenta: ya está en su bolsa. */
let MI_APARTADO = {expira: null, piezas: {}};
async function applyAvailability(){
  if(typeof sbReservations === 'undefined') return;
  try{
    const rows = await Promise.race([
      sbReservations.availability(),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000))
    ]);
    if(!Array.isArray(rows)) return;
    const propio = {}; let expira = null;
    rows.forEach(r => {
      const p = PRODUCTOS.find(x => x.id === r.id);
      if(p && r.disponible != null) p.stock = Number(r.disponible);
      if(r.propio){
        propio[r.id] = Number(r.propio);
        if(r.expira && (!expira || new Date(r.expira) < new Date(expira))) expira = r.expira;
      }
    });
    MI_APARTADO = {expira, piezas: propio};
  }catch(e){
    console.warn('No se pudo consultar el apartado de inventario.', e);
  }
}
