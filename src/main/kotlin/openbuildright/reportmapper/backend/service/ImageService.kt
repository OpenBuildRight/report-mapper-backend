package openbuildright.reportmapper.backend.service

import ObjectNotFoundException
import geoLocationModelToPoint
import openbuildright.reportmapper.backend.db.jpa.entity.Image
import openbuildright.reportmapper.backend.db.jpa.repository.ImageRepository
import openbuildright.reportmapper.backend.db.objectstore.ImageObjectRepository
import openbuildright.reportmapper.backend.exception.NotFoundException
import openbuildright.reportmapper.backend.model.GeoLocationModel
import openbuildright.reportmapper.backend.model.ImageMetadataModel
import openbuildright.reportmapper.backend.model.ImageModel
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.time.Instant
import java.util.UUID
import java.util.Optional

@Service
class ImageService (@param:Autowired val imageRepository: ImageRepository, @param:Autowired val imageObjectRepository: ImageObjectRepository){

    fun createImage(data: ByteArray, location: GeoLocationModel?) : ImageMetadataModel {
        val objectKey: String =  Instant.now().epochSecond.toString()  + UUID.randomUUID().toString().slice(IntRange(0, 8))
        imageObjectRepository.put(objectKey, data)
        val image: Image = imageRepository.save(Image(
            objectKey = objectKey,
            createdTime = Instant.now(),
            location = location?.let { geoLocationModelToPoint(it) },
        ))
        return image.toImageMetadataModel()
    }

    fun getImageMetadata(id: Long) : ImageMetadataModel {
        val imageResponse: Optional<Image> = imageRepository.findById(id)
        if (imageResponse.isEmpty) {
            throw NotFoundException("Image ${id} not found.")
        }
        return imageResponse.get().toImageMetadataModel()
    }

    fun getImage(id: Long) : ImageModel {
        val metadata : ImageMetadataModel = getImageMetadata(id)
        val image : ByteArray = imageObjectRepository.get(metadata.key)
        return ImageModel(
            metadata=metadata,
            image = image
        )
    }
}