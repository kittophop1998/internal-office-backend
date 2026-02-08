import { loadEnvFile } from 'node:process'

export function loadEnv() {
    const nodeEnv = process.env.NODE_ENV || 'development';

    const files = [
        `.env.${nodeEnv}.local`,
        nodeEnv === 'test' ? null : `.env.local`,
        `.env.${nodeEnv}`,
        `.env`,
    ].filter((file): file is string => !!file);

    for (const file of files) {
        try {
            loadEnvFile(file);
            break;
        } catch {}
    }
}