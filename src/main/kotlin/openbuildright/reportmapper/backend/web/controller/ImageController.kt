package openbuildright.reportmapper.backend.web.controller

import openbuildright.reportmapper.backend.model.ImageMetadataModel
import openbuildright.reportmapper.backend.service.ImageService
import openbuildright.reportmapper.backend.web.dto.ImageCreateDto
import openbuildright.reportmapper.backend.web.dto.ImageDto
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.bind.annotation.ModelAttribute
import openbuildright.reportmapper.backend.model.GeoLocationModel
import openbuildright.reportmapper.backend.web.InvalidImageFile

@RestController
@RequestMapping("/image")
class ImageController(
    @param:Autowired val imageService: ImageService
) {
    @PostMapping( consumes = arrayOf("multipart/form-data"))
    fun createImage(
        @ModelAttribute dto: ImageCreateDto
    ) : ImageDto {
        var location: GeoLocationModel? = null;
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
            location = location
        )
        return ImageDto.fromImageModel(image)
    }

    @GetMapping("/{id}")
    fun getImage(id: Long) : ImageDto {
        return ImageDto.fromImageModel(imageService.getImageMetadata(id))
    }

    @GetMapping("/{id}/download")
    fun downloadImage(id: Long) {

    }
}