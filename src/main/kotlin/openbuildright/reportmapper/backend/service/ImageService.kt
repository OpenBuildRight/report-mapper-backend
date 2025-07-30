package openbuildright.reportmapper.backend.service

import geoLocationModelToPoint
import openbuildright.reportmapper.backend.db.mongo.ImageMetadataDocument
import openbuildright.reportmapper.backend.db.mongo.ImageMetadataDocumentRepository
import openbuildright.reportmapper.backend.db.objectstore.ImageObjectRepository
import openbuildright.reportmapper.backend.exception.NotFoundException
import openbuildright.reportmapper.backend.model.ImageMetadataCreateModel
import openbuildright.reportmapper.backend.model.ImageMetadataModel
import openbuildright.reportmapper.backend.model.ImageModel
import openbuildright.reportmapper.backend.web.InvalidImageFile
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.time.Instant
import java.util.*

@Service
class ImageService(
    @param:Autowired val imageRepository: ImageMetadataDocumentRepository,
    @param:Autowired val imageObjectRepository: ImageObjectRepository
) {

    fun normalizeImage(data: ByteArray, name: String) {
        var extension: String? = null
        val i: Int = name.lastIndexOf('.')
        if (i > 0) {
            extension = name.substring(i + 1)
        } else {
            throw InvalidImageFile("Unable to determine file type from image name ${name}.")
        }

    }

    fun createImage(
        data: ByteArray,
        metadata: ImageMetadataCreateModel,
    ): ImageMetadataModel {
        val imageId: String = UUID.randomUUID().toString()
        val objectKey: String = Instant.now().epochSecond.toString() + "/" + imageId
        val now = Instant.now()
        val metadataDocument = ImageMetadataDocument(
            id = imageId,
            key = objectKey,
            createdTime = now,
            location = metadata.location?.let { geoLocationModelToPoint(it) },
            description = metadata.description,
            updatedTime = now,
            reporterId = metadata.reporterId,
            imageGeneratedTime = metadata.imageGeneratedTime
        )
        imageObjectRepository.put(objectKey, data)
        val metadataDocumentResponse: ImageMetadataDocument = imageRepository.save(metadataDocument)
        return metadataDocumentResponse.toImageMetadataModel()
    }

    fun getImageMetadata(id: String): ImageMetadataModel {
        val imageResponse: Optional<ImageMetadataDocument> = imageRepository.findById(id)
        if (imageResponse.isEmpty) {
            throw NotFoundException("Image ${id} not found.")
        }
        return imageResponse.get().toImageMetadataModel()
    }

    fun getImage(id: String): ImageModel {
        val metadata: ImageMetadataModel = getImageMetadata(id)
        val image: ByteArray = imageObjectRepository.get(metadata.key)
        return ImageModel(
            metadata = metadata,
            image = image
        )
    }

    fun listImagesMetadata(ids: Set<String>): Set<ImageMetadataModel> {
        return ids.parallelStream().map { getImageMetadata(it) }.toList().toSet()
    }
}