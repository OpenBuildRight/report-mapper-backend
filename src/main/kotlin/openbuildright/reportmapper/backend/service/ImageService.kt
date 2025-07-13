package openbuildright.reportmapper.backend.service

import geoLocationModelToPoint
import openbuildright.reportmapper.backend.db.jpa.entity.Image
import openbuildright.reportmapper.backend.db.jpa.repository.ImageRepository
import openbuildright.reportmapper.backend.model.GeoLocationModel
import openbuildright.reportmapper.backend.model.ImageModel
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.time.Instant
import java.util.UUID

@Service
class ImageService (@param:Autowired val imageRepository: ImageRepository){

    fun createImage(location: GeoLocationModel?) : ImageModel {
        val objectKey: String =  Instant.now().epochSecond.toString()  + UUID.randomUUID().toString().slice(IntRange(0, 8))
        // ToDo Save image to bucket.
        val image: Image = imageRepository.save(Image(
            objectKey = objectKey,
            createdTime = Instant.now(),
            location = location?.let { geoLocationModelToPoint(it) },
        ))
        return image.toImageModel()
    }
}