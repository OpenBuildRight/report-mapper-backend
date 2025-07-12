package openbuildright.reportmapper.backend.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix="openbuildright.reportmapper.crypto")
data class CryptoConfigModel(
    val key: String
)