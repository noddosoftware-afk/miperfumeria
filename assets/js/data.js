/* Catálogo del maquetado. Los 11 productos con datosDemo:false contienen
   cantidades y precios entregados por el cliente el 18 de septiembre de 2026.
   El resto conserva los datos de demostración anteriores. Imágenes generadas con IA. */
const MONEDA = n => '$' + n.toLocaleString('es-MX', {minimumFractionDigits:0});
function cardArt(p, eager=false){
  return '<img class="product-photo" src="'+p.imagen+'" alt="'+p.marca+' '+p.nombre+' — imagen ilustrativa" width="1024" height="1024" loading="'+(eager?'eager':'lazy')+'" decoding="async">';
}
function artBg(kind,id){
  const images={navy:'hero-chrome',azul:'coleccion',noche:'arabes',humo:'coleccion'};
  return '<img class="editorial-photo" src="assets/img/editorial/'+(images[kind]||kind)+'.webp" alt="" width="1536" height="1024" loading="'+(id===0?'eager':'lazy')+'" decoding="async">';
}
function artTile(kind,id){
  const images={dark:'hombre',light:'mujer',black:'arabes',mid:'disenador'};
  return '<img class="category-photo" src="assets/img/editorial/'+images[kind]+'.webp" alt="" width="1024" height="1280" loading="lazy" decoding="async">';
}

