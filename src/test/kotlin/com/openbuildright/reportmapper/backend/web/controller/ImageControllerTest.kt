package com.openbuildright.reportmapper.backend.web.controller

import com.openbuildright.reportmapper.backend.model.GeoLocationModel
import com.openbuildright.reportmapper.backend.model.ImageMetadataModel
import com.openbuildright.reportmapper.backend.model.ImageModel
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
import java.time.Instant
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

class ImageControllerTest {

    private lateinit var imageService: ImageService
    private lateinit var imageController: ImageController

    @BeforeEach
    fun setUp() {
        imageService = mock()
        imageController = ImageController(imageService)
    }

    @Test
    fun `createImage should create image with valid data`() {
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
            createdTime = Instant.now(),
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
    fun `createImage should handle null location`() {
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
            createdTime = Instant.now(),
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
        assertEquals(null, result.location)
        verify(imageService).createImage(
            eq(file.bytes),
            any()
        )
    }

    @Test
    fun `createImage should throw InvalidImageFile when file is empty`() {
        // Given
        val emptyFile = MockMultipartFile(
            "file",
            "empty-file.jpg",
            MediaType.IMAGE_JPEG_VALUE,
            ByteArray(0)
        )
        val dto = ImageCreateDto(
            file = emptyFile,
            latitude = 40.7128,
            longitude = -74.0060,
            description = "Test description",
            imageGeneratedTime = Instant.now()
        )

        // When & Then
        assertThrows<InvalidImageFile> {
            imageController.createImage(dto)
        }
        verify(imageService, never()).createImage(any(), any())
    }

    @Test
    fun `getImage should return image metadata`() {
        // Given
        val imageId = "test-image-id"
        val expectedImageMetadata = ImageMetadataModel(
            id = imageId,
            createdTime = Instant.now(),
            imageGeneratedTime = Instant.now(),
            location = GeoLocationModel(40.7128, -74.0060),
            description = "Test image"
        )

        whenever(imageService.getImageMetadata(imageId)).thenReturn(expectedImageMetadata)

        // When
        val result = imageController.getImage(imageId)

        // Then
        assertNotNull(result)
        assertEquals(imageId, result.id)
        assertEquals("Test image", result.description)
        verify(imageService).getImageMetadata(imageId)
    }

    @Test
    fun `downloadImage should return image bytes`() {
        // Given
        val imageId = "test-image-id"
        val thumbnail = false
        val imageBytes = "test image data".toByteArray()
        val imageMetadata = ImageMetadataModel(
            id = imageId,
            createdTime = Instant.now(),
            imageGeneratedTime = Instant.now(),
            location = GeoLocationModel(40.7128, -74.0060),
            description = "Test image"
        )
        val imageModel = ImageModel(image = imageBytes, metadata = imageMetadata)

        whenever(imageService.getImage(imageId, thumbnail)).thenReturn(imageModel)

        // When
        val result = imageController.downloadImage(imageId, thumbnail)

        // Then
        assertEquals(imageBytes, result)
        verify(imageService).getImage(imageId, thumbnail)
    }

    @Test
    fun `downloadImage should return thumbnail when thumbnail parameter is true`() {
        // Given
        val imageId = "test-image-id"
        val thumbnail = true
        val thumbnailBytes = "thumbnail data".toByteArray()
        val imageMetadata = ImageMetadataModel(
            id = imageId,
            createdTime = Instant.now(),
            imageGeneratedTime = Instant.now(),
            location = GeoLocationModel(40.7128, -74.0060),
            description = "Test image"
        )
        val imageModel = ImageModel(image = thumbnailBytes, metadata = imageMetadata)

        whenever(imageService.getImage(imageId, thumbnail)).thenReturn(imageModel)

        // When
        val result = imageController.downloadImage(imageId, thumbnail)

        // Then
        assertEquals(thumbnailBytes, result)
        verify(imageService).getImage(imageId, thumbnail)
    }

    @Test
    fun `downloadImage with thumbnail path should return thumbnail`() {
        // Given
        val imageId = "test-image-id"
        val thumbnailBytes = "thumbnail data".toByteArray()
        val imageMetadata = ImageMetadataModel(
            id = imageId,
            createdTime = Instant.now(),
            imageGeneratedTime = Instant.now(),
            location = GeoLocationModel(40.7128, -74.0060),
            description = "Test image"
        )
        val imageModel = ImageModel(image = thumbnailBytes, metadata = imageMetadata)

        whenever(imageService.getImage(imageId, true)).thenReturn(imageModel)

        // When
        val result = imageController.downloadImage(imageId)

        // Then
        assertEquals(thumbnailBytes, result)
        verify(imageService).getImage(imageId, true)
    }

    @Test
    fun `createImage should handle partial location data`() {
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
            createdTime = Instant.now(),
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
        assertEquals(null, result.location)
        verify(imageService).createImage(
            eq(file.bytes),
            any()
        )
    }

    @Test
    fun `createImage should handle null description and imageGeneratedTime`() {
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
            longitude = -74.0060,
            description = null,
            imageGeneratedTime = null
        )

        val expectedImageMetadata = ImageMetadataModel(
            id = "test-id",
            createdTime = Instant.now(),
            imageGeneratedTime = null,
            location = GeoLocationModel(40.7128, -74.0060),
            description = null
        )

        whenever(imageService.createImage(any(), any())).thenReturn(expectedImageMetadata)

        // When
        val result = imageController.createImage(dto)

        // Then
        assertNotNull(result)
        assertEquals("test-id", result.id)
        assertEquals(null, result.description)
        assertEquals(null, result.imageGeneratedTime)
        verify(imageService).createImage(
            eq(file.bytes),
            any()
        )
    }
}
