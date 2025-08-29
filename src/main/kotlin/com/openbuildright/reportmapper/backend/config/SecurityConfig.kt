package com.openbuildright.reportmapper.backend.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.web.SecurityFilterChain
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource


@Configuration
@EnableWebSecurity
class SecurityConfig {

    @Value("\${cors.allowed-origins:http://localhost:3000,http://127.0.0.1:3000}")
    private lateinit var allowedOrigins: String

    @Value("\${cors.allowed-methods:GET,POST,PUT,DELETE,OPTIONS}")
    private lateinit var allowedMethods: String

    @Value("\${cors.allowed-headers:*}")
    private lateinit var allowedHeaders: String

    @Value("\${cors.allow-credentials:true}")
    private var allowCredentials: Boolean = true

    @Value("\${cors.max-age:3600}")
    private var maxAge: Long = 3600L

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .cors { it.configurationSource(corsConfigurationSource()) }
            .authorizeHttpRequests {
                it.requestMatchers(
                    "/swagger-ui/*",
                    "/v3/api-docs",
                    "/v3/api-docs/*"
                    ).permitAll()
                it.anyRequest().authenticated()
            }.oauth2ResourceServer { it.jwt {  } }
        return http.build()
    }

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration()
        configuration.allowedOriginPatterns = allowedOrigins.split(",").map { it.trim() }
        configuration.allowedMethods = allowedMethods.split(",").map { it.trim() }
        configuration.allowedHeaders = if (allowedHeaders == "*") listOf("*") else allowedHeaders.split(",").map { it.trim() }
        configuration.allowCredentials = allowCredentials
        configuration.maxAge = maxAge
        
        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        return source
    }
}
