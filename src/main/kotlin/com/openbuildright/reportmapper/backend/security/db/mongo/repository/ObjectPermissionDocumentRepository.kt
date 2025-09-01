package com.openbuildright.reportmapper.backend.security.db.mongo.repository

import com.openbuildright.reportmapper.backend.security.ObjectType
import com.openbuildright.reportmapper.backend.security.PermissionGranteeType
import com.openbuildright.reportmapper.backend.security.db.mongo.document.ObjectPermissionDocument
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.data.mongodb.repository.cdi.MongoRepositoryBean


interface ObjectPermissionDocumentRepository: MongoRepository<ObjectPermissionDocument, String> {

    fun findByObjectTypeObjectIdGranteeTypeGrantee(
        objectType: ObjectType,
        objectId: String,
        granteeType: PermissionGranteeType,
        grantee: String
    ) : List<ObjectPermissionDocument>

    fun findByObjectTypeObjectId(
        objectType: ObjectType,
        objectId: String,
    ) : List<ObjectPermissionDocument>

}
