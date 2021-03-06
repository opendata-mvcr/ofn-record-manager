package cz.cvut.kbss.study.security;

import cz.cvut.kbss.study.security.model.AuthenticationToken;
import cz.cvut.kbss.study.security.model.UserDetails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class OntologyAuthenticationProvider implements AuthenticationProvider {

    private static final Logger LOG = LoggerFactory.getLogger(OntologyAuthenticationProvider.class);

    private final UserDetailsService userDetailsService;

    private final PasswordEncoder passwordEncoder;

    public OntologyAuthenticationProvider(UserDetailsService userDetailsService,
                                          PasswordEncoder passwordEncoder) {
        this.userDetailsService = userDetailsService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        final String username = authentication.getPrincipal().toString();
        if (LOG.isDebugEnabled()) {
            LOG.debug("Authenticating user {}", username);
        }

        final UserDetails userDetails = (UserDetails) userDetailsService.loadUserByUsername(username);
        final String password = (String) authentication.getCredentials();
        if (!passwordEncoder.matches(password, userDetails.getPassword())) {
            LOG.trace("Provided password for username '" + username + "' doesn't match.");
            throw new BadCredentialsException("Provided password for username '" + username + "' doesn't match.");
        }
        userDetails.eraseCredentials(); // Don't pass credentials around in the user details object
        final AuthenticationToken token = new AuthenticationToken(userDetails.getAuthorities(), userDetails);
        token.setAuthenticated(true);
        token.setDetails(userDetails);

        final SecurityContext context = new SecurityContextImpl();
        context.setAuthentication(token);
        SecurityContextHolder.setContext(context);
        return token;
    }

    @Override
    public boolean supports(Class<?> aClass) {
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(aClass) ||
                AuthenticationToken.class.isAssignableFrom(aClass);
    }
}
