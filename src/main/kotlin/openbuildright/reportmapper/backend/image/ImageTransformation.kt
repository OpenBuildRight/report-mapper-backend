package openbuildright.reportmapper.backend.image

import openbuildright.reportmapper.backend.exception.ReportMapperException
import openbuildright.reportmapper.backend.web.InvalidImageFile
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

enum class ImageType {
    JPEG, PNG, HEIF, HEIC
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

fun getImageType(name: String) : ImageType {
    var extension: String? = null
    val i: Int = name.lastIndexOf('.')
    if (i > 0) {
        extension = name.substring(i + 1)
    } else {
        throw InvalidImageFile("Unable to determine file type from image name ${name}.")
    }
    return ImageType.valueOf(name.uppercase())
}

fun normalizeImage(data: ByteArray, name: String) {

}
