import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import sequelize from '../src/sequelize/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = {};

// Read all model files except this index.js
const modelFiles = readdirSync(__dirname)
  .filter(
    (file) =>
      file !== 'index.js' &&
      file.endsWith('.js') &&
      !file.includes('.test.')
  );

for (const file of modelFiles) {
  const modelModule = await import(pathToFileURL(join(__dirname, file)).href);
  const model = modelModule.default;

  if (!model?.name) {
    console.warn(`Skipping invalid model in file ${file}`);
    continue;
  }

  db[model.name] = model;
}

// If models have associations, run them
Object.keys(db).forEach((modelName) => {
  if (typeof db[modelName].associate === 'function') {
    db[modelName].associate(db);
  }
});

// Add sequelize instance to db object
db.sequelize = sequelize;

export default db;
