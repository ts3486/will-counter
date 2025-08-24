package com.willcounter.api.config

import com.auth0.jwk.JwkProviderBuilder
import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.auth0.jwt.interfaces.DecodedJWT
import java.util.concurrent.TimeUnit

object Auth0Config {
    private val domain = System.getProperty("AUTH0_DOMAIN") ?: System.getenv("AUTH0_DOMAIN") ?: ""
    private val audience = System.getProperty("AUTH0_AUDIENCE") ?: System.getenv("AUTH0_AUDIENCE") ?: ""
    
    private val jwkProvider by lazy {
        if (domain.isEmpty()) {
            throw IllegalStateException("AUTH0_DOMAIN must be set")
        }
        JwkProviderBuilder(domain)
            .cached(10, 24, TimeUnit.HOURS)
            .rateLimited(10, 1, TimeUnit.MINUTES)
            .build()
    }

    fun verifyToken(token: String): DecodedJWT? {
        return try {
            val parts = token.split(".")
            
            // Only accept standard 3-part JWT tokens for security
            if (parts.size == 3) {
                return verifyJWTToken(token)
            } else {
                return null
            }
        } catch (e: Exception) {
            null
        }
    }
    
    private fun verifyJWTToken(token: String): DecodedJWT? {
        return try {
            if (domain.isEmpty() || audience.isEmpty()) {
                return null
            }
            
            // Parse token header to get key ID
            val jwt = JWT.decode(token)
            val keyId = jwt.keyId
            
            // Get JWK using the key ID from the token
            val jwk = if (keyId != null) {
                jwkProvider.get(keyId)
            } else {
                jwkProvider.get("latest")
            }
            
            val algorithm = Algorithm.RSA256(jwk.publicKey as java.security.interfaces.RSAPublicKey, null)
            val verifier = JWT.require(algorithm)
                .withIssuer("https://$domain/")
                .withAudience(audience)
                .build()
            
            verifier.verify(token)
        } catch (e: Exception) {
            null
        }
    }
    

    fun extractUserId(jwt: DecodedJWT): String? {
        return jwt.subject
    }
}