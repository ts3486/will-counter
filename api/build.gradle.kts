plugins {
    id("org.jetbrains.kotlin.jvm") version "1.9.25"
    id("org.jetbrains.kotlin.plugin.serialization") version "1.9.25"
    id("io.ktor.plugin") version "2.3.12"
    application
}

group = "com.willcounter.api"
version = "1.0.0"

application {
    mainClass.set("com.willcounter.api.ApplicationKt")
    
    val isDevelopment: Boolean = project.ext.has("development")
    
    // Load .env file if it exists and set as system properties
    val envFile = file(".env")
    val envProps = mutableListOf<String>()
    if (envFile.exists()) {
        envFile.readLines().forEach { line ->
            if (line.isNotBlank() && !line.startsWith("#")) {
                val parts = line.split("=", limit = 2)
                if (parts.size == 2) {
                    val key = parts[0].trim()
                    val value = parts[1].trim()
                    
                    // Validate environment variable name to prevent injection
                    if (key.matches(Regex("^[A-Z_][A-Z0-9_]*$"))) {
                        envProps.add("-D${key}=${value}")
                    }
                }
            }
        }
    }
    
    applicationDefaultJvmArgs = listOf("-Dio.ktor.development=$isDevelopment") + envProps
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("io.ktor:ktor-server-core-jvm")
    implementation("io.ktor:ktor-server-netty-jvm")
    implementation("io.ktor:ktor-server-content-negotiation")
    implementation("io.ktor:ktor-serialization-kotlinx-json")
    implementation("io.ktor:ktor-server-cors")
    implementation("io.ktor:ktor-server-auth-jvm")
    implementation("io.ktor:ktor-server-auth-jwt-jvm")
    
    // Ktor client dependencies for Supabase REST calls
    implementation("io.ktor:ktor-client-core")
    implementation("io.ktor:ktor-client-cio")
    implementation("io.ktor:ktor-client-content-negotiation")
    implementation("io.ktor:ktor-client-serialization")
    
    implementation("org.postgresql:postgresql:42.7.3")
    implementation("com.zaxxer:HikariCP:5.0.1")
    implementation("org.jetbrains.exposed:exposed-core:0.50.1")
    implementation("org.jetbrains.exposed:exposed-dao:0.50.1")
    implementation("org.jetbrains.exposed:exposed-jdbc:0.50.1")
    implementation("org.jetbrains.exposed:exposed-java-time:0.50.1")
    implementation("com.auth0:java-jwt:4.4.0")
    implementation("com.auth0:jwks-rsa:0.22.1")
    
    // JWE (JSON Web Encryption) support for encrypted tokens
    implementation("com.nimbusds:nimbus-jose-jwt:9.37.3")
    implementation("ch.qos.logback:logback-classic:1.4.14")
    testImplementation("io.ktor:ktor-server-tests-jvm")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit")
}

// Configure the run task to use environment variables
tasks.named<JavaExec>("run") {
    // Load .env file if it exists and set as system properties for the run task
    val envFile = file(".env")
    if (envFile.exists()) {
        envFile.readLines().forEach { line ->
            if (line.isNotBlank() && !line.startsWith("#")) {
                val parts = line.split("=", limit = 2)
                if (parts.size == 2) {
                    val key = parts[0].trim()
                    val value = parts[1].trim()
                    
                    // Validate environment variable name to prevent injection
                    if (key.matches(Regex("^[A-Z_][A-Z0-9_]*$"))) {
                        systemProperty(key, value)
                    }
                }
            }
        }
    }
}