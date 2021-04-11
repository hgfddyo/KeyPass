package di.avi.core;

public class Host {
    private TimePartition partition;

    private Device device;

    public Host() {
    }

    public Host(TimePartition partition, Device device) {
        this.partition = partition;
        this.device = device;
    }

    public Device getDevice() {
        return device;
    }

    public void setDevice(Device device) {
        this.device = device;
    }

    public TimePartition getPartition() {
        return partition;
    }

    public void setPartition(TimePartition partition) {
        this.partition = partition;
    }

    public static Host of(TimePartition partition, Device device) {
        return new Host(partition, device);
    }

    public static Host of(Device device) {
        return new Host(null, device);
    }
}
