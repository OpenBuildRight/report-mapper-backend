package com.openbuildright.reportmapper.backend.web.controller

import com.openbuildright.reportmapper.backend.model.GeoLocationModel
import com.openbuildright.reportmapper.backend.model.ImageMetadataCreateModel
import com.openbuildright.reportmapper.backend.model.ImageMetadataModel
import com.openbuildright.reportmapper.backend.service.ImageService
import com.openbuildright.reportmapper.backend.service.ObservationService
import com.openbuildright.reportmapper.backend.web.InvalidImageFile
import com.openbuildright.reportmapper.backend.web.dto.ImageCreateDto
import com.openbuildright.reportmapper.backend.web.dto.ImageDto
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.query.Param
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import javax.print.attribute.standard.Media

@RestController
@RequestMapping("/image")
class ImageController(
    @param:Autowired val imageService: ImageService,
    @param:Autowired val observationService: ObservationService
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

    // Draft image endpoints - require authentication
    @GetMapping("/draft/{id}", produces = arrayOf(MediaType.IMAGE_JPEG_VALUE))
    fun downloadDraftImage(
        @PathVariable id: String, 
        @RequestParam(required = false, defaultValue = "false") thumbnail: Boolean,
        authentication: Authentication
    ): ResponseEntity<ByteArray> {
        // Check if user has access to this image (it's in their draft observations)
        if (!imageService.isImageAccessibleToUser(id, authentication.name)) {
            return ResponseEntity.status(403).build()
        }
        
        val imageData = imageService.getImage(id, thumbnail).image
        return ResponseEntity.ok(imageData)
    }

    @GetMapping("/draft/thumbnail-{id}", produces = arrayOf(MediaType.IMAGE_JPEG_VALUE))
    fun downloadDraftThumbnail(
        @PathVariable id: String,
        authentication: Authentication
    ): ResponseEntity<ByteArray> {
        // Check if user has access to this image (it's in their draft observations)
        if (!imageService.isImageAccessibleToUser(id, authentication.name)) {
            return ResponseEntity.status(403).build()
        }
        
        val imageData = imageService.getImage(id, true).image
        return ResponseEntity.ok(imageData)
    }

    // Published image endpoints - public access
    @GetMapping("/published/{id}", produces = arrayOf(MediaType.IMAGE_JPEG_VALUE))
    fun downloadPublishedImage(
        @PathVariable id: String, 
        @RequestParam(required = false, defaultValue = "false") thumbnail: Boolean
    ): ResponseEntity<ByteArray> {
        // Check if image is part of a published observation
        if (!imageService.isImagePublished(id)) {
            return ResponseEntity.status(404).build()
        }
        
        val imageData = imageService.getImage(id, thumbnail).image
        return ResponseEntity.ok(imageData)
    }

    @GetMapping("/published/thumbnail-{id}", produces = arrayOf(MediaType.IMAGE_JPEG_VALUE))
    fun downloadPublishedThumbnail(@PathVariable id: String): ResponseEntity<ByteArray> {
        // Check if image is part of a published observation
        if (!imageService.isImagePublished(id)) {
            return ResponseEntity.status(404).build()
        }
        
        val imageData = imageService.getImage(id, true).image
        return ResponseEntity.ok(imageData)
    }

    // Legacy endpoints - redirect to appropriate endpoint based on image status
    @GetMapping("/download/{id}", produces = arrayOf(MediaType.IMAGE_JPEG_VALUE))
    fun downloadImage(
        @PathVariable id: String, 
        @RequestParam(required = false, defaultValue = "false") thumbnail: Boolean,
        authentication: Authentication?
    ): ResponseEntity<ByteArray> {
        return if (imageService.isImagePublished(id)) {
            // Published image - use public endpoint
            downloadPublishedImage(id, thumbnail)
        } else if (authentication != null && imageService.isImageAccessibleToUser(id, authentication.name)) {
            // Draft image with authenticated user - use draft endpoint
            downloadDraftImage(id, thumbnail, authentication)
        } else {
            // No access
            ResponseEntity.status(403).build()
        }
    }

    @GetMapping("/download/thumbnail-{id}", produces = arrayOf(MediaType.IMAGE_JPEG_VALUE))
    fun downloadThumbnail(
        @PathVariable id: String,
        authentication: Authentication?
    ): ResponseEntity<ByteArray> {
        return if (imageService.isImagePublished(id)) {
            // Published image - use public endpoint
            downloadPublishedThumbnail(id)
        } else if (authentication != null && imageService.isImageAccessibleToUser(id, authentication.name)) {
            // Draft image with authenticated user - use draft endpoint
            downloadDraftThumbnail(id, authentication)
        } else {
            // No access
            ResponseEntity.status(403).build()
        }
    }
}