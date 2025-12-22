package com.example.backend.ratelimiter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final String KEY = "rate_limit";
    private static final int LIMIT = 5;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        if (request.getRequestURI().equals("/api/test")) {
            Long count = redisTemplate.opsForValue().increment(KEY);
            redisTemplate.expire(KEY, Duration.ofSeconds(60));

            if (count != null && count > LIMIT) {
                response.setStatus(429);
                response.getWriter().write("Too many requests");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    public int getCurrentCount() {
        String value = redisTemplate.opsForValue().get(KEY);
        return value == null ? 0 : Integer.parseInt(value);
    }

    public int getLimit() {
        return LIMIT;
    }
}
