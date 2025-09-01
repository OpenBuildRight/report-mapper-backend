package com.openbuildright.reportmapper.backend.security

/**
 * Available permissions for objects
 */
enum class Permission {
    READ,
    UPDATE,
    CREATE,
    DISABLE,
    PUBLISH,
    DELETE
}

/**
 * Types of objects that can have permissions
 */
enum class ObjectType {
    OBSERVATION,
    IMAGE,
}

/**
 * System roles that are built-in
 */
enum class SystemRole {
    PUBLIC,        // Everyone (including unauthenticated)
    AUTHENTICATED, // All logged-in users  
    ADMIN          // Admin scope bypass
}

/**
 * Types of entities that can receive permissions
 */
enum class PermissionGranteeType {
    ROLE,  // System roles or custom roles
    USER   // Individual users
}

data class ObjectPermissionCreateModel(
    val objectType: ObjectType,
    val objectId: String,
    val granteeType: PermissionGranteeType,
    val grantee: String,
    val permission: Permission
)

data class ObjectPermissionModel(
    val id: String,
    val objectType: ObjectType,
    val objectId: String,
    val granteeType: PermissionGranteeType,
    val grantee: String,
    val permission: Permission
)

interface ControllableObject {
    val objectType: ObjectType
    fun getTargetId(): String?
} 