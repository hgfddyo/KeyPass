package di.avi.core;

import java.util.UUID;

public class Channel {
    private UUID uuid;

    public Channel(UUID uuid) {
        this.uuid = uuid;
    }

    public UUID getUuid() {
        return uuid;
    }

    public void setUuid(UUID uuid) {
        this.uuid = uuid;
    }

    public static Channel of(UUID uuid) {
        return new Channel(uuid);
    }
}
