package di.avi.core.host;

import di.avi.core.Host;
import di.avi.core.Login;
import di.avi.core.User;
import io.reactivex.Observable;

public interface HostService {

    User login(Login login);

    User getUser();

    void setup(Host host);

    Host getSetup();

    Observable<User> getUserObservable();

    Observable<Host> getHostObservable();
}
