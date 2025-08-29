package com.openbuildright.reportmapper.backend.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration

@Configuration
@ConfigurationProperties(prefix = "cors")
data class CorsConfig(
    var allowedOrigins: List<String> = listOf("http://localhost:3000", "http://127.0.0.1:3000"),
    var allowedMethods: List<String> = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS"),
    var allowedHeaders: List<String> = listOf("*"),
    var allowCredentials: Boolean = true,
    var maxAge: Long = 3600L
)
