package com.openbuildright.reportmapper.backend.web.controller

import com.openbuildright.reportmapper.backend.model.GeoLocationModel
import com.openbuildright.reportmapper.backend.model.ImageMetadataCreateModel
import com.openbuildright.reportmapper.backend.model.ImageMetadataModel
import com.openbuildright.reportmapper.backend.service.ImageService
import com.openbuildright.reportmapper.backend.web.InvalidImageFile
import com.openbuildright.reportmapper.backend.web.dto.ImageCreateDto
import com.openbuildright.reportmapper.backend.web.dto.ImageDto
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.query.Param
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.*
import javax.print.attribute.standard.Media

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
            )
        )
        return ImageDto.fromImageModel(image)
    }

    @GetMapping("/{id}")
    fun getImage(@PathVariable id: String): ImageDto {
        return ImageDto.fromImageModel(imageService.getImageMetadata(id))
    }

    @GetMapping("/download/{id}", produces = arrayOf(MediaType.IMAGE_JPEG_VALUE))
    fun downloadImage(@PathVariable id: String, @RequestParam(required = false, defaultValue = "false") thumbnail: Boolean): ByteArray {
        return imageService.getImage(id, thumbnail).image
    }

    @GetMapping("/download/thumbnail-{id}", produces = arrayOf(MediaType.IMAGE_JPEG_VALUE))
    fun downloadImage(@PathVariable id: String): ByteArray {
        return imageService.getImage(id, true).image
    }
}