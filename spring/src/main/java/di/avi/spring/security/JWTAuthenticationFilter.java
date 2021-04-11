package di.avi.spring.security;

import di.avi.core.User;
import di.avi.core.host.HostService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.GenericFilterBean;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.concurrent.atomic.AtomicReference;

public class JWTAuthenticationFilter extends GenericFilterBean {
    private String applicationKey;
    private HostService hostService;
    private AtomicReference<User> userReference;

    public JWTAuthenticationFilter(String applicationKey, HostService hostService) {
        this.applicationKey = applicationKey;
        this.hostService = hostService;
        userReference = new AtomicReference<>();
        hostService.getUserObservable().subscribe(user -> userReference.set(user));
    }

    @Override
    public void doFilter(ServletRequest request,
                         ServletResponse response,
                         FilterChain filterChain)
            throws IOException, ServletException {
        Authentication authentication = JWTTokens
                .getAuthentication((HttpServletRequest)request, userReference.get());

        SecurityContextHolder.getContext()
                .setAuthentication(authentication);
        filterChain.doFilter(request,response);
    }
}
