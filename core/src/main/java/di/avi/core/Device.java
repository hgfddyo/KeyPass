package di.avi.core;

import java.util.UUID;

public class Device {
    private UUID uuid;
    private NetworkID networkID;
    private Key key;
    private boolean registered;
    private Capacity capacity;


    public Device() {
    }

    public Device(UUID uuid) {
        this.uuid = uuid;
    }

    public Device(UUID uuid, NetworkID networkID, Key key, boolean registered, Capacity capacity) {
        this.uuid = uuid;
        this.networkID = networkID;
        this.key = key;
        this.registered = registered;
        this.capacity = capacity;
    }

    public UUID getUuid() {
        return uuid;
    }

    public void setUuid(UUID uuid) {
        this.uuid = uuid;
    }

    public NetworkID getNetworkID() {
        return networkID;
    }

    public void setNetworkID(NetworkID networkID) {
        this.networkID = networkID;
    }

    public Key getKey() {
        return key;
    }

    public void setKey(Key key) {
        this.key = key;
    }

    public boolean isRegistered() {
        return registered;
    }

    public void setRegistered(boolean registered) {
        this.registered = registered;
    }

    public Capacity getCapacity() {
        return capacity;
    }

    public void setCapacity(Capacity capacity) {
        this.capacity = capacity;
    }

    public static Device of(UUID uuid) {
        return new Device(uuid);
    }
}