const PRODUCTOS = [
  {
    "id": "mandarin-sky",
    "marca": "Armaf",
    "nombre": "Odyssey Mandarin Sky Eau de Parfum",
    "ml": "100 ml",
    "genero": "hombre",
    "cat": "arabe",
    "familia": "Cítrico",
    "precio": 649,
    "best": 1,
    "desc": "Odyssey Mandarin Sky Eau de Parfum de Armaf, en presentación de 100 ml. Consulta nuestros precios normal, de mayoreo y de distribuidor.",
    "stock": 3,
    "datosDemo": false,
    "mayoreo": 599,
    "distribuidor": 549,
    "nuevo": 1,
    "concentracion": "Eau de Parfum",
    "imagen": "assets/img/productos/mandarin-sky.webp"
  },
  {
    "id": "hawas-malibu",
    "marca": "Rasasi",
    "nombre": "Hawas Malibú Eau de Parfum",
    "ml": "100 ml",
    "genero": "hombre",
    "cat": "arabe",
    "familia": "Fresco",
    "precio": 879,
    "best": 1,
    "nuevo": 1,
    "desc": "Hawas Malibú Eau de Parfum de Rasasi, en presentación de 100 ml. Consulta nuestros precios normal, de mayoreo y de distribuidor.",
    "stock": 5,
    "datosDemo": false,
    "mayoreo": 799,
    "distribuidor": 699,
    "concentracion": "Eau de Parfum",
    "imagen": "assets/img/productos/hawas-malibu.webp"
  },
  {
    "id": "most-wanted-intense",
    "marca": "Azzaro",
    "nombre": "The Most Wanted Intense Eau de Parfum",
    "ml": "100 ml",
    "genero": "hombre",
    "cat": "disenador",
    "familia": "Oriental",
    "precio": 1249,
    "best": 1,
    "desc": "The Most Wanted Intense Eau de Parfum de Azzaro, en presentación de 100 ml. Consulta nuestros precios normal, de mayoreo y de distribuidor.",
    "stock": 1,
    "datosDemo": false,
    "mayoreo": 1129,
    "distribuidor": 999,
    "nuevo": 1,
    "concentracion": "Eau de Parfum",
    "imagen": "assets/img/productos/most-wanted-intense.webp"
  },
  {
    "id": "hawas-chrome",
    "marca": "Rasasi",
    "nombre": "Hawas Chrome Eau de Parfum",
    "ml": "100 ml",
    "genero": "hombre",
    "cat": "arabe",
    "familia": "Por descubrir",
    "stock": 5,
    "precio": 899,
    "mayoreo": 819,
    "distribuidor": 749,
    "datosDemo": false,
    "nuevo": 1,
    "best": 0,
    "concentracion": "Eau de Parfum",
    "desc": "Hawas Chrome Eau de Parfum de Rasasi, en presentación de 100 ml. Consulta nuestros precios normal, de mayoreo y de distribuidor.",
    "imagen": "assets/img/productos/hawas-chrome.webp"
  },
  {
    "id": "hawas-kobra",
    "marca": "Rasasi",
    "nombre": "Hawas Kobra Eau de Parfum",
    "ml": "100 ml",
    "genero": "hombre",
    "cat": "arabe",
    "familia": "Por descubrir",
    "stock": 4,
    "precio": 879,
    "mayoreo": 799,
    "distribuidor": 699,
    "datosDemo": false,
    "nuevo": 1,
    "best": 0,
    "concentracion": "Eau de Parfum",
    "desc": "Hawas Kobra Eau de Parfum de Rasasi, en presentación de 100 ml. Consulta nuestros precios normal, de mayoreo y de distribuidor.",
    "imagen": "assets/img/productos/hawas-kobra.webp"
  },
  {
    "id": "dynasty",
    "marca": "Lattafa",
    "nombre": "Dynasty Eau de Parfum",
    "ml": "100 ml",
    "genero": "unisex",
    "cat": "arabe",
    "familia": "Por descubrir",
    "stock": 1,
    "precio": 629,
    "mayoreo": 579,
    "distribuidor": 519,
    "datosDemo": false,
    "nuevo": 1,
    "best": 0,
    "concentracion": "Eau de Parfum",
    "desc": "Dynasty Eau de Parfum de Lattafa, en presentación de 100 ml. Consulta nuestros precios normal, de mayoreo y de distribuidor.",
    "imagen": "assets/img/productos/dynasty.webp"
  },
  {
    "id": "fakhar-platin",
    "marca": "Lattafa",
    "nombre": "Fakhar Platin Eau de Parfum",
    "ml": "100 ml",
    "genero": "unisex",
    "cat": "arabe",
    "familia": "Por descubrir",
    "stock": 1,
    "precio": 639,
    "mayoreo": 589,
    "distribuidor": 529,
    "datosDemo": false,
    "nuevo": 1,
    "best": 0,
    "concentracion": "Eau de Parfum",
    "desc": "Fakhar Platin Eau de Parfum de Lattafa, en presentación de 100 ml. Consulta nuestros precios normal, de mayoreo y de distribuidor.",
    "imagen": "assets/img/productos/fakhar-platin.webp"
  },
  {
    "id": "dylan-blue-set",
    "marca": "Versace",
    "nombre": "Set Dylan Blue Pour Femme",
    "ml": "Set de 4 piezas",
    "genero": "mujer",
    "cat": "disenador",
    "familia": "Por descubrir",
    "stock": 1,
    "precio": 1599,
    "mayoreo": 1419,
    "distribuidor": 1349,
    "datosDemo": false,
    "nuevo": 1,
    "best": 0,
    "concentracion": "Eau de Parfum",
    "desc": "El ritual completo de Dylan Blue Pour Femme en un set de cuatro piezas. Incluye perfume de 100 ml, loción corporal de 100 ml, gel de ducha de 100 ml y perfume miniatura de 5 ml. El precio corresponde al set completo y la existencia se cuenta por set.",
    "contenido": [
      "Perfume Eau de Parfum · 100 ml",
      "Body Lotion · 100 ml",
      "Shower Gel · 100 ml",
      "Perfume Eau de Parfum · 5 ml"
    ],
    "imagen": "assets/img/productos/dylan-blue-set.webp"
  },
  {
    "id": "9pm-pour-homme",
    "marca": "Afnan",
    "nombre": "9PM Pour Homme Eau de Parfum",
    "ml": "100 ml",
    "genero": "hombre",
    "cat": "arabe",
    "familia": "Por descubrir",
    "stock": 3,
    "precio": 649,
    "mayoreo": 599,
    "distribuidor": 549,
    "datosDemo": false,
    "nuevo": 1,
    "best": 0,
    "concentracion": "Eau de Parfum",
    "desc": "9PM Pour Homme Eau de Parfum de Afnan, en presentación de 100 ml. Consulta nuestros precios normal, de mayoreo y de distribuidor.",
    "imagen": "assets/img/productos/9pm-pour-homme.webp"
  },
  {
    "id": "sublime-leather",
    "marca": "Ferragamo",
    "nombre": "Sublime Leather Eau de Parfum",
    "ml": "100 ml",
    "genero": "hombre",
    "cat": "disenador",
    "familia": "Por descubrir",
    "stock": 1,
    "precio": 1049,
    "mayoreo": 979,
    "distribuidor": 909,
    "datosDemo": false,
    "nuevo": 1,
    "best": 0,
    "concentracion": "Eau de Parfum",
    "desc": "Sublime Leather Eau de Parfum de Ferragamo, en presentación de 100 ml. Consulta nuestros precios normal, de mayoreo y de distribuidor.",
    "imagen": "assets/img/productos/sublime-leather.webp"
  },
  {
    "id": "club-de-nuit-maleka",
    "marca": "Armaf",
    "nombre": "Club de Nuit Maleka",
    "ml": "100 ml",
    "genero": "mujer",
    "cat": "arabe",
    "familia": "Por descubrir",
    "stock": 1,
    "precio": 699,
    "mayoreo": 649,
    "distribuidor": 599,
    "datosDemo": false,
    "nuevo": 1,
    "best": 0,
    "concentracion": "",
    "desc": "Club de Nuit Maleka de Armaf, en presentación de 100 ml. Consulta nuestros precios normal, de mayoreo y de distribuidor.",
    "imagen": "assets/img/productos/club-de-nuit-maleka.webp"
  },
  {
    "id": "hawas-ice",
    "marca": "Rasasi",
    "nombre": "Hawas Ice Eau de Parfum",
    "ml": "100 ml",
    "genero": "hombre",
    "cat": "arabe",
    "familia": "Fresco",
    "precio": 1290,
    "lista": 1690,
    "best": 1,
    "rating": 4.9,
    "reviews": 214,
    "notas": {
      "s": "Bergamota, manzana verde, cardamomo",
      "c": "Lavanda, jazmín, notas acuáticas",
      "f": "Ámbar gris, musgo, madera de cedro"
    },
    "desc": "El más pedido de la tienda. Una apertura helada y cítrica que se asienta en un fondo ambarado y limpio. Rinde entre 8 y 10 horas y proyecta fuerte las primeras dos.",
    "stock": null,
    "datosDemo": true,
    "imagen": "assets/img/productos/hawas-ice.webp"
  },
  {
    "id": "odyssey-mega",
    "marca": "Armaf",
    "nombre": "Odyssey Mega Eau de Parfum",
    "ml": "100 ml",
    "genero": "hombre",
    "cat": "arabe",
    "familia": "Amaderado",
    "precio": 1190,
    "lista": 1490,
    "best": 1,
    "rating": 4.7,
    "reviews": 141,
    "notas": {
      "s": "Bergamota, pimienta negra",
      "c": "Lavanda, geranio, salvia",
      "f": "Vetiver, cedro, ámbar"
    },
    "desc": "Amaderado aromático con muy buena relación precio-rendimiento. Uso diario, oficina y clima templado.",
    "stock": null,
    "datosDemo": true,
    "imagen": "assets/img/productos/odyssey-mega.webp"
  },
  {
    "id": "club-de-nuit-intense",
    "marca": "Armaf",
    "nombre": "Club de Nuit Intense Man Eau de Toilette",
    "ml": "105 ml",
    "genero": "hombre",
    "cat": "arabe",
    "familia": "Fresco",
    "precio": 1090,
    "lista": 1390,
    "rating": 4.8,
    "reviews": 410,
    "notas": {
      "s": "Piña, limón, grosella negra",
      "c": "Abedul, jazmín, rosa",
      "f": "Ámbar gris, almizcle, vainilla"
    },
    "desc": "Un clásico absoluto del segmento. Fresco frutal con fondo ahumado, potencia muy alta.",
    "stock": null,
    "datosDemo": true,
    "imagen": "assets/img/productos/club-de-nuit-intense.webp"
  },
  {
    "id": "khamrah",
    "marca": "Lattafa",
    "nombre": "Khamrah Eau de Parfum",
    "ml": "100 ml",
    "genero": "unisex",
    "cat": "arabe",
    "familia": "Dulce",
    "precio": 1250,
    "lista": 1590,
    "rating": 4.8,
    "reviews": 268,
    "notas": {
      "s": "Canela, nuez moscada, bergamota",
      "c": "Dátil, praliné, haba tonka",
      "f": "Vainilla, benjuí, mirra"
    },
    "desc": "Gourmand especiado que se volvió fenómeno. Ideal para invierno y eventos de noche.",
    "stock": null,
    "datosDemo": true,
    "imagen": "assets/img/productos/khamrah.webp"
  },
  {
    "id": "asad",
    "marca": "Lattafa",
    "nombre": "Asad Eau de Parfum",
    "ml": "100 ml",
    "genero": "hombre",
    "cat": "arabe",
    "familia": "Amaderado",
    "precio": 990,
    "lista": 1290,
    "rating": 4.6,
    "reviews": 187,
    "notas": {
      "s": "Pimienta negra, piña, bergamota",
      "c": "Café, lavanda, cardamomo",
      "f": "Vetiver, ámbar, almizcle"
    },
    "desc": "Café y madera con un toque frutal. Muy rendidor para el precio.",
    "stock": null,
    "datosDemo": true,
    "imagen": "assets/img/productos/asad.webp"
  },
  {
    "id": "yara",
    "marca": "Lattafa",
    "nombre": "Yara Eau de Parfum",
    "ml": "100 ml",
    "genero": "mujer",
    "cat": "arabe",
    "familia": "Dulce",
    "precio": 890,
    "lista": 1190,
    "nuevo": 1,
    "rating": 4.7,
    "reviews": 233,
    "notas": {
      "s": "Orquídea, heliotropo",
      "c": "Frutas tropicales, gardenia",
      "f": "Vainilla, almizcle, sándalo"
    },
    "desc": "Dulce, cremoso y muy femenino. El más vendido de la marca en México.",
    "stock": null,
    "datosDemo": true,
    "imagen": "assets/img/productos/yara.webp"
  },
  {
    "id": "hawas-for-her",
    "marca": "Rasasi",
    "nombre": "Hawas for Her Eau de Parfum",
    "ml": "100 ml",
    "genero": "mujer",
    "cat": "arabe",
    "familia": "Floral",
    "precio": 1290,
    "lista": 1590,
    "rating": 4.7,
    "reviews": 112,
    "notas": {
      "s": "Bergamota, grosella negra, mandarina",
      "c": "Jazmín, peonía, rosa",
      "f": "Almizcle, ámbar, madera"
    },
    "desc": "La contraparte femenina de Hawas: floral fresco con fondo limpio y duradero.",
    "stock": null,
    "datosDemo": true,
    "imagen": "assets/img/productos/hawas-for-her.webp"
  },
  {
    "id": "ameer-al-oudh",
    "marca": "Lattafa",
    "nombre": "Ameer Al Oudh Intense Oud",
    "ml": "100 ml",
    "genero": "unisex",
    "cat": "arabe",
    "familia": "Oriental",
    "precio": 1150,
    "rating": 4.6,
    "reviews": 88,
    "notas": {
      "s": "Azafrán, nuez moscada",
      "c": "Oud, rosa, pachulí",
      "f": "Ámbar, almizcle, madera"
    },
    "desc": "Oud clásico para quien quiere entrar al perfume árabe tradicional sin gastar de más.",
    "stock": null,
    "datosDemo": true,
    "imagen": "assets/img/productos/ameer-al-oudh.webp"
  },
  {
    "id": "bade-al-oud",
    "marca": "Lattafa",
    "nombre": "Bade'e Al Oud Sublime",
    "ml": "100 ml",
    "genero": "unisex",
    "cat": "arabe",
    "familia": "Oriental",
    "precio": 1190,
    "rating": 4.7,
    "reviews": 104,
    "notas": {
      "s": "Frutos rojos, bergamota",
      "c": "Oud, especias, rosa",
      "f": "Vainilla, ámbar, almizcle"
    },
    "desc": "Oud moderno y afrutado, mucho más llevadero que un oud tradicional.",
    "stock": null,
    "datosDemo": true,
    "imagen": "assets/img/productos/bade-al-oud.webp"
  },
  {
    "id": "sauvage-edp",
    "marca": "Dior",
    "nombre": "Sauvage Eau de Parfum",
    "ml": "100 ml",
    "genero": "hombre",
    "cat": "disenador",
    "familia": "Fresco",
    "precio": 3290,
    "lista": 3790,
    "best": 1,
    "rating": 4.9,
    "reviews": 521,
    "notas": {
      "s": "Bergamota de Calabria, pimienta de Sichuan",
      "c": "Lavanda, nuez moscada, anís estrellado",
      "f": "Ambroxan, vainilla, haba tonka"
    },
    "desc": "El más reconocido del mercado. Versátil, elegante y seguro para cualquier ocasión.",
    "stock": null,
    "datosDemo": true,
    "imagen": "assets/img/productos/sauvage-edp.webp"
  },
  {
    "id": "bleu-de-chanel",
    "marca": "Chanel",
    "nombre": "Bleu de Chanel Eau de Parfum",
    "ml": "100 ml",
    "genero": "hombre",
    "cat": "disenador",
    "familia": "Amaderado",
    "precio": 3590,
    "rating": 4.9,
    "reviews": 388,
    "notas": {
      "s": "Toronja, limón, menta",
      "c": "Jengibre, jazmín, nuez moscada",
      "f": "Incienso, cedro, sándalo"
    },
    "desc": "Amaderado aromático de manual. Formal, limpio y de proyección controlada.",
    "stock": null,
    "datosDemo": true,
    "imagen": "assets/img/productos/bleu-de-chanel.webp"
  },
  {
    "id": "eros-edt",
    "marca": "Versace",
    "nombre": "Eros Eau de Toilette",
    "ml": "100 ml",
    "genero": "hombre",
    "cat": "disenador",
    "familia": "Fresco",
    "precio": 1890,
    "lista": 2290,
    "rating": 4.8,
    "reviews": 297,
    "notas": {
      "s": "Menta, manzana verde, limón",
      "c": "Haba tonka, geranio, ámbar",
      "f": "Vainilla, vetiver, cedro"
    },
    "desc": "Menta y vainilla, uno de los más vendidos del mundo. Juvenil y de alta proyección.",
    "stock": null,
    "datosDemo": true,
    "imagen": "assets/img/productos/eros-edt.webp"
  },
  {
    "id": "y-edp",
    "marca": "Yves Saint Laurent",
    "nombre": "Y Eau de Parfum",
    "ml": "100 ml",
    "genero": "hombre",
    "cat": "disenador",
    "familia": "Amaderado",
    "precio": 2790,
    "lista": 3190,
    "rating": 4.8,
    "reviews": 203,
    "notas": {
      "s": "Bergamota, jengibre, manzana",
      "c": "Salvia, junípero, lavanda",
      "f": "Ambroxan, cedro, haba tonka"
    },
    "desc": "Fresco arriba y amaderado abajo. El favorito para oficina y día a día.",
    "stock": null,
    "datosDemo": true,
    "imagen": "assets/img/productos/y-edp.webp"
  },
  {
    "id": "one-million",
    "marca": "Paco Rabanne",
    "nombre": "1 Million Eau de Toilette",
    "ml": "100 ml",
    "genero": "hombre",
    "cat": "disenador",
    "familia": "Oriental",
    "precio": 2190,
    "lista": 2590,
    "rating": 4.7,
    "reviews": 344,
    "notas": {
      "s": "Toronja, menta, mandarina roja",
      "c": "Canela, rosa, especias",
      "f": "Cuero, madera blanca, ámbar"
    },
    "desc": "Canela y cuero. Un clásico de noche que sigue vendiendo igual que hace diez años.",
    "stock": null,
    "datosDemo": true,
    "imagen": "assets/img/productos/one-million.webp"
  },
  {
    "id": "le-male-elixir",
    "marca": "Jean Paul Gaultier",
    "nombre": "Le Male Elixir Parfum",
    "ml": "125 ml",
    "genero": "hombre",
    "cat": "disenador",
    "familia": "Dulce",
    "precio": 3190,
    "lista": 3590,
    "nuevo": 1,
    "rating": 4.9,
    "reviews": 176,
    "notas": {
      "s": "Lavanda, menta",
      "c": "Miel, haba tonka",
      "f": "Vainilla, benjuí, madera"
    },
    "desc": "La versión más dulce y concentrada de Le Male. Rendimiento muy alto en clima frío.",
    "stock": null,
    "datosDemo": true,
    "imagen": "assets/img/productos/le-male-elixir.webp"
  },
  {
    "id": "bad-boy",
    "marca": "Carolina Herrera",
    "nombre": "Bad Boy Eau de Toilette",
    "ml": "100 ml",
    "genero": "hombre",
    "cat": "disenador",
    "familia": "Amaderado",
    "precio": 2390,
    "rating": 4.7,
    "reviews": 221,
    "notas": {
      "s": "Pimienta negra, bergamota",
      "c": "Salvia, cedro",
      "f": "Cacao, haba tonka, ámbar"
    },
    "desc": "Cacao y especias en el frasco de rayo. De los más elegidos para regalo.",
    "stock": null,
    "datosDemo": true,
    "imagen": "assets/img/productos/bad-boy.webp"
  },
  {
    "id": "invictus",
    "marca": "Paco Rabanne",
    "nombre": "Invictus Eau de Toilette",
    "ml": "100 ml",
    "genero": "hombre",
    "cat": "disenador",
    "familia": "Fresco",
    "precio": 1990,
    "lista": 2390,
    "rating": 4.6,
    "reviews": 259,
    "notas": {
      "s": "Toronja, notas marinas, mandarina",
      "c": "Hoja de laurel, jazmín",
      "f": "Ámbar gris, madera de gaiac, pachulí"
    },
    "desc": "Deportivo, fresco y limpio. Excelente para clima cálido y uso diurno.",
    "stock": null,
    "datosDemo": true,
    "imagen": "assets/img/productos/invictus.webp"
  },
  {
    "id": "voyage",
    "marca": "Nautica",
    "nombre": "Voyage Eau de Toilette",
    "ml": "100 ml",
    "genero": "hombre",
    "cat": "disenador",
    "familia": "Fresco",
    "precio": 690,
    "lista": 1090,
    "oferta": 1,
    "rating": 4.5,
    "reviews": 402,
    "notas": {
      "s": "Manzana, hoja verde",
      "c": "Loto, mimosa",
      "f": "Musgo, almizcle, madera"
    },
    "desc": "El mejor precio por rendimiento del catálogo. Fresco verde para diario.",
    "stock": null,
    "datosDemo": true,
    "imagen": "assets/img/productos/voyage.webp"
  },
  {
    "id": "stronger-with-you",
    "marca": "Emporio Armani",
    "nombre": "Stronger With You Eau de Toilette",
    "ml": "100 ml",
    "genero": "hombre",
    "cat": "disenador",
    "familia": "Dulce",
    "precio": 2090,
    "rating": 4.7,
    "reviews": 188,
    "notas": {
      "s": "Cardamomo, menta, rosa pimienta",
      "c": "Salvia, lavanda, junípero",
      "f": "Vainilla, castaña, ámbar"
    },
    "desc": "Dulce equilibrado, muy bien recibido por el público joven. Ideal para cita.",
    "stock": null,
    "datosDemo": true,
    "imagen": "assets/img/productos/stronger-with-you.webp"
  },
  {
    "id": "good-girl",
    "marca": "Carolina Herrera",
    "nombre": "Good Girl Eau de Parfum",
    "ml": "80 ml",
    "genero": "mujer",
    "cat": "disenador",
    "familia": "Oriental",
    "precio": 2890,
    "lista": 3290,
    "best": 1,
    "rating": 4.9,
    "reviews": 466,
    "notas": {
      "s": "Almendra, café",
      "c": "Jazmín sambac, nardo",
      "f": "Cacao, haba tonka, sándalo"
    },
    "desc": "Café y jazmín en el icónico frasco de tacón. El más regalado de la categoría femenina.",
    "stock": null,
    "datosDemo": true,
    "imagen": "assets/img/productos/good-girl.webp"
  },
  {
    "id": "la-vie-est-belle",
    "marca": "Lancôme",
    "nombre": "La Vie Est Belle Eau de Parfum",
    "ml": "100 ml",
    "genero": "mujer",
    "cat": "disenador",
    "familia": "Dulce",
    "precio": 2990,
    "rating": 4.8,
    "reviews": 311,
    "notas": {
      "s": "Grosella negra, pera",
      "c": "Iris, jazmín, flor de azahar",
      "f": "Praliné, vainilla, pachulí"
    },
    "desc": "Gourmand floral de larga duración. Un básico del tocador.",
    "stock": null,
    "datosDemo": true,
    "imagen": "assets/img/productos/la-vie-est-belle.webp"
  },
  {
    "id": "black-opium",
    "marca": "Yves Saint Laurent",
    "nombre": "Black Opium Eau de Parfum",
    "ml": "90 ml",
    "genero": "mujer",
    "cat": "disenador",
    "familia": "Dulce",
    "precio": 2890,
    "lista": 3290,
    "rating": 4.8,
    "reviews": 357,
    "notas": {
      "s": "Pera, pimienta rosa, naranja",
      "c": "Café, jazmín sambac",
      "f": "Vainilla, pachulí, cedro"
    },
    "desc": "Café y vainilla. Nocturno, adictivo y de proyección alta.",
    "stock": null,
    "datosDemo": true,
    "imagen": "assets/img/productos/black-opium.webp"
  },
  {
    "id": "olympea",
    "marca": "Paco Rabanne",
    "nombre": "Olympéa Eau de Parfum",
    "ml": "80 ml",
    "genero": "mujer",
    "cat": "disenador",
    "familia": "Floral",
    "precio": 2290,
    "rating": 4.7,
    "reviews": 198,
    "notas": {
      "s": "Jazmín acuático, mandarina verde",
      "c": "Vainilla salada, flor de jengibre",
      "f": "Sándalo, ámbar gris, madera de cachemira"
    },
    "desc": "Vainilla salada y flores blancas. Femenino, fresco y muy duradero.",
    "stock": null,
    "datosDemo": true,
    "imagen": "assets/img/productos/olympea.webp"
  },
  {
    "id": "scandal",
    "marca": "Jean Paul Gaultier",
    "nombre": "Scandal Eau de Parfum",
    "ml": "80 ml",
    "genero": "mujer",
    "cat": "disenador",
    "familia": "Dulce",
    "precio": 2490,
    "rating": 4.7,
    "reviews": 164,
    "notas": {
      "s": "Naranja sanguina, mandarina",
      "c": "Miel, gardenia, jazmín",
      "f": "Pachulí, cera de abeja, caramelo"
    },
    "desc": "Miel y flores blancas en el frasco de cadera. Dulce sin empalagar.",
    "stock": null,
    "datosDemo": true,
    "imagen": "assets/img/productos/scandal.webp"
  },
  {
    "id": "coco-mademoiselle",
    "marca": "Chanel",
    "nombre": "Coco Mademoiselle Eau de Parfum",
    "ml": "100 ml",
    "genero": "mujer",
    "cat": "disenador",
    "familia": "Floral",
    "precio": 3690,
    "rating": 4.9,
    "reviews": 402,
    "notas": {
      "s": "Naranja, bergamota, mandarina",
      "c": "Rosa, jazmín, litchi",
      "f": "Pachulí, vetiver, vainilla"
    },
    "desc": "Elegancia sin discusión. Chipre floral que funciona todo el año.",
    "stock": null,
    "datosDemo": true,
    "imagen": "assets/img/productos/coco-mademoiselle.webp"
  },
  {
    "id": "212-vip-rose",
    "marca": "Carolina Herrera",
    "nombre": "212 VIP Rosé Eau de Parfum",
    "ml": "80 ml",
    "genero": "mujer",
    "cat": "disenador",
    "familia": "Floral",
    "precio": 2190,
    "lista": 2590,
    "rating": 4.6,
    "reviews": 207,
    "notas": {
      "s": "Champán rosado, durazno",
      "c": "Rosa, flor de azahar",
      "f": "Almizcle, madera de cachemira"
    },
    "desc": "Champaña y rosas. Festivo, ligero y muy fácil de usar.",
    "stock": null,
    "datosDemo": true,
    "imagen": "assets/img/productos/212-vip-rose.webp"
  },
  {
    "id": "bombshell",
    "marca": "Victoria's Secret",
    "nombre": "Bombshell Eau de Parfum",
    "ml": "100 ml",
    "genero": "mujer",
    "cat": "disenador",
    "familia": "Floral",
    "precio": 1490,
    "lista": 1890,
    "oferta": 1,
    "rating": 4.6,
    "reviews": 276,
    "notas": {
      "s": "Maracuyá, toronja",
      "c": "Peonía, orquídea de vainilla",
      "f": "Almizcle, madera"
    },
    "desc": "Frutal floral muy popular. Fresco, alegre y de buen rendimiento.",
    "stock": null,
    "datosDemo": true,
    "imagen": "assets/img/productos/bombshell.webp"
  }
];

