import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const materiales = [
  {
    "codigo": "MKT0035",
    "nombreProducto": "GORRAS COMBINADA C/MALLA AZUL CON COLOR BLANCO Y ESPONJA SUBLIMADO FRONTAL LOGO TUPY",
    "categoria": "Gorras y Ropa",
    "stock": 5,
    "stockMinimo": 0,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "APM00011",
    "nombreProducto": "AGENDAS 2026  21x15 CM TAPA CON ELASTICO-ESPIRAL PLASTICO",
    "categoria": "Accesorios",
    "stock": 1220,
    "stockMinimo": 122,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0030",
    "nombreProducto": "VOLANTE TAMAÑO 21.5 x 14 CM IMPRESIÓN FULL COLOR UN LADO PAPEL BOND DE 75GR",
    "categoria": "Impresos",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0040",
    "nombreProducto": "TAZA LOGO CAMPAÑA DE VALORES - RRHH",
    "categoria": "Vasos y Tazas",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "SIN CODIGO 5",
    "nombreProducto": "TOMATODO STANLEY",
    "categoria": "Vasos y Tazas",
    "stock": 89,
    "stockMinimo": 8,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "SVA00232",
    "nombreProducto": "ESMALTE SINTÉTICO CORALIT",
    "categoria": "Equipos y Material",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0037",
    "nombreProducto": "MOCHILAS TIPO ARAÑA COLOR AZUL C/SERIGRAFIA DEL LOGO TUPY",
    "categoria": "Gorras y Ropa",
    "stock": 144,
    "stockMinimo": 14,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "SIN CODIGO 7",
    "nombreProducto": "CHALECOS ROJO ELECTRO MONT.",
    "categoria": "Gorras y Ropa",
    "stock": 69,
    "stockMinimo": 6,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "REVM1808",
    "nombreProducto": "ENCHUFE CON TAPA Y ESPIGA REDONDA 10 AMP. 250V.",
    "categoria": "Equipos y Material",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "REVM0590",
    "nombreProducto": "PRECINTO PLASTICO 100 mm",
    "categoria": "Equipos y Material",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "SIN CODIGO 2",
    "nombreProducto": "BOLSAS ECOLOGICAS ROJA MONTERREY",
    "categoria": "Bolsas",
    "stock": 311,
    "stockMinimo": 31,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0049",
    "nombreProducto": "TAZAS C/ LOGO MONTERREY",
    "categoria": "Vasos y Tazas",
    "stock": 62,
    "stockMinimo": 6,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "ECYS0055",
    "nombreProducto": "TRIPODE PARA CAMARA",
    "categoria": "Equipos y Material",
    "stock": 1,
    "stockMinimo": 0,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "SIN CODIGO 8",
    "nombreProducto": "MUESTRAS ELECTRO MONTERREY 6013 2.5",
    "categoria": "Muestras y Consumibles",
    "stock": 83,
    "stockMinimo": 8,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "REVM1800",
    "nombreProducto": "CABLE CORDÓN BIPOLAR 2X12/1",
    "categoria": "Equipos y Material",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0027",
    "nombreProducto": "CHALECOS COLOR ROJO CON SERIGRAFÍA.",
    "categoria": "Gorras y Ropa",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "SIN CODIGO 1",
    "nombreProducto": "BOLSAS ECOLOGICAS BLANCA MONTERREY",
    "categoria": "Bolsas",
    "stock": 583,
    "stockMinimo": 58,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "SVA00230",
    "nombreProducto": "PROYECTOR LED SLIM 30W",
    "categoria": "Equipos y Material",
    "stock": 1,
    "stockMinimo": 0,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "PFO00021",
    "nombreProducto": "TARJETAS PERSONALES",
    "categoria": "Impresos",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "REVM1950",
    "nombreProducto": "KIT DE CILINDRO-CAMISA-PISTON Y ANILLAS",
    "categoria": "Equipos y Material",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "REVM1951",
    "nombreProducto": "BOMBA TRANSFER",
    "categoria": "Equipos y Material",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0058",
    "nombreProducto": "BANDEROLAS PUBLICITARIAS (ACTIVACIONES-FERIAS)",
    "categoria": "Impresos",
    "stock": 4,
    "stockMinimo": 0,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0025",
    "nombreProducto": "VOLANTE TAMAÑO 15X21CM IMPRESIÓN FULL COLOR ANVERSO Y REVERSO PAPEL COUCHE DE 115GR",
    "categoria": "Impresos",
    "stock": 8000,
    "stockMinimo": 800,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0043",
    "nombreProducto": "VASOS GLASS CUP",
    "categoria": "Vasos y Tazas",
    "stock": 484,
    "stockMinimo": 48,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "REVM1804",
    "nombreProducto": "CAJA ELÉCTRICA DE PLÁSTICO RECTANGULAR 10X6 CM",
    "categoria": "Equipos y Material",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0007",
    "nombreProducto": "ADHESIVO FONDO PLOMO",
    "categoria": "Muestras y Consumibles",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "SAVM0153",
    "nombreProducto": "ETIQUETA DE BLOQUEO ELECTRICO",
    "categoria": "Equipos y Material",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0021",
    "nombreProducto": "KIT DE MANTENIMIENTO",
    "categoria": "Equipos y Material",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "S/C",
    "nombreProducto": "VASOS ROJOS DE PLÁSTICO DURO",
    "categoria": "Vasos y Tazas",
    "stock": 573,
    "stockMinimo": 57,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0031",
    "nombreProducto": "VOLANTE TAMAÑO 1/2 OFICIO 21 x 15 cm IMPRESIÓN FULL COLOR EN PAPEL BOND DE 75 gr - CAPACITACION SOLDEXA",
    "categoria": "Impresos",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0029",
    "nombreProducto": "VOLANTE TAMAÑO 28X21CM IMPRESIÓN FULL COLOR ANVERSO Y REVERSO PAPEL COUCHE DE 115GR",
    "categoria": "Impresos",
    "stock": 7000,
    "stockMinimo": 700,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "SVA00231",
    "nombreProducto": "PROYECTOR LED SLIM 60W",
    "categoria": "Equipos y Material",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "ECYS0054",
    "nombreProducto": "FUNDA PARA CAMARA",
    "categoria": "Equipos y Material",
    "stock": 1,
    "stockMinimo": 0,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0028",
    "nombreProducto": "POLERA CUELLO REDONDO COLOR ROJO CON SERIGRAFÍA.",
    "categoria": "Gorras y Ropa",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0015",
    "nombreProducto": "TINTA BLACK",
    "categoria": "Muestras y Consumibles",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0011",
    "nombreProducto": "CABEZAL DE IMPRESIONES COLOR LIGHT MAGENTA & LIGHT CIAN",
    "categoria": "Muestras y Consumibles",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0059",
    "nombreProducto": "TOLDO TIPO ARAÑA  (ACTIVACIONES-FERIAS)",
    "categoria": "Equipos y Material",
    "stock": 1,
    "stockMinimo": 0,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0036",
    "nombreProducto": "POLERA CUELLO REDONDO COLOR AZUL C/IMPRESIÓN LOGO TUPY",
    "categoria": "Gorras y Ropa",
    "stock": 134,
    "stockMinimo": 13,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "ASSE0024",
    "nombreProducto": "CEMENTO ITACAMBA",
    "categoria": "Equipos y Material",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0012",
    "nombreProducto": "CABEZAL DE IMPRESIONES COLOR OPTIMIZADOR",
    "categoria": "Muestras y Consumibles",
    "stock": 1,
    "stockMinimo": 0,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "APM00005",
    "nombreProducto": "AGENDAS 25x18 CM TAPA CARTON DURO FULL COLOR 100 HOJAS ESPIRAL PLASTICO",
    "categoria": "Accesorios",
    "stock": 680,
    "stockMinimo": 68,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0057",
    "nombreProducto": "TAZAS ANIVERSARIO 37 AÑOS MONTERREY",
    "categoria": "Vasos y Tazas",
    "stock": 1409,
    "stockMinimo": 140,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "EPP00014",
    "nombreProducto": "GAFAS TRANSPARENTES",
    "categoria": "Equipos y Material",
    "stock": 1,
    "stockMinimo": 0,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0018",
    "nombreProducto": "TINTA LIGHT CIAN",
    "categoria": "Muestras y Consumibles",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0002",
    "nombreProducto": "LONA FONDO BLANCO (13 ONZAS)",
    "categoria": "Muestras y Consumibles",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0008",
    "nombreProducto": "ADHESIVO MICROPERFORADO",
    "categoria": "Muestras y Consumibles",
    "stock": 1,
    "stockMinimo": 0,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0055",
    "nombreProducto": "ALCANCÍA CHANCHITO COLOR ROJO, CON LOGO MONTERREY.",
    "categoria": "Accesorios",
    "stock": 1282,
    "stockMinimo": 128,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "ECYS0097",
    "nombreProducto": "CORREA Y TENSOR COMPATIBLE CON B4H70-67026 CON LÁTEX METÁLICO 330 LÁTEX 360 64 PULGADAS",
    "categoria": "Equipos y Material",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "SIN CODIGO 4",
    "nombreProducto": "GORRAS ROJA CON CAPUCHA MONTERREY",
    "categoria": "Gorras y Ropa",
    "stock": 1173,
    "stockMinimo": 117,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "REVM1806",
    "nombreProducto": "INTERRUPTOR BIPOLAR 10 AMP.",
    "categoria": "Equipos y Material",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0009",
    "nombreProducto": "CABEZAL DE IMPRESIONES COLOR CIAN & BLACK",
    "categoria": "Muestras y Consumibles",
    "stock": 1,
    "stockMinimo": 0,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0047",
    "nombreProducto": "VINIL INTERBACK BLANCO MATTE C/ RESPALDO NEGRO",
    "categoria": "Muestras y Consumibles",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "APM00008",
    "nombreProducto": "LLAVEROS CON ESPEJOS LEYENDA ”COMPROMISO”",
    "categoria": "Accesorios",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0033",
    "nombreProducto": "LLAVEROS DE GOMA DISEÑO MONTERREY",
    "categoria": "Accesorios",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0017",
    "nombreProducto": "TINTA LIGHT MAGENTA",
    "categoria": "Muestras y Consumibles",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "APM00003",
    "nombreProducto": "CALENDARIO DE ESCRITORIO 21x14.7 cm A COLOR",
    "categoria": "Impresos",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0010",
    "nombreProducto": "CABEZAL DE IMPRESIONES COLOR MAGENTA & YELLOW",
    "categoria": "Muestras y Consumibles",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "APM00002",
    "nombreProducto": "FOLDER T/OFICIO SUBLIMADO C/LOGO MONTERREY",
    "categoria": "Impresos",
    "stock": 400,
    "stockMinimo": 40,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0056",
    "nombreProducto": "CARTUCHO NEGRO 775ml (PLOTER LX-310)",
    "categoria": "Muestras y Consumibles",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "REVM1801",
    "nombreProducto": "INTERRUPTOR DOBLE",
    "categoria": "Equipos y Material",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0041",
    "nombreProducto": "VASOS STAINLESS STEEL CUP 12 OZ",
    "categoria": "Vasos y Tazas",
    "stock": 169,
    "stockMinimo": 16,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "SVA00004",
    "nombreProducto": "LADRILLO ADOBITO PRIMERA",
    "categoria": "Equipos y Material",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "REVM1807",
    "nombreProducto": "CABLE ENGOMADO 2X2,5MM",
    "categoria": "Equipos y Material",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0042",
    "nombreProducto": "VASOS STAINLESS STEEL CUP 16 OZ",
    "categoria": "Vasos y Tazas",
    "stock": 705,
    "stockMinimo": 70,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0013",
    "nombreProducto": "CARTUCHO DE MANTENIMIENTO",
    "categoria": "Muestras y Consumibles",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0019",
    "nombreProducto": "TINTA YELOW",
    "categoria": "Muestras y Consumibles",
    "stock": 2,
    "stockMinimo": 0,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "APM00004",
    "nombreProducto": "ALMANAQUE DE PARED 50x70 FULL COLOR",
    "categoria": "Impresos",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0006",
    "nombreProducto": "ADHESIVO BLACKOUT, FONDO NEGRO",
    "categoria": "Muestras y Consumibles",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0048",
    "nombreProducto": "CHAMARRA IMPERMEABLE/ROMPEVIENTOS  (NEGRA)",
    "categoria": "Gorras y Ropa",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "REVM0117",
    "nombreProducto": "CABLE DE 15 Mts.",
    "categoria": "Equipos y Material",
    "stock": 1,
    "stockMinimo": 0,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "APM00001",
    "nombreProducto": "REGLAS PAI 23 cm  (MTK)",
    "categoria": "Impresos",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0023",
    "nombreProducto": "ADHESIVO RAYBAN AMERICANO",
    "categoria": "Muestras y Consumibles",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "APM00010",
    "nombreProducto": "ALMANAQUE DE PARED 40x60 FULL COLOR",
    "categoria": "Impresos",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0054",
    "nombreProducto": "LLAVEROS DE PVC, COLOR AZUL IMPRESO 2 CARAS EL LOGO TUPY.",
    "categoria": "Accesorios",
    "stock": 198,
    "stockMinimo": 19,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0039",
    "nombreProducto": "LLAVERO C/LOGO CAMPAÑA DE VALORES - RRHH",
    "categoria": "Accesorios",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0051",
    "nombreProducto": "BOLÍGRAFO COLOR AZUL, CON LOGO TUPY",
    "categoria": "Accesorios",
    "stock": 267,
    "stockMinimo": 26,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0050",
    "nombreProducto": "GORRA COLOR AZUL CON LOGO TUPY, TELA KAKY",
    "categoria": "Gorras y Ropa",
    "stock": 417,
    "stockMinimo": 41,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "REVM1803",
    "nombreProducto": "TORNILLO AUTOPERFORANTE, CABEZA ARANDELA HEXAGONAL 1/4X2. 1/2 PULGADA",
    "categoria": "Equipos y Material",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0020",
    "nombreProducto": "TINTA OPTIMIZADOR",
    "categoria": "Muestras y Consumibles",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0052",
    "nombreProducto": "BOLSAS ECOLÓGICAS DE 40X30X8 AZULES CON LOGO TUPY",
    "categoria": "Bolsas",
    "stock": 28,
    "stockMinimo": 2,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "SVA00233",
    "nombreProducto": "TOMA CORRIENTES DE 3",
    "categoria": "Equipos y Material",
    "stock": 5,
    "stockMinimo": 0,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "SIN CODIGO 9",
    "nombreProducto": "MUESTRAS ELECTRO MONTERREY 6013 3.2",
    "categoria": "Muestras y Consumibles",
    "stock": 214,
    "stockMinimo": 21,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0046",
    "nombreProducto": "CARTUCHO YELLOW 775ml (PLOTER LX-310)",
    "categoria": "Muestras y Consumibles",
    "stock": 2,
    "stockMinimo": 0,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "APM00009",
    "nombreProducto": "LLAVEROS CON ESPEJOS LEYENDA ”TRABAJO EN EQUIPO ”",
    "categoria": "Accesorios",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0022",
    "nombreProducto": "LONA PINO PLASTIC FONDO BLANCO (12 ONZAS)",
    "categoria": "Muestras y Consumibles",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0014",
    "nombreProducto": "TINTA CIAN",
    "categoria": "Muestras y Consumibles",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0053",
    "nombreProducto": "BOLSAS ECOLÓGICAS PARA MOVILIDAD, COLR AZUL CON LOGO TUPY",
    "categoria": "Bolsas",
    "stock": 300,
    "stockMinimo": 30,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "REVM1802",
    "nombreProducto": "TIRAFONDO CABEZA HEXAGONAL",
    "categoria": "Equipos y Material",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0034",
    "nombreProducto": "MOCHILAS TIPO ARAÑA COLOR ROJO C/SERIGRAFIA DEL LOGO DE MONTERREY",
    "categoria": "Gorras y Ropa",
    "stock": 1000,
    "stockMinimo": 100,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "APM00006",
    "nombreProducto": "RIÑONERAS(4 DIVISIONES CON LOGO MONTERREY)",
    "categoria": "Accesorios",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0005",
    "nombreProducto": "ADHESIVO NORMAL BLANCO, MARCA ARCLAD",
    "categoria": "Muestras y Consumibles",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "PRB001",
    "nombreProducto": "Prueba material",
    "categoria": "Accesorios",
    "stock": 4,
    "stockMinimo": 2,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": "Esto es una prueba de agregar un articulo"
  },
  {
    "codigo": "APM00007",
    "nombreProducto": "NECESER DE ALGODÓN CON DETALLE DE CORCHO C/LOGO",
    "categoria": "Accesorios",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0003",
    "nombreProducto": "LONA FONDO PLOMO (11 ONZAS)",
    "categoria": "Muestras y Consumibles",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0045",
    "nombreProducto": "CARTUCHO MAGENTA 775ml (PLOTER LX-310)",
    "categoria": "Muestras y Consumibles",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "REVM1805",
    "nombreProducto": "LIJA AL AGUA PARA METAL",
    "categoria": "Equipos y Material",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0061",
    "nombreProducto": "TOMATODO C/IPRESION LOGO MONTERREY",
    "categoria": "Vasos y Tazas",
    "stock": 973,
    "stockMinimo": 97,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0026",
    "nombreProducto": "GORRO/CAPUCHA PARA SOLDADOR CON SERIGRAFÍA.",
    "categoria": "Gorras y Ropa",
    "stock": 783,
    "stockMinimo": 78,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0044",
    "nombreProducto": "VOLANTE TAMAÑO 18 x 28 cm. IMPRESIÓN FULL COLOR ANVERSO Y REVERSO PAPEL COUCHE DE 115GR (TERMOPANELES)",
    "categoria": "Impresos",
    "stock": 1133,
    "stockMinimo": 113,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0060",
    "nombreProducto": "GORRAS C/MALLA ROJAS LOGO MONTERREY",
    "categoria": "Gorras y Ropa",
    "stock": 1183,
    "stockMinimo": 118,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0016",
    "nombreProducto": "TINTA MAGENTA",
    "categoria": "Muestras y Consumibles",
    "stock": 3,
    "stockMinimo": 0,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "SIN CODIGO 3",
    "nombreProducto": "BOLSA PLASTICA MONTERREY",
    "categoria": "Bolsas",
    "stock": 8000,
    "stockMinimo": 800,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0038",
    "nombreProducto": "GORRA BLANCO CON ROJO LOGO MONTERREY",
    "categoria": "Gorras y Ropa",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "SVA00171",
    "nombreProducto": "RODILLO ESPONJA  23 CN",
    "categoria": "Equipos y Material",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0001",
    "nombreProducto": "LONA FONDO BLANCO (11 ONZAS)",
    "categoria": "Muestras y Consumibles",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "ECYS0109",
    "nombreProducto": "MICRÓFONO CON CABLE",
    "categoria": "Equipos y Material",
    "stock": 1,
    "stockMinimo": 0,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "SIN CODIGO 6",
    "nombreProducto": "MOUSE PAD",
    "categoria": "Accesorios",
    "stock": 81,
    "stockMinimo": 8,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0032",
    "nombreProducto": "BOLIGRAFOS CON SERIGRAFIA C/LOGO MONTERREY",
    "categoria": "Accesorios",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "SVA00170",
    "nombreProducto": "BROCHA 2 ½",
    "categoria": "Equipos y Material",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0004",
    "nombreProducto": "LONA FONDO PLOMO (13 ONZAS)",
    "categoria": "Muestras y Consumibles",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "MKT0024",
    "nombreProducto": "ADHESIVO ESMERILADO",
    "categoria": "Muestras y Consumibles",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "SIN CODIGO 10",
    "nombreProducto": "TAZAS BLANCA CON LOGO DE MONT.",
    "categoria": "Vasos y Tazas",
    "stock": 139,
    "stockMinimo": 13,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "APM00012",
    "nombreProducto": "CALENDARIO DE ESCRITORIO (2026)  15x16X7 cm A COLOR ESPIRAL METALICO",
    "categoria": "Impresos",
    "stock": 61,
    "stockMinimo": 6,
    "estadoExcel": "OK",
    "costo": 0.0,
    "descripcionExcel": ""
  },
  {
    "codigo": "SAVM0159",
    "nombreProducto": "DISCO ABRASIVO CORTE METAL",
    "categoria": "Equipos y Material",
    "stock": 0,
    "stockMinimo": 0,
    "estadoExcel": "Sin stock",
    "costo": 0.0,
    "descripcionExcel": ""
  }
] as const

