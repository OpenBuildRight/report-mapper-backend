import openbuildright.reportmapper.backend.model.GeoLocationModel
import org.springframework.data.geo.Point

fun pointToGeoLocationModel(value: Point) : GeoLocationModel {
    return GeoLocationModel(latitude = value.x, longitude = value.y)
}

fun geoLocationModelToPoint(value: GeoLocationModel) : Point {
    return Point(value.latitude,  value.longitude)
}
