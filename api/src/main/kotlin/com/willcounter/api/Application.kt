package com.willcounter.api

import com.willcounter.api.config.DatabaseConfig
import com.willcounter.api.config.configureAuthentication
import com.willcounter.api.services.DatabaseService
import com.willcounter.api.routes.userRoutes
import com.willcounter.api.routes.willCountRoutes
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
    // Note: Database initialization skipped - using Supabase service directly
    println("Starting Will Counter API (Supabase mode)...")
    
    embeddedServer(Netty, port = 8080, host = "0.0.0.0", module = Application::module)
        .start(wait = true)
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
        anyHost()
    }
    
    val databaseService = DatabaseService()
    
    routing {
        get("/") {
            call.respond(ApiResponse(
                success = true,
                data = mapOf("message" to "Will Counter API", "version" to "1.0.0"),
                message = "Welcome to Will Counter API"
            ))
        }
        
        get("/health") {
            call.respondText("API is running and healthy", ContentType.Text.Plain)
        }
        
        // Add user routes
        userRoutes(databaseService)
        
        // Add will count routes
        willCountRoutes(databaseService)
    }
}