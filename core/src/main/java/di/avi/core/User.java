package di.avi.core;

import java.util.UUID;

public class User {
    private UUID uuid;

    private Key key;

    public User() {
    }

    public User(UUID uuid, Key key) {
        this.uuid = uuid;
        this.key = key;
    }

    public UUID getUuid() {
        return uuid;
    }

    public void setUuid(UUID uuid) {
        this.uuid = uuid;
    }

    public Key getKey() {
        return key;
    }

    public void setKey(Key key) {
        this.key = key;
    }

    public static User of(UUID uuid, Key key) {
        return new User(uuid, key);
    }

    public static User of(UUID uuid) {
        return new User(uuid, null);
    }

}