/* categorías para navegación y filtros */
const CATEGORIAS = [
  {slug:"inventario", titulo:"Disponible ahora", desc:"Consulta existencias y precios normal, mayoreo y distribuidor. Encuentra tu próxima fragancia."},
  {slug:"hombre",     titulo:"Para él",            desc:"Amaderados, frescos y orientales para uso diario y de noche."},
  {slug:"mujer",      titulo:"Para ella",          desc:"Florales, dulces y orientales de las casas más buscadas."},
  {slug:"unisex",     titulo:"Unisex",             desc:"Fragancias que funcionan igual de bien para cualquiera."},
  {slug:"arabe",      titulo:"Perfumes árabes",    desc:"Rasasi, Armaf y Lattafa: alto rendimiento y precio accesible."},
  {slug:"disenador",  titulo:"Diseñador",          desc:"Dior, Chanel, Versace, YSL y más, 100% originales."},
  {slug:"best",       titulo:"Los más vendidos",   desc:"Lo que más sale de la tienda cada semana."},
  {slug:"nuevo",      titulo:"Novedades",          desc:"Últimas llegadas al inventario."},
  {slug:"oferta",     titulo:"Ofertas",            desc:"Precios especiales por tiempo limitado."},
  {slug:"favoritos",  titulo:"Mis favoritos",      desc:"Los perfumes que has guardado para volver a verlos."}
];

