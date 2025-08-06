package com.openbuildright.reportmapper.backend.db.objectstore.config

import io.minio.MinioClient
import com.openbuildright.reportmapper.backend.db.objectstore.MinioObjectStoreRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.context.properties.bind.ConstructorBinding
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration


@ConfigurationProperties(
    prefix="openbuildright.reportmapper.objectstore.minio"
)
data class MinioConfigProperties @ConstructorBinding constructor(
    val accessKey: String,
    val secretKey: String,
    val bucket: String,
    val endpoint: String
) {
}


@Configuration
@EnableConfigurationProperties(MinioConfigProperties::class)
class MinioConfig {

    @Bean
    fun minioClient(
        @Autowired minioConfigProperties: MinioConfigProperties) : MinioClient {
        return MinioClient.builder()
            .credentials(
            minioConfigProperties.accessKey,
            minioConfigProperties.secretKey)
            .endpoint(minioConfigProperties.endpoint).build()
    }

    @Bean
    fun minioObjectStoreRepository(
        @Autowired minioConfigProperties: MinioConfigProperties,
        @Autowired minioClient: MinioClient
    ) : MinioObjectStoreRepository {
       return MinioObjectStoreRepository(
           client = minioClient,
           bucket = minioConfigProperties.bucket
       )
    }
}