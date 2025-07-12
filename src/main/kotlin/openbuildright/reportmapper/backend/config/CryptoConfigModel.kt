package openbuildright.reportmapper.backend.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Configuration

@ConfigurationProperties(prefix="openbuildright.reportmapper.crypto")
data class CryptoConfigModel(
    val key: String
) {
}

@Configuration
@EnableConfigurationProperties(CryptoConfigModel::class)
class CryptoConfig()