package openbuildright.reportmapper.backend.service

import geoLocationModelToPoint
import openbuildright.reportmapper.backend.db.mongo.ImageMetadataDocument
import openbuildright.reportmapper.backend.db.mongo.ImageMetadataDocumentRepository
import openbuildright.reportmapper.backend.db.objectstore.ImageObjectRepository
import openbuildright.reportmapper.backend.exception.NotFoundException
import openbuildright.reportmapper.backend.image.getImageType
import openbuildright.reportmapper.backend.image.readImageMetadata
import openbuildright.reportmapper.backend.image.resizeImage
import openbuildright.reportmapper.backend.model.ImageMetadataCreateModel
import openbuildright.reportmapper.backend.model.ImageMetadataModel
import openbuildright.reportmapper.backend.model.ImageModel
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.geo.Point
import org.springframework.stereotype.Service
import java.time.Instant
import java.util.*

@Service
class ImageService(
    val imageRepository: ImageMetadataDocumentRepository,
    val imageObjectRepository: ImageObjectRepository,
    val maxWidth: Int,
    val maxHeight: Int,
    val normalizeImage: Boolean
) {


    fun createImage(
        data: ByteArray,
        metadata: ImageMetadataCreateModel,
    ): ImageMetadataModel {
        val imageId: String = UUID.randomUUID().toString() + ".jpeg"
        val objectKey: String = Instant.now().epochSecond.toString() + "/" + imageId
        val now = Instant.now()
        val locationPoint : Point?
        if (metadata.location != null) {
            locationPoint = geoLocationModelToPoint(metadata.location)
        } else {
            locationPoint = readImageMetadata(data).location?.let {geoLocationModelToPoint(it)}
        }
        val metadataDocument = ImageMetadataDocument(
            id = imageId,
            key = objectKey,
            createdTime = now,
            location =  locationPoint,
            description = metadata.description,
            updatedTime = now,
            reporterId = metadata.reporterId,
            imageGeneratedTime = metadata.imageGeneratedTime
        )
        val resizedImage : ByteArray = resizeImage(data, maxWidth, maxHeight)
        imageObjectRepository.put(objectKey, resizedImage)
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