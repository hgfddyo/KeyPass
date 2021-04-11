package di.avi.core.host;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import di.avi.core.*;
import di.avi.core.encryption.Keys;
import di.avi.core.stream.Streams;
import io.reactivex.Observable;
import io.reactivex.subjects.PublishSubject;
import io.reactivex.subjects.Subject;

import java.io.File;
import java.io.IOException;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

import static di.avi.core.encryption.Keys.fromEncriptedData;
import static di.avi.core.encryption.Keys.toEncryptedData;
import static java.util.Optional.of;
import static java.util.Optional.ofNullable;

public class Hosts implements HostService {
    private static final int HOSTS_INDEX = 0;
    private static final TimePartition HOST_PARTITION = TimePartition.year;
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private Environment environment;

    private Subject<User> userSubject = PublishSubject.create();
    private Subject<Host> hostSubject = PublishSubject.create();

    private AtomicReference<User> userAtomicReference = new AtomicReference<>();
    private AtomicReference<Host> hostAtomicReference = new AtomicReference<>();


    public Hosts(Environment environment) {
        this.environment = environment;
        userSubject.subscribe(userAtomicReference::set);
        hostSubject.subscribe(hostAtomicReference::set);
    }


    @Override
    public User getUser() {
        return userAtomicReference.get();
    }

    @Override
    public User login(Login login) {
        User user = login(environment, login);
        userSubject.onNext(user);
        getHost(environment, user).ifPresent(hostSubject::onNext);
        return user;
    }

    @Override
    public void setup(Host host) {
        setupHost(environment, userAtomicReference.get(), host);
        hostSubject.onNext(host);
    }

    public Host getSetup() {
        return hostAtomicReference.get();
    }

    @Override
    public Observable<User> getUserObservable() {
        return userSubject;
    }

    @Override
    public Observable<Host> getHostObservable() {
        return hostSubject;
    }

    private static void setupHost(Environment environment, User user, Host host) {
        try {
            long now = System.currentTimeMillis();
            Streams.put(hostsStream(environment, user),
                    Beat.of(now,
                            uuid(environment.getApplicationKey()),
                            encryptHost(user, host)));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private static Optional<Host> getHost(Environment environment, User user) {
        try {
            Beat beat = Streams.get(hostsStream(environment, user));
            return ofNullable(
                    beat == null ?
                            null :
                            dencryptHost(user, beat.getData()));
        } catch (Exception e) {
            e.printStackTrace();
            return Optional.empty();
        }
    }

    private static User login(Environment environment, Login login) {
        String userName = login.getLogin();
        String password = login.getPassword();
        String applicationKey = environment.getApplicationKey();
        return User.of(
                uuid(userName),
                key(password, applicationKey));
    }


    private static java.util.UUID uuid(String login) {
        return UUID.nameUUIDFromBytes(login.getBytes());
    }

    private static Key key(String password, String applicationKey) {
        byte[] masterKey = Keys.generateMasterKey(password, applicationKey);
        return Key.of(masterKey);
    }

    private static String path(String... path) {
        return String.join(File.separator, path);
    }

    private static Stream hostsStream(Environment environment, User user) {
        String rootDirectory = environment.getRootDirectory();
        String index = String.valueOf(HOSTS_INDEX);
        String uuid = user.getUuid().toString();
        return Stream.of(
                path(rootDirectory, uuid, index),
                HOST_PARTITION);
    }

    private static byte[] encryptHost(User user, Host host) throws JsonProcessingException {
        return fromEncriptedData(
                Keys.encryptWithMaster(
                        user.getKey().getKey(),
                        OBJECT_MAPPER.writeValueAsBytes(host)));
    }

    private static Host dencryptHost(User user, byte[] data) throws IOException {
        return OBJECT_MAPPER.readValue(
                Keys.decryptWithMaster(user.getKey().getKey(),
                        toEncryptedData(data)),
                Host.class);
    }
}
