package com.openbuildright.reportmapper.backend.security

import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.beans.factory.annotation.Autowire
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.access.PermissionEvaluator
import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service
import java.io.Serializable

fun extractScopes(authentication: Authentication?) : Set<String> {
    val principal : Jwt? = authentication?.principal as Jwt?
    val scopesClaim: String? = principal?.claims?.get("scope")?.toString()
    return scopesClaim?.split(" ")?.asSequence()?.filter{ it.isNotBlank() }?.toSet() ?: setOf<String>()
}

@Service
class RmPermissionEvaluator(
    @Autowired  val permissionService: PermissionService
) : PermissionEvaluator {

    private val logger = KotlinLogging.logger {}

    override fun hasPermission(
        authentication: Authentication?,
        targetDomainObject: Any?,
        permission: Any?
    ): Boolean {
        val controllableObject = targetDomainObject as ControllableObject
        return this.permissionService.hasPermission(
            objectType = controllableObject.objectType,
            objectId = controllableObject.getTargetId(),
            isAuthenticated = authentication?.isAuthenticated ?: false,
            permission = Permission.valueOf(permission!!.toString()),
            userId = authentication?.name,
            scopes = extractScopes(authentication).toSet()
        )

    }

    override fun hasPermission(
        authentication: Authentication?,
        targetId: Serializable?,
        targetType: String?,
        permission: Any?
    ): Boolean {
        return this.permissionService.hasPermission(
            objectType = ObjectType.valueOf(targetType!!),
            objectId = targetId!!.toString(),
            isAuthenticated = authentication?.isAuthenticated ?: false,
            permission = Permission.valueOf(permission!!.toString()),
            userId = authentication?.name,
            scopes = extractScopes(authentication).toSet()
            )
    }
}