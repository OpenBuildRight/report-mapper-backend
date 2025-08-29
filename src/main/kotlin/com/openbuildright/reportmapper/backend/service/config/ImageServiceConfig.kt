package com.openbuildright.reportmapper.backend.service.config

import com.openbuildright.reportmapper.backend.db.mongo.ImageMetadataDocumentRepository
import com.openbuildright.reportmapper.backend.db.objectstore.ImageObjectRepository
import com.openbuildright.reportmapper.backend.service.ImageService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.context.properties.bind.DefaultValue
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.context.properties.bind.ConstructorBinding
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@ConfigurationProperties(prefix="openbuildright.reportmapper.objectstore.image")
data class ImageServiceConfigProperties @ConstructorBinding constructor(
    @DefaultValue("1280") val maxWidth: Int,
    @DefaultValue("1280") val maxHeight: Int,
    @DefaultValue("true") val normalizeImage: Boolean,
    @DefaultValue("480") val thumbnailMaxHeight: Int,
    @DefaultValue("480") val thumbnailMaxWidth: Int,
)

@Configuration
@EnableConfigurationProperties(ImageServiceConfigProperties::class)
class ImageConfig() {

    @Bean
    fun imageService(
        @Autowired imageRepository: ImageMetadataDocumentRepository,
        @Autowired imageObjectRepository: ImageObjectRepository,
        @Autowired observationService: com.openbuildright.reportmapper.backend.service.ObservationService,
        @Autowired imageServiceConfigProperties: ImageServiceConfigProperties
    ) : ImageService {
        return ImageService(
            imageRepository,
            imageObjectRepository,
            observationService,
            maxWidth = imageServiceConfigProperties.maxWidth,
            maxHeight = imageServiceConfigProperties.maxHeight,
            normalizeImage = imageServiceConfigProperties.normalizeImage,
            thumbnailMaxWidth = imageServiceConfigProperties.thumbnailMaxWidth,
            thumbnailMaxHeight = imageServiceConfigProperties.thumbnailMaxHeight
        )
    }
}