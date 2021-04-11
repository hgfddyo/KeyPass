package di.avi.core;

import java.util.UUID;

public class Beat {
    private long timestamp;
    private UUID sign;
    private byte[] data;

    public Beat(long timestamp, UUID sign, byte[] data) {
        this.timestamp = timestamp;
        this.sign = sign;
        this.data = data;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public UUID getSign() {
        return sign;
    }

    public byte[] getData() {
        return data;
    }

    public static Beat of(long timestamp, UUID sign, byte[] data) {
        return new Beat(timestamp, sign, data);
    }
}
