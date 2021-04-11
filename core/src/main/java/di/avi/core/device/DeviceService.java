package di.avi.core.device;

import di.avi.core.Device;

public interface DeviceService {
    void configure(Device device);

    void register(Device device);

    void unregister(Device device);

    Device get(Device device);
}
