package openbuildright.reportmapper.backend.service

import geoLocationModelToPoint
import openbuildright.reportmapper.backend.db.jpa.entity.Image
import openbuildright.reportmapper.backend.db.jpa.repository.ImageRepository
import openbuildright.reportmapper.backend.model.GeoLocationModel
import org.springframework.beans.factory.annotation.Autowired
import java.time.Instant
import java.util.UUID

class ImageService (@param:Autowired val imageRepository: ImageRepository){

    fun createImage(location: GeoLocationModel?) {
        val objectKey: String = UUID.randomUUID().toString()
        // ToDo Save image to bucket.
        imageRepository.save(Image(
            objectKey = objectKey,
            createdTime = Instant.now(),
            location = location?.let { geoLocationModelToPoint(it) },
        ))
    }
}