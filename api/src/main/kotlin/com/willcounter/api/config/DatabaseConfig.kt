package com.willcounter.api.config

import com.willcounter.api.models.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource

object DatabaseConfig {
    
    fun init() {
        val supabaseUrl = System.getenv("SUPABASE_URL") ?: "https://mrbyvoccayqxddwrnsye.supabase.co"
        val supabaseKey = System.getenv("SUPABASE_SERVICE_ROLE_KEY") ?: System.getenv("SUPABASE_ANON_KEY") ?: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYnl2b2NjYXlxeGRkd3Juc3llIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjAwNjYzOCwiZXhwIjoyMDYxNTgyNjM4fQ.XcWsv0uJ4UfrL4usgwUmk40Ktq93u-m8lWQ_V3XlgKA"
        
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