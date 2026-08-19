import mongoose from 'mongoose';
import dns from 'dns';

export function setupDnsResolvers() {
  try {
    if (dns.setDefaultResultOrder) {
      dns.setDefaultResultOrder('ipv4first');
    }
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4', '1.0.0.1']);
  } catch {
    // Ignore restricted environment errors
  }
}

// Set up public DNS resolvers immediately on module load
setupDnsResolvers();

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Cache the connection across hot reloads in dev
const globalWithMongoose = globalThis as typeof globalThis & { _mongooseCache?: MongooseCache };

if (!globalWithMongoose._mongooseCache) {
  globalWithMongoose._mongooseCache = { conn: null, promise: null };
}

const cached = globalWithMongoose._mongooseCache;

export async function connectToDatabase(retries = 3): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  setupDnsResolvers();

  let attempt = 0;
  while (attempt < retries) {
    try {
      cached.promise = mongoose.connect(uri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000, // 5s timeout to fail fast and retry on DNS lookup glitches
        connectTimeoutMS: 5000,
        socketTimeoutMS: 20000,
        maxPoolSize: 10,
        minPoolSize: 0,
        family: 4, // Force IPv4 — fixes SRV ETIMEOUT on Windows local ISP resolvers
      });

      cached.conn = await cached.promise;
      return cached.conn;
    } catch (err: unknown) {
      cached.promise = null;
      cached.conn = null;
      attempt++;

      const errObj = err as { code?: string; syscall?: string };
      const isDnsError =
        errObj?.code === 'ETIMEOUT' ||
        errObj?.syscall === 'querySrv' ||
        String(err).includes('querySrv');

      if (isDnsError) {
        console.warn(
          `[MongoDB] DNS SRV query timeout (attempt ${attempt}/${retries}). Retrying with public DNS (8.8.8.8)...`
        );
        setupDnsResolvers();
      }

      if (attempt >= retries) {
        throw err;
      }
      await new Promise((res) => setTimeout(res, 1000));
    }
  }

  throw new Error('Failed to connect to MongoDB after multiple retries.');
}