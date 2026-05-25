import fs from 'node:fs';
import path from 'node:path';
import { Request, Response } from 'express';
import config from '../config';

type ViteManifestEntry = {
    file: string;
    css?: string[];
};

type ViteManifest = Record<string, ViteManifestEntry>;

const projectRoot = path.resolve(__dirname, '../..');
const clientBuildDir = path.resolve(projectRoot, 'dist/public');
const manifestPath = path.resolve(clientBuildDir, '.vite/manifest.json');
const viteDevServerUrl = process.env.CLIENT_VITE_DEV_SERVER_URL ?? `http://localhost:${process.env.VITE_PORT ?? '5173'}`;

const getClientAssets = (): { entryScript: string; entryStyles: string[] } => {
    if (config.env !== 'production') {
        return {
            entryScript: '/src/main.tsx',
            entryStyles: [],
        };
    }

    if (!fs.existsSync(manifestPath)) {
        throw new Error(
            'Client build manifest not found. Run "npm run build" before starting the production server.',
        );
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as ViteManifest;
    const entry = manifest['index.html'];

    if (!entry?.file) {
        throw new Error('Vite manifest is missing the client entry for index.html.');
    }

    return {
        entryScript: `/${entry.file}`,
        entryStyles: entry.css?.map((stylesheet) => `/${stylesheet}`) ?? [],
    };
};

export const getClientStaticDir = (): string => clientBuildDir;

export const renderClient = (_req: Request, res: Response): void => {
    const assets = getClientAssets();

    res.render('client', {
        isDev: config.env !== 'production',
        viteDevServerUrl,
        entryScript: assets.entryScript,
        entryStyles: assets.entryStyles,
    });
};
