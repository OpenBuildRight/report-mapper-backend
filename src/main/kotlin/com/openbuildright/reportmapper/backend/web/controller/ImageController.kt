package com.openbuildright.reportmapper.backend.web.controller

import com.openbuildright.reportmapper.backend.model.GeoLocationModel
import com.openbuildright.reportmapper.backend.model.ImageMetadataCreateModel
import com.openbuildright.reportmapper.backend.model.ImageMetadataModel
import com.openbuildright.reportmapper.backend.security.ObjectType
import com.openbuildright.reportmapper.backend.security.Permission
import com.openbuildright.reportmapper.backend.security.PermissionService
import com.openbuildright.reportmapper.backend.service.ImageService
import com.openbuildright.reportmapper.backend.web.InvalidImageFile
import com.openbuildright.reportmapper.backend.web.dto.ImageCreateDto
import com.openbuildright.reportmapper.backend.web.dto.ImageDto
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/image")
class ImageController(
    @param:Autowired val imageService: ImageService,
    @param:Autowired val permissionService: PermissionService
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

    /**
     * Smart image download endpoint - handles both draft and published images
     * with appropriate access control
     */
    @GetMapping("/download/{imageId}", produces = arrayOf(MediaType.IMAGE_JPEG_VALUE))
    fun downloadImage(
        @PathVariable imageId: String, 
        @RequestParam(required = false, defaultValue = "false") thumbnail: Boolean,
        authentication: Authentication?
    ): ResponseEntity<ByteArray> {
        return try {
            // Check if user has read permission on this image
            if (permissionService.hasPermission(ObjectType.IMAGE, imageId, Permission.READ, authentication)) {
                val imageData = imageService.getImage(imageId, thumbnail).image
                ResponseEntity.ok(imageData)
            } else {
                ResponseEntity.status(403).build()
            }
        } catch (e: Exception) {
            ResponseEntity.status(404).build()
        }
    }

    /**
     * Smart thumbnail download endpoint - handles both draft and published images
     * with appropriate access control
     */
    @GetMapping("/download/thumbnail-{imageId}", produces = arrayOf(MediaType.IMAGE_JPEG_VALUE))
    fun downloadThumbnail(
        @PathVariable imageId: String,
        authentication: Authentication?
    ): ResponseEntity<ByteArray> {
        return downloadImage(imageId, true, authentication)
    }

    // Legacy endpoints for backward compatibility
    @GetMapping("/draft/{imageId}", produces = arrayOf(MediaType.IMAGE_JPEG_VALUE))
    fun downloadDraftImage(
        @PathVariable imageId: String, 
        @RequestParam(required = false, defaultValue = "false") thumbnail: Boolean,
        authentication: Authentication?
    ): ResponseEntity<ByteArray> {
        if (authentication == null) {
            return ResponseEntity.status(401).build()
        }
        
        return if (permissionService.hasPermission(ObjectType.IMAGE, imageId, Permission.READ, authentication)) {
            val imageData = imageService.getImage(imageId, thumbnail).image
            ResponseEntity.ok(imageData)
        } else {
            ResponseEntity.status(403).build()
        }
    }

    @GetMapping("/draft/thumbnail-{imageId}", produces = arrayOf(MediaType.IMAGE_JPEG_VALUE))
    fun downloadDraftThumbnail(
        @PathVariable imageId: String,
        authentication: Authentication?
    ): ResponseEntity<ByteArray> {
        return downloadDraftImage(imageId, true, authentication)
    }

    @GetMapping("/published/{imageId}", produces = arrayOf(MediaType.IMAGE_JPEG_VALUE))
    fun downloadPublishedImage(
        @PathVariable imageId: String, 
        @RequestParam(required = false, defaultValue = "false") thumbnail: Boolean
    ): ResponseEntity<ByteArray> {
        return if (permissionService.hasPermission(ObjectType.IMAGE, imageId, Permission.READ, null)) {
            val imageData = imageService.getImage(imageId, thumbnail).image
            ResponseEntity.ok(imageData)
        } else {
            ResponseEntity.status(404).build()
        }
    }

    @GetMapping("/published/thumbnail-{imageId}", produces = arrayOf(MediaType.IMAGE_JPEG_VALUE))
    fun downloadPublishedThumbnail(@PathVariable imageId: String): ResponseEntity<ByteArray> {
        return downloadPublishedImage(imageId, true)
    }
}