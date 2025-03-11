const fs = require('fs');
const path = require('path');

// Function to get dependencies from package.json
const getDependencies = (packageJsonPath) => {
  const packageJson = require(packageJsonPath);
  return Object.keys(packageJson.dependencies || {});
};

// Function to scan JS files for import/require statements
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

// Function to scan project files for imports
const scanProjectFiles = (projectDir) => {
  const jsFiles = [];
  const scanDir = (dir) => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        scanDir(fullPath); // Recurse into subdirectories
      } else if (fullPath.endsWith('.js')) {
        jsFiles.push(fullPath); // Collect JS files
      }
    });
  };

  scanDir(projectDir);

  return jsFiles;
};

// Main function to check for unused dependencies
const checkUnusedDependencies = () => {
  const packageJsonPath = path.resolve(__dirname, 'package.json'); // Direct path to package.json
  if (!fs.existsSync(packageJsonPath)) {
    console.log('No package.json found in the project.');
    return;
  }

  const dependencies = getDependencies(packageJsonPath);
  const projectDir = path.dirname(packageJsonPath);

  // Scan project files for imported modules
  const jsFiles = scanProjectFiles(projectDir);
  let usedDependencies = new Set();

  jsFiles.forEach(file => {
    const imports = findImports(file);
    imports.forEach(dep => usedDependencies.add(dep));
  });

  // Compare dependencies and log unused ones
  const unusedDependencies = dependencies.filter(dep => !usedDependencies.has(dep));

  if (unusedDependencies.length > 0) {
    console.log('Unused dependencies found:');
    unusedDependencies.forEach(dep => console.log(dep));
  } else {
    console.log('No unused dependencies found.');
  }
};

// Run the tool
checkUnusedDependencies();
