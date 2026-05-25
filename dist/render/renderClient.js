"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderClient = exports.getClientStaticDir = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const config_1 = __importDefault(require("../config"));
const projectRoot = process.cwd();
const clientBuildDir = node_path_1.default.resolve(projectRoot, 'dist/public');
const manifestPath = node_path_1.default.resolve(clientBuildDir, '.vite/manifest.json');
const viteDevServerUrl = process.env.CLIENT_VITE_DEV_SERVER_URL ?? `http://localhost:${process.env.VITE_PORT ?? '5173'}`;
const getClientAssets = () => {
    if (config_1.default.env !== 'production') {
        return {
            entryScript: '/src/main.tsx',
            entryStyles: [],
        };
    }
    if (!node_fs_1.default.existsSync(manifestPath)) {
        throw new Error('Client build manifest not found. Run "npm run build" before starting the production server.');
    }
    const manifest = JSON.parse(node_fs_1.default.readFileSync(manifestPath, 'utf-8'));
    const entry = manifest['index.html'];
    if (!entry?.file) {
        throw new Error('Vite manifest is missing the client entry for index.html.');
    }
    return {
        entryScript: `/${entry.file}`,
        entryStyles: entry.css?.map((stylesheet) => `/${stylesheet}`) ?? [],
    };
};
const getClientStaticDir = () => clientBuildDir;
exports.getClientStaticDir = getClientStaticDir;
const renderClient = (_req, res) => {
    const assets = getClientAssets();
    res.render('client', {
        isDev: config_1.default.env !== 'production',
        viteDevServerUrl,
        entryScript: assets.entryScript,
        entryStyles: assets.entryStyles,
    });
};
exports.renderClient = renderClient;
//# sourceMappingURL=renderClient.js.map