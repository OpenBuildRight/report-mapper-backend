package com.openbuildright.reportmapper.backend.db.mongo

import com.openbuildright.reportmapper.backend.db.mongo.ObservationDocument
import com.openbuildright.reportmapper.backend.db.mongo.ImageMetadataDocument
import com.openbuildright.reportmapper.backend.db.mongo.document.ObjectPermissionDocument
import com.openbuildright.reportmapper.backend.security.ObjectType
import com.openbuildright.reportmapper.backend.security.PermissionGranteeType
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.stereotype.Repository

@Repository
interface ObservationDocumentRepository : MongoRepository<ObservationDocument, String> {
    fun findByReporterId(reporterId: String): List<ObservationDocument>
    fun findByEnabledTrue(): List<ObservationDocument>
}

@Repository
interface ImageMetadataDocumentRepository : MongoRepository<ImageMetadataDocument, String> {
    fun findByObservationId(observationId: String): List<ImageMetadataDocument>
}

@Repository
interface ObjectPermissionDocumentRepository : MongoRepository<ObjectPermissionDocument, String> {
    fun findByObjectTypeAndObjectId(objectType: ObjectType, objectId: String): List<ObjectPermissionDocument>
    fun findByObjectTypeAndObjectIdAndGranteeTypeAndGrantee(
        objectType: ObjectType, 
        objectId: String, 
        granteeType: PermissionGranteeType, 
        grantee: String
    ): ObjectPermissionDocument?
    fun findByObjectTypeAndGranteeTypeAndGrantee(
        objectType: ObjectType, 
        granteeType: PermissionGranteeType, 
        grantee: String
    ): List<ObjectPermissionDocument>
    fun deleteByObjectTypeAndObjectId(objectType: ObjectType, objectId: String)
}