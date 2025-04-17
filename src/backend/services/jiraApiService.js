const axios = require('axios');
const axiosRetry = require('axios-retry');
const cache = require('memory-cache');

/**
 * Service for interacting with the Jira API
 */
class JiraApiService {
  constructor() {
    this.baseUrl = process.env.JIRA_API_URL;
    this.apiVersion = process.env.JIRA_API_VERSION || '3';
    this.defaultCacheTTL = parseInt(process.env.JIRA_CACHE_TTL || 300000, 10); // 5 minutes in ms
    
    // Create axios instance with retry capability
    this.api = axios.create({
      baseURL: `${this.baseUrl}/rest/api/${this.apiVersion}`,
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    // Configure retry behavior
    axiosRetry(this.api, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        // Retry on network errors or 5xx server errors
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
               (error.response && error.response.status >= 500);
      }
    });
  }

  /**
   * Get authorization header with OAuth token
   * @param {string} accessToken - OAuth access token
   * @returns {Object} - Headers object with authorization
   */
  getAuthHeaders(accessToken) {
    return {
      'Authorization': `Bearer ${accessToken}`
    };
  }

  /**
   * Make a GET request to the Jira API
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @param {string} accessToken - OAuth access token
   * @param {boolean} useCache - Whether to use cache
   * @param {number} cacheTTL - Cache TTL in milliseconds
   * @returns {Promise<Object>} - API response
   */
  async get(endpoint, params = {}, accessToken, useCache = true, cacheTTL = this.defaultCacheTTL) {
    try {
      // Generate cache key based on endpoint and params
      const cacheKey = `jira_${endpoint}_${JSON.stringify(params)}`;
      
      // Check cache if enabled
      if (useCache) {
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
          console.log(`Cache hit for ${cacheKey}`);
          return cachedData;
        }
      }
      
      // Make API request
      const response = await this.api.get(endpoint, {
        params,
        headers: this.getAuthHeaders(accessToken)
      });
      
      // Cache response if enabled
      if (useCache && response.data) {
        cache.put(cacheKey, response.data, cacheTTL);
      }
      
      return response.data;
    } catch (error) {
      this.handleApiError(error, endpoint);
      throw error;
    }
  }

  /**
   * Make a POST request to the Jira API
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {string} accessToken - OAuth access token
   * @returns {Promise<Object>} - API response
   */
  async post(endpoint, data = {}, accessToken) {
    try {
      const response = await this.api.post(endpoint, data, {
        headers: this.getAuthHeaders(accessToken)
      });
      
      return response.data;
    } catch (error) {
      this.handleApiError(error, endpoint);
      throw error;
    }
  }

  /**
   * Make a PUT request to the Jira API
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {string} accessToken - OAuth access token
   * @returns {Promise<Object>} - API response
   */
  async put(endpoint, data = {}, accessToken) {
    try {
      const response = await this.api.put(endpoint, data, {
        headers: this.getAuthHeaders(accessToken)
      });
      
      return response.data;
    } catch (error) {
      this.handleApiError(error, endpoint);
      throw error;
    }
  }

  /**
   * Handle API errors
   * @param {Error} error - Error object
   * @param {string} endpoint - API endpoint
   */
  handleApiError(error, endpoint) {
    if (error.response) {
      // The request was made and the server responded with an error status
      console.error(`Jira API error for ${endpoint}: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error(`Jira API no response for ${endpoint}: ${error.message}`);
    } else {
      // Something happened in setting up the request
      console.error(`Jira API request error for ${endpoint}: ${error.message}`);
    }
  }

  /**
   * Clear cache for a specific key or pattern
   * @param {string} keyPattern - Cache key or pattern
   */
  clearCache(keyPattern) {
    // If no pattern provided, do nothing
    if (!keyPattern) return;
    
    // Get all cache keys
    const keys = Object.keys(cache.exportJson());
    
    // Filter keys matching the pattern
    const matchingKeys = keys.filter(key => key.includes(keyPattern));
    
    // Clear matching keys
    matchingKeys.forEach(key => cache.del(key));
    
    console.log(`Cleared ${matchingKeys.length} cache entries matching "${keyPattern}"`);
  }

  /**
   * Clear all cache
   */
  clearAllCache() {
    cache.clear();
    console.log('Cleared all Jira API cache');
  }
}

module.exports = new JiraApiService();
