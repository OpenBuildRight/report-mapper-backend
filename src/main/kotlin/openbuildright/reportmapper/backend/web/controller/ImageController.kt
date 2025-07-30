package openbuildright.reportmapper.backend.web.controller

import openbuildright.reportmapper.backend.model.GeoLocationModel
import openbuildright.reportmapper.backend.model.ImageMetadataCreateModel
import openbuildright.reportmapper.backend.model.ImageMetadataModel
import openbuildright.reportmapper.backend.service.ImageService
import openbuildright.reportmapper.backend.web.InvalidImageFile
import openbuildright.reportmapper.backend.web.dto.ImageCreateDto
import openbuildright.reportmapper.backend.web.dto.ImageDto
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/image")
class ImageController(
    @param:Autowired val imageService: ImageService
) {
    @PostMapping(consumes = arrayOf("multipart/form-data"))
    fun createImage(
        @ModelAttribute dto: ImageCreateDto,

        ): ImageDto {
        var location: GeoLocationModel? = null
        if (dto.latitude != null && dto.longitude != null) {
            location = GeoLocationModel(
                latitude = dto.latitude,
                longitude = dto.longitude
            )
        }
        if (dto.file.isEmpty) {
            throw InvalidImageFile("Image is empty.")
        }
        val image: ImageMetadataModel = imageService.createImage(
            data = dto.file.bytes,
            metadata = ImageMetadataCreateModel(
                imageGeneratedTime = dto.imageGeneratedTime,
                location = location,
                description = dto.description,
                // ToDo: Reporter ID should come from token subject.
                reporterId = ""
            )
        )
        return ImageDto.fromImageModel(image)
    }

    @GetMapping("/{id}")
    fun getImage(id: String): ImageDto {
        return ImageDto.fromImageModel(imageService.getImageMetadata(id))
    }

    @GetMapping("/{id}/download", produces = arrayOf(MediaType.IMAGE_JPEG_VALUE, MediaType.IMAGE_PNG_VALUE))
    fun downloadImage(id: String): ByteArray {
        return imageService.getImage(id).image
    }
}