package com.willcounter.api.config

import com.auth0.jwk.JwkProviderBuilder
import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.auth0.jwt.interfaces.DecodedJWT
import java.util.concurrent.TimeUnit

object Auth0Config {
    private val domain = System.getenv("AUTH0_DOMAIN") ?: ""
    private val audience = System.getenv("AUTH0_AUDIENCE") ?: ""
    
    init {
        if (domain.isEmpty() || audience.isEmpty()) {
            println("⚠️ Auth0 configuration incomplete. Please set AUTH0_DOMAIN and AUTH0_AUDIENCE environment variables.")
        }
    }
    
    private val jwkProvider = JwkProviderBuilder(domain)
        .cached(10, 24, TimeUnit.HOURS)
        .rateLimited(10, 1, TimeUnit.MINUTES)
        .build()

    fun verifyToken(token: String): DecodedJWT? {
        return try {
            val jwk = jwkProvider.get("latest")
            val algorithm = Algorithm.RSA256(jwk.publicKey as java.security.interfaces.RSAPublicKey, null)
            val verifier = JWT.require(algorithm)
                .withIssuer("https://$domain/")
                .withAudience(audience)
                .build()
            
            verifier.verify(token)
        } catch (e: Exception) {
            println("Token verification failed: ${e.message}")
            null
        }
    }

    fun extractUserId(jwt: DecodedJWT): String? {
        return jwt.subject
    }
}