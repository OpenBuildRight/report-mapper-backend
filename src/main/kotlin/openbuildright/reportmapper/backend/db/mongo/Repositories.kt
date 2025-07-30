package openbuildright.reportmapper.backend.db.mongo

import org.springframework.data.mongodb.repository.MongoRepository

interface ObservationDocumentRepository : MongoRepository<ObservationDocument, String>

interface ImageMetadataDocumentRepository : MongoRepository<ImageMetadataDocument, String>