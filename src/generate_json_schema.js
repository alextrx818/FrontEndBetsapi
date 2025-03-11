const axios = require('axios');
const jsf = require('json-schema-faker');
const fs = require('fs');

const fetchRawData = async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/tennis/raw');
    if (response.status !== 200) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = response.data;
    console.log('Raw data fetched successfully:', data);
    return data;
  } catch (err) {
    console.error('Error fetching raw data:', err);
    return null;
  }
};

const generateJsonSchema = (data) => {
  const schema = jsf.generate(data);
  console.log('Generated JSON schema:', schema);
  return schema;
};

const saveSchemaToFile = (schema, filePath) => {
  fs.writeFileSync(filePath, JSON.stringify(schema, null, 2));
  console.log(`JSON schema saved to ${filePath}`);
};

const main = async () => {
  const rawData = await fetchRawData();
  if (rawData) {
    const schema = generateJsonSchema(rawData);
    saveSchemaToFile(schema, 'json_schema.json');
  }
};

main();