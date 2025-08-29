package com.openbuildright.reportmapper.backend.security

/**
 * Available permissions for objects
 */
enum class Permission {
    READ,      // View the object
    UPDATE,    // Modify the object (but not delete)
    CREATE,    // Create new objects of this type
    DISABLE,   // Disable/enable the object (soft delete)
    PUBLISH    // Publish/unpublish the object (grant/revoke public access)
}

/**
 * Types of objects that can have permissions
 */
enum class ObjectType {
    OBSERVATION,
    IMAGE
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
