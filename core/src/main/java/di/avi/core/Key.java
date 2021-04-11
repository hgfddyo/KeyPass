package di.avi.core;

public class Key {
    private byte[] key;
    private long ttl = -1;
    private long timestamp = -1;

    public Key() {
    }

    public Key(byte[] key) {
        this.key = key;
    }

    public byte[] getKey() {
        return key;
    }

    public void setKey(byte[] key) {
        this.key = key;
    }

    public long getTtl() {
        return ttl;
    }

    public void setTtl(long ttl) {
        this.ttl = ttl;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public static Key of(byte[] bytes) {
        return new Key(bytes);
    }
}
