package com.example.alumniassocaition1.security;

import io.jsonwebtoken.*;
// Specific import
import io.jsonwebtoken.security.Keys;
// Removed: import io.jsonwebtoken.io.Decoders; // Was unused

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${app.jwtSecret}")
    private String jwtSecretString;

    @Value("${app.jwtExpirationInMs}")
    private int jwtExpirationInMs;

    private SecretKey jwtSecretKey;

    @PostConstruct
    public void init() {
        // Ensure the secret is strong enough for HS512 (at least 64 bytes)
        if (jwtSecretString == null || jwtSecretString.getBytes().length < 64) { // Check byte length for more accuracy
            logger.warn("JWT Secret ('app.jwtSecret') is weak, not configured, or too short (requires at least 64 bytes for HS512). " +
                    "Using a default, dynamically generated secure key. PLEASE CONFIGURE a strong 'app.jwtSecret' in your application.properties for production.");
            this.jwtSecretKey = Keys.secretKeyFor(SignatureAlgorithm.HS512); // Generates a secure key
        } else {
            // Assuming jwtSecretString is a plain string. If it were Base64 encoded, you'd use Decoders.BASE64.decode()
            this.jwtSecretKey = Keys.hmacShaKeyFor(jwtSecretString.getBytes());
        }
    }

    public String generateToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        return Jwts.builder()
                .setSubject(userPrincipal.getUsername()) // Typically email
                .setIssuedAt(now) // Use the 'now' variable
                .setExpiration(expiryDate)
                .signWith(jwtSecretKey, SignatureAlgorithm.HS512) // Ensure algorithm matches key type
                .compact();
    }

    public String getUsernameFromJWT(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(jwtSecretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parser()
                    .setSigningKey(jwtSecretKey)
                    .build()
                    .parseClaimsJws(authToken);
            return true;
        } catch (MalformedJwtException ex) {
            logger.error("Invalid JWT token: {}", ex.getMessage());
        } catch (ExpiredJwtException ex) {
            logger.error("Expired JWT token: {}", ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            logger.error("Unsupported JWT token: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            // This can happen if the token string is null or empty, or if claims are malformed.
            logger.error("JWT claims string is empty or argument is invalid: {}", ex.getMessage());
        } catch (io.jsonwebtoken.security.SecurityException ex) { // Catches signature errors
            logger.error("JWT signature validation failed: {}", ex.getMessage());
        } catch (Exception e) { // Catch any other unexpected JWT parsing errors
            logger.error("Could not validate JWT token for an unexpected reason: {}", e.getMessage());
        }
        return false;
    }
}