const FAMILIAS = ["Fresco","Amaderado","Oriental","Dulce","Floral","Cítrico"];
const MARCAS = [...new Set(PRODUCTOS.map(p=>p.marca))].sort();

/* datos del negocio — se editan en un solo lugar */
const TIENDA = {
  nombre:"miperfumeria",
  instagram:"https://www.instagram.com/miperfumeriamx",
  instagramUser:"@miperfumeriamx",
  tiktok:"https://www.tiktok.com/@miperfumeriamx",
  whatsapp:"https://wa.me/528186866622",           // WhatsApp Business confirmado por el cliente
  correo:"",                            // Correo público pendiente de confirmar
  envioGratisPiezas:3,
  mayoreoMonto:4000,
  distribuidorMonto:10000, // Solo entregas dentro de México
  paqueteria:"Skydrop",
  transferencia:{banco:"BBVA", beneficiario:"Martha Xochitl Loeza", cuenta:"012233028583280647", tipo:"CLABE"} // Confirmado por el cliente
};

/* Ediciones locales del panel de demostración; no sincroniza entre dispositivos. */
const ORIGINAL_PRODUCTS = JSON.parse(JSON.stringify(PRODUCTOS));
try {
  const edits=JSON.parse(localStorage.getItem('mp_catalog_edits')||'[]');
  if(Array.isArray(edits)) for(const p of edits){
    if(!p || !/^[a-z0-9-]+$/.test(p.id) || typeof p.nombre!=='string' || typeof p.marca!=='string' || !Number.isFinite(p.precio) || p.precio<0 || !Number.isInteger(p.stock) || p.stock<0)continue;
    const i=PRODUCTOS.findIndex(x=>x.id===p.id);
    if(i>=0) PRODUCTOS[i]={...PRODUCTOS[i],...p};else PRODUCTOS.push(p);
  }
} catch(e){}
MARCAS.splice(0,MARCAS.length,...[...new Set(PRODUCTOS.map(p=>p.marca))].sort());
