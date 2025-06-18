package com.willcounter.api.config

import com.willcounter.api.models.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource

object DatabaseConfig {
    
    fun init() {
        val supabaseUrl = System.getenv("SUPABASE_URL") ?: "YOUR_SUPABASE_URL"
        val supabaseKey = System.getenv("SUPABASE_SERVICE_ROLE_KEY") ?: System.getenv("SUPABASE_ANON_KEY") ?: "YOUR_SUPABASE_KEY"
        
        val projectId = supabaseUrl.replace("https://", "").replace(".supabase.co", "")
        
        val config = HikariConfig().apply {
            driverClassName = "org.postgresql.Driver"
            jdbcUrl = "jdbc:postgresql://$projectId.supabase.co:5432/postgres"
            username = "postgres"
            password = supabaseKey
            maximumPoolSize = 10
            addDataSourceProperty("sslmode", "require")
        }
        
        val dataSource = HikariDataSource(config)
        Database.connect(dataSource)
        
        transaction {
            SchemaUtils.createMissingTablesAndColumns(Users, WillCounts)
        }
    }
    
    fun testConnection(): Boolean = try {
        transaction {
            Users.selectAll().limit(1).count() >= 0
        }
    } catch (e: Exception) {
        println("Database connection test failed: ${e.message}")
        false
    }
}