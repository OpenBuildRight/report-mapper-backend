package openbuildright.reportmapper.backend.image

import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.MethodSource
import java.util.stream.Stream
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

data class GetImageTypeTestParam(
    val name: String,
    val expected: ImageType
)

class ImageTransformationTest {

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