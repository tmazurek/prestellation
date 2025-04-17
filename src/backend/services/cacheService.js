const cache = require('memory-cache');

/**
 * Service for managing application cache
 */
class CacheService {
  constructor() {
    this.defaultTTL = parseInt(process.env.DEFAULT_CACHE_TTL || 300000, 10); // 5 minutes in ms
    this.cache = cache;
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {*} - Cached value or null if not found
   */
  get(key) {
    return this.cache.get(key);
  }

  /**
   * Set a value in cache
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds
   */
  set(key, value, ttl = this.defaultTTL) {
    this.cache.put(key, value, ttl);
  }

  /**
   * Delete a value from cache
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.del(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get all cache keys
   * @returns {Array<string>} - Array of cache keys
   */
  getKeys() {
    return Object.keys(this.cache.exportJson());
  }

  /**
   * Clear cache by pattern
   * @param {string} pattern - Pattern to match keys
   * @returns {number} - Number of keys cleared
   */
  clearByPattern(pattern) {
    if (!pattern) return 0;
    
    const keys = this.getKeys();
    const matchingKeys = keys.filter(key => key.includes(pattern));
    
    matchingKeys.forEach(key => this.delete(key));
    
    return matchingKeys.length;
  }

  /**
   * Get cache stats
   * @returns {Object} - Cache statistics
   */
  getStats() {
    const keys = this.getKeys();
    const size = keys.length;
    const json = this.cache.exportJson();
    
    // Calculate memory usage (approximate)
    const jsonSize = JSON.stringify(json).length;
    
    return {
      size,
      keys,
      approximateSizeBytes: jsonSize,
      approximateSizeKB: Math.round(jsonSize / 1024),
    };
  }

  /**
   * Get or set cache value with callback
   * @param {string} key - Cache key
   * @param {Function} callback - Function to call if cache miss
   * @param {number} ttl - Time to live in milliseconds
   * @returns {Promise<*>} - Cached or computed value
   */
  async getOrSet(key, callback, ttl = this.defaultTTL) {
    const cachedValue = this.get(key);
    
    if (cachedValue !== null) {
      return cachedValue;
    }
    
    const value = await callback();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * Refresh a cached value
   * @param {string} key - Cache key
   * @param {Function} callback - Function to call to refresh value
   * @param {number} ttl - Time to live in milliseconds
   * @returns {Promise<*>} - New cached value
   */
  async refresh(key, callback, ttl = this.defaultTTL) {
    const value = await callback();
    this.set(key, value, ttl);
    return value;
  }
}

module.exports = new CacheService();
