package di.avi.core.device;

import com.fasterxml.jackson.databind.ObjectMapper;
import di.avi.core.*;
import di.avi.core.stream.Streams;

import java.io.File;
import java.io.IOException;

public class Devices {
    public static final int DEVICES_INDEX = 1;
    private static final TimePartition DEVICE_PARTITION = TimePartition.year;
    private static final java.util.UUID UUID = java.util.UUID.fromString("4db16851-2fec-48b2-a10c-03ad8b4364e7");

    public static void setup(Environment environment, User user, Host host, Device device) {
        try {
            Streams.put(deviceStream(environment, user, host),
                    Beat.of(System.currentTimeMillis(), UUID,
                            new ObjectMapper().writeValueAsBytes(host)));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public static Device get(Environment environment, User user, Host host) {
        try {
            return new ObjectMapper().readValue(
                    Streams.get(deviceStream(environment, user, host)).getData(),
                    Device.class);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private static String path(String... path) {
        return String.join(File.separator, path);
    }

    private static Stream deviceStream(Environment environment, User user, Host host) {
        return Stream.of(
                path(environment.getRootDirectory(),
                        String.valueOf(DEVICES_INDEX),
                        user.getUuid().toString(),
                        host.getDevice().getUuid().toString()),
                DEVICE_PARTITION);
    }
}
