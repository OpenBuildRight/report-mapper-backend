package openbuildright.reportmapper.backend.db.objectstore

import ObjectNotFoundException
import io.github.oshai.kotlinlogging.KLogger
import io.github.oshai.kotlinlogging.KotlinLogging
import io.minio.BucketExistsArgs
import io.minio.GetObjectArgs
import io.minio.MakeBucketArgs
import io.minio.MinioClient
import io.minio.PutObjectArgs

interface ImageObjectRepository {

    fun put(objectKey: String, data: ByteArray)

    fun get(objectKey: String): ByteArray
}

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

class MinioObjectStoreRepository(
    val client: MinioClient,
    val bucket: String
) : ImageObjectRepository {
    
    private val logger : KLogger = KotlinLogging.logger {}
    private var initialized : Boolean = false

     fun init() {
         if (!this.initialized) {
             logger.debug { "Initializing image object repository." }
             val found : Boolean = this.client.bucketExists(BucketExistsArgs.builder().bucket(this.bucket).build());
             if (!found) {
                 logger.info { "Creating bucket ${bucket}" }
                 client.makeBucket(MakeBucketArgs.builder().bucket(this.bucket).build());
             }
             this.initialized = true
         }
    }


    override fun put(objectKey: String, data: ByteArray) {
        this.init()
        this.logger.debug { "Uploaded object ${objectKey} to bucket ${this.bucket}" }
        val putObjectArgs: PutObjectArgs =
            PutObjectArgs.builder().bucket(this.bucket).`object`(objectKey).stream(data.inputStream(),
                data.size.toLong(), -1).build()
        this.client.putObject(
            putObjectArgs
        )
    }

    override fun get(objectKey: String): ByteArray {
        this.init()
        this.logger.info {
            "Getting object ${objectKey} from bucket ${bucket}"
        }
        val getObjectArgs : GetObjectArgs = GetObjectArgs.builder().`object`(objectKey).bucket(this.bucket).build()
        val response = this.client.getObject(getObjectArgs)
        return response.readBytes()
    }

}