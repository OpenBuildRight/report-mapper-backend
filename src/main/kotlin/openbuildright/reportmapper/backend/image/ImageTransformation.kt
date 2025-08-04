package openbuildright.reportmapper.backend.image

import io.github.oshai.kotlinlogging.KLogger
import io.github.oshai.kotlinlogging.KotlinLogging
import openbuildright.reportmapper.backend.exception.ReportMapperException
import org.apache.commons.io.output.ByteArrayOutputStream
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus
import java.awt.image.BufferedImage
import javax.imageio.ImageIO
import kotlin.math.min
import java.awt.Graphics2D
import javax.imageio.ImageReader
import javax.imageio.metadata.IIOMetadata
import javax.imageio.stream.ImageInputStream


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



fun readImageMetadata(data: ByteArray) {

    val inputStream : ImageInputStream? = ImageIO.createImageInputStream(data)
    if (inputStream == null) {
        LOGGER.error {  "Unable to generate input stream." }
        throw InvalidImage("Unable to generate input stream.")
    }
    val readers : Iterator<ImageReader> = ImageIO.getImageReaders(inputStream)
    for (reader: ImageReader in readers) {
        reader.setInput(inputStream, true)
        val numberImages = reader.getNumImages(true)
        for (i in 0..<numberImages) {
            val metadata : IIOMetadata = reader.getImageMetadata(i)
            val names = metadata.metadataFormatNames
        }
    }
}

fun resizePercent(current: Int, target: Int) : Double {
    if (current <= target) {
        return 1.0
    }
    return current.toDouble() / target.toDouble()
}


fun resizeImage(data: ByteArray, maxWidth: Int, maxHeight: Int) : ByteArray {
    val image: BufferedImage = ImageIO.read(data.inputStream())
    val widthPercent : Double = resizePercent(image.width, maxWidth)
    val heightPercent : Double = resizePercent(image.height, maxHeight)
    val resizePercent : Double = min(widthPercent, heightPercent)
    val targetWidth : Int = (image.width * resizePercent).toInt()
    val targetHeight : Int = (image.height * resizePercent).toInt()
    val targetImage = BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_ARGB)
    val graphics2D : Graphics2D = targetImage.createGraphics()
    graphics2D.drawImage(image, 0, 0, null )
    val outStream : ByteArrayOutputStream = ByteArrayOutputStream()
    ImageIO.write(targetImage, "jpg", outStream)
    return outStream.toByteArray()
}
