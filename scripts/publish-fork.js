const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

// Configuration
const NAMESPACE = '@fgnass';
const TIMESTAMP = new Date()
  .toISOString()
  .replace(/[:.]/g, '') // Remove colons and periods
  .replace(/[TZ]/g, ''); // Remove T and Z

// Use fixed temp directory
const tempDir = path.join(os.tmpdir(), 'decap-cms-publish');

try {
  // Clean up existing temp directory if it exists
  if (fs.existsSync(tempDir)) {
    console.log('Cleaning up existing temp directory...');
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  // Create temp directory
  console.log('Creating temp directory:', tempDir);
  fs.mkdirSync(tempDir, { recursive: true });

  // Get list of packages
  const packagesDir = path.join(process.cwd(), 'packages');
  const packages = fs.readdirSync(packagesDir).filter(dir => {
    const pkgJsonPath = path.join(packagesDir, dir, 'package.json');
    return fs.existsSync(pkgJsonPath);
  });

  // Copy each package
  console.log('Copying packages...');
  packages.forEach(pkg => {
    const srcDir = path.join(packagesDir, pkg);
    const destDir = path.join(tempDir, 'packages', pkg);

    // Copy entire package directory
    fs.mkdirSync(path.dirname(destDir), { recursive: true });
    execSync(`cp -r "${srcDir}" "${destDir}"`);
  });

  // Create root package.json with workspace config
  const rootPkg = {
    name: '@fgnass/decap-cms-workspace',
    private: true,
    workspaces: ['packages/*'],
    version: '1.0.0',
  };
  fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(rootPkg, null, 2));

  // Process each package
  packages.forEach(pkg => {
    const packageJsonPath = path.join(tempDir, 'packages', pkg, 'package.json');
    const pkgJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Update package name
    if (pkgJson.name.startsWith('decap-')) {
      pkgJson.name = `${NAMESPACE}/${pkgJson.name}`;
    }

    // Update version with timestamp
    const baseVersion = pkgJson.version.split('-')[0];
    pkgJson.version = `${baseVersion}-${TIMESTAMP}`;

    // Update dependencies to use our namespace
    ['dependencies', 'peerDependencies'].forEach(depType => {
      if (pkgJson[depType]) {
        Object.keys(pkgJson[depType]).forEach(dep => {
          if (dep.startsWith('decap-')) {
            const newDep = `${NAMESPACE}/${dep}`;
            // Reference the latest version
            pkgJson[depType][newDep] = 'latest';
            delete pkgJson[depType][dep];
          }
        });
      }
    });

    // Write modified package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(pkgJson, null, 2));
  });

  if (isDryRun) {
    console.log('\nDry run completed. Packages ready in:', tempDir);
    // Don't cleanup in dry-run mode
    process.exit(0);
  }

  // Publish packages
  console.log('Publishing packages...');
  packages.forEach(pkg => {
    const packageDir = path.join(tempDir, 'packages', pkg);
    try {
      execSync('npm publish --access public', {
        cwd: packageDir,
        stdio: 'inherit',
      });
    } catch (error) {
      console.error(`Failed to publish ${pkg}:`, error);
    }
  });

  console.log(`\nPublished packages with timestamp '${TIMESTAMP}'`);
  console.log(`Install with: npm install @fgnass/decap-cms-*`);
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
} finally {
  // Cleanup only if not in dry-run mode
  if (!isDryRun) {
    console.log('Cleaning up...');
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}
