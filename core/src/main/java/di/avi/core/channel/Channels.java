package di.avi.core.channel;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import di.avi.core.*;
import di.avi.core.encryption.Keys;
import di.avi.core.host.HostService;
import di.avi.core.stream.Streams;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Comparator;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

import org.apache.commons.codec.binary.Hex;

public class Channels implements ChannelService {
    public static final int CONFIGURATION_INDEX = 2;
    public static final int DATA_INDEX = 3;
    public static final UUID sign = java.util.UUID.fromString("4db16851-2fec-48b2-a10c-03ad8b4364e7");
    public static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private AtomicReference<User> user = new AtomicReference<>();
    private AtomicReference<Host> host = new AtomicReference<>();

    private Environment environment;

    public Channels(Environment environment, HostService hostService) {
        hostService.getHostObservable().subscribe(host -> this.host.set(host));
        hostService.getUserObservable().subscribe(user -> this.user.set(user));
        this.environment = environment;
    }

    //TODO - improve - observable?: last_in_channel, update on get and put,
    @Override
    public Beat get(Channel channel) {
        return decrypt(get(environment, user.get(), channel), user.get());
    }

    @Override
    public void put(Channel channel, Beat beat) {
        byte[] key = user.get().getKey().getKey();
        put(environment, host.get(), user.get(), channel,
                Beat.of(beat.getTimestamp(),
                        beat.getSign(),
                        Keys.fromEncriptedData(
                                Keys.encryptWithMaster(key,
                                        beat.getData()))));
    }

    @Override
    public void configure(Channel channel, Configuration configuration) {
        try {
            configure(environment, host.get(), user.get(), channel, configuration);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public static void configure(Environment environment,
                                 Host host,
                                 User user,
                                 Channel channel,
                                 Configuration configuration) throws IOException {
        Streams.put(
                configurationStream(environment, host, user, channel),
                toBeat(configuration, user));
    }

    public static Beat get(Environment environment,
                           User user,
                           Channel channel) {
        try {
            Path dir = Paths.get(channelPath(environment, user, channel));
            if(!Files.exists(dir)) {
                return null;
            }
            return Files.list(dir)
                    .map(Channels::deviceName)
                    .map(deviceName -> Streams.get(dataStream(environment,
                            Host.of(
                                    Device.of(
                                            UUID.fromString(
                                                    deviceName))),
                            user, channel))).max(Comparator.comparing(
                                    beat -> beat == null ? -1L : beat.getTimestamp()))
                    .get();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public static void put(Environment environment,
                           Host host,
                           User user,
                           Channel channel,
                           Beat beat) {
        try {
            Streams.put(dataStream(environment, host, user, channel), beat);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private static String deviceName(Path path) {
        return path.getName(path.getNameCount() - 1).toString();
    }

    private static String path(String... path) {
        return String.join(File.separator, path);
    }

    public static Stream configurationStream(Environment environment,
                                             Host host,
                                             User user,
                                             Channel channel) {
        return Stream.of(path(environment, host, user, channel, CONFIGURATION_INDEX),
                host.getPartition());
    }

    public static Stream dataStream(Environment environment,
                                    Host host,
                                    User user,
                                    Channel channel) {
        return dataStream(environment, host, user, channel, host.getPartition());
    }

    public static Stream dataStream(Environment environment,
                                    Host host,
                                    User user,
                                    Channel channel,
                                    TimePartition partition) {
        return Stream.of(channelPath(environment, host, user, channel), partition);
    }

    private static String channelPath(Environment environment,
                                      Host host,
                                      User user,
                                      Channel channel) {
        return path(environment, host, user, channel, DATA_INDEX);
    }

    private static String channelPath(Environment environment,
                                      User user,
                                      Channel channel) {
        return channelPath(environment, null, user, channel);
    }

    private static String path(Environment environment,
                               Host host,
                               User user,
                               Channel channel,
                               int index) {
        String path = path(environment.getRootDirectory(),
                user.getUuid().toString(),
                String.valueOf(index),
                channel.getUuid()
                        .toString());
        return host == null ?
                path :
                path(path,
                        host
                                .getDevice()
                                .getUuid()
                                .toString());
    }

    private static Beat toBeat(Configuration configuration, User user) {
        try {
            return new Beat(System.currentTimeMillis(), sign,
                    Keys.fromEncriptedData(
                            Keys.encryptWithMaster(user.getKey().getKey(),
                                    OBJECT_MAPPER.writeValueAsBytes(configuration))));
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    private static Beat decrypt(Beat beat, User user) {
        if(beat == null) {
            return null;
        }
        byte[] key = user.getKey().getKey();
        byte[] data = beat.getData();
        return Beat.of(beat.getTimestamp(),
                beat.getSign(),
                Keys.decryptWithMaster(key, Keys.toEncryptedData(data)));
    }

}
