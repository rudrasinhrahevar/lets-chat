// Simple in-memory cache with TTL for frequently-accessed API responses
const cache = new Map();

export const cacheMiddleware = (ttlSeconds = 30) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') return next();

    const key = `${req.originalUrl || req.url}_${req.user?._id || 'anon'}`;
    const cached = cache.get(key);

    if (cached && Date.now() - cached.timestamp < ttlSeconds * 1000) {
      return res.json(cached.data);
    }

    // Monkey-patch res.json to intercept the response
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, { data, timestamp: Date.now() });
      }
      return originalJson(data);
    };

    next();
  };
};

// Invalidate cache entries matching a pattern
export const invalidateCache = (pattern) => {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};

// Periodic cleanup of expired entries (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > 120000) { // 2 min max stale
      cache.delete(key);
    }
  }
}, 300000);
