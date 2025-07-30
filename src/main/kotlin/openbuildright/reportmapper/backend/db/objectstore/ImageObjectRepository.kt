package openbuildright.reportmapper.backend.db.objectstore

import ObjectNotFoundException
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean
import org.springframework.stereotype.Service

interface ImageObjectRepository {

    fun put(objectKey: String, data: ByteArray)

    fun get(objectKey: String): ByteArray
}

@Service
@ConditionalOnMissingBean(type = arrayOf("ImageObjectRepository"))
class InMemoryImageObjectRepository : ImageObjectRepository {

    val objectStore: MutableMap<String, ByteArray> = mutableMapOf()

    override fun put(objectKey: String, data: ByteArray) {
        this.objectStore.put(objectKey, value = data)
    }

    override fun get(objectKey: String): ByteArray {
        val ret = this.objectStore.get(objectKey)
        if (ret == null) {
            throw ObjectNotFoundException(
                "Object ${objectKey} not found."
            )
        }
        return ret
    }

}