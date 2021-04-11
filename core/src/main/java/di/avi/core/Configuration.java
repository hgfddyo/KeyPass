package di.avi.core;

public class Configuration {
    private Long timestamp;
    private String[] subscribers;

    public Configuration(Long timestamp, String[] subscribers) {
        this.timestamp = timestamp;
        this.subscribers = subscribers;
    }

    public Long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }

    public String[] getSubscribers() {
        return subscribers;
    }

    public void setSubscribers(String[] subscribers) {
        this.subscribers = subscribers;
    }

    public static Configuration of(Long timestamp, String[] subscribers) {
        return new Configuration(timestamp, subscribers);
    }
}
