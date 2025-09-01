package com.openbuildright.reportmapper.backend.db.mongo

import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.stereotype.Repository

@Repository
interface ObservationDocumentRepository : MongoRepository<ObservationDocument, String> {
    fun findByReporterId(reporterId: String): List<ObservationDocument>
    fun findByEnabledTrue(): List<ObservationDocument>
}

@Repository
interface ImageMetadataDocumentRepository : MongoRepository<ImageMetadataDocument, String> {
    // No custom query methods needed - images are referenced by ID in observations
}

