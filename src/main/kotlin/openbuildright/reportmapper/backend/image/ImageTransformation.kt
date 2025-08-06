package openbuildright.reportmapper.backend.image

import com.drew.imaging.ImageMetadataReader
import com.drew.metadata.Metadata
import com.drew.metadata.exif.ExifSubIFDDirectory
import com.drew.metadata.exif.GpsDirectory
import io.github.oshai.kotlinlogging.KLogger
import io.github.oshai.kotlinlogging.KotlinLogging
import openbuildright.reportmapper.backend.exception.ReportMapperException
import openbuildright.reportmapper.backend.model.GeoLocationModel
import openbuildright.reportmapper.backend.model.ImageMetadataExtract
import org.apache.commons.io.output.ByteArrayOutputStream
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus
import java.awt.Image
import java.awt.image.BufferedImage
import java.time.Instant
import javax.imageio.ImageIO
import kotlin.math.min


private val LOGGER : KLogger = KotlinLogging.logger {}

enum class ImageType{
    JPEG,
    PNG,
    HEIF,
    HEIC
}

enum class ImageTypeRaw(val final: ImageType){
    JPEG(ImageType.JPEG),
    JPG(ImageType.JPEG),
    PNG(ImageType.PNG),
    HEIF(ImageType.HEIF),
    HEIC(ImageType.HEIC);
}

@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "Image type not supported.")
open class InvalidImageType : ReportMapperException {
    constructor() : super()
    constructor(message: String?) : super(message)
    constructor(message: String?, cause: Throwable?) : super(message, cause)
    constructor(cause: Throwable?) : super(cause)
    constructor(message: String?, cause: Throwable?, enableSuppression: Boolean, writableStackTrace: Boolean) : super(
        message,
        cause,
        enableSuppression,
        writableStackTrace
    )

}

@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "Unable to read image")
open class InvalidImage : ReportMapperException {
    constructor() : super()
    constructor(message: String?) : super(message)
    constructor(message: String?, cause: Throwable?) : super(message, cause)
    constructor(cause: Throwable?) : super(cause)
    constructor(message: String?, cause: Throwable?, enableSuppression: Boolean, writableStackTrace: Boolean) : super(
        message,
        cause,
        enableSuppression,
        writableStackTrace
    )

}

fun getImageType(name: String) : ImageType {
    var extension: String? = null
    val i: Int = name.lastIndexOf('.')
    if (i > 0) {
        extension = name.substring(i + 1)
        try {
            return ImageTypeRaw.valueOf(extension.uppercase()).final
        } catch (e: IllegalArgumentException) {
            throw InvalidImageType("File ${name} Image type ${extension} is not supported.", e)
        }
    } else {
        throw InvalidImageType("Unable to determine file type from image name ${name}.")
    }
}


fun readMetadataDateTime(metadata: Metadata) : Instant? {
    val exifSubIFDirectory : ExifSubIFDDirectory? = metadata.getFirstDirectoryOfType(ExifSubIFDDirectory::class.java)
    return exifSubIFDirectory?.dateOriginal?.toInstant()
}

fun readMetadataLocation(metadata: Metadata) : GeoLocationModel? {
    val gpsDirectory = metadata.getFirstDirectoryOfType(GpsDirectory::class.java)
    val latitude : Double? = gpsDirectory?.geoLocation?.latitude
    val longitude: Double? = gpsDirectory?.geoLocation?.longitude
    if (latitude != null && longitude != null) {
        return GeoLocationModel(latitude, longitude)
    }
    return null
}


fun readImageMetadata(data: ByteArray) : ImageMetadataExtract {
    val metadata : Metadata? = ImageMetadataReader.readMetadata(data.inputStream())
    val geoLocation : GeoLocationModel? = metadata?.let {readMetadataLocation(it)}
    val dateTime: Instant? = metadata?.let {readMetadataDateTime(it)}
    return ImageMetadataExtract(location=geoLocation,dateTime)
}

fun resizePercent(current: Int, target: Int) : Double {
    if (current <= target) {
        return 1.0
    }
    return target.toDouble() / current.toDouble()
}


fun resizeImage(data: ByteArray, maxWidth: Int, maxHeight: Int) : ByteArray {
    if (data.isEmpty()) {
        throw InvalidImage("Image is empty.")
    }
    val image: BufferedImage = ImageIO.read(data.inputStream())
    val imageWidth : Int = image.width
    val imageHeight : Int = image.height
    val widthPercent : Double = resizePercent(imageWidth, maxWidth)
    val heightPercent : Double = resizePercent(imageHeight, maxHeight)
    val resizePercent : Double = min(widthPercent, heightPercent)
    val targetWidth : Int = (imageWidth * resizePercent).toInt()
    val targetHeight : Int = (imageHeight * resizePercent).toInt()
    val resizedImage = image.getScaledInstance(targetWidth, targetHeight, Image.SCALE_DEFAULT)
    val targetImage = BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_RGB)
    targetImage.graphics.drawImage(resizedImage, 0, 0, null)
    val outStream  = ByteArrayOutputStream()
    ImageIO.write(targetImage, "jpg", outStream)
    val targetBytes = outStream.toByteArray()
    if (targetBytes.isEmpty()) {
        throw ReportMapperException("Failed to create valid image")
    }
    return targetBytes
}
