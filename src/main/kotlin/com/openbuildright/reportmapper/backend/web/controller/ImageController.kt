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
import org.springframework.http.HttpStatus
import org.springframework.http.HttpStatusCode
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/image")
class ImageController(
    @param:Autowired val imageService: ImageService,
) {
    @PostMapping(consumes = arrayOf("multipart/form-data"))
    @PreAuthorize("hasPermission(#dto, 'CREATE')")
    fun createImage(
        @ModelAttribute dto: ImageCreateDto,
        authentication: Authentication
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
            ),
            authentication.name
        )
        return ImageDto.fromImageModel(image)
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasPermission(#id, 'IMAGE','CREATE')")
    fun getImage(
        @PathVariable id: String,
    ): ImageDto {
        return ImageDto.fromImageModel(imageService.getImageMetadata(id))
    }

    /**
     * Smart image download endpoint - handles both draft and published images
     * with appropriate access control
     */
    @GetMapping("/download/{id}", produces = arrayOf(MediaType.IMAGE_JPEG_VALUE))
    @PreAuthorize("hasPermission(#id, 'IMAGE','CREATE')")
    fun downloadImage(
        @PathVariable id: String,
        @RequestParam(required = false, defaultValue = "false") thumbnail: Boolean,
    ): ResponseEntity<ByteArray> {
            // Check if user has read permission on this image
            val imageData = imageService.getImage(id, thumbnail).image
            return ResponseEntity.ok(imageData)
    }
}