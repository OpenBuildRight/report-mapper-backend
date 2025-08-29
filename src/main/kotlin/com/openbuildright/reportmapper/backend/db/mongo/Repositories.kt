package com.openbuildright.reportmapper.backend.db.mongo

import org.springframework.data.mongodb.repository.MongoRepository

interface ObservationDocumentRepository : MongoRepository<ObservationDocument, String> {
    fun findByReporterId(reporterId: String): List<ObservationDocument>
    fun findByEnabledTrue(): List<ObservationDocument>
}

interface ImageMetadataDocumentRepository : MongoRepository<ImageMetadataDocument, String>