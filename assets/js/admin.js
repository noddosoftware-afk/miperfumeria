const $=s=>document.querySelector(s), esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* Panel instalable como app + notificaciones push cuando llega un pedido
   nuevo por transferencia. La llave pública VAPID es segura de exponer
   aquí (es la contraparte pública de la privada que solo tiene la función
   notify-orders); sirve para que el navegador cifre hacia ese par de llaves. */
const VAPID_PUBLIC_KEY = 'BGB-wFDXoE9ioFPp0-968MNWFQviWZiCsmlynHBhfd2sAGJTwxlqtPl5smUkohj0GclDuQfBvXTppHa_xll051U';
function urlBase64ToUint8Array(base64){
  const pad = '='.repeat((4 - base64.length % 4) % 4);
  const raw = atob((base64 + pad).replace(/-/g,'+').replace(/_/g,'/'));
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}
async function registrarSW(){
  if(!('serviceWorker' in navigator)) return null;
  try{ return await navigator.serviceWorker.register('sw-admin.js', {scope: '/'}); }catch{ return null; }
}
async function estadoNotificaciones(){
  if(!('serviceWorker' in navigator) || !('PushManager' in window)) return 'no-soportado';
  const reg = await navigator.serviceWorker.getRegistration('/');
  const sub = reg ? await reg.pushManager.getSubscription() : null;
  return sub ? 'activo' : 'inactivo';
}
async function activarNotificaciones(){
  const permiso = await Notification.requestPermission();
  if(permiso !== 'granted') throw new Error('Bloqueaste el permiso de notificaciones en el navegador.');
  const reg = await registrarSW();
  if(!reg) throw new Error('Este navegador no soporta notificaciones push.');
  await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) });
  const j = sub.toJSON();
  await sbAuth.request('/rest/v1/push_subscriptions?on_conflict=endpoint', {
    method: 'POST', headers: {Prefer: 'resolution=merge-duplicates'},
    body: JSON.stringify({ user_id: sbAuth.session().user_id, endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth })
  });
}
async function desactivarNotificaciones(){
  const reg = await navigator.serviceWorker.getRegistration('/');
  const sub = reg ? await reg.pushManager.getSubscription() : null;
  if(sub){
    await sbAuth.request('/rest/v1/push_subscriptions?endpoint=eq.'+encodeURIComponent(sub.endpoint), {method:'DELETE'});
    await sub.unsubscribe();
  }
}
const money=n=>MONEDA(n)+' MXN', today=new Date().toLocaleDateString('en-CA'), find=id=>PRODUCTOS.find(p=>p.id===id);
let orders=[];
let view='overview', editing=null;const total=o=>o.items.reduce((s,i)=>s+i.price*i.q,0);
function notify(t){$('#adminToast').textContent=t;$('#adminToast').classList.add('on');setTimeout(()=>$('#adminToast').classList.remove('on'),2800)}
const tag=(t,kind='')=>`<span class="tag ${kind}">${esc(t)}</span>`;
const statusOptions=['Por preparar','Programado','En camino','Entregado'];
const paymentOptions=['Pendiente','Por revisar','Confirmado','Vencido'];
const select=(name,label,opts,value)=>`<label>${label}<select name="${name}">${opts.map(x=>`<option ${x===value?'selected':''}>${esc(x)}</option>`).join('')}</select></label>`;
const input=(name,label,value='',type='text',required=false)=>`<label>${label}<input name="${name}" type="${type}" value="${esc(value)}" ${required?'required':''} ${type==='number'?'min="0" step="1"':''} maxlength="220"></label>`;
function go(v){view=v;document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===v));$('#viewTitle').textContent=({overview:'Resumen de la tienda',inventory:'Productos e inventario',orders:'Pedidos y pagos',deliveries:'Agenda de entregas',customers:'Clientes',settings:'Datos de la tienda'})[v];render()}
function table(head,rows){return `<div class="table-scroll"><table><thead><tr>${head.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`}
function orderRows(arr){return arr.map(o=>`<tr><td><b>${esc(o.id)}</b><br><span class="muted">${esc(o.channel)}</span></td><td>${esc(o.customer)}<br><span class="muted">${esc(o.city)}</span></td><td>${money(total(o))}</td><td>${tag(o.payment,o.payment==='Confirmado'?'ok':o.payment==='Vencido'?'':'warn')}</td><td>${tag(o.status)}</td><td><button class="small-button" data-order="${esc(o.id)}">Ver pedido</button></td></tr>`)}
function render(){
 const v=$('#view');const active=orders.filter(o=>o.status!=='Entregado');const paid=orders.filter(o=>o.payment==='Confirmado');const low=PRODUCTOS.filter(p=>p.stock!==null&&p.stock<=2);
 if(view==='overview'){
 const ranked={};paid.forEach(o=>o.items.forEach(i=>ranked[i.id]=(ranked[i.id]||0)+i.q));const ranks=Object.entries(ranked).sort((a,b)=>b[1]-a[1]).slice(0,5);const max=Math.max(1,...ranks.map(x=>x[1]));
 v.innerHTML=`<div class="stats"><div class="stat"><span>Productos vendidos · cobro confirmado</span><b>${money(paid.reduce((s,o)=>s+total(o),0))}</b><span>Sin costos de entrega</span></div><div class="stat"><span>Pedidos por atender</span><b>${active.length}</b><span>Preparación y entrega</span></div><div class="stat"><span>Pagos por revisar</span><b>${orders.filter(o=>o.payment==='Por revisar').length}</b><span>Transferencias pendientes de revisión</span></div><div class="stat"><span>Modelos con pocas existencias</span><b>${low.length}</b><span>2 unidades o menos</span></div></div>
 <p class="report-note">Acumulado de los pedidos cargados en esta demostración, incluidos los ejemplos. El inventario inicial no descuenta los pedidos de ejemplo.</p>
 <div class="grid-two"><section class="panel"><div class="panel-head"><h2>Próximas entregas personales</h2><button data-view="deliveries" class="small-button">Ver agenda</button></div>${deliveryRows(active.filter(o=>o.method==='personal'))}</section><section class="panel"><h2>Más vendidos</h2><p class="note">Unidades de pedidos con pago confirmado.</p>${ranks.map(([id,n])=>`<div class="bar-row"><div class="bar-label"><span>${esc(find(id)?.nombre||id)}</span><b>${n}</b></div><div class="bar-track"><div class="bar-fill" style="width:${n/max*100}%"></div></div></div>`).join('')||'<p>Aún no hay ventas confirmadas.</p>'}</section></div>
 <section class="panel"><div class="panel-head"><h2>Pedidos por atender</h2><button data-view="orders" class="small-button">Todos los pedidos</button></div>${table(['Pedido','Cliente','Productos','Pago','Entrega',''],orderRows(active))}</section>
 <section class="panel"><div class="panel-head"><h2>Conviene reponer</h2><button data-view="inventory" class="small-button">Editar inventario</button></div>${low.map(p=>`<p class="note">${esc(p.marca+' '+p.nombre)} — <b>${p.stock} ${p.contenido?'sets':'unidades'}</b></p>`).join('')||'<p>Sin alertas de inventario.</p>'}</section>`;
 }
 if(view==='inventory'){v.innerHTML=`<section class="panel"><div class="panel-head"><div><h2>Tu catálogo</h2><p class="note">${PRODUCTOS.filter(p=>p.stock!=null).length} modelos con inventario · ${PRODUCTOS.reduce((s,p)=>s+(p.stock||0),0)} unidades</p></div><button class="primary" id="addProduct">Agregar producto</button></div><div class="toolbar"><input type="search" id="productSearch" aria-label="Buscar producto" placeholder="Buscar por perfume o marca"><select id="stockFilter" aria-label="Filtrar inventario"><option value="available">Disponibles</option><option value="confirmed">Con inventario confirmado</option><option value="low">Pocas existencias</option><option value="zero">Agotados</option><option value="all">Todos, incluidos ejemplos</option></select></div><div id="inventoryTable"></div></section><section class="panel"><div class="panel-head"><div><h2>Apartados en curso</h2><p class="note">Piezas que un cliente confirmó que va a pagar. Se liberan solas a los 10 minutos si la compra no se concreta.</p></div><button class="small-button" id="refreshHolds">Actualizar</button></div><div id="holdsTable"><div class="empty">Consultando…</div></div></section>`;renderInventory();renderHolds();$('#refreshHolds').onclick=renderHolds;$('#productSearch').oninput=renderInventory;$('#stockFilter').onchange=renderInventory;$('#addProduct').onclick=()=>productEditor();}
 if(view==='orders'){v.innerHTML=`<section class="panel"><div class="panel-head"><h2>Registro de pedidos</h2></div><div class="toolbar"><input type="search" id="orderSearch" placeholder="Buscar pedido, cliente o ciudad" aria-label="Buscar pedido"><select id="paymentFilter" aria-label="Estado de pago"><option>Todos los pagos</option>${paymentOptions.map(x=>`<option>${x}</option>`).join('')}</select></div><div id="ordersTable"></div></section>`;renderOrders();$('#orderSearch').oninput=renderOrders;$('#paymentFilter').onchange=renderOrders;}
 if(view==='deliveries'){v.innerHTML=`<section class="panel"><div class="panel-head"><div><h2>Organiza cada entrega</h2><p class="note">Un horario solicitado queda pendiente hasta que lo confirmes en el pedido.</p></div></div><div class="toolbar"><label>Fecha<input type="date" id="deliveryDate" value="${today}"></label><label>Modalidad<select id="deliveryFilter"><option value="all">Todas</option><option value="personal">Entrega personal</option><option value="paqueteria">Paquetería</option></select></label><button id="allDates">Ver todas las fechas</button></div><div id="deliveryList"></div></section>`;renderDeliveries();$('#deliveryDate').onchange=renderDeliveries;$('#deliveryFilter').onchange=renderDeliveries;$('#allDates').onclick=()=>{$('#deliveryDate').value='';renderDeliveries()};}
 if(view==='customers'){const clients={};orders.forEach(o=>{const key=o.customer.trim().toLowerCase();(clients[key]??={name:o.customer,city:o.city,count:0,paid:0}).count++;if(o.payment==='Confirmado')clients[key].paid+=total(o)});v.innerHTML=`<section class="panel"><h2>Clientes de los pedidos registrados</h2><p class="note">Datos de ejemplo o capturados localmente. No se importan conversaciones de WhatsApp.</p>${table(['Cliente','Ciudad','Pedidos','Productos · cobro confirmado'],Object.values(clients).map(c=>`<tr><td>${esc(c.name)}</td><td>${esc(c.city)}</td><td>${c.count}</td><td>${money(c.paid)}</td></tr>`))}</section>`;}
 if(view==='settings'){v.innerHTML=`<section class="panel"><h2>Instalar como app y notificaciones</h2><p class="note">Instala este panel en tu celular o computadora para abrirlo como una app, con un icono propio, y recibe una notificación cada vez que llegue un pedido nuevo por transferencia — aunque el panel esté cerrado.</p><div id="notifStatus"><p class="note">Consultando…</p></div></section><section class="panel"><h2>Información confirmada</h2><dl class="settings"><div><dt>WhatsApp Business</dt><dd>81 8686 6622</dd><dt>Pago</dt><dd>Transferencia, comprobante por WhatsApp</dd><dt>Envío por paquetería</dt><dd>$149 · Gratis desde 3 piezas</dd><dt>Cuenta para transferencia</dt><dd>BBVA · Martha Xochitl Loeza</dd></div><div><dt>Dominio elegido</dt><dd>miperfumeria.com.mx<br><small class="muted">Publicado y en línea</small></dd><dt>Instagram y TikTok</dt><dd>@miperfumeriamx</dd><dt>Mayoreo</dt><dd>Desde $4,000 · Distribuidor desde $10,000 (solo México)</dd></div></dl></section><section class="panel"><h2>Pendiente de definir con el dueño</h2><p>Zonas, costos y horarios de entrega personal.</p><p class="note">La dirección de recolección y las credenciales de servicios no se incluyen en los archivos públicos.</p></section><section class="panel"><h2>Mensajes de atención</h2><p class="note">En cada pedido puedes preparar y copiar un agradecimiento, una solicitud de horario o una actualización de envío. Esta demo no envía mensajes automáticamente.</p><p class="note">El panel usa acceso con correo y contraseña, y los datos se guardan en la base de datos de la tienda, disponibles desde cualquier dispositivo.</p></section>`;renderNotifPanel();}
}
function renderInventory(){const q=$('#productSearch').value.toLowerCase(),f=$('#stockFilter').value;const arr=PRODUCTOS.filter(p=>(p.marca+' '+p.nombre).toLowerCase().includes(q)&&(f==='all'||f==='available'&&p.stock>0||f==='confirmed'&&p.stock!=null||f==='low'&&p.stock!=null&&p.stock<=2&&p.stock>0||f==='zero'&&p.stock===0));$('#inventoryTable').innerHTML=arr.length?table(['Producto','Stock','Normal','Mayoreo','Distribuidor',''],arr.map(p=>`<tr><td><div class="product-cell"><img src="${esc(p.imagen)}" alt=""><div><b>${esc(p.nombre)}</b><small>${esc(p.marca)} · ${esc(p.ml)}</small></div></div></td><td>${p.stock==null?tag('Sin confirmar'):tag(p.stock===0?'Agotado':p.stock+(p.contenido?' sets':' unidades'),p.stock<=2?'warn':'ok')}</td><td>${MONEDA(p.precio)}</td><td>${p.mayoreo?MONEDA(p.mayoreo):'—'}</td><td>${p.distribuidor?MONEDA(p.distribuidor):'—'}</td><td><button class="small-button" data-product="${p.id}">Editar</button></td></tr>`)):'<div class="empty">No hay productos con estos filtros.</div>';}
/* Apartados temporales: lo que un cliente tiene reservado en este momento. */
let HOLDS=[],HOLD_TIMER=null;
const holdClock=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
async function renderHolds(){
 const box=$('#holdsTable');if(!box)return;
 try{HOLDS=await sbReservations.adminList()||[]}catch(e){box.innerHTML='<div class="empty">No se pudieron consultar los apartados.</div>';return}
 paintHolds();clearInterval(HOLD_TIMER);
 HOLD_TIMER=setInterval(()=>{HOLDS=HOLDS.map(h=>({...h,segundos:h.segundos-1})).filter(h=>h.segundos>0);if(!$('#holdsTable'))return clearInterval(HOLD_TIMER);paintHolds()},1000);
}
function paintHolds(){
 const box=$('#holdsTable');if(!box)return;
 box.innerHTML=HOLDS.length?table(['Producto','Piezas','Tiempo restante','Cliente',''],HOLDS.map(h=>`<tr><td><b>${esc(h.nombre)}</b><br><span class="muted">${esc(h.marca)}</span></td><td>${h.qty}</td><td>${tag(holdClock(h.segundos),h.segundos<300?'warn':'ok')}</td><td><span class="muted">${esc(String(h.session_id).slice(0,14))}…</span></td><td><button class="small-button" data-hold="${esc(h.id)}">Liberar ahora</button></td></tr>`)):'<div class="empty">No hay piezas apartadas en este momento.</div>';
}
function renderOrders(){const q=$('#orderSearch').value.toLowerCase(),f=$('#paymentFilter').value;const arr=orders.filter(o=>(o.id+' '+o.customer+' '+o.city).toLowerCase().includes(q)&&(f==='Todos los pagos'||o.payment===f));$('#ordersTable').innerHTML=arr.length?table(['Pedido','Cliente','Productos','Pago','Entrega',''],orderRows(arr)):'<div class="empty">No hay pedidos con estos filtros.</div>';}
function deliveryRows(arr){return `<div class="delivery-list">${arr.map(o=>`<article class="delivery-row"><div class="delivery-time">${esc(o.date||'Sin fecha')}<br>${esc(o.confirmed||'Por confirmar')}</div><div><h3>${esc(o.customer)}</h3><p>${esc(o.city)} · ${esc(o.address||'Sin dirección')}</p><p>Recibe: ${esc(o.recipient||o.customer)}</p>${o.method==='personal'?`<p>Solicitado: ${esc(o.requested||'Sin horario')} · Repartidor: ${esc(o.courier||'Por asignar')}</p>`:`<p>Paquetería: ${esc(o.courier||'Por asignar')} · Guía: ${esc(o.tracking||'Pendiente')}</p>`}${tag(o.status)} ${o.method==='personal'?tag(o.confirmed?'Horario confirmado':'Horario pendiente',o.confirmed?'ok':'warn'):tag('Paquetería')}</div><button class="small-button" data-order="${o.id}">Coordinar</button></article>`).join('')||'<div class="empty">No hay entregas para esta selección.</div>'}</div>`;}
function renderDeliveries(){const date=$('#deliveryDate').value,f=$('#deliveryFilter').value;$('#deliveryList').innerHTML=deliveryRows(orders.filter(o=>(!date||o.date===date)&&(f==='all'||o.method===f)&&o.status!=='Entregado'));}
function modal(title,html,fn){$('#editorTitle').textContent=title;$('#editorFields').innerHTML=html;$('#formError').textContent='';$('#editorForm').onsubmit=async e=>{e.preventDefault();try{await fn(new FormData(e.target));$('#editor').close();render();notify('Cambios guardados')}catch(err){$('#formError').textContent=err.message}};$('#editor').showModal()}
const safeText=v=>String(v||'').trim().replace(/[<>"&]/g,'');
async function saveProducts(changes){for(const p of changes){await sbProducts.upsert(p);const i=PRODUCTOS.findIndex(x=>x.id===p.id);if(i<0)PRODUCTOS.push(p);else PRODUCTOS[i]=p}}
function productEditor(id){const p=find(id)||{};let image=p.imagen||'';modal(id?'Editar producto':'Agregar producto',`<div class="fields">${input('nombre','Nombre',p.nombre,'text',true)}${input('marca','Marca',p.marca,'text',true)}${input('ml','Presentación',p.ml||'100 ml','text',true)}${input('stock','Unidades disponibles',p.stock??0,'number',true)}${input('precio','Precio normal (MXN)',p.precio,'number',true)}${input('mayoreo','Precio mayoreo (MXN)',p.mayoreo,'number',true)}${input('distribuidor','Precio distribuidor (MXN)',p.distribuidor,'number',true)}${select('genero','Género',['hombre','mujer','unisex'],p.genero||'hombre')}${select('cat','Categoría',['arabe','disenador','nicho'],p.cat||'arabe')}<label>Fotografía (PNG, JPG o WebP, hasta 1 MB)<input type="file" id="productImage" accept="image/png,image/jpeg,image/webp"></label><label class="full">Descripción<textarea name="desc" rows="3">${esc(p.desc||'')}</textarea></label><label class="full" style="display:flex;flex-direction:row;align-items:center;gap:9px"><input type="checkbox" name="best" style="width:auto" ${p.best?'checked':''}> Mostrar en "Más vendidos" (inicio y catálogo)</label><label class="full" style="display:flex;flex-direction:row;align-items:center;gap:9px"><input type="checkbox" name="nuevo" style="width:auto" ${p.nuevo?'checked':''}> Mostrar en "Novedades"</label></div><p class="note">${p.contenido?'El set se cuenta como una unidad de inventario.':''} Las ediciones se reflejan en la tienda en cuanto se recargue la página.</p><img class="image-preview" id="imagePreview" ${image?'src="'+esc(image)+'"':'hidden'} alt="Vista previa">`,async f=>{
 if($('#productImage').files[0]&&!image)throw Error('Espera a que cargue la imagen.');if(!image)throw Error('Agrega una fotografía del producto.');const prices=['precio','mayoreo','distribuidor'].map(k=>Number(f.get(k)));const stock=Number(f.get('stock'));if(!Number.isInteger(stock)||stock<0||prices.some(n=>!Number.isFinite(n)||n<=0))throw Error('Revisa los precios y las existencias.');
 await saveProducts([{...p,id:id||'producto-'+Date.now(),nombre:safeText(f.get('nombre')),marca:safeText(f.get('marca')),ml:safeText(f.get('ml')),stock,precio:prices[0],mayoreo:prices[1],distribuidor:prices[2],genero:f.get('genero'),cat:f.get('cat'),desc:safeText(f.get('desc')),familia:p.familia||'Por descubrir',imagen:image,best:f.get('best')==='on'?1:0,nuevo:f.get('nuevo')==='on'?1:0,datosDemo:false}]);});
 $('#productImage').onchange=async e=>{const file=e.target.files[0];if(!file)return;if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>1048576){$('#formError').textContent='Usa PNG, JPG o WebP de hasta 1 MB.';e.target.value='';return;}image='';$('#imagePreview').src=URL.createObjectURL(file);$('#imagePreview').hidden=false;$('#formError').textContent='Subiendo fotografía…';try{image=await sbStorage.uploadProductImage(file,id);$('#formError').textContent='';}catch(err){$('#formError').textContent=err.message;e.target.value='';$('#imagePreview').hidden=true;}};
}
function registerOrder(){const products=PRODUCTOS.filter(p=>p.stock>0);modal('Registrar pedido',`<p class="note">Registra ventas de WhatsApp, Instagram o presenciales. Al guardar se descontarán las unidades seleccionadas del inventario.</p><div class="fields">${input('customer','Cliente','','text',true)}${input('recipient','Persona que recibe','','text',true)}${input('city','Ciudad','','text',true)}${select('channel','Canal',['WhatsApp','Instagram','Presencial'],'WhatsApp')}${select('method','Entrega',['personal','paqueteria'],'personal')}${select('payment','Pago',paymentOptions,'Pendiente')}${input('date','Fecha solicitada',today,'date')}${input('requested','Horario solicitado')}<label class="full">Dirección<input name="address" maxlength="220"></label><label class="full">Referencias<input name="reference" maxlength="220"></label></div><h3>Productos</h3><div id="orderLines"></div><button type="button" id="addLine" class="small-button">Agregar otro perfume</button>`,async f=>{
 const grouped={};document.querySelectorAll('.order-line').forEach(row=>{const id=row.querySelector('select').value,q=Number(row.querySelector('input').value);if(!id||!Number.isInteger(q)||q<1)throw Error('Revisa los productos y cantidades.');grouped[id]=(grouped[id]||0)+q});const lines=Object.entries(grouped).map(([id,q])=>{const p=find(id);if(!p||q>p.stock)throw Error('Existencia insuficiente para '+(p?.nombre||id));return {id,q,price:p.precio}});if(!lines.length)throw Error('Agrega al menos un perfume.');if(lines.reduce((s,i)=>s+i.price*i.q,0)>=TIENDA.mayoreoMonto)lines.forEach(i=>i.price=find(i.id).mayoreo||i.price);
 const o={id:'LOCAL-'+Date.now().toString().slice(-8),items:lines,status:'Por preparar',confirmed:'',courier:'',tracking:'',example:false};for(const key of ['customer','recipient','city','channel','method','payment','date','requested','address','reference'])o[key]=safeText(f.get(key));
 const originals=lines.map(i=>({...find(i.id)}));try{await saveProducts(lines.map(i=>({...find(i.id),stock:find(i.id).stock-i.q})));await sbOrders.upsert(o);orders.unshift(o)}catch(err){originals.forEach(p=>{const idx=PRODUCTOS.findIndex(x=>x.id===p.id);if(idx>-1)PRODUCTOS[idx]=p});throw Error('No se pudo guardar en la base de datos. Intenta de nuevo.');}
 });function addLine(){const el=document.createElement('div');el.className='fields order-line';el.style.marginBottom='12px';el.innerHTML=`<label>Perfume<select>${products.map(p=>`<option value="${p.id}">${esc(p.nombre)} · ${p.stock} disponibles</option>`).join('')}</select></label><label>Cantidad<input type="number" min="1" step="1" required value="1"></label>`;$('#orderLines').append(el)}$('#addLine').onclick=addLine;addLine();}
function orderMessage(o){return ['Gracias por tu compra en miperfumeria.',`Pedido: ${o.id}`,...o.items.map(i=>`${i.q} × ${find(i.id)?.nombre||i.id} — ${money(i.q*i.price)}`),`Subtotal de productos: ${money(total(o))}`,`Estado del pago: ${o.payment}.`,o.method==='personal'?`Entrega personal. ${o.confirmed?'Horario confirmado: '+o.date+' '+o.confirmed:'Horario solicitado: '+(o.requested||'por acordar')+'. Pendiente de confirmación.'}`:`Envío por paquetería. ${o.tracking?'Guía: '+o.tracking:'Guía pendiente de generar.'}`,`Recibe: ${o.recipient||o.customer}. Dirección: ${o.address||'por confirmar'}, ${o.city}.`,'Costo de entrega y tiempo de llegada: consulta la confirmación del pedido.'].join('\n')}
function orderEditor(id){const o=orders.find(x=>x.id===id);modal('Pedido '+o.id,`<p><b>${esc(o.customer)}</b> · ${esc(o.channel)}</p><p class="note">${o.items.map(i=>esc(i.q+' × '+(find(i.id)?.nombre||i.id))).join('<br>')}<br>Productos: ${money(total(o))}</p>${o.comprobante_path?'<p><button type="button" id="verComprobante" class="btn btn-ghost">Ver comprobante de transferencia</button></p>':'<p class="note">El cliente todavía no sube comprobante desde su cuenta.</p>'}<div class="fields">${select('payment','Estado del pago',paymentOptions,o.payment)}${select('status','Estado de entrega',statusOptions,o.status)}${select('method','Modalidad',['personal','paqueteria'],o.method)}${input('recipient','Persona que recibe',o.recipient)}${input('city','Ciudad',o.city)}${input('date','Fecha de entrega',o.date,'date')}${input('requested','Horario solicitado',o.requested)}${input('confirmed','Horario confirmado',o.confirmed)}${input('courier','Repartidor o paquetería',o.courier)}${input('tracking','Guía (paquetería)',o.tracking)}<label class="full">Dirección<input name="address" value="${esc(o.address)}" maxlength="220"></label><label class="full">Referencias<input name="reference" value="${esc(o.reference)}" maxlength="220"></label></div><h3>Mensaje para el cliente</h3><p class="note">Guarda los cambios antes de copiar la actualización. No se envía automáticamente.</p><pre class="preview-message" id="messagePreview"></pre><button type="button" id="copyMessage">Copiar mensaje</button>`,async f=>{const next={...o};for(const key of ['payment','status','method','recipient','city','date','requested','confirmed','courier','tracking','address','reference'])next[key]=safeText(f.get(key));if(next.method==='personal'&&next.status==='Programado'&&(!next.confirmed||!next.date||!next.courier))throw Error('Para programar una entrega personal, confirma fecha, horario y repartidor.');
 if(next.payment==='Confirmado'&&o.payment!=='Confirmado'){
  const cambios=o.items.filter(i=>find(i.id)&&find(i.id).stock!=null).map(i=>({...find(i.id),stock:Math.max(0,find(i.id).stock-i.q)}));
  if(cambios.length){const originales=cambios.map(p=>({...find(p.id)}));try{await saveProducts(cambios);}catch(err){originales.forEach(p=>{const idx=PRODUCTOS.findIndex(x=>x.id===p.id);if(idx>-1)PRODUCTOS[idx]=p});throw Error('No se pudo descontar el inventario. Intenta de nuevo.');}}
 }
 await sbOrders.upsert(next);orders=orders.map(x=>x.id===id?next:x);});$('#messagePreview').textContent=orderMessage(o);$('#copyMessage').onclick=async()=>{try{await navigator.clipboard.writeText(orderMessage(o));notify('Mensaje copiado')}catch{notify('Selecciona el texto del mensaje para copiarlo')}};if(o.comprobante_path)$('#verComprobante').onclick=async()=>{try{window.open(await sbComprobantes.verComoAdmin(o.comprobante_path),'_blank')}catch{notify('No se pudo abrir el comprobante.')}};}
$('#today').textContent=new Date().toLocaleDateString('es-MX',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
document.addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(b)go(b.dataset.view);const p=e.target.closest('[data-product]');if(p)productEditor(p.dataset.product);const o=e.target.closest('[data-order]');if(o)orderEditor(o.dataset.order);const h=e.target.closest('[data-hold]');if(h){h.disabled=true;sbReservations.adminRelease(h.dataset.hold).then(()=>{notify('Apartado liberado; la pieza vuelve al catálogo.');renderHolds()}).catch(()=>{h.disabled=false;notify('No se pudo liberar el apartado.')})}});
$('#newOrder').onclick=registerOrder;$('#closeEditor').onclick=$('#cancelEditor').onclick=()=>$('#editor').close();
$('#logoutBtn').onclick=()=>{sbAuth.signOut();location.href='login.html'};
(async function boot(){
 if(!sbAuth.isAuthenticated()){location.href='login.html';return}
 if(!(await sbAuth.isAdmin())){sbAuth.signOut();location.href='login.html';return}
 try{
  const [liveProducts,liveOrders]=await Promise.all([sbProducts.fetchAll(),sbOrders.fetchAll()]);
  if(liveProducts.length){PRODUCTOS.length=0;PRODUCTOS.push(...liveProducts)}
  orders=liveOrders;
 }catch(e){notify('No se pudo conectar con la base de datos. Revisa tu conexión.')}
 registrarSW();
 const vistaPedida = new URLSearchParams(location.search).get('view');
 go(['overview','inventory','orders','deliveries','customers','settings'].includes(vistaPedida) ? vistaPedida : 'overview');
})();

/* Instalar como app: Chrome/Android ofrecen este evento para disparar el
   diálogo de instalación con un botón propio; en iPhone no existe, ahí se
   instala manualmente desde Safari (instrucciones en renderNotifPanel). */
let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredInstallPrompt = e;
  if(view === 'settings') renderNotifPanel();
});
async function renderNotifPanel(){
  const box = $('#notifStatus'); if(!box) return;
  const estado = await estadoNotificaciones();
  const esIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  let html = '';
  html += standalone
    ? '<p class="note">✓ Ya está instalado como app en este dispositivo.</p>'
    : `<p class="note"><b>1. Instala el panel:</b> ${esIOS
        ? 'en Safari, toca el botón de compartir (el cuadro con la flecha hacia arriba) y elige "Agregar a inicio".'
        : deferredInstallPrompt
          ? '<button class="small-button" id="btnInstalar" type="button">Instalar app</button>'
          : 'abre el menú del navegador (⋮) y elige "Instalar app" o "Agregar a la pantalla de inicio".'}</p>`;
  if(estado === 'no-soportado'){
    html += `<p class="note">Este navegador no soporta notificaciones push${esIOS && !standalone ? '; en iPhone, primero instala el panel (paso 1) y ábrelo desde el icono de inicio — recién ahí se puede activar' : ''}.</p>`;
  } else if(estado === 'activo'){
    html += '<p class="note">✓ Notificaciones activas en este dispositivo.</p><button class="small-button" id="btnNotifOff" type="button">Desactivar</button>';
  } else {
    html += '<p class="note"><b>2. Activa las notificaciones</b> para enterarte al instante de cada pedido nuevo por transferencia.</p><button class="primary small-button" id="btnNotifOn" type="button">Activar notificaciones</button>';
  }
  box.innerHTML = html;
  $('#btnInstalar')?.addEventListener('click', async () => {
    if(!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    renderNotifPanel();
  });
  $('#btnNotifOn')?.addEventListener('click', async e => {
    e.target.disabled = true; e.target.textContent = 'Activando…';
    try{ await activarNotificaciones(); notify('Notificaciones activadas.'); }
    catch(err){ notify(err.message || 'No se pudo activar.'); }
    renderNotifPanel();
  });
  $('#btnNotifOff')?.addEventListener('click', async () => {
    try{ await desactivarNotificaciones(); notify('Notificaciones desactivadas.'); }catch{}
    renderNotifPanel();
  });
}
