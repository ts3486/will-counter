package com.willcounter.api.config

import com.auth0.jwk.JwkProviderBuilder
import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.auth0.jwt.interfaces.DecodedJWT
import java.util.concurrent.TimeUnit

object Auth0Config {
    private lateinit var config: EnvironmentConfig.Config
    private lateinit var jwkProvider: com.auth0.jwk.JwkProvider
    
    fun initialize(envConfig: EnvironmentConfig.Config) {
        config = envConfig
        jwkProvider = JwkProviderBuilder(config.auth0Domain)
            .cached(10, 24, TimeUnit.HOURS)
            .rateLimited(10, 1, TimeUnit.MINUTES)
            .build()
    }

    fun verifyToken(token: String): DecodedJWT? {
        if (!::config.isInitialized) {
            throw IllegalStateException("Auth0Config not initialized. Call initialize() first.")
        }
        
        return try {
            val jwk = jwkProvider.get("latest")
            val algorithm = Algorithm.RSA256(jwk.publicKey as java.security.interfaces.RSAPublicKey, null)
            val verifier = JWT.require(algorithm)
                .withIssuer("https://${config.auth0Domain}/")
                .withAudience(config.auth0Audience)
                .build()
            
            verifier.verify(token)
        } catch (e: Exception) {
            // Log error without exposing sensitive details
            println("Token verification failed: Authentication error")
            null
        }
    }

    fun extractUserId(jwt: DecodedJWT): String? {
        return jwt.subject
    }
}