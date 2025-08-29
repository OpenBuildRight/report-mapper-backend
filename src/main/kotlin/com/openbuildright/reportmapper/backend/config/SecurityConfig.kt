package com.openbuildright.reportmapper.backend.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter
import org.springframework.security.web.SecurityFilterChain
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource


@Configuration
@EnableWebSecurity
@EnableMethodSecurity
class SecurityConfig(
    private val corsConfig: CorsConfig
) {

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .cors { it.configurationSource(corsConfigurationSource()) }
            .authorizeHttpRequests {
                it.requestMatchers(
                    "/swagger-ui/*",
                    "/v3/api-docs",
                    "/v3/api-docs/*",
                    "/image/published/**"  // Allow published images without authentication
                    ).permitAll()
                it.anyRequest().authenticated()
            }.oauth2ResourceServer { 
                it.jwt { 
                    it.jwtAuthenticationConverter(jwtAuthenticationConverter())
                } 
            }
        return http.build()
    }

    @Bean
    fun jwtAuthenticationConverter(): JwtAuthenticationConverter {
        val jwtGrantedAuthoritiesConverter = JwtGrantedAuthoritiesConverter()
        jwtGrantedAuthoritiesConverter.setAuthoritiesClaimName("scope")
        jwtGrantedAuthoritiesConverter.setAuthorityPrefix("ROLE_")
        
        val jwtAuthenticationConverter = JwtAuthenticationConverter()
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter)
        
        return jwtAuthenticationConverter
    }

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration()
        configuration.allowedOriginPatterns = corsConfig.allowedOrigins
        configuration.allowedMethods = corsConfig.allowedMethods
        configuration.allowedHeaders = corsConfig.allowedHeaders
        configuration.allowCredentials = corsConfig.allowCredentials
        configuration.maxAge = corsConfig.maxAge
        
        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        return source
    }
}
