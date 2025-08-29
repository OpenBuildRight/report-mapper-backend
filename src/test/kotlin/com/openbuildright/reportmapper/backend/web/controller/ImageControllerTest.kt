package com.openbuildright.reportmapper.backend.web.controller

import com.openbuildright.reportmapper.backend.model.GeoLocationModel
import com.openbuildright.reportmapper.backend.model.ImageMetadataModel
import com.openbuildright.reportmapper.backend.model.ImageModel
import com.openbuildright.reportmapper.backend.security.ObjectType
import com.openbuildright.reportmapper.backend.security.Permission
import com.openbuildright.reportmapper.backend.security.PermissionService
import com.openbuildright.reportmapper.backend.service.ImageService
import com.openbuildright.reportmapper.backend.web.InvalidImageFile
import com.openbuildright.reportmapper.backend.web.dto.ImageCreateDto
import com.openbuildright.reportmapper.backend.web.dto.ImageDto
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.*
import org.springframework.http.MediaType
import org.springframework.mock.web.MockMultipartFile
import org.springframework.security.core.Authentication
import java.time.Instant
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

class ImageControllerTest {

    private lateinit var imageService: ImageService
    private lateinit var permissionService: PermissionService
    private lateinit var imageController: ImageController

    @BeforeEach
    fun setUp() {
        imageService = mock()
        permissionService = mock()
        imageController = ImageController(imageService, permissionService)
    }

    @Test
    fun createImageShouldCreateImageWithValidData() {
        // Given
        val file = MockMultipartFile(
            "file",
            "test-image.jpg",
            MediaType.IMAGE_JPEG_VALUE,
            "test image data".toByteArray()
        )
        val latitude = 40.7128
        val longitude = -74.0060
        val description = "Test image description"
        val imageGeneratedTime = Instant.now()

        val dto = ImageCreateDto(
            file = file,
            latitude = latitude,
            longitude = longitude,
            description = description,
            imageGeneratedTime = imageGeneratedTime
        )

        val expectedImageMetadata = ImageMetadataModel(
            id = "test-id",
            key = "test-key",
            thumbnailKey = "test-thumbnail-key",
            createdTime = Instant.now(),
            updatedTime = Instant.now(),
            imageGeneratedTime = imageGeneratedTime,
            location = GeoLocationModel(latitude, longitude),
            description = description
        )

        whenever(imageService.createImage(any(), any())).thenReturn(expectedImageMetadata)

        // When
        val result = imageController.createImage(dto)

        // Then
        assertNotNull(result)
        assertEquals("test-id", result.id)
        assertEquals(description, result.description)
        verify(imageService).createImage(
            eq(file.bytes),
            any()
        )
    }

    @Test
    fun createImageShouldHandleNullLocation() {
        // Given
        val file = MockMultipartFile(
            "file",
            "test-image.jpg",
            MediaType.IMAGE_JPEG_VALUE,
            "test image data".toByteArray()
        )
        val dto = ImageCreateDto(
            file = file,
            latitude = null,
            longitude = null,
            description = "Test description",
            imageGeneratedTime = Instant.now()
        )

        val expectedImageMetadata = ImageMetadataModel(
            id = "test-id",
            key = "test-key",
            thumbnailKey = "test-thumbnail-key",
            createdTime = Instant.now(),
            updatedTime = Instant.now(),
            imageGeneratedTime = Instant.now(),
            location = null,
            description = "Test description"
        )

        whenever(imageService.createImage(any(), any())).thenReturn(expectedImageMetadata)

        // When
        val result = imageController.createImage(dto)

        // Then
        assertNotNull(result)
        assertEquals("test-id", result.id)
        assertEquals("Test description", result.description)
        verify(imageService).createImage(
            eq(file.bytes),
            any()
        )
    }

    @Test
    fun createImageShouldThrowExceptionForEmptyFile() {
        // Given
        val file = MockMultipartFile(
            "file",
            "test-image.jpg",
            MediaType.IMAGE_JPEG_VALUE,
            ByteArray(0)
        )
        val dto = ImageCreateDto(
            file = file,
            latitude = null,
            longitude = null,
            description = "Test description",
            imageGeneratedTime = Instant.now()
        )

        // When & Then
        assertThrows<InvalidImageFile> {
            imageController.createImage(dto)
        }
    }

    @Test
    fun getImageShouldReturnImageDto() {
        // Given
        val imageId = "test-image-id"
        val imageMetadata = ImageMetadataModel(
            id = imageId,
            key = "test-key",
            thumbnailKey = "test-thumbnail-key",
            createdTime = Instant.now(),
            updatedTime = Instant.now(),
            imageGeneratedTime = Instant.now(),
            location = GeoLocationModel(40.7128, -74.0060),
            description = "Test image"
        )

        whenever(imageService.getImageMetadata(imageId)).thenReturn(imageMetadata)

        // When
        val result = imageController.getImage(imageId)

        // Then
        assertNotNull(result)
        assertEquals(imageId, result.id)
        assertEquals("Test image", result.description)
        verify(imageService).getImageMetadata(imageId)
    }

