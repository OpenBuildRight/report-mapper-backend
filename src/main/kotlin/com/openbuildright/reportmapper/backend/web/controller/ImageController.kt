package com.openbuildright.reportmapper.backend.web.controller

import com.openbuildright.reportmapper.backend.model.GeoLocationModel
import com.openbuildright.reportmapper.backend.model.ImageMetadataCreateModel
import com.openbuildright.reportmapper.backend.model.ImageMetadataModel
import com.openbuildright.reportmapper.backend.security.DraftAccess
import com.openbuildright.reportmapper.backend.service.ImageService
import com.openbuildright.reportmapper.backend.web.InvalidImageFile
import com.openbuildright.reportmapper.backend.web.dto.ImageCreateDto
import com.openbuildright.reportmapper.backend.web.dto.ImageDto
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.query.Param
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
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

    // Draft image endpoints - require authentication and ownership
    @GetMapping("/draft/{imageId}", produces = arrayOf(MediaType.IMAGE_JPEG_VALUE))
    @DraftAccess
    fun downloadDraftImage(
        @PathVariable imageId: String, 
        @RequestParam(required = false, defaultValue = "false") thumbnail: Boolean
    ): ResponseEntity<ByteArray> {
        val imageData = imageService.getImage(imageId, thumbnail).image
        return ResponseEntity.ok(imageData)
    }

    @GetMapping("/draft/thumbnail-{imageId}", produces = arrayOf(MediaType.IMAGE_JPEG_VALUE))
    @DraftAccess
    fun downloadDraftThumbnail(@PathVariable imageId: String): ResponseEntity<ByteArray> {
        val imageData = imageService.getImage(imageId, true).image
        return ResponseEntity.ok(imageData)
    }

    // Published image endpoints - public access
    @GetMapping("/published/{imageId}", produces = arrayOf(MediaType.IMAGE_JPEG_VALUE))
    fun downloadPublishedImage(
        @PathVariable imageId: String, 
        @RequestParam(required = false, defaultValue = "false") thumbnail: Boolean
    ): ResponseEntity<ByteArray> {
        // Check if image is part of a published observation
        if (!imageService.isImagePublished(imageId)) {
            return ResponseEntity.status(404).build()
        }
        
        val imageData = imageService.getImage(imageId, thumbnail).image
        return ResponseEntity.ok(imageData)
    }

    @GetMapping("/published/thumbnail-{imageId}", produces = arrayOf(MediaType.IMAGE_JPEG_VALUE))
    fun downloadPublishedThumbnail(@PathVariable imageId: String): ResponseEntity<ByteArray> {
        // Check if image is part of a published observation
        if (!imageService.isImagePublished(imageId)) {
            return ResponseEntity.status(404).build()
        }
        
        val imageData = imageService.getImage(imageId, true).image
        return ResponseEntity.ok(imageData)
    }

    // Legacy endpoints - smart routing based on image status
    @GetMapping("/download/{imageId}", produces = arrayOf(MediaType.IMAGE_JPEG_VALUE))
    fun downloadImage(
        @PathVariable imageId: String, 
        @RequestParam(required = false, defaultValue = "false") thumbnail: Boolean
    ): ResponseEntity<ByteArray> {
        return if (imageService.isImagePublished(imageId)) {
            // Published image - use public endpoint
            downloadPublishedImage(imageId, thumbnail)
        } else {
            // Draft image - use draft endpoint (will be protected by @DraftAccess)
            downloadDraftImage(imageId, thumbnail)
        }
    }

    @GetMapping("/download/thumbnail-{imageId}", produces = arrayOf(MediaType.IMAGE_JPEG_VALUE))
    fun downloadThumbnail(@PathVariable imageId: String): ResponseEntity<ByteArray> {
        return if (imageService.isImagePublished(imageId)) {
            // Published image - use public endpoint
            downloadPublishedThumbnail(imageId)
        } else {
            // Draft image - use draft endpoint (will be protected by @DraftAccess)
            downloadDraftThumbnail(imageId)
        }
    }
}