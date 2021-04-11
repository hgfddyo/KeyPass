package di.avi.spring.security;

import di.avi.core.User;
import di.avi.core.host.HostService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Date;
import java.util.UUID;

import static java.util.Collections.emptyList;

public class JWTTokens {
    static final long EXPIRATIONTIME = 864_000_000; // 10 days
    static final String TOKEN_PREFIX = "Bearer";
    static final String HEADER_STRING = "Authorization";

    public static String token(User user) {
        return Jwts.builder()
                    .setSubject(user.getUuid().toString())
                    .setExpiration(new Date(System.currentTimeMillis() + EXPIRATIONTIME))
                    .signWith(SignatureAlgorithm.HS512, user.getKey().getKey())
                    .compact();
    }

    public static Authentication getAuthentication(HttpServletRequest request,
                                                   User currentUser) {
        String token = request.getHeader(HEADER_STRING);
        if (token != null && currentUser != null) {
            // parse the token.
            String user = Jwts.parser()
                    .setSigningKey(currentUser.getKey().getKey())
                    .parseClaimsJws(token.replace(TOKEN_PREFIX, ""))
                    .getBody()
                    .getSubject();

            if (user != null && currentUser.getUuid().toString().equals(user)) {
                return new UsernamePasswordAuthenticationToken(user, null, emptyList());
            }
        }
        return null;
    }
}
