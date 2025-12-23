package com.example.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Configuration
public class RateLimitConfig {
    @Bean
    public Map<String, Map<String, Object>> rateLimitStore() {
        return new ConcurrentHashMap<>();
    }
    
    @Bean
    public RateLimiter rateLimiter(Map<String, Map<String, Object>> rateLimitStore) {
        return new RateLimiter(rateLimitStore, 5, 1, TimeUnit.MINUTES);
    }
    
    public static class RateLimiter {
        private final Map<String, Map<String, Object>> store;
        private final int limit;
        private final long timeWindowInMillis;
        
        public RateLimiter(Map<String, Map<String, Object>> store, int limit, long timeWindow, TimeUnit timeUnit) {
            this.store = store;
            this.limit = limit;
            this.timeWindowInMillis = timeUnit.toMillis(timeWindow);
        }
        
        public boolean isAllowed(String clientId, String endpoint) {
            String key = clientId + "|" + endpoint;
            long currentTime = System.currentTimeMillis();
            
            Map<String, Object> entry = store.compute(key, (k, v) -> {
                if (v == null) {
                    Map<String, Object> newEntry = new HashMap<>();
                    newEntry.put("count", 1);
                    newEntry.put("timestamp", currentTime);
                    return newEntry;
                }
                
                long lastTime = (Long) v.get("timestamp");
                if ((currentTime - lastTime) > timeWindowInMillis) {
                    v.put("count", 1);
                    v.put("timestamp", currentTime);
                } else {
                    v.put("count", (Integer)v.get("count") + 1);
                }
                return v;
            });
            
            int count = (Integer) entry.get("count");
            boolean allowed = count <= limit;
            
            if (!allowed) {
                long waitTime = timeWindowInMillis - (currentTime - (Long)entry.get("timestamp"));
                System.out.println("Rate limit exceeded for " + clientId + ":" + endpoint + 
                                 " - count=" + count + ", wait=" + waitTime + "ms");
            }
            
            return allowed;
        }
    }
}