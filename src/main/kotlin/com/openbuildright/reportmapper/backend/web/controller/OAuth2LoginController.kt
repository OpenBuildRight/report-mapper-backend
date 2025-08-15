package com.openbuildright.reportmapper.backend.web.controller

import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController


/**
 * OAuth2 Log in controller.
 *
 * @author Joe Grandja
 * @author Rob Winch
 */
@RestController
class OAuth2LoginController {
    @GetMapping("/foo")
    fun foo() : String {
        return "foo"
    }

    @GetMapping("/")
    fun index(
        model: Model, @RegisteredOAuth2AuthorizedClient authorizedClient: OAuth2AuthorizedClient,
        @AuthenticationPrincipal oauth2User: OAuth2User
    ): String {
        model.addAttribute("userName", oauth2User.getName())
        model.addAttribute("clientName", authorizedClient.getClientRegistration().getClientName())
        model.addAttribute("userAttributes", oauth2User.getAttributes())
        return "index"
    }
}