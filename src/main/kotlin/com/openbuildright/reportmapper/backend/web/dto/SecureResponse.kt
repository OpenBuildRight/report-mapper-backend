package com.openbuildright.reportmapper.backend.web.dto

/**
 * Simplified response wrapper for observations
 * TODO: Update to use new permission system when needed
 */
data class SecureResponse<T>(
    val data: T?,
    val message: String? = null
) {
    companion object {
        fun <T> public(data: T, message: String? = null): SecureResponse<T> {
            return SecureResponse(
                data = data,
                message = message
            )
        }
        
        fun <T> denied(message: String? = "Access denied"): SecureResponse<T> {
            return SecureResponse(
                data = null,
                message = message
            )
        }
        
        fun <T> custom(data: T?, message: String? = null): SecureResponse<T> {
            return SecureResponse(data, message)
        }
    }
}
