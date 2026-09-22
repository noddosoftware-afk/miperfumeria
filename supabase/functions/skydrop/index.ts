/* Conexión con Skydropx para miperfumeria.
   Vive en el servidor: la llave de Skydropx nunca viaja al navegador ni al repositorio.
   Sólo responde a una sesión del panel (rol authenticated); el público no la puede usar.

   Acciones:
     cotizar    { cp_destino, estado?, ciudad?, piezas? }  -> tarifas disponibles
     crear_guia { pedido, cp_destino, estado, ciudad, calle, nombre, telefono, rate_id, piezas? }
     rastrear   { shipment_id }

   Secretos que necesita (Supabase → Edge Functions → Secrets):
     SKYDROPX_API_KEY
     SKYDROPX_CP_ORIGEN, SKYDROPX_ESTADO_ORIGEN, SKYDROPX_CIUDAD_ORIGEN,
     SKYDROPX_CALLE_ORIGEN, SKYDROPX_NOMBRE_ORIGEN, SKYDROPX_TELEFONO_ORIGEN, SKYDROPX_EMAIL_ORIGEN
*/
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const API = "https://api.skydropx.com/v1";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

/* El JWT ya viene verificado por la plataforma; aquí sólo leemos el rol. */
function rolDe(req: Request): string {
  try {
    const raw = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    const payload = JSON.parse(atob(raw.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return String(payload.role || "");
  } catch {
    return "";
  }
}

function origen() {
  const cp = Deno.env.get("SKYDROPX_CP_ORIGEN");
  if (!cp) throw new Error("Falta la dirección de origen en los secretos (SKYDROPX_CP_ORIGEN).");
  return {
    country_code: "MX",
    postal_code: cp,
    area_level1: Deno.env.get("SKYDROPX_ESTADO_ORIGEN") || "",
    area_level2: Deno.env.get("SKYDROPX_CIUDAD_ORIGEN") || "",
    area_level3: Deno.env.get("SKYDROPX_CIUDAD_ORIGEN") || "",
    street1: Deno.env.get("SKYDROPX_CALLE_ORIGEN") || "",
    name: Deno.env.get("SKYDROPX_NOMBRE_ORIGEN") || "miperfumeria",
    phone: Deno.env.get("SKYDROPX_TELEFONO_ORIGEN") || "",
    email: Deno.env.get("SKYDROPX_EMAIL_ORIGEN") || "",
  };
}

/* Una caja por cada tres perfumes; medidas conservadoras de una caja chica. */
function paquetes(piezas = 1) {
  const cajas = Math.max(1, Math.ceil(piezas / 3));
  return Array.from({ length: cajas }, () => ({
    length: 25, width: 20, height: 15, weight: 1, // cm y kg
  }));
}

async function skydropx(path: string, init: RequestInit = {}) {
  const key = Deno.env.get("SKYDROPX_API_KEY");
  if (!key) throw new Error("Falta SKYDROPX_API_KEY en los secretos del proyecto.");
  const res = await fetch(API + path, {
    ...init,
    headers: {
      Authorization: "Token token=" + key,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const texto = await res.text();
  let cuerpo: unknown = null;
  try { cuerpo = texto ? JSON.parse(texto) : null; } catch { cuerpo = texto; }
  if (!res.ok) throw new Error("Skydropx " + res.status + ": " + texto.slice(0, 300));
  return cuerpo as Record<string, unknown>;
}

const limpio = (v: unknown, max = 120) => String(v ?? "").trim().slice(0, max);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método no permitido." }, 405);
  if (rolDe(req) !== "authenticated") return json({ error: "Sólo desde el panel de la tienda." }, 401);

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return json({ error: "Cuerpo inválido." }, 400); }
  const accion = limpio(body.accion, 20);

  try {
    if (accion === "estado") {
      // Diagnóstico: dice si ya están cargados los secretos, sin revelarlos.
      return json({
        llave: !!Deno.env.get("SKYDROPX_API_KEY"),
        origen: !!Deno.env.get("SKYDROPX_CP_ORIGEN"),
      });
    }

    if (accion === "cotizar") {
      const cp = limpio(body.cp_destino, 5);
      if (!/^\d{5}$/.test(cp)) return json({ error: "Código postal inválido." }, 400);
      const data = await skydropx("/quotations", {
        method: "POST",
        body: JSON.stringify({
          quotation: {
            address_from: origen(),
            address_to: {
              country_code: "MX",
              postal_code: cp,
              area_level1: limpio(body.estado),
              area_level2: limpio(body.ciudad),
            },
            parcels: paquetes(Number(body.piezas) || 1),
          },
        }),
      });
      const rates = (data?.included as Array<Record<string, any>> | undefined)
        ?.filter((r) => r.type === "rates")
        ?.map((r) => ({
          id: r.id,
          paqueteria: r.attributes?.provider,
          servicio: r.attributes?.service_level_name,
          dias: r.attributes?.days,
          costo: Number(r.attributes?.total_pricing ?? 0),
        }))
        ?.sort((a, b) => a.costo - b.costo) ?? [];
      return json({ tarifas: rates });
    }

    if (accion === "crear_guia") {
      const cp = limpio(body.cp_destino, 5);
      const rate = limpio(body.rate_id, 60);
      if (!/^\d{5}$/.test(cp) || !rate) return json({ error: "Falta el código postal o la tarifa elegida." }, 400);
      const data = await skydropx("/shipments", {
        method: "POST",
        body: JSON.stringify({
          shipment: {
            rate_id: rate,
            reference: limpio(body.pedido, 40),
            address_from: origen(),
            address_to: {
              country_code: "MX",
              postal_code: cp,
              area_level1: limpio(body.estado),
              area_level2: limpio(body.ciudad),
              street1: limpio(body.calle, 200),
              name: limpio(body.nombre),
              phone: limpio(body.telefono, 20),
              email: limpio(body.email),
              reference: limpio(body.referencia, 200),
            },
            parcels: paquetes(Number(body.piezas) || 1),
          },
        }),
      });
      const a = (data?.data as Record<string, any>)?.attributes ?? {};
      return json({
        shipment_id: (data?.data as Record<string, any>)?.id ?? null,
        guia: a.tracking_number ?? null,
        paqueteria: a.provider ?? null,
        etiqueta: a.label_url ?? null,
        rastreo: a.tracking_url_provider ?? null,
      });
    }

    if (accion === "rastrear") {
      const id = limpio(body.shipment_id, 60);
      if (!id) return json({ error: "Falta el envío a rastrear." }, 400);
      const data = await skydropx("/shipments/" + encodeURIComponent(id));
      const a = (data?.data as Record<string, any>)?.attributes ?? {};
      return json({ estado: a.status ?? null, guia: a.tracking_number ?? null, rastreo: a.tracking_url_provider ?? null });
    }

    return json({ error: "Acción no reconocida." }, 400);
  } catch (e) {
    return json({ error: (e as Error).message }, 502);
  }
});
