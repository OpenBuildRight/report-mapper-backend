package com.openbuildright.reportmapper.backend.security

import com.openbuildright.reportmapper.backend.security.db.mongo.document.ObjectPermissionDocument
import com.openbuildright.reportmapper.backend.security.db.mongo.repository.ObjectPermissionDocumentRepository
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.stereotype.Service

@Service
class PermissionService(
    private val permissionRepository: ObjectPermissionDocumentRepository,
) {


    private val logger = KotlinLogging.logger {}
    val defaultRolePermissions: Set<ObjectPermissionModel> = sequenceOf<ObjectPermissionCreateModel>(
        ObjectPermissionCreateModel(
            ObjectType.OBSERVATION,
            "*",
            PermissionGranteeType.ROLE,
            SystemRole.AUTHENTICATED.toString(),
            Permission.CREATE
        ),
        ObjectPermissionCreateModel(
            ObjectType.IMAGE,
            "*",
            PermissionGranteeType.ROLE,
            SystemRole.AUTHENTICATED.toString(),
            Permission.CREATE
        ),
        ObjectPermissionCreateModel(
            ObjectType.IMAGE,
            "*",
            PermissionGranteeType.ROLE,
            SystemRole.ADMIN.toString(),
            Permission.READ
        ),
        ObjectPermissionCreateModel(
            ObjectType.OBSERVATION,
            "*",
            PermissionGranteeType.ROLE,
            SystemRole.ADMIN.toString(),
            Permission.READ
        ),
        ObjectPermissionCreateModel(
            ObjectType.OBSERVATION,
            "*",
            PermissionGranteeType.ROLE,
            SystemRole.ADMIN.toString(),
            Permission.DISABLE
        ),
        ObjectPermissionCreateModel(
            ObjectType.OBSERVATION,
            "*",
            PermissionGranteeType.ROLE,
            SystemRole.ADMIN.toString(),
            Permission.PUBLISH
        )
    ).map {
        ObjectPermissionModel(
            permissionIdHash(it),
            it.objectType,
            it.objectId,
            it.granteeType,
            it.grantee,
            it.permission
        )
    }.toSet()

    /**
     * Create a permission id based on attributes.
     */
    fun permissionIdHash(
        grant: ObjectPermissionCreateModel
    ): String {
        return Integer.toHexString(grant.hashCode())
    }


    fun getUserRoles(
        isAuthenticated: Boolean,
        scopes: Set<String>
    ): Set<SystemRole> {
        val roles: MutableSet<SystemRole> = mutableSetOf(
            SystemRole.PUBLIC
        )
        if (isAuthenticated) {
            roles.add(SystemRole.AUTHENTICATED)
            if (scopes.contains(SystemRole.ADMIN.toString())) {
                roles.add(SystemRole.ADMIN)
            }
        }
        return roles.toSet()
    }

    fun getObjectTypeDefaultRolePermissions(
        objectType: ObjectType,
        role: SystemRole,
    ): Set<ObjectPermissionModel> {
        return defaultRolePermissions.asSequence().filter {
            it.grantee == role.toString()
                    && it.objectType == objectType
                    && it.objectId == "*"
                    && it.granteeType == PermissionGranteeType.ROLE
        }.toSet()
    }

    fun getPermissions(
        objectType: ObjectType,
        objectId: String?,
        isAuthenticated: Boolean,
        userId: String?,
        scopes: Set<String>
    ): Set<ObjectPermissionModel> {
        val permissions: MutableSet<ObjectPermissionModel> = mutableSetOf()
        val roles: Set<SystemRole> = getUserRoles(
            isAuthenticated = isAuthenticated,
            scopes = scopes
        )
        for (role in roles) {
            // ToDo: Add Concurrency Or Make Optimized Query
            permissions.addAll(
                getObjectTypeDefaultRolePermissions(
                    objectType,
                    role
                )
            )
            if (objectId != null) {
                val permissionsDocuments: List<ObjectPermissionDocument> =
                    permissionRepository.findByObjectTypeAndObjectIdAndGranteeTypeAndGrantee(
                        objectType,
                        objectId,
                        PermissionGranteeType.ROLE,
                        role.toString()
                    )
                permissions.addAll(permissionsDocuments.asSequence().map { it.toObjectPermissionModel() })
            }
        }
        if (objectId != null) {
            if (isAuthenticated && userId != null) {
                val userPermissionDocuments: List<ObjectPermissionDocument> =
                    permissionRepository.findByObjectTypeAndObjectIdAndGranteeTypeAndGrantee(
                        objectType,
                        objectId,
                        PermissionGranteeType.USER,
                        userId
                    )
                permissions.addAll(userPermissionDocuments.asSequence().map { it.toObjectPermissionModel() })
            }
        }
        logger.debug { "Obtained permissions ${permissions}" }
        return permissions
    }

    /**
     * Check if a user has a specific permission on an object
     */
    fun hasPermission(
        objectType: ObjectType,
        objectId: String?,
        permission: Permission,
        isAuthenticated: Boolean,
        userId: String?,
        scopes: Set<String>
    ): Boolean {
        logger.debug {
            "Determining request has permission ${permission} on ${objectType} ${objectId}."
        }
        if (isAuthenticated) {
            logger.debug { "User ${userId} has scopes ${scopes}" }
        }
        val userRoles: Set<SystemRole> = getUserRoles(
            isAuthenticated,
            scopes
        )
        logger.debug {
            "Request has roles ${userRoles}"
        }
        // Try default permissions first so we don't have to query the database.
        for (role in userRoles) {
            val defaultPermissionsForRole = getObjectTypeDefaultRolePermissions(
                objectType, role
            )
            // Minimize loops because performance matters here.
            for (op in defaultPermissionsForRole) {
                if (op.permission == permission) {
                    logger.debug { "Access approved using default permission for role ${role} : ${op}" }
                    return true
                }
            }
        }
        // Now we query the database to get all permissions.
        val allPermissions = getPermissions(objectType, objectId, isAuthenticated, userId, scopes)

        // Minimizing loops here for performance.
        for (op in allPermissions) {
            if (op.permission == permission) {
                logger.debug { "Access approved using permission : ${op}" }
                return true
            }
        }

        return false
    }

    fun grantPermissions(
        grants: Set<ObjectPermissionCreateModel>
    ): Set<ObjectPermissionModel> {
        // Remove existing permissions for this grantee on this object
        val documents: List<ObjectPermissionDocument> = grants.asSequence().map {
            ObjectPermissionDocument(
                id = permissionIdHash(it),
                objectType = it.objectType,
                objectId = it.objectId,
                granteeType = it.granteeType,
                grantee = it.grantee,
                permission = it.permission
            )
        }.toList()
        val savedDocuments = permissionRepository.saveAll(documents)
        for (document in savedDocuments) {
            logger.info{"Granted permission: ${document}"}
        }
        return savedDocuments.asSequence().map { it.toObjectPermissionModel() }.toSet()
    }

    /**
     * Grant ownership permissions to a user (READ, UPDATE, DISABLE)
     */
    fun grantOwnership(
        objectType: ObjectType,
        objectId: String,
        ownerUserId: String
    ): Set<ObjectPermissionModel> {
        val ownershipPermissions = sequenceOf(Permission.READ, Permission.UPDATE, Permission.DISABLE, Permission.DELETE)
        val grants: Set<ObjectPermissionCreateModel> = ownershipPermissions.map {
            ObjectPermissionCreateModel(
                objectType,
                objectId,
                PermissionGranteeType.USER,
                ownerUserId,
                it
            )
        }.toSet()
        return grantPermissions(
            grants
        )
    }

    /**
     * Grant public read access to an object
     */
    fun grantPublicRead(objectType: ObjectType, objectId: String): Set<ObjectPermissionModel> {

        return grantPermissions(
            setOf(
                ObjectPermissionCreateModel(
                    objectType,
                    objectId,
                    PermissionGranteeType.ROLE,
                    SystemRole.PUBLIC.name,
                    Permission.READ
                )
            )
        )
    }

    fun revokePublicRead(
        objectType: ObjectType, objectId: String
    ) : Set<ObjectPermissionModel> {
        val deleted: List<ObjectPermissionDocument> = permissionRepository.deleteByObjectTypeAndObjectIdAndGranteeTypeAndGranteeAndPermission(
            objectType = objectType,
            objectId = objectId,
            granteeType = PermissionGranteeType.ROLE,
            grantee = SystemRole.PUBLIC.name,
            permission = Permission.READ
        )
        return deleted.asSequence().map{it.toObjectPermissionModel()}.toSet()
    }

    /**
     * Delete all permissions for an object
     */
    fun revokeObjectPermissions(objectType: ObjectType, objectId: String) : Set<ObjectPermissionModel> {
        logger.debug{ "Deleting all permissions on ${objectType} ${objectId}." }
        val deleted: List<ObjectPermissionDocument> = permissionRepository.deleteByObjectTypeAndObjectId(objectType, objectId)
        for (grant in deleted) {
            logger.info{ "Permission Revoked: ${grant}." }
        }
        return deleted.asSequence().map{ it.toObjectPermissionModel() }.toSet()
    }
}
