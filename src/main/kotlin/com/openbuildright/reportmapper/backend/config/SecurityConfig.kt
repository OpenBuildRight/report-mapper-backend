package com.openbuildright.reportmapper.backend.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.web.SecurityFilterChain


@Configuration
@EnableWebSecurity
class SecurityConfig {

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http.authorizeHttpRequests {
            it.requestMatchers(
                "/swagger-ui/*",
                "/v3/api-docs",
                "/v3/api-docs/*"
                ).permitAll()
            it.anyRequest().authenticated()
        }.oauth2ResourceServer { it.jwt {  } }
        return http.build()
    }
}
