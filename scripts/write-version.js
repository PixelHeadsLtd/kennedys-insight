const { execSync } = require('child_process');
const { writeFileSync, mkdirSync } = require('fs');
const { join } = require('path');

const root = process.cwd();
const pkg = require(join(root, 'package.json'));

function sh(cmd) { try { return execSync(cmd).toString().trim(); } catch { return ''; } }

const data = {
  version: pkg.version,
  commit: sh('git rev-parse --short HEAD'),
  buildTime: new Date().toISOString()
};

const outDir = join(root, 'src', 'assets');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'version.json'), JSON.stringify(data, null, 2));
console.log('Wrote src/assets/version.json:', data);
