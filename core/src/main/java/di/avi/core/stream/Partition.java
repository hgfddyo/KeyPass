package di.avi.core.stream;

import di.avi.core.TimePartition;

public class Partition {
    private TimePartition type;
    private long timestamp;

    public Partition(TimePartition type,
                     long timestamp) {
        this.type = type;
        this.timestamp = timestamp;
    }

    TimePartition getType() {
        return type;
    }

    long getTimestamp() {
        return timestamp;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Partition partition = (Partition) o;

        return timestamp == partition.timestamp;
    }

    @Override
    public int hashCode() {
        return (int) (timestamp ^ (timestamp >>> 32));
    }
}
