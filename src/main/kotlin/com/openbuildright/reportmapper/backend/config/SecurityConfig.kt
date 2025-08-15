package com.openbuildright.reportmapper.backend.config

import io.swagger.v3.oas.models.Components
import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.security.OAuthFlow
import io.swagger.v3.oas.models.security.OAuthFlows
import io.swagger.v3.oas.models.security.Scopes
import io.swagger.v3.oas.models.security.SecurityRequirement
import io.swagger.v3.oas.models.security.SecurityScheme
import org.springframework.beans.factory.annotation.Value
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

@Configuration
class OpenAPISecurityConfig {
    @Value("\${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    var issuerUriString: String? = null

    @Bean
    fun openAPI(): OpenAPI? {
        return OpenAPI().components(
            Components()
                .addSecuritySchemes(OAUTH_SCHEME_NAME, createOAuthScheme())
        )
            .addSecurityItem(SecurityRequirement().addList(OAUTH_SCHEME_NAME))
            .info(
                Info().title("Todos Management Service")
                    .description("A service providing todos.")
                    .version("1.0")
            )
    }

    private fun createOAuthScheme(): SecurityScheme {
        val flows: OAuthFlows = createOAuthFlows()
        return SecurityScheme().type(SecurityScheme.Type.OAUTH2)
            .flows(flows)
    }

    private fun createOAuthFlows(): OAuthFlows {
        val flow: OAuthFlow = createAuthorizationCodeFlow()
        return OAuthFlows().implicit(flow)
    }

    private fun createAuthorizationCodeFlow(): OAuthFlow {
        return OAuthFlow()
            .authorizationUrl(issuerUriString + "/protocol/openid-connect/auth")
            .scopes(
                Scopes().addString("read_access", "read data")
                    .addString("write_access", "modify data")
            )
    }

    companion object {
        private const val OAUTH_SCHEME_NAME = "my_oAuth_security_schema"
    }
}