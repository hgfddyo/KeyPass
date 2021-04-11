package di.avi.core.stream;

public class Index {
    private long timestamp;
    private long offset;

    public Index(long timestamp, long offset) {
        this.timestamp = timestamp;
        this.offset = offset;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public long getOffset() {
        return offset;
    }
}
