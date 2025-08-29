package com.openbuildright.reportmapper.backend.db.mongo.document

import com.openbuildright.reportmapper.backend.security.ObjectType
import com.openbuildright.reportmapper.backend.security.Permission
import com.openbuildright.reportmapper.backend.security.PermissionGranteeType
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant

@Document(collection = "object_permissions")
data class ObjectPermissionDocument(
    @Id
    val id: String,
    val objectType: ObjectType,
    val objectId: String,
    val granteeType: PermissionGranteeType,  // ROLE or USER
    val grantee: String,  // Role name (e.g., "PUBLIC", "ADMIN") or username
    val permissions: Set<Permission>,
    val grantedBy: String,  // Who granted this permission
    val grantedAt: Instant,
    val expiresAt: Instant? = null  // Optional expiration
)
