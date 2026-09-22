import { Pool } from 'pg';

// Wichtig: Pool nur EINMAL erstellen, nicht bei jedem Request neu!
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, 
});

export default pool;