async function main() {
  console.log("Iniciando carga del inventario actual Monterrey...")

  const admin = await prisma.usuario.findUnique({
    where: { usuario: "admin" },
  })

  if (!admin) {
    throw new Error("No existe el usuario admin. Ejecuta primero: npm.cmd run seed")
  }

  console.log("Limpiando inventario demo anterior...")

  await prisma.detalleVenta.deleteMany()
  await prisma.venta.deleteMany()
  await prisma.sesionCaja.deleteMany()
  await prisma.movimientoInventario.deleteMany()
  await prisma.detalleCompra.deleteMany()
  await prisma.compra.deleteMany()
  await prisma.producto.deleteMany()
  await prisma.categoriaProducto.deleteMany()

  const categoriasUnicas = Array.from(new Set(materiales.map((m) => m.categoria))).sort()

  const categorias = new Map<string, number>()

  for (const nombreCategoria of categoriasUnicas) {
    const categoria = await prisma.categoriaProducto.create({
      data: {
        nombreCategoria,
        descripcion: `Categoria importada desde inventario Monterrey 02-07-2026`,
        estado: "ACTIVO",
      },
    })

    categorias.set(nombreCategoria, categoria.id)
  }

  console.log(`Categorias creadas: ${categorias.size}`)

  let creados = 0
  let conStock = 0
  let sinStock = 0

  for (const material of materiales) {
    const idCategoriaProducto = categorias.get(material.categoria)

    if (!idCategoriaProducto) {
      throw new Error(`No se encontro categoria para: ${material.categoria}`)
    }

    const observacionBase = [
      material.descripcionExcel ? `Descripcion: ${material.descripcionExcel}` : "",
      material.estadoExcel ? `Estado Excel: ${material.estadoExcel}` : "",
      "Importado desde Monterrey_Inventario_02-07-2026.xlsx",
    ]
      .filter(Boolean)
      .join(" | ")

    const producto = await prisma.producto.create({
      data: {
        idCategoriaProducto,
        codigo: material.codigo,
        nombreProducto: material.nombreProducto,
        unidadMedida: "Unidad",
        ubicacion: "Almacen Marketing",
        observacion: observacionBase,
        precioVenta: 0,
        marca: "Inventario Monterrey",
        talla: "N/A",
        color: "N/A",
        costo: material.costo,
        margen: 0,
        stock: material.stock,
        stockMinimo: material.stockMinimo,
        estado: "ACTIVO",
      },
    })

    await prisma.movimientoInventario.create({
      data: {
        idProducto: producto.id,
        idUsuario: admin.id,
        tipo: material.stock > 0 ? "ENTRADA" : "AJUSTE",
        origen: "STOCK_INICIAL",
        cantidad: material.stock,
        descripcion: "Carga inicial desde inventario actual Monterrey 02-07-2026",
      },
    })

    creados++

    if (material.stock > 0) {
      conStock++
    } else {
      sinStock++
    }
  }

  console.log("Carga completada correctamente")
  console.log(`Materiales creados: ${creados}`)
  console.log(`Con stock: ${conStock}`)
  console.log(`Sin stock: ${sinStock}`)
  console.log("Usuario de acceso: admin / admin123")
}

main()
  .catch((error) => {
    console.error("Error importando inventario:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
