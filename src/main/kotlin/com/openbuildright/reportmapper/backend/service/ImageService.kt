package com.openbuildright.reportmapper.backend.service

import com.openbuildright.reportmapper.backend.db.mongo.ImageMetadataDocument
import com.openbuildright.reportmapper.backend.db.mongo.ImageMetadataDocumentRepository
import com.openbuildright.reportmapper.backend.db.objectstore.ImageObjectRepository
import com.openbuildright.reportmapper.backend.exception.NotFoundException
import com.openbuildright.reportmapper.backend.image.readImageMetadata
import com.openbuildright.reportmapper.backend.image.resizeImage
import com.openbuildright.reportmapper.backend.model.ImageMetadataCreateModel
import com.openbuildright.reportmapper.backend.model.ImageMetadataModel
import com.openbuildright.reportmapper.backend.model.ImageModel
import geoLocationModelToPoint
import org.springframework.data.geo.Point
import org.springframework.stereotype.Service
import java.time.Instant
import java.util.*

@Service
class ImageService(
    val imageRepository: ImageMetadataDocumentRepository,
    val imageObjectRepository: ImageObjectRepository,
    val observationService: ObservationService,
    val maxWidth: Int,
    val maxHeight: Int,
    val normalizeImage: Boolean,
    val thumbnailMaxWidth: Int,
    val thumbnailMaxHeight: Int
) {

    fun createImage(
        data: ByteArray,
        metadata: ImageMetadataCreateModel,
    ): ImageMetadataModel {
        val imageId: String = UUID.randomUUID().toString() + ".jpeg"
        val objectKey: String = Instant.now().epochSecond.toString() + "/" + imageId
        val thumbnailObjectKey: String = Instant.now().epochSecond.toString() + "/thumbnail" + imageId
        val now = Instant.now()
        val locationPoint: Point?
        if (metadata.location != null) {
            locationPoint = geoLocationModelToPoint(metadata.location)
        } else {
            locationPoint = readImageMetadata(data).location?.let { geoLocationModelToPoint(it) }
        }
        val metadataDocument = ImageMetadataDocument(
            id = imageId,
            key = objectKey,
            thumbnailKey = thumbnailObjectKey,
            createdTime = now,
            location = locationPoint,
            description = metadata.description,
            updatedTime = now,
            imageGeneratedTime = metadata.imageGeneratedTime
        )
        val resizedImage: ByteArray = if (normalizeImage) {
            resizeImage(data, maxWidth, maxHeight)
        } else {
            data
        }
        val thumbnailImage: ByteArray = resizeImage(data, thumbnailMaxWidth, thumbnailMaxHeight)

        imageObjectRepository.put(objectKey, resizedImage)
        imageObjectRepository.put(thumbnailObjectKey, thumbnailImage)

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

    fun getImage(id: String, thumbnail: Boolean = false): ImageModel {
        val metadata: ImageMetadataModel = getImageMetadata(id)
        val key : String = if (thumbnail) {metadata.thumbnailKey} else {metadata.key}
        val image: ByteArray = imageObjectRepository.get(key)
        return ImageModel(
            metadata = metadata,
            image = image
        )
    }

    fun listImagesMetadata(ids: Set<String>): Set<ImageMetadataModel> {
        return ids.parallelStream().map { getImageMetadata(it) }.toList().toSet()
    }

    /**
     * Check if an image is published (part of an enabled observation)
     */
    fun isImagePublished(imageId: String): Boolean {
        return try {
            // Check if the image is part of any enabled (published) observation
            val observations = observationService.getAllObservations()
            observations.any { observation ->
                observation.enabled && observation.imageIds.contains(imageId)
            }
        } catch (e: Exception) {
            // If there's any error checking publication status, consider it not published
            false
        }
    }
}