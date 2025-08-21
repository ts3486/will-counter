package com.willcounter.api

import com.willcounter.api.config.DatabaseConfig
import com.willcounter.api.config.configureAuthentication
import com.willcounter.api.services.DatabaseService
import com.willcounter.api.services.SupabaseClient
import com.willcounter.api.routes.userRoutes
import com.willcounter.api.routes.willCountRoutes
import com.willcounter.api.routes.secureWillCountRoutes
import com.willcounter.api.dto.HealthResponse
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
import java.time.LocalDateTime

fun main() {
    // Initialize database
    try {
        DatabaseConfig.init()
    } catch (e: Exception) {
        return
    }
    
    embeddedServer(Netty, port = 8080, host = "0.0.0.0", module = Application::module)
        .start(wait = true)
}

fun Application.module() {
    // Configure authentication
    configureAuthentication()
    
    // Security middleware will be added via response headers in routing
    
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
        
        // Secure CORS - only allow specific hosts
        allowHost("localhost:3000") // React dev server
        allowHost("localhost:8081") // Expo dev server  
        allowHost("127.0.0.1:3000")
        allowHost("127.0.0.1:8081")
        
        // Add production domains when deployed
        // allowHost("your-production-domain.com", schemes = listOf("https"))
        
        // Allow credentials for authenticated requests
        allowCredentials = true
    }
    
    val databaseService = DatabaseService()
    val supabaseClient = SupabaseClient()
    
    routing {
        get("/") {
            call.respond(ApiResponse(
                success = true,
                data = mapOf("message" to "Will Counter API", "version" to "1.0.0"),
                message = "Welcome to Will Counter API"
            ))
        }
        
        get("/health") {
            try {
                val supabaseHealthy = supabaseClient.healthCheck()
                val dbHealthy = databaseService.testConnection()
                
                if (supabaseHealthy && dbHealthy) {
                    call.respondText("API is running and healthy - All services connected", ContentType.Text.Plain)
                } else {
                    call.respond(HttpStatusCode.ServiceUnavailable, "Service unavailable - Database connectivity issues")
                }
            } catch (e: Exception) {
                call.respond(HttpStatusCode.ServiceUnavailable, "Service unavailable: ${e.message}")
            }
        }
        
        
        // Secure Supabase-based routes (recommended)
        secureWillCountRoutes(supabaseClient)
        
        // Legacy routes for backward compatibility (can be removed after migration)
        userRoutes(databaseService)
        willCountRoutes(databaseService)
    }
}