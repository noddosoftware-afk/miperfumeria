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
}
