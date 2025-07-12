package openbuildright.reportmapper.backend.service

import openbuildright.reportmapper.backend.config.CryptoConfigModel
import org.apache.commons.codec.digest.HmacAlgorithms
import org.apache.commons.codec.digest.HmacUtils
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.stereotype.Service


@Service
@EnableConfigurationProperties(CryptoConfigModel::class)
class CryptoService(
    @Autowired
    val config: CryptoConfigModel
) {
    fun hmac(value: String) : String {
        val hmac: String? = HmacUtils(HmacAlgorithms.HMAC_SHA_256, config.key).hmacHex(value)
        if (hmac == null) {
            return ""
        }
        return hmac;
    }
}