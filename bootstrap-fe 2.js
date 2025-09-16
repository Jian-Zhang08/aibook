const fs = require('fs');
const path = require('path');

/**
 * Generic server generator for projects with serverless-style handlers in an api/ directory.
 *
 * Usage examples:
 *   node bootstrap-fe.js --apiDir=api --out=server.js --basePath=/api --staticDir=build --port=3001
 *   node bootstrap-fe.js --apiDir=functions --out=dev-server.js --basePath=/functions
 */
function bootstrap(opts) {
  const options = normalizeOptions(opts);
  const handlers = discoverHandlers(options.apiDir);
  const plans = analyzeHandlers(handlers, options);
  const serverContents = renderServer(plans, options);
  fs.writeFileSync(options.out, serverContents, 'utf8');
  return { serverPath: options.out, handlersCount: plans.length };
}

function normalizeOptions(opts) {
  const argv = parseArgs(process.argv.slice(2));
  const projectRoot = process.cwd();
  const apiDir = path.resolve(projectRoot, (opts?.apiDir || argv.apiDir || 'api'));
  const out = path.resolve(projectRoot, (opts?.out || argv.out || 'server.js'));
  const basePath = String(opts?.basePath || argv.basePath || '/api').replace(/\/$/, '');
  const staticDir = path.resolve(projectRoot, (opts?.staticDir || argv.staticDir || 'build'));
  const port = Number(opts?.port || argv.port || process.env.PORT || 3000);
  return { projectRoot, apiDir, out, basePath, staticDir, port };
}

function parseArgs(args) {
  const out = {};
  for (const a of args) {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

function discoverHandlers(apiDir) {
  const list = [];
  function walk(dir) {
    const entries = fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }) : [];
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.isFile() && e.name.endsWith('.js')) list.push(full);
    }
  }
  walk(apiDir);
  return list;
}

