const fs = require('fs');
const path = require('path');

// Function to get dependencies from package.json
const getDependencies = (packageJsonPath) => {
  const packageJson = require(packageJsonPath);
  return Object.keys(packageJson.dependencies || {});
};

// Function to scan a single JS file for import/require statements
const findImports = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const imports = [];
  
  // Regular expression to match import/require statements
  const importRegex = /(?:import .* from ['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]\))/g;
  let match;

  // Execute the regex to find all imports
  while ((match = importRegex.exec(content)) !== null) {
    const dependency = match[1] || match[2]; // Match either import or require
    // Remove the file extension if present (e.g., index.js, .js)
    const cleanDependency = dependency.replace(/\/index\.js$/, '').replace(/\.js$/, '');
    imports.push(cleanDependency);
  }

  return imports;
};

// Main function to check for unused dependencies in a single file
const checkUnusedDependencies = (filePath) => {
  const packageJsonPath = path.resolve(__dirname, 'package.json'); // Direct path to package.json
  if (!fs.existsSync(packageJsonPath)) {
    console.log('No package.json found in the project.');
    return;
  }

  const dependencies = getDependencies(packageJsonPath);

  // Get the imports used in the specified file
  const imports = findImports(filePath);
  const usedDependencies = new Set(imports);

  // Compare dependencies and log unused ones
  const unusedDependencies = dependencies.filter(dep => !usedDependencies.has(dep));

  if (unusedDependencies.length > 0) {
    console.log('Unused dependencies found:');
    unusedDependencies.forEach(dep => console.log(dep));
  } else {
    console.log('No unused dependencies found.');
  }
};

// Example usage: Call the function with the path to the specific file you want to check
const filePath = path.resolve(__dirname, 'src/index.js'); // Adjust this path to the file you want to check
checkUnusedDependencies(filePath);
