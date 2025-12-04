# Migrations Quick Start

## First Time Setup (Do Once)

```bash
npx tsx scripts/init-migrations.ts
```

Then paste the SQL it copies into [Supabase SQL Editor](https://supabase.com/dashboard/project/enbuwffusjhpcyoveewb/sql) and click Run.

## Running Migrations

```bash
./migrate.sh migrations/your-file.sql
```

OR

```bash
npx tsx scripts/run-migration.ts migrations/your-file.sql
```

That's it!

---

## For Claude

Claude can now run migrations automatically using:

```typescript
// In a script or during conversation
npx tsx scripts/run-migration.ts migrations/new-migration.sql
```

No manual intervention needed after initial setup!

---

See [MIGRATION_WORKFLOW.md](./MIGRATION_WORKFLOW.md) for detailed documentation.
