package openbuildright.reportmapper.backend.test.fixtures

import java.io.File
import java.net.URL

fun getResource(path: String) : File {
    val url : URL =  object {}.javaClass.classLoader.getResource("test-data/jpeg/exif/2024-04-30_G012.JPG")!!
    return File(url.toURI())

}

fun jpegExifImageFile() : File {
    return getResource("test-data/jpeg/exif/2024-04-30_G012.JPG")
}
