package com.openbuildright.reportmapper.backend.security

import com.openbuildright.reportmapper.backend.db.mongo.ObjectPermissionDocumentRepository
import com.openbuildright.reportmapper.backend.db.mongo.document.ObjectPermissionDocument
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service
import java.time.Instant
import java.util.UUID

@Service
class PermissionService(
    private val permissionRepository: ObjectPermissionDocumentRepository,
    private val jwtScopeExtractor: JwtScopeExtractor
) {
    
    /**
     * Check if a user has a specific permission on an object
     */
    fun hasPermission(
        objectType: ObjectType, 
        objectId: String, 
        permission: Permission, 
        authentication: Authentication?
    ): Boolean {
        val username = authentication?.name
        
        // Admin scope bypasses all permissions (synthetic admin permissions)
        if (authentication != null && jwtScopeExtractor.hasAdminScope(authentication)) {
            return true
        }
        
        // Special case: PUBLISH permission is available to all authenticated users
        if (permission == Permission.PUBLISH && username != null) {
            return true
        }
        
        // Check user-specific permissions first (most specific)
        if (username != null) {
            if (permissionRepository.existsByObjectTypeAndObjectIdAndUserAndPermission(
                objectType, objectId, username, permission.name
            )) {
                return true
            }
        }
        
        // Check role-based permissions (PUBLIC role for published objects)
        if (permissionRepository.existsByObjectTypeAndObjectIdAndRoleAndPermission(
            objectType, objectId, SystemRole.PUBLIC.name, permission.name
        )) {
            return true
        }
        
        return false
    }
    
    /**
     * Grant permissions to a role or user on an object
     */
    fun grantPermission(
        objectType: ObjectType,
        objectId: String,
        granteeType: PermissionGranteeType,
        grantee: String,
        permissions: Set<Permission>,
        grantedBy: String
    ): ObjectPermissionDocument {
        // Remove existing permissions for this grantee on this object
        val existing = permissionRepository.findByObjectTypeAndObjectIdAndGranteeTypeAndGrantee(
            objectType, objectId, granteeType, grantee
        )
        existing?.let { permissionRepository.deleteById(it.id) }
        
        // Create new permission
        val permission = ObjectPermissionDocument(
            id = UUID.randomUUID().toString(),
            objectType = objectType,
            objectId = objectId,
            granteeType = granteeType,
            grantee = grantee,
            permissions = permissions,
            grantedBy = grantedBy,
            grantedAt = Instant.now()
        )
        
        return permissionRepository.save(permission)
    }
    
    /**
     * Grant ownership permissions to a user (READ, UPDATE, DISABLE)
     */
    fun grantOwnership(
        objectType: ObjectType,
        objectId: String,
        ownerUsername: String
    ): ObjectPermissionDocument {
        val ownershipPermissions = setOf(Permission.READ, Permission.UPDATE, Permission.DISABLE)
        return grantPermission(
            objectType, 
            objectId, 
            PermissionGranteeType.USER, 
            ownerUsername, 
            ownershipPermissions, 
            "system"
        )
    }
    
    /**
     * Grant public read access to an object
     */
    fun grantPublicRead(objectType: ObjectType, objectId: String, grantedBy: String): ObjectPermissionDocument {
        return grantPermission(
            objectType, 
            objectId, 
            PermissionGranteeType.ROLE, 
            SystemRole.PUBLIC.name, 
            setOf(Permission.READ), 
            grantedBy
        )
    }
    
    /**
     * Revoke permissions for a grantee on an object
     */
    fun revokePermission(
        objectType: ObjectType, 
        objectId: String, 
        granteeType: PermissionGranteeType, 
        grantee: String
    ) {
        val existing = permissionRepository.findByObjectTypeAndObjectIdAndGranteeTypeAndGrantee(
            objectType, objectId, granteeType, grantee
        )
        existing?.let { permissionRepository.deleteById(it.id) }
    }
    
    /**
     * Delete all permissions for an object
     */
    fun deleteObjectPermissions(objectType: ObjectType, objectId: String) {
        permissionRepository.deleteByObjectTypeAndObjectId(objectType, objectId)
    }
    
    /**
     * Get all permissions for an object
     */
    fun getObjectPermissions(objectType: ObjectType, objectId: String): List<ObjectPermissionDocument> {
        return permissionRepository.findByObjectTypeAndObjectId(objectType, objectId)
    }
}
