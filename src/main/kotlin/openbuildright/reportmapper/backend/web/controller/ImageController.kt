package openbuildright.reportmapper.backend.web.controller

import openbuildright.reportmapper.backend.model.ImageModel
import openbuildright.reportmapper.backend.service.ImageService
import openbuildright.reportmapper.backend.web.dto.ImageCreateDto
import openbuildright.reportmapper.backend.web.dto.ImageDto
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.bind.annotation.RequestBody

@RestController
@RequestMapping("/image")
class ImageController(
    @param:Autowired val imageService: ImageService
) {
    @PostMapping()
    fun createImage(
        @RequestBody dto: ImageCreateDto
    ) : ImageDto {
        val image: ImageModel = imageService.createImage(
            location = dto.location?.toGeoLocationModel()
        )
        return ImageDto.fromImageModel(image)
    }
}