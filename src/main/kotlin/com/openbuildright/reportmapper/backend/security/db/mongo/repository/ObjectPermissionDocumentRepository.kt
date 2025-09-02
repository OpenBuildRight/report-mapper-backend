package com.openbuildright.reportmapper.backend.security.db.mongo.repository

import com.openbuildright.reportmapper.backend.security.ObjectType
import com.openbuildright.reportmapper.backend.security.Permission
import com.openbuildright.reportmapper.backend.security.PermissionGranteeType
import com.openbuildright.reportmapper.backend.security.db.mongo.document.ObjectPermissionDocument
import org.springframework.data.mongodb.repository.MongoRepository


interface ObjectPermissionDocumentRepository: MongoRepository<ObjectPermissionDocument, String> {

    fun findByObjectTypeAndObjectIdAndGranteeTypeAndGrantee(
        objectType: ObjectType,
        objectId: String,
        granteeType: PermissionGranteeType,
        grantee: String
    ) : List<ObjectPermissionDocument>

    fun deleteByObjectTypeAndObjectIdAndGranteeTypeAndGrantee(
        objectType: ObjectType,
        objectId: String,
        granteeType: PermissionGranteeType,
        grantee: String
    ) : List<ObjectPermissionDocument>

    fun deleteByObjectTypeAndObjectIdAndGranteeTypeAndGranteeAndPermission(
        objectType: ObjectType,
        objectId: String,
        granteeType: PermissionGranteeType,
        grantee: String,
        permission: Permission
    ) : List<ObjectPermissionDocument>

    fun findByObjectTypeAndObjectId(
        objectType: ObjectType,
        objectId: String,
    ) : List<ObjectPermissionDocument>

    fun deleteByObjectTypeAndObjectId(objectType: ObjectType, objectId: String) : List<ObjectPermissionDocument>
}
