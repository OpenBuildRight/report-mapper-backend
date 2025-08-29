package com.openbuildright.reportmapper.backend.web.dto

import com.openbuildright.reportmapper.backend.security.AccessInfo
import com.openbuildright.reportmapper.backend.security.AccessLevel

/**
 * Unified response wrapper that includes access control information
 * This allows the frontend to make UI decisions based on user permissions
 */
data class SecureResponse<T>(
    val data: T?,
    val accessInfo: AccessInfo,
    val message: String? = null
) {
    companion object {
        fun <T> public(data: T, message: String? = null): SecureResponse<T> {
            return SecureResponse(
                data = data,
                accessInfo = AccessInfo(AccessLevel.PUBLIC, false, false, false),
                message = message
            )
        }
        
        fun <T> owner(data: T, canEdit: Boolean = true, canDelete: Boolean = true, message: String? = null): SecureResponse<T> {
            return SecureResponse(
                data = data,
                accessInfo = AccessInfo(AccessLevel.OWNER, canEdit, false, canDelete),
                message = message
            )
        }
        
        fun <T> moderator(data: T, message: String? = null): SecureResponse<T> {
            return SecureResponse(
                data = data,
                accessInfo = AccessInfo(AccessLevel.MODERATOR, true, true, true),
                message = message
            )
        }
        
        fun <T> denied(message: String? = "Access denied"): SecureResponse<T> {
            return SecureResponse(
                data = null,
                accessInfo = AccessInfo(AccessLevel.DENIED, false, false, false),
                message = message
            )
        }
        
        fun <T> custom(data: T?, accessInfo: AccessInfo, message: String? = null): SecureResponse<T> {
            return SecureResponse(data, accessInfo, message)
        }
    }
}
