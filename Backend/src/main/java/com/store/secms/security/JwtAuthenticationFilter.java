package com.store.secms.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        logger.info("=== Request: {} ===", request.getRequestURI());
        logger.info("Auth header: {}", authHeader != null ? "present" : "null");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            logger.info("Token: {}...", token.substring(0, Math.min(20, token.length())));
            
            try {
                    if (jwtUtil.validateToken(token)) {
                        String username = jwtUtil.extractUsername(token);
                        String role = jwtUtil.extractRole(token);
                        Long userId = jwtUtil.extractUserId(token);
                        
                        logger.info("Username: {}, Role: {}, UserId: {}", username, role, userId);
                        
                        if (role == null) {
                            role = "ROLE_CUSTOMER";
                        } else if (!role.startsWith("ROLE_")) {
                            role = "ROLE_" + role;
                        }

                        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(role));

                        UserPrincipal principal = new UserPrincipal(userId, username, "", authorities);
                        UsernamePasswordAuthenticationToken authentication = 
                                new UsernamePasswordAuthenticationToken(principal, null, authorities);
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        logger.info("=== Authentication SET with authorities: {} ===", authorities);
                    } else {
                    logger.warn("Token validation FAILED");
                }
            } catch (Exception e) {
                logger.error("Error processing JWT: {}", e.getMessage(), e);
            }
        } else {
            logger.info("No Bearer token in request");
        }

        filterChain.doFilter(request, response);
    }
}
