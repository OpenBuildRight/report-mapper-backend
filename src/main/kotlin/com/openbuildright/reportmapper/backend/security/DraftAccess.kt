package com.openbuildright.reportmapper.backend.security

import org.springframework.security.access.prepost.PreAuthorize

/**
 * Custom annotation for controlling access to draft resources.
 * Users can only access their own draft resources.
 */
@Target(AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
@PreAuthorize("@draftAccessService.canAccessDraft(#imageId, authentication.name)")
annotation class DraftAccess

/**
 * Custom annotation for controlling access to draft resources with custom parameter.
 * Users can only access their own draft resources.
 */
@Target(AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
@PreAuthorize("@draftAccessService.canAccessDraft(#resourceId, authentication.name)")
annotation class DraftAccessById(val resourceId: String = "resourceId")
