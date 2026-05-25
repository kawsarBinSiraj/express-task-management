import { defineConfig } from 'prisma/config';
import config from './src/config/index';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: config.database.directUrl ??  config.database.url,
  },
});
