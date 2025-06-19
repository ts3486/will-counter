plugins {
    id("org.jetbrains.kotlin.jvm") version "1.9.25"
    id("io.ktor.plugin") version "2.3.12"
    application
}

group = "com.willcounter.api"
version = "1.0.0"

application {
    mainClass.set("com.willcounter.api.ApplicationKt")
    
    val isDevelopment: Boolean = project.ext.has("development")
    applicationDefaultJvmArgs = listOf("-Dio.ktor.development=$isDevelopment")
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
    implementation("org.postgresql:postgresql:42.7.3")
    implementation("com.zaxxer:HikariCP:5.0.1")
    implementation("org.jetbrains.exposed:exposed-core:0.50.1")
    implementation("org.jetbrains.exposed:exposed-dao:0.50.1")
    implementation("org.jetbrains.exposed:exposed-jdbc:0.50.1")
    implementation("org.jetbrains.exposed:exposed-java-time:0.50.1")
    implementation("com.auth0:java-jwt:4.4.0")
    implementation("com.auth0:jwks-rsa:0.22.1")
    implementation("ch.qos.logback:logback-classic:1.4.14")
    testImplementation("io.ktor:ktor-server-tests-jvm")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit")
}