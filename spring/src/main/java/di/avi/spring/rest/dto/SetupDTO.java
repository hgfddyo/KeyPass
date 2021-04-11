package di.avi.spring.rest.dto;

public class SetupDTO {
    private String partition;
    private String device;

    public SetupDTO() {
    }

    public SetupDTO(String partition, String device) {
        this.partition = partition;
        this.device = device;
    }

    public String getPartition() {
        return partition;
    }

    public void setPartition(String partition) {
        this.partition = partition;
    }

    public String getDevice() {
        return device;
    }

    public void setDevice(String device) {
        this.device = device;
    }
}
