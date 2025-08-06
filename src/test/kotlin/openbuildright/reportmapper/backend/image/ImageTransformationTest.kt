package openbuildright.reportmapper.backend.image

import openbuildright.reportmapper.backend.test.fixtures.jpegExifImageFile
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.MethodSource
import java.awt.Image
import java.awt.image.BufferedImage
import java.io.File
import java.util.stream.Stream
import javax.imageio.ImageIO
import kotlin.test.Test
import kotlin.test.assertContains
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue

data class GetImageTypeTestParam(
    val name: String,
    val expected: ImageType
)

class ImageTransformationTest {

    @Test
    fun readImageMetadataTest() {
        val imageFile : File = jpegExifImageFile()
        val originalImageBytes : ByteArray = imageFile.readBytes()
        val metadata = readImageMetadata(originalImageBytes)
        assertTrue(metadata.location != null)


    }

    @Test
    fun resizeImageTest() {
        val imageFile : File = jpegExifImageFile()
        val originalImageBytes : ByteArray = imageFile.readBytes()
        val resizedImageBytes : ByteArray = resizeImage(originalImageBytes, 20, 20)
        val image : BufferedImage = ImageIO.read(resizedImageBytes.inputStream())
        assertContains(arrayOf(image.width, image.height), 20)
        assertTrue(image.width <= 20)
        assertTrue( image.height <= 20)
    }

    companion object {
        @JvmStatic
        fun getImageTypeParams() : Stream<GetImageTypeTestParam> {
            return Stream.of(
                GetImageTypeTestParam("foo.jpeg", ImageType.JPEG),
                GetImageTypeTestParam("foo.JPEG", ImageType.JPEG),
                GetImageTypeTestParam("foo.jpg", ImageType.JPEG),
                GetImageTypeTestParam("/foo/bar/zar.thing.bing.jpeg", ImageType.JPEG),
                GetImageTypeTestParam("foo.png", ImageType.PNG),
                GetImageTypeTestParam("foo.heic", ImageType.HEIC),
                GetImageTypeTestParam("foo.heif", ImageType.HEIF)
            )
        }
    }


    @ParameterizedTest
    @MethodSource("getImageTypeParams")
    fun getImageTypeTest(param: GetImageTypeTestParam) {
        val actual: ImageType = getImageType(param.name)
        assertEquals(param.expected, actual)
    }

    @Test
    fun getImageTypeTestEInvalidType() {
        assertFailsWith<InvalidImageType> {
            getImageType("foo.zoo")
        }
    }

}