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
        val supabaseUrl = System.getProperty("SUPABASE_URL") ?: System.getenv("SUPABASE_URL") ?: ""
        val supabaseKey = System.getProperty("SUPABASE_SERVICE_ROLE_KEY") ?: System.getProperty("SUPABASE_ANON_KEY") 
                           ?: System.getenv("SUPABASE_SERVICE_ROLE_KEY") ?: System.getenv("SUPABASE_ANON_KEY") ?: ""
        
        if (supabaseUrl.isEmpty() || supabaseKey.isEmpty()) {
            return
        }
        
        // Test Supabase REST API connection
        testSupabaseConnection(supabaseUrl, supabaseKey)
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
            false
        }
    }
    
    fun testConnection(): Boolean = try {
        val supabaseUrl = System.getProperty("SUPABASE_URL") ?: System.getenv("SUPABASE_URL") ?: ""
        val supabaseKey = System.getProperty("SUPABASE_SERVICE_ROLE_KEY") ?: System.getProperty("SUPABASE_ANON_KEY") 
                           ?: System.getenv("SUPABASE_SERVICE_ROLE_KEY") ?: System.getenv("SUPABASE_ANON_KEY") ?: ""
        
        if (supabaseUrl.isEmpty() || supabaseKey.isEmpty()) {
            false
        } else {
            testSupabaseConnection(supabaseUrl, supabaseKey)
        }
    } catch (e: Exception) {
        false
    }
}