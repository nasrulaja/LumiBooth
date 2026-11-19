/**
 * Helper kompilasi src/lib untuk test Node.
 * =========================================
 * src/lib memakai import gaya bundler (`@/lib/...`, `@/data/poses.json`)
 * yang tidak dikenali Node maupun tsc polos. Helper ini:
 *   1. meng-compile src/lib/*.ts ke .tmp-test (CommonJS) dengan alias `@/*`
 *   2. memasang resolver runtime agar `@/...` benar-benar bisa di-require
 */
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const Module = require("module");

const root = path.join(__dirname, "..");
const tmp = path.join(root, ".tmp-test");

/**
 * Pasang hook require agar `@/x/y` (atau `@/data/poses.json`) diarahkan ke
 * file hasil compile di .tmp-test. Hanya dipakai selama test berjalan.
 */
function installAlias() {
  if (installAlias.done) return;
  installAlias.done = true;

  const original = Module._resolveFilename;
  Module._resolveFilename = function (request, ...args) {
    if (typeof request === "string" && request.startsWith("@/")) {
      // "@/lib/x" → "<tmp>/lib/x", "@/data/y.json" → "<tmp>/data/y.json"
      const rel = request.slice(2);
      const resolved = path.join(tmp, rel);
      try {
        return original.call(this, resolved, ...args);
      } catch {
        // Coba tambahkan .js (import tanpa ekstensi).
        return original.call(this, resolved + ".js", ...args);
      }
    }
    return original.call(this, request, ...args);
  };
}

/** Compile seluruh src/lib/*.ts ke .tmp-test lalu pasang alias. */
function compileLib() {
  fs.rmSync(tmp, { recursive: true, force: true });

  // tsconfig sementara: alias + resolveJsonModule + output CommonJS.
  const tmpConfig = path.join(root, ".tmp-test.tsconfig.json");
  const config = {
    compilerOptions: {
      target: "ES2020",
      lib: ["dom", "es2020"],
      module: "commonjs",
      moduleResolution: "node",
      skipLibCheck: true,
      esModuleInterop: true,
      resolveJsonModule: true,
      strict: true,
      outDir: ".tmp-test",
      rootDir: "src",
      baseUrl: ".",
      paths: { "@/*": ["./src/*"] },
    },
    include: ["src/lib/**/*.ts", "src/data/**/*.json"],
  };
  fs.writeFileSync(tmpConfig, JSON.stringify(config, null, 2), "utf8");

  try {
    execFileSync(
      process.execPath,
      [path.join(root, "node_modules", "typescript", "bin", "tsc"), "-p", tmpConfig],
      { cwd: root, stdio: "inherit" },
    );
  } finally {
    fs.rmSync(tmpConfig, { force: true });
  }

  // Tandai hasil compile sebagai CommonJS.
  fs.writeFileSync(
    path.join(tmp, "package.json"),
    JSON.stringify({ type: "commonjs" }),
  );

  installAlias();
  return tmp;
}

/** Hapus folder hasil compile. */
function cleanup() {
  fs.rmSync(tmp, { recursive: true, force: true });
}

module.exports = { compileLib, cleanup, tmp, root };

