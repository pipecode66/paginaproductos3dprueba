const ringSizes = ['Talla 5', 'Talla 6', 'Talla 7', 'Talla 8', 'Talla 9', 'Talla personalizada'];
const braceletSizes = ['15 cm', '16 cm', '17 cm', '18 cm', '19 cm', '20 cm', 'Medida personalizada'];
const earringSizes = ['Pequeñas', 'Medianas', 'Grandes', 'Ajuste especial'];
const charmSizes = ['Mini', 'Pequeño', 'Mediano', 'Argolla reforzada', 'Medida personalizada'];
const wristSizes = ['14 cm', '15 cm', '16 cm', '17 cm', '18 cm', '19 cm', 'Medida personalizada'];

const groups = [
  {
    id: 'anillo-rubi-aurora', name: 'Anillo Rubí Aurora', category: 'anillos', price: 1120000, stock: 3,
    measurements: ringSizes, imageNumbers: [1, 2, 3, 4], gemstone: 'Cristal rojo tipo rubí',
    description: 'Anillo en oro 18K con cristales rojos tipo rubí en corte rectangular. Una pieza luminosa, femenina y fácil de combinar.',
  },
  {
    id: 'anillo-corona-amatista', name: 'Anillo Corona Amatista', category: 'anillos', price: 1480000, stock: 2,
    measurements: ringSizes, imageNumbers: [9, 10, 11, 12], gemstone: 'Piedra morada tipo amatista',
    description: 'Anillo en oro 18K con diseño tipo corona, acentos brillantes y piedra central morada para una presencia elegante.',
  },
  {
    id: 'anillo-filigrana-celestial', name: 'Anillo Filigrana Celestial', category: 'anillos', price: 1250000, stock: 1,
    measurements: ringSizes, imageNumbers: [17, 18, 19, 20], gemstone: 'Cristales decorativos',
    description: 'Anillo en oro 18K con volumen ornamental y detalles de filigrana, pensado para quienes prefieren una joya con carácter.',
  },
  {
    id: 'brazalete-placa-dorada', name: 'Brazalete Placa Dorada', category: 'brazaletes', price: 1320000, stock: 4,
    measurements: braceletSizes, imageNumbers: [1, 2, 3, 4], gemstone: 'Sin piedra principal',
    description: 'Brazalete rígido en oro 18K con placa decorativa central y silueta limpia para uso diario o regalo especial.',
  },
  {
    id: 'brazalete-lazo-diamantado', name: 'Brazalete Lazo Diamantado', category: 'brazaletes', price: 1180000, stock: 2,
    measurements: braceletSizes, imageNumbers: [9, 10, 11, 12], gemstone: 'Cristales decorativos',
    description: 'Brazalete con terminales tipo lazo y textura diamantada, ideal para una pieza delicada con brillo sutil.',
  },
  {
    id: 'brazalete-greca-serena', name: 'Brazalete Greca Serena', category: 'brazaletes', price: 1090000, stock: 0,
    measurements: braceletSizes, imageNumbers: [17, 18, 19, 20], gemstone: 'Sin piedra principal',
    description: 'Brazalete abierto con motivo geométrico central, acabado sobrio y estructura cómoda para uso frecuente.',
  },
  {
    id: 'brazalete-amuletos-esmeralda', name: 'Brazalete Amuletos Esmeralda', category: 'brazaletes', price: 1580000, stock: 1,
    measurements: braceletSizes, imageNumbers: [25, 26, 27, 28], gemstone: 'Acentos verdes tipo esmeralda',
    description: 'Brazalete en oro 18K con dijes colgantes y detalles verdes tipo esmeralda para una composición llamativa.',
  },
  {
    id: 'candongas-brillo-clasico', name: 'Candongas Brillo Clásico', category: 'candongas', price: 680000, stock: 6,
    measurements: earringSizes, imageNumbers: [1, 2, 3, 4], gemstone: 'Cristales decorativos',
    description: 'Candongas en oro 18K de acabado pulido, formato clásico y brillo limpio para acompañar cualquier ocasión.',
  },
  {
    id: 'candongas-trenza-dorada', name: 'Candongas Trenza Dorada', category: 'candongas', price: 740000, stock: 4,
    measurements: earringSizes, imageNumbers: [9, 10, 11, 12], gemstone: 'Sin piedra principal',
    description: 'Candongas en oro 18K con volumen trenzado y textura brillante, diseñadas para sumar presencia sin perder delicadeza.',
  },
  {
    id: 'candongas-ovalo-diamantado', name: 'Candongas Óvalo Diamantado', category: 'candongas', price: 790000, stock: 3,
    measurements: earringSizes, imageNumbers: [17, 18, 19, 20], gemstone: 'Sin piedra principal',
    description: 'Candongas ovaladas en oro 18K con textura diamantada y una silueta alargada que estiliza el rostro.',
  },
  {
    id: 'candongas-onda-organica', name: 'Candongas Onda Orgánica', category: 'candongas', price: 860000, stock: 1,
    measurements: earringSizes, imageNumbers: [25, 26, 27], gemstone: 'Sin piedra principal',
    description: 'Candongas en oro 18K con contorno ondulado y acabado orgánico para una pieza más artística y moderna.',
  },
  {
    id: 'dije-mano-sagrada', name: 'Dije Mano Sagrada', category: 'dijes-para-manillas', price: 340000, stock: 5,
    measurements: charmSizes, imageNumbers: [1, 2, 3, 4], gemstone: 'Sin piedra principal',
    description: 'Dije para manilla en oro 18K con símbolo de mano protectora, ideal para personalizar una joya con intención.',
  },
  {
    id: 'dije-medallon-corona-real', name: 'Dije Medallón Corona Real', category: 'dijes-para-manillas', price: 520000, stock: 2,
    measurements: charmSizes, imageNumbers: [9, 10, 11, 12], gemstone: 'Sin piedra principal',
    description: 'Dije para manilla con medallón circular, corona central y contraste bicolor para una pieza de mayor presencia.',
  },
  {
    id: 'dije-medalla-devocion', name: 'Dije Medalla Devoción', category: 'dijes-para-manillas', price: 460000, stock: 3,
    measurements: charmSizes, imageNumbers: [21, 22, 23, 24], gemstone: 'Sin piedra principal',
    description: 'Dije tipo medalla en oro 18K con forma alargada y relieve delicado para una manilla personalizada.',
  },
  {
    id: 'manilla-atenea-cristal', name: 'Manilla Atenea Cristal', category: 'manillas', price: 1280000, stock: 2,
    measurements: wristSizes, imageNumbers: [1, 2, 3, 4], gemstone: 'Cristales decorativos',
    description: 'Manilla en oro 18K con eslabones rectangulares y detalles brillantes, pensada para una presencia elegante.',
  },
  {
    id: 'manilla-esmeralda-enlace', name: 'Manilla Esmeralda Enlace', category: 'manillas', price: 1560000, stock: 1,
    measurements: wristSizes, imageNumbers: [9, 10, 11, 12], gemstone: 'Acentos verdes tipo esmeralda',
    description: 'Manilla en oro 18K con eslabones y acentos verdes tipo esmeralda, ideal para una pieza con color protagonista.',
  },
  {
    id: 'manilla-eslabon-dorado', name: 'Manilla Eslabón Dorado', category: 'manillas', price: 1380000, stock: 3,
    measurements: wristSizes, imageNumbers: [17, 18, 19, 20], gemstone: 'Sin piedra principal',
    description: 'Manilla en oro 18K de eslabón ancho con caída flexible, una pieza clásica para uso diario o regalo.',
  },
  {
    id: 'manilla-placa-sello-dorado', name: 'Manilla Placa Sello Dorado', category: 'manillas', price: 1650000, stock: 1,
    measurements: wristSizes, imageNumbers: [25, 26, 27, 28], gemstone: 'Sin piedra principal',
    description: 'Manilla en oro 18K con eslabón cubano y placa central tipo sello, diseñada para un estilo contundente.',
  },
];

function imageList(category, numbers) {
  return numbers.map((number) => `/products/catalogo-real/${category}/${category}-${String(number).padStart(2, '0')}.jpg`);
}

export const catalogSeed = groups.map((product) => ({
  id: product.id,
  name: product.name,
  category: product.category,
  material: 'Oro amarillo 18K',
  price: product.price,
  stock: product.stock,
  measurements: product.measurements,
  images: imageList(product.category, product.imageNumbers),
  description: product.description,
  variants: {
    metal: 'Oro amarillo',
    purity: '18K',
    gemstone: product.gemstone,
    engraving: 'Disponible bajo solicitud',
  },
  premium: false,
  featured: false,
  active: true,
}));
