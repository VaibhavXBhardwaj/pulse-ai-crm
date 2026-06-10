import { execSync } from 'child_process'
execSync('node --loader ts-node/esm prisma/seed.ts', { stdio: 'inherit' })