package com.willcounter.api

import com.willcounter.api.config.DatabaseConfig
import com.willcounter.api.config.EnvironmentConfig
import com.willcounter.api.config.Auth0Config
import com.willcounter.api.config.configureAuthentication
import com.willcounter.api.services.DatabaseService
import com.willcounter.api.routes.userRoutes
import com.willcounter.api.routes.willCountRoutes
import com.willcounter.api.dto.ApiResponse
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.routing.*
import io.ktor.server.response.*
import io.ktor.http.*
import kotlinx.serialization.json.Json

fun main() {
    try {
        // Load and validate environment configuration
        val envConfig = EnvironmentConfig.load()
        
        // Initialize Auth0 with validated config
        Auth0Config.initialize(envConfig)
        
        // Initialize database
        println("Initializing database...")
        DatabaseConfig.init()
        println("Database initialized successfully")
        
        // Start server
        embeddedServer(Netty, port = 8080, host = "0.0.0.0", module = Application::module)
            .start(wait = true)
            
    } catch (e: Exception) {
        System.err.println("Failed to start application: ${e.message}")
        kotlin.system.exitProcess(1)
    }
}

fun Application.module() {
    // Configure authentication
    configureAuthentication()
    
    install(ContentNegotiation) {
        json(Json {
            prettyPrint = true
            isLenient = true
            ignoreUnknownKeys = true
        })
    }
    
    install(CORS) {
        allowMethod(HttpMethod.Options)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        allowMethod(HttpMethod.Patch)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Get)
        allowHeader(HttpHeaders.Authorization)
        allowHeader(HttpHeaders.ContentType)
        
        // For production, this should be configured with specific allowed hosts
        anyHost()
    }
    
    val databaseService = DatabaseService()
    
    routing {
        get("/") {
            call.respond(ApiResponse(
                success = true,
                data = mapOf(
                    "message" to "Will Counter API",
                    "version" to "1.0.0",
                    "environment" to "secure"
                ),
                message = "Welcome to Will Counter API"
            ))
        }
        
        get("/health") {
            call.respond(ApiResponse(
                success = true,
                data = mapOf(
                    "status" to "healthy",
                    "timestamp" to System.currentTimeMillis()
                ),
                message = "API is running and healthy"
            ))
        }
        
        // Add user routes
        userRoutes(databaseService)
        
        // Add will count routes
        willCountRoutes(databaseService)
    }
}