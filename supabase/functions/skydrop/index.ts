/* Conexión con Skydropx para miperfumeria.
   Vive en el servidor: las credenciales de Skydropx nunca viajan al navegador ni al repositorio.

   "cotizar" es la única acción pública: cualquier visitante del sitio puede pedir un
   precio de envío (solo lectura, no cuesta ni compromete nada). Generar guía y rastrear
   siguen siendo solo para una sesión del panel (rol authenticated) — el cliente no debe
   ver ni generar guías todavía; eso se sigue coordinando manualmente por WhatsApp hasta
   que se conecte el pago en línea (Mercado Pago).

   Acciones:
     cotizar    { cp_destino, estado, ciudad, colonia, piezas? }  -> tarifas disponibles (pública)
     crear_guia { pedido?, rate_id, nombre, telefono, email, calle, referencia? }        (solo panel)
     rastrear   { tracking_number, carrier_code }                                        (solo panel)

   Secretos que necesita (Supabase → Edge Functions → Secrets):
     SKYDROPX_CLIENT_ID, SKYDROPX_CLIENT_SECRET
     SKYDROPX_CP_ORIGEN, SKYDROPX_ESTADO_ORIGEN, SKYDROPX_CIUDAD_ORIGEN, SKYDROPX_COLONIA_ORIGEN,
     SKYDROPX_CALLE_ORIGEN, SKYDROPX_NOMBRE_ORIGEN, SKYDROPX_TELEFONO_ORIGEN, SKYDROPX_EMAIL_ORIGEN

   Skydropx Pro API (docs.skydropx.com -> pro.skydropx.com/api-docs):
     Base: https://pro.skydropx.com/api/v1
     Auth: OAuth2 client_credentials -> POST /oauth/token, Bearer token vigente 2 horas.
     Cotizar es asíncrono: POST /quotations regresa {id, is_completed:false}; hay que
     consultar GET /quotations/{id} hasta que is_completed sea true para leer las tarifas.
*/
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const API = "https://pro.skydropx.com/api/v1";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

/* El JWT de la sesión del panel ya viene verificado por la plataforma; aquí sólo leemos el rol. */
function rolDe(req: Request): string {
  try {
    const raw = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    const payload = JSON.parse(atob(raw.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return String(payload.role || "");
  } catch {
    return "";
  }
}

function origenDireccion() {
  const cp = Deno.env.get("SKYDROPX_CP_ORIGEN");
  const estado = Deno.env.get("SKYDROPX_ESTADO_ORIGEN");
  const ciudad = Deno.env.get("SKYDROPX_CIUDAD_ORIGEN");
  const colonia = Deno.env.get("SKYDROPX_COLONIA_ORIGEN");
  if (!cp || !estado || !ciudad || !colonia) {
    throw new Error(
      "Falta configurar la dirección de origen completa en los secretos " +
        "(SKYDROPX_CP_ORIGEN, SKYDROPX_ESTADO_ORIGEN, SKYDROPX_CIUDAD_ORIGEN, SKYDROPX_COLONIA_ORIGEN).",
    );
  }
  return { country_code: "MX", postal_code: cp, area_level1: estado, area_level2: ciudad, area_level3: colonia };
}

function origenContacto() {
  return {
    name: Deno.env.get("SKYDROPX_NOMBRE_ORIGEN") || "miperfumeria",
    street1: Deno.env.get("SKYDROPX_CALLE_ORIGEN") || "",
    phone: Deno.env.get("SKYDROPX_TELEFONO_ORIGEN") || "",
    email: Deno.env.get("SKYDROPX_EMAIL_ORIGEN") || "",
  };
}

/* Una sola caja por pedido; el peso sube un poco por cada 3 perfumes adicionales.
   Medidas conservadoras de una caja chica (cm) y peso en kg. */
function paquete(piezas = 1) {
  const cajas = Math.max(1, Math.ceil(Math.min(Math.max(piezas, 1), 30) / 3));
  return { weight: cajas, length: 25, width: 20, height: 15 };
}

/* Token OAuth2 cacheado en memoria mientras el isolate siga caliente; se renueva solo. */
let cachedToken: { token: string; expira: number } | null = null;

async function oauthToken(): Promise<string> {
  if (cachedToken && cachedToken.expira > Date.now() + 30_000) return cachedToken.token;
  const clientId = Deno.env.get("SKYDROPX_CLIENT_ID");
  const clientSecret = Deno.env.get("SKYDROPX_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    throw new Error("Faltan SKYDROPX_CLIENT_ID / SKYDROPX_CLIENT_SECRET en los secretos del proyecto.");
  }
  const res = await fetch(API + "/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, grant_type: "client_credentials" }),
  });
  const texto = await res.text();
  let cuerpo: Record<string, unknown> = {};
  try { cuerpo = texto ? JSON.parse(texto) : {}; } catch { /* cuerpo no era json */ }
  if (!res.ok) throw new Error("Skydropx OAuth " + res.status + ": " + texto.slice(0, 300));
  const token = String(cuerpo.access_token || "");
  const dura = Number(cuerpo.expires_in || 7200);
  if (!token) throw new Error("Skydropx no regresó un token válido.");
  cachedToken = { token, expira: Date.now() + dura * 1000 };
  return token;
}

async function skydropx(path: string, init: RequestInit = {}) {
  const token = await oauthToken();
  const res = await fetch(API + path, {
    ...init,
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json", ...(init.headers || {}) },
  });
  const texto = await res.text();
  let cuerpo: unknown = null;
  try { cuerpo = texto ? JSON.parse(texto) : null; } catch { cuerpo = texto; }
  if (!res.ok) throw new Error("Skydropx " + res.status + ": " + texto.slice(0, 300));
  return cuerpo as Record<string, unknown>;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const limpio = (v: unknown, max = 120) => String(v ?? "").trim().slice(0, max);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método no permitido." }, 405);

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return json({ error: "Cuerpo inválido." }, 400); }
  const accion = limpio(body.accion, 20);

  /* Sólo "cotizar" es pública; todo lo demás (generar guía, rastrear, diagnóstico) es del panel. */
  if (accion !== "cotizar" && rolDe(req) !== "authenticated") {
    return json({ error: "Sólo desde el panel de la tienda." }, 401);
  }

  try {
    if (accion === "estado") {
      const credenciales = !!Deno.env.get("SKYDROPX_CLIENT_ID") && !!Deno.env.get("SKYDROPX_CLIENT_SECRET");
      let conecta = false;
      let detalle: string | null = null;
      if (credenciales) {
        try { await oauthToken(); conecta = true; } catch (e) { detalle = (e as Error).message; }
      }
      let origenListo = true;
      try { origenDireccion(); } catch (e) { origenListo = false; detalle = detalle ?? (e as Error).message; }
      return json({ credenciales, origen: origenListo, conecta, detalle });
    }

    if (accion === "cotizar") {
      const cp = limpio(body.cp_destino, 5);
      const estado = limpio(body.estado, 60);
      const ciudad = limpio(body.ciudad, 60);
      const colonia = limpio(body.colonia, 60);
      if (!/^\d{5}$/.test(cp)) return json({ error: "Código postal inválido." }, 400);
      if (!estado || !ciudad || !colonia) return json({ error: "Falta estado, ciudad o colonia de destino." }, 400);

      const creada = await skydropx("/quotations", {
        method: "POST",
        body: JSON.stringify({
          quotation: {
            address_from: origenDireccion(),
            address_to: { country_code: "MX", postal_code: cp, area_level1: estado, area_level2: ciudad, area_level3: colonia },
            parcel: paquete(Number(body.piezas) || 1),
          },
        }),
      });
      const quotationId = String((creada as Record<string, any>).id || "");
      if (!quotationId) throw new Error("Skydropx no regresó un id de cotización.");

      let resultado: Record<string, any> = creada as Record<string, any>;
      for (let intento = 0; intento < 10 && !resultado.is_completed; intento++) {
        await sleep(2000);
        resultado = await skydropx("/quotations/" + encodeURIComponent(quotationId)) as Record<string, any>;
      }
      if (!resultado.is_completed) return json({ quotation_id: quotationId, tarifas: [], pendiente: true });

      const tarifas = (resultado.rates as Array<Record<string, any>> | undefined)
        ?.filter((r) => r.success)
        ?.map((r) => ({
          id: r.id,
          carrier_code: r.provider_name,
          paqueteria: r.provider_display_name || r.provider_name,
          servicio: r.provider_service_name,
          dias: r.days,
          costo: Number(r.total ?? r.amount ?? 0),
        }))
        ?.sort((a, b) => a.costo - b.costo) ?? [];
      return json({ quotation_id: quotationId, tarifas });
    }

    if (accion === "crear_guia") {
      const rate = limpio(body.rate_id, 60);
      const nombre = limpio(body.nombre, 120);
      const telefono = limpio(body.telefono, 20);
      const email = limpio(body.email, 120);
      const calle = limpio(body.calle, 200);
      if (!rate || !nombre || !telefono || !email || !calle) {
        return json({ error: "Falta la tarifa elegida o los datos del destinatario (nombre, teléfono, email, calle)." }, 400);
      }
      const data = await skydropx("/shipments", {
        method: "POST",
        body: JSON.stringify({
          shipment: {
            rate_id: rate,
            address_from: { ...origenContacto(), reference: "" },
            address_to: { name: nombre, street1: calle, phone: telefono, email, reference: limpio(body.referencia, 200) },
          },
        }),
      });
      const envio = (data?.data as Record<string, any>) ?? {};
      const paqueteEnvio = ((data?.included as Array<Record<string, any>> | undefined) ?? [])[0]?.attributes ?? {};
      return json({
        shipment_id: envio.id ?? null,
        estado: envio.attributes?.workflow_status ?? null,
        guia: paqueteEnvio.tracking_number ?? null,
        etiqueta: paqueteEnvio.label_url ?? null,
        rastreo: paqueteEnvio.tracking_url_provider ?? null,
      });
    }

    if (accion === "rastrear") {
      const guia = limpio(body.tracking_number, 60);
      const carrier = limpio(body.carrier_code, 40);
      if (!guia || !carrier) return json({ error: "Falta el número de guía o el código de paquetería." }, 400);
      const data = await skydropx(
        "/tracking?tracking_number=" + encodeURIComponent(guia) + "&carrier_code=" + encodeURIComponent(carrier),
      );
      const a = (data?.data as Record<string, any>)?.attributes ?? {};
      return json({ estado: a.tracking_status ?? null, detalle: a.status_detail ?? null, guia: a.tracking_number ?? guia });
    }

    return json({ error: "Acción no reconocida." }, 400);
  } catch (e) {
    return json({ error: (e as Error).message }, 502);
  }
});
