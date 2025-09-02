package com.openbuildright.reportmapper.backend.config

import com.openbuildright.reportmapper.backend.security.SystemRole
import io.swagger.v3.oas.models.OpenAPI
import org.springframework.context.annotation.Configuration
import io.swagger.v3.oas.models.Components
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.security.OAuthFlow
import io.swagger.v3.oas.models.security.OAuthFlows
import io.swagger.v3.oas.models.security.Scopes
import io.swagger.v3.oas.models.security.SecurityRequirement
import io.swagger.v3.oas.models.security.SecurityScheme
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean

@Configuration
class OpenAPISecurityConfig {
    @Value("\${swagger.authorization-url:http://localhost:9003/realms/my-realm/protocol/openid-connect/auth}")
    var authorizationUrl: String? = null

    @Bean
    fun openAPI(): OpenAPI? {
        return OpenAPI().components(
            Components()
                .addSecuritySchemes(OAUTH_SCHEME_NAME, createOAuthScheme())
        )
            .addSecurityItem(SecurityRequirement().addList(OAUTH_SCHEME_NAME))
            .info(
                Info().title("Report Mapper Backend API")
                    .description("A service for managing observations and images.")
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
            .authorizationUrl(authorizationUrl)
            .scopes(
                Scopes().addString(SystemRole.ADMIN.name, "Administrator")
            )
    }

    companion object {
        private const val OAUTH_SCHEME_NAME = "OAuthSchema"
    }
}
