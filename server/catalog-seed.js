const ringSizes = ['Talla 5', 'Talla 6', 'Talla 7', 'Talla 8', 'Talla 9', 'Talla personalizada'];
const braceletSizes = ['15 cm', '16 cm', '17 cm', '18 cm', '19 cm', '20 cm', 'Medida personalizada'];
const earringSizes = ['Pequeñas', 'Medianas', 'Grandes', 'Ajuste especial'];
const charmSizes = ['Mini', 'Pequeño', 'Mediano', 'Argolla reforzada', 'Medida personalizada'];
const wristSizes = ['14 cm', '15 cm', '16 cm', '17 cm', '18 cm', '19 cm', 'Medida personalizada'];

export const catalogSeed = [
  { id: 'anillo-rubi-aurora', name: 'Anillo Rubí Aurora', category: 'anillos', price: 1120000, stock: 3, measurements: ringSizes },
  { id: 'anillo-corona-amatista', name: 'Anillo Corona Amatista', category: 'anillos', price: 1480000, stock: 2, measurements: ringSizes },
  { id: 'anillo-filigrana-celestial', name: 'Anillo Filigrana Celestial', category: 'anillos', price: 1250000, stock: 1, measurements: ringSizes },
  { id: 'brazalete-placa-dorada', name: 'Brazalete Placa Dorada', category: 'brazaletes', price: 1320000, stock: 4, measurements: braceletSizes },
  { id: 'brazalete-lazo-diamantado', name: 'Brazalete Lazo Diamantado', category: 'brazaletes', price: 1180000, stock: 2, measurements: braceletSizes },
  { id: 'brazalete-greca-serena', name: 'Brazalete Greca Serena', category: 'brazaletes', price: 1090000, stock: 0, measurements: braceletSizes },
  { id: 'brazalete-amuletos-esmeralda', name: 'Brazalete Amuletos Esmeralda', category: 'brazaletes', price: 1580000, stock: 1, measurements: braceletSizes },
  { id: 'candongas-brillo-clasico', name: 'Candongas Brillo Clásico', category: 'candongas', price: 680000, stock: 6, measurements: earringSizes },
  { id: 'candongas-trenza-dorada', name: 'Candongas Trenza Dorada', category: 'candongas', price: 740000, stock: 4, measurements: earringSizes },
  { id: 'candongas-ovalo-diamantado', name: 'Candongas Óvalo Diamantado', category: 'candongas', price: 790000, stock: 3, measurements: earringSizes },
  { id: 'candongas-onda-organica', name: 'Candongas Onda Orgánica', category: 'candongas', price: 860000, stock: 1, measurements: earringSizes },
  { id: 'dije-mano-sagrada', name: 'Dije Mano Sagrada', category: 'dijes-para-manillas', price: 340000, stock: 5, measurements: charmSizes },
  { id: 'dije-medallon-corona-real', name: 'Dije Medallón Corona Real', category: 'dijes-para-manillas', price: 520000, stock: 2, measurements: charmSizes },
  { id: 'dije-medalla-devocion', name: 'Dije Medalla Devoción', category: 'dijes-para-manillas', price: 460000, stock: 3, measurements: charmSizes },
  { id: 'manilla-atenea-cristal', name: 'Manilla Atenea Cristal', category: 'manillas', price: 1280000, stock: 2, measurements: wristSizes },
  { id: 'manilla-esmeralda-enlace', name: 'Manilla Esmeralda Enlace', category: 'manillas', price: 1560000, stock: 1, measurements: wristSizes },
  { id: 'manilla-eslabon-dorado', name: 'Manilla Eslabón Dorado', category: 'manillas', price: 1380000, stock: 3, measurements: wristSizes },
  { id: 'manilla-placa-sello-dorado', name: 'Manilla Placa Sello Dorado', category: 'manillas', price: 1650000, stock: 1, measurements: wristSizes },
].map((product) => ({ ...product, active: true }));
