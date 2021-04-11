package di.avi.spring.rest;

import di.avi.core.*;
import di.avi.core.channel.ChannelService;
import di.avi.core.host.HostService;
import di.avi.spring.rest.dto.*;
import di.avi.spring.security.JWTTokens;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;
import java.util.stream.Collectors;

@RestController
public class AviController {
    private HostService hostService;
    private ChannelService channelService;

    @Value("${application.key}")
    private String applicationKey;

    @Autowired
    public AviController(HostService hostService,
                         ChannelService channelService) {
        this.hostService = hostService;
        this.channelService = channelService;
    }

    @RequestMapping(value = "/login", method = RequestMethod.POST)
    private ResultDTO login(@RequestBody LoginDTO login) {
        User user = hostService.login(Login.of(login.getLogin(), login.getPassword()));
        String jwt = JWTTokens.token(user);
        return new ResultDTO("OK", jwt);
    }

    @RequestMapping(value = "/setup", method = RequestMethod.POST)
    private ResultDTO setup(@RequestBody SetupDTO setup) {
        hostService.setup(
                Host.of(
                        TimePartition.valueOf(
                                setup.getPartition()),
                        Device.of(UUID.fromString(
                                setup.getDevice()))));
        return new ResultDTO("OK");
    }

    @RequestMapping(value = "/setup", method = RequestMethod.GET)
    private ResultDTO getSetup() {
        Host setup = hostService.getSetup();
        return new ResultDTO("OK", setup == null ? null : new SetupDTO(
                setup.getPartition().name(),
                setup.getDevice().getUuid().toString()));
    }

    @RequestMapping(value = "/register", method = RequestMethod.POST)
    private ResultDTO register(@RequestBody DeviceDTO device) {
        return new ResultDTO("OK", device);
    }

    @RequestMapping(value = "/unregister", method = RequestMethod.POST)
    private ResultDTO unregister(@RequestBody DeviceDTO device) {
        return new ResultDTO("OK", device);
    }

    @RequestMapping(value = "/subscribe", method = RequestMethod.POST)
    private ResultDTO subscribe(@RequestBody SubscriptionDTO subscriptionDTO) {
        UUID uuid = UUID.fromString(subscriptionDTO.getSource().getUuid());
        long now = System.currentTimeMillis();
        String[] subscribers = subscriptionDTO.getSubsribers().stream()
                .map(ChannelDTO::getUuid).collect(Collectors.toList())
                .toArray(new String[0]);
        channelService.configure(Channel.of(uuid), Configuration.of(now, subscribers));
        return new ResultDTO("OK");
    }

    @RequestMapping(value = "/put", method = RequestMethod.POST)
    private ResultDTO put(@RequestBody PutDTO putDTO) {
        channelService.put(Channel.of(
                UUID.fromString(putDTO.getChannel().getUuid())),
                Beat.of(System.currentTimeMillis(),
                        UUID.fromString(putDTO.getSign()),
                        putDTO.getData().getContent().getBytes()));
        return new ResultDTO("OK");
    }

    @RequestMapping(value = "/get", method = RequestMethod.POST)
    private ResultDTO get(@RequestBody ChannelDTO aChannel) {
        Channel channel = Channel.of(UUID.fromString(aChannel.getUuid()));
        Beat beat = channelService.get(channel);
        return new ResultDTO("OK", beat == null ? "" : new String(beat.getData()));
    }
}
