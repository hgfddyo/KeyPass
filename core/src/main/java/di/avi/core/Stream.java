package di.avi.core;

public class Stream {
    private String path;
    private TimePartition partitionType;

    public static Stream of(String path, TimePartition partitionType) {
        return new Stream(path, partitionType);
    }

    public Stream(String path, TimePartition partitionType) {
        this.path = path;
        this.partitionType = partitionType;
    }

    public String getPath() {
        return path;
    }

    public TimePartition getPartitionType() {
        return partitionType;
    }
}