function analyzeHandlers(files, options) {
  return files.sort().map((absPath) => {
    const code = fs.readFileSync(absPath, 'utf8');
    const relFromApi = path.relative(options.apiDir, absPath).replace(/\\/g, '/');
    const routePath = toRoutePath(relFromApi, options.basePath);
    const methods = detectMethods(code);
    const bodyUsage = detectBodyHandling(code);
    return {
      absPath,
      requirePath: './' + path.relative(path.dirname(options.out), absPath).replace(/\\/g, '/'),
      routePath,
      methods,
      bodyUsage,
      varName: relFromApi.replace(/\.[jt]s$/, '').replace(/\//g, '_').replace(/[^a-zA-Z0-9_]/g, '_') + 'Handler',
    };
  });
}

function toRoutePath(relFromApi, basePath) {
  const clean = relFromApi.replace(/index\.js$/, '').replace(/\.js$/, '');
  return `${basePath}/${clean}`;
}

function detectMethods(code) {
  const methodsFound = new Set();
  // Pattern: if (req.method !== 'GET') ... or !== 'PATCH' && !== 'POST'
  const notEqRegex = /req\.method\s*!==\s*['"](GET|POST|PATCH|DELETE)['"]/g;
  let m;
  while ((m = notEqRegex.exec(code))) methodsFound.add(m[1]);
  // Pattern: if (req.method === 'GET')
  const eqRegex = /req\.method\s*===\s*['"](GET|POST|PATCH|DELETE)['"]/g;
  while ((m = eqRegex.exec(code))) methodsFound.add(m[1]);
  if (methodsFound.size === 0) return ['POST'];
  // For !== pattern inside allow-list guard, those tokens are the allowed ones
  return Array.from(methodsFound);
}

function detectBodyHandling(code) {
  const usesJsonParse = /JSON\.parse\(\s*req\.body\s*\)/.test(code);
  const checksBodyType = /typeof\s+req\.body\s*===\s*['"]string['"]/i.test(code);
  const streamsBody = /for\s+await\s*\(\s*const\s+.+?\s+of\s+req\s*\)|Buffer\.concat\(|new\s+Blob\(\[\s*buf\s*\]/s.test(code);
  return {
    rawPreferred: streamsBody,
    needsJson: !streamsBody,
    bodyAsString: usesJsonParse || checksBodyType,
  };
}

function renderServer(plans, options) {
  const imports = [
    "'use strict';",
    "require('dotenv').config();",
    "const path = require('path');",
    "const express = require('express');",
  ];

  const requireLines = plans.map(p => `const ${p.varName} = require('${p.requirePath}');`);

  const routeLines = [];
  for (const p of plans) {
    const needJsonParser = p.bodyUsage.needsJson;
    const bodyAsString = p.bodyUsage.bodyAsString;
    const hasRaw = p.bodyUsage.rawPreferred;
    const methods = p.methods.length ? p.methods : ['POST'];

    for (const method of methods) {
      if (hasRaw) {
        // Heuristic: allow JSON for convenience, raw otherwise
        routeLines.push(
          `app.${method.toLowerCase()}('${p.routePath}', (req, res) => { const ct = String(req.headers['content-type']||''); if (ct.startsWith('application/json')) return jsonParser(req,res,()=>${bodyAsString ? 'stringifyBodyAndCall' : 'call'}(${p.varName}, req, res)); return ${p.varName}(req, res); });`
        );
      } else if (needJsonParser) {
        routeLines.push(
          `app.${method.toLowerCase()}('${p.routePath}', jsonParser, (req, res) => ${bodyAsString ? 'stringifyBodyAndCall' : 'call'}(${p.varName}, req, res));`
        );
      } else {
        routeLines.push(
          `app.${method.toLowerCase()}('${p.routePath}', (req, res) => ${bodyAsString ? 'stringifyBodyAndCall' : 'call'}(${p.varName}, req, res));`
        );
      }
    }
  }

  const staticExists = fs.existsSync(options.staticDir);

  return [
    ...imports,
    '',
    ...requireLines,
    '',
    'const app = express();',
    "const jsonParser = express.json({ limit: '20mb' });",
    '',
    'function call(handler, req, res) { return handler(req, res); }',
    'function stringifyBodyAndCall(handler, req, res) { try { if (req.body && typeof req.body === "object") req.body = JSON.stringify(req.body); } catch {} return handler(req, res); }',
    '',
    "app.get('/health', (req,res)=>res.status(200).json({ ok:true }));",
    ...routeLines,
    '',
    ...(staticExists ? [
      `const buildDir = path.join(__dirname, '${path.relative(path.dirname(options.out), options.staticDir).replace(/\\\\/g, '/')}');`,
      'app.use(express.static(buildDir));',
      "app.get('*', (req,res)=>{ if(req.path.startsWith('" + options.basePath + "')) return res.status(404).json({ error:'NOT_FOUND' }); res.sendFile(path.join(buildDir,'index.html')); });",
    ] : []),
    '',
    `const port = Number(${options.port});`,
    "app.listen(port, () => console.log(`✅ API server listening on http://localhost:${port}`));",
    '',
  ].join('\n');
}

if (require.main === module) {
  const argv = parseArgs(process.argv.slice(2));
  const noBuild = String(argv.noBuild || '').toLowerCase() === 'true';

  // Auto-detect backend and frontend
  const detected = autodetectProject();

  // If Next.js, delegate to Next dev server instead of generating Express
  if (detected.framework === 'next') {
    try {
      const frontendRoot = detected.frontendRoot || process.cwd();
      const pkg = safeReadJson(path.join(frontendRoot, 'package.json')) || {};
      const hasDev = !!pkg.scripts?.dev;
      const { packageManager } = detectPackageManagerAndBuild(frontendRoot);
      const cmd = hasDev
        ? (packageManager === 'yarn' ? 'yarn dev' : packageManager === 'pnpm' ? 'pnpm dev' : packageManager === 'bun' ? 'bun run dev' : 'npm run dev')
        : 'npx next dev';
      console.log(`Detected Next.js project at ${frontendRoot}. Starting: ${cmd}`);
      const { spawn } = require('child_process');
      const child = spawn(cmd, { cwd: frontendRoot, stdio: 'inherit', shell: true });
      child.on('exit', (code) => process.exit(code || 0));
    } catch (e) {
      console.error('❌ Failed to start Next.js dev server:', e.message);
      process.exit(1);
    }
    return;
  }

  // Optionally build the frontend
  let staticDir = detected.staticDir; // may be undefined until build
  if (!noBuild && detected.frontendRoot && detected.buildScript) {
    try {
      runBuild(detected.frontendRoot, detected.packageManager, detected.buildScript);
      staticDir = detectBuildOutputDir(detected.frontendRoot) || staticDir;
    } catch (e) {
      console.warn('⚠️ Frontend build failed or skipped:', e.message);
    }
  } else {
    staticDir = detectBuildOutputDir(detected.frontendRoot) || staticDir;
  }

  // Generate server.js
  const result = bootstrap({
    apiDir: detected.apiDir || 'api',
    out: argv.out || 'server.js',
    basePath: detected.basePath || '/api',
    staticDir: staticDir || path.join(process.cwd(), 'build'),
    port: Number(argv.port || process.env.PORT || 3000),
  });
  console.log('Generated server', result);

  // Start the generated server.js
  try {
    const { spawn } = require('child_process');
    const nodeExec = process.execPath;
    const child = spawn(nodeExec, [result.serverPath], { stdio: 'inherit', env: process.env });
    child.on('exit', (code) => process.exit(code || 0));
  } catch (e) {
    console.error('❌ Failed to start generated server:', e.message);
    process.exit(1);
  }
}

module.exports = { bootstrap };

// ---- Auto-detection and build helpers ----

function autodetectProject() {
  const cwd = process.cwd();
  const frontendRoot = detectFrontendRoot(cwd);
  const pkg = safeReadJson(path.join(frontendRoot || cwd, 'package.json')) || {};
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  const isNext = !!deps.next || /next/.test(pkg.scripts?.dev || '') || /next/.test(pkg.scripts?.start || '');

  // For Next.js, do not generate Express; Next handles API routes under pages/api or app/api
  const apiDir = isNext ? null : detectApiDir(cwd);
  const basePath = '/api';
  const { packageManager, buildScript } = detectPackageManagerAndBuild(frontendRoot);
  const staticDir = detectBuildOutputDir(frontendRoot);
  const framework = isNext ? 'next' : 'generic';
  return { apiDir, basePath, frontendRoot, packageManager, buildScript, staticDir, framework };
}

function detectApiDir(root) {
  const candidates = [
    'api',
    'functions',
    path.join('pages', 'api'), // Next.js (pages router)
    path.join('app', 'api'),   // Next.js (app router)
    path.join('netlify', 'functions'),
    path.join('vercel', 'functions')
  ];
  for (const rel of candidates) {
    const abs = path.join(root, rel);
    if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) return abs;
  }
  return null;
}

function detectFrontendRoot(root) {
  const rootPkg = safeReadJson(path.join(root, 'package.json'));
  if (rootPkg && looksLikeFrontend(rootPkg)) return root;

  // Scan subdirectories for a frontend package.json
  const entries = fs.readdirSync(root, { withFileTypes: true });
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    if (e.name.startsWith('.') || ['api', 'functions', 'node_modules'].includes(e.name)) continue;
    const subPkgPath = path.join(root, e.name, 'package.json');
    const pkg = safeReadJson(subPkgPath);
    if (pkg && looksLikeFrontend(pkg)) return path.join(root, e.name);
  }
  return rootPkg ? root : root; // fallback to root
}

function looksLikeFrontend(pkg) {
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  return !!(deps.react || deps.vite || deps.next || deps.vue || deps.svelte || deps['react-scripts']);
}

function detectPackageManagerAndBuild(frontendRoot) {
  if (!frontendRoot) return { packageManager: 'npm', buildScript: 'build' };
  if (fs.existsSync(path.join(frontendRoot, 'pnpm-lock.yaml'))) return { packageManager: 'pnpm', buildScript: 'build' };
  if (fs.existsSync(path.join(frontendRoot, 'yarn.lock'))) return { packageManager: 'yarn', buildScript: 'build' };
  if (fs.existsSync(path.join(frontendRoot, 'bun.lockb'))) return { packageManager: 'bun', buildScript: 'build' };
  return { packageManager: 'npm', buildScript: 'build' };
}

function runBuild(frontendRoot, packageManager, buildScript) {
  const { spawnSync } = require('child_process');
  const cmd = packageManager;
  const args = packageManager === 'yarn' ? ['run', buildScript] : ['run', buildScript];
  const res = spawnSync(cmd, args, { cwd: frontendRoot, stdio: 'inherit', shell: true });
  if (res.status !== 0) throw new Error(`${packageManager} run ${buildScript} failed with code ${res.status}`);
}

function detectBuildOutputDir(frontendRoot) {
  if (!frontendRoot) return null;
  const candidates = ['build', 'dist', 'out'];
  for (const name of candidates) {
    const abs = path.join(frontendRoot, name);
    if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) return abs;
  }
  return null;
}

function safeReadJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}

