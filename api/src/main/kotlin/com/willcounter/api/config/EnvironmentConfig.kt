package com.willcounter.api.config

import kotlin.system.exitProcess

object EnvironmentConfig {
    data class Config(
        val auth0Domain: String,
        val auth0Audience: String,
        val databaseUrl: String
    )
    
    private fun getRequiredEnvVar(name: String): String {
        return System.getenv(name) ?: run {
            System.err.println("ERROR: Required environment variable '$name' is not set")
            exitProcess(1)
        }
    }
    
    private fun validateConfig(config: Config) {
        // Validate Auth0 domain format
        if (!config.auth0Domain.matches(Regex("^[a-zA-Z0-9.-]+\\.(auth0\\.com|us\\.auth0\\.com|eu\\.auth0\\.com|au\\.auth0\\.com)$"))) {
            System.err.println("ERROR: Invalid AUTH0_DOMAIN format")
            exitProcess(1)
        }
        
        // Validate Auth0 audience format (should be a valid URL)
        if (!config.auth0Audience.matches(Regex("^https?://.+"))) {
            System.err.println("ERROR: Invalid AUTH0_AUDIENCE format - should be a valid URL")
            exitProcess(1)
        }
        
        // Validate database URL format
        if (!config.databaseUrl.startsWith("postgresql://")) {
            System.err.println("ERROR: Invalid DATABASE_URL format - should start with postgresql://")
            exitProcess(1)
        }
    }
    
    fun load(): Config {
        println("Loading and validating environment configuration...")
        
        val config = Config(
            auth0Domain = getRequiredEnvVar("AUTH0_DOMAIN"),
            auth0Audience = getRequiredEnvVar("AUTH0_AUDIENCE"),
            databaseUrl = getRequiredEnvVar("DATABASE_URL")
        )
        
        validateConfig(config)
        
        println("Environment configuration loaded successfully")
        // Log non-sensitive config for debugging
        println("Auth0 Domain: ${config.auth0Domain}")
        println("Auth0 Audience: ${maskUrl(config.auth0Audience)}")
        println("Database: ${maskDatabaseUrl(config.databaseUrl)}")
        
        return config
    }
    
    private fun maskUrl(url: String): String {
        return url.replaceAfter("://", "***")
    }
    
    private fun maskDatabaseUrl(url: String): String {
        return url.replace(Regex("://[^@]+@"), "://***@")
    }
}