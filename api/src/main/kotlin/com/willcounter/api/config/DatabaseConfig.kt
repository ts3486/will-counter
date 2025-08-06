package com.willcounter.api.config

import com.willcounter.api.models.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import kotlinx.coroutines.runBlocking
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.net.URI

object DatabaseConfig {
    
    fun init() {
        val supabaseUrl = System.getenv("SUPABASE_URL") ?: ""
        val supabaseKey = System.getenv("SUPABASE_SERVICE_ROLE_KEY") ?: System.getenv("SUPABASE_ANON_KEY") ?: ""
        
        if (supabaseUrl.isEmpty() || supabaseKey.isEmpty()) {
            println("⚠️ Supabase configuration incomplete. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) environment variables.")
            return
        }
        
        // Test Supabase REST API connection instead of direct database
        println("Testing Supabase REST API connection...")
        if (testSupabaseConnection(supabaseUrl, supabaseKey)) {
            println("Supabase REST API connection successful")
        } else {
            println("Warning: Supabase REST API connection failed")
        }
    }
    
    private fun testSupabaseConnection(supabaseUrl: String, supabaseKey: String): Boolean {
        return try {
            val client = HttpClient.newHttpClient()
            val request = HttpRequest.newBuilder()
                .uri(URI.create("$supabaseUrl/rest/v1/"))
                .header("apikey", supabaseKey)
                .header("Authorization", "Bearer $supabaseKey")
                .GET()
                .build()
            
            val response = client.send(request, HttpResponse.BodyHandlers.ofString())
            response.statusCode() in 200..299
        } catch (e: Exception) {
            println("Supabase connection test failed: ${e.message}")
            false
        }
    }
    
    fun testConnection(): Boolean = try {
        val supabaseUrl = System.getenv("SUPABASE_URL") ?: ""
        val supabaseKey = System.getenv("SUPABASE_SERVICE_ROLE_KEY") ?: System.getenv("SUPABASE_ANON_KEY") ?: ""
        
        if (supabaseUrl.isEmpty() || supabaseKey.isEmpty()) {
            println("Database connection test failed: Missing environment variables")
            false
        } else {
            testSupabaseConnection(supabaseUrl, supabaseKey)
        }
    } catch (e: Exception) {
        println("Database connection test failed: ${e.message}")
        false
    }
}