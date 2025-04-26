import Papa from 'papaparse';

// Raw CSV imports (ensure you're using ?raw suffix)
import herbalCSV from './Herbal_Ecommerce_Dataset.csv?raw';
import plantCSV from './Plant.csv?raw';
import diseaseCSV from './Disease.csv?raw';
import ecommerceCSV from './E-commerce dataset.csv?raw'; // ✅ NEW

// General CSV parsing function
export const loadCSVText = (csvText) => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      trimHeaders: true,
      trimValues: true,
      dynamicTyping: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => value ? value.trim() : '',
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          console.warn('CSV parsing warnings:', results.errors);
        }
        if (!results.data || results.data.length === 0) {
          reject(new Error('No data found in CSV file'));
        } else {
          resolve(results.data);
        }
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        reject(error);
      }
    });
  });
};

// Process herbal product data
export const processHerbalProductData = (data) => {
  if (!data || data.length === 0) {
    throw new Error('No herbal product data to process');
  }

  return data.map((product, idx) => {
    return {
      id: product['Product ID'] || Math.random().toString(36).substr(2, 9),
      name: product['Product Name'] || 'Unknown Product',
      scientificName: product['Scientific Name'] || 'Unknown',
      category: product['Category'] || 'Uncategorized',
      description: product['Description'] || 'No description available',
      price: parseFloat(product['Price (USD)']) || 0,
      imageUrl: product['Image URL'] || 'https://placehold.co/300x200?text=Product+Image',
      benefits: product['Usage']
        ? product['Usage'].split(',').map(b => b.trim())
        : [],
      dosage: 'See usage information.',
      origin: product['Region'] || 'Unknown region',
      stock: parseInt(product['Stock Quantity']) || 0
    };
  });
};

// Process plant data
export const processPlantData = (data) => {
  if (!data || data.length === 0) {
    throw new Error('No plant data to process');
  }

  return data.map(plant => ({
    id: plant['Plant ID'] || Math.random().toString(36).substr(2, 9),
    commonName: plant['Common Name'] || 'Unknown Plant',
    scientificName: plant['Scientific Name'] || 'Unknown Scientific Name',
    medicinalUses: plant['Medicinal Uses'] || 'No medicinal uses available',
    plantFamily: plant['Plant Family'] || 'Family not specified',
    region: plant['Region'] || 'Region not specified',
    partsUsed: plant['Parts Used'] || 'Parts used not specified',
    preparationMethods: plant['Preparation Methods'] || 'No preparation method available',
    chemicalConstituents: plant['Chemical Constituents'] || 'Chemical constituents not specified',
    precautions: plant['Precautions/Side effects'] || 'No precautions listed',
    imageUrl: plant['Image URL'] || 'https://via.placeholder.com/300x200?text=Plant+Image'
  }));
};

// Process disease data
export const processDiseaseData = (data) => {
  if (!data || data.length === 0) {
    throw new Error('No disease data to process');
  }

  return data.map(disease => ({
    id: disease['Plant ID'] || Math.random().toString(36).substr(2, 9),
    disease: disease['Disease/Symptomes'] || 'Unknown Disease',
    herbalPlant: disease['Herbal plant'] || 'Not specified',
    preparationMethod: disease['Preparation method'] || 'Not specified',
    dosage: disease['Dosage'] || 'Not specified',
    possibleReactions: disease['Possible Reactions'] || 'Not specified',
    imageUrl: disease['Image URL'] || 'https://via.placeholder.com/300x200?text=Disease+Image'
  }));
};

//Process e-commerce product data
export const processEcommerceProductData = (data) => {
  if (!data || data.length === 0) {
    throw new Error('No e-commerce product data to process');
  }

  return data.map((product, idx) => {
    return {
      id: product['Id'] || Math.random().toString(36).substr(2, 9),
      name: product['Name'] || 'Unnamed Product',
      description: product['Description'] || 'No description provided',
      price: parseFloat(product['Price']) || 0,
      imageUrl: product['Image'] || 'https://via.placeholder.com/300x200?text=Product+Image',
      benefits: product['Benefits']
        ? product['Benefits'].split(',').map(b => b.trim())
        : [],
      dosage: product['Dosage'] || 'See label',
      origin: product['Origin'] || 'Unknown',
      stock: parseInt(product['Available Stock']) || 0
    };
  });
};

// Loaders for all datasets
export const loadHerbalProductData = async () => {
  const data = await loadCSVText(herbalCSV);
  return processHerbalProductData(data);
};

export const loadPlantData = async () => {
  const data = await loadCSVText(plantCSV);
  return processPlantData(data);
};

export const loadDiseaseData = async () => {
  const data = await loadCSVText(diseaseCSV);
  return processDiseaseData(data);
};

export const loadEcommerceProductData = async () => {
  const data = await loadCSVText(ecommerceCSV);
  return processEcommerceProductData(data);
};