    @Test
    fun downloadImageShouldReturnImageBytes() {
        // Given
        val imageId = "test-image-id"
        val thumbnail = false
        val imageBytes = "image data".toByteArray()
        val imageMetadata = ImageMetadataModel(
            id = imageId,
            key = "test-key",
            thumbnailKey = "test-thumbnail-key",
            createdTime = Instant.now(),
            updatedTime = Instant.now(),
            imageGeneratedTime = Instant.now(),
            location = GeoLocationModel(40.7128, -74.0060),
            description = "Test image"
        )
        val imageModel = ImageModel(image = imageBytes, metadata = imageMetadata)

        whenever(imageService.getImage(imageId, thumbnail)).thenReturn(imageModel)
        whenever(permissionService.hasPermission(ObjectType.IMAGE, imageId, Permission.READ, null)).thenReturn(true)

        // When
        val result = imageController.downloadImage(imageId, thumbnail, null)

        // Then
        assertEquals(imageBytes, result.body)
        verify(imageService).getImage(imageId, thumbnail)
    }

    @Test
    fun downloadImageShouldReturnThumbnailWhenThumbnailParameterIsTrue() {
        // Given
        val imageId = "test-image-id"
        val thumbnail = true
        val thumbnailBytes = "thumbnail data".toByteArray()
        val imageMetadata = ImageMetadataModel(
            id = imageId,
            key = "test-key",
            thumbnailKey = "test-thumbnail-key",
            createdTime = Instant.now(),
            updatedTime = Instant.now(),
            imageGeneratedTime = Instant.now(),
            location = GeoLocationModel(40.7128, -74.0060),
            description = "Test image"
        )
        val imageModel = ImageModel(image = thumbnailBytes, metadata = imageMetadata)

        whenever(imageService.getImage(imageId, thumbnail)).thenReturn(imageModel)
        whenever(permissionService.hasPermission(ObjectType.IMAGE, imageId, Permission.READ, null)).thenReturn(true)

        // When
        val result = imageController.downloadImage(imageId, thumbnail, null)

        // Then
        assertEquals(thumbnailBytes, result.body)
        verify(imageService).getImage(imageId, thumbnail)
    }

    @Test
    fun downloadImageWithThumbnailPathShouldReturnThumbnail() {
        // Given
        val imageId = "test-image-id"
        val thumbnailBytes = "thumbnail data".toByteArray()
        val imageMetadata = ImageMetadataModel(
            id = imageId,
            key = "test-key",
            thumbnailKey = "test-thumbnail-key",
            createdTime = Instant.now(),
            updatedTime = Instant.now(),
            imageGeneratedTime = Instant.now(),
            location = GeoLocationModel(40.7128, -74.0060),
            description = "Test image"
        )
        val imageModel = ImageModel(image = thumbnailBytes, metadata = imageMetadata)

        whenever(imageService.getImage(imageId, true)).thenReturn(imageModel)
        whenever(permissionService.hasPermission(ObjectType.IMAGE, imageId, Permission.READ, null)).thenReturn(true)

        // When
        val result = imageController.downloadImage(imageId, true, null)

        // Then
        assertEquals(thumbnailBytes, result.body)
        verify(imageService).getImage(imageId, true)
    }

    @Test
    fun createImageShouldHandlePartialLocationData() {
        // Given
        val file = MockMultipartFile(
            "file",
            "test-image.jpg",
            MediaType.IMAGE_JPEG_VALUE,
            "test image data".toByteArray()
        )
        val dto = ImageCreateDto(
            file = file,
            latitude = 40.7128,
            longitude = null, // Only latitude provided
            description = "Test description",
            imageGeneratedTime = Instant.now()
        )

        val expectedImageMetadata = ImageMetadataModel(
            id = "test-id",
            key = "test-key",
            thumbnailKey = "test-thumbnail-key",
            createdTime = Instant.now(),
            updatedTime = Instant.now(),
            imageGeneratedTime = Instant.now(),
            location = null, // No location since only partial data
            description = "Test description"
        )

        whenever(imageService.createImage(any(), any())).thenReturn(expectedImageMetadata)

        // When
        val result = imageController.createImage(dto)

        // Then
        assertNotNull(result)
        assertEquals("test-id", result.id)
        assertEquals("Test description", result.description)
        verify(imageService).createImage(
            eq(file.bytes),
            any()
        )
    }
}
