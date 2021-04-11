package di.avi.spring.config;

import di.avi.core.Environment;
import di.avi.core.channel.ChannelService;
import di.avi.core.channel.Channels;
import di.avi.core.host.HostService;
import di.avi.core.host.Hosts;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@ComponentScan("di.avi")
public class AviConfiguration {
    @Value("${root.directory}")
    private String rootDirectory;

    @Value("${application.key}")
    private String applicationKey;

    @Bean
    public HostService hostService() {
        return new Hosts(Environment.of(rootDirectory, applicationKey));
    }

    @Bean
    @Autowired
    public ChannelService channelService(HostService hostService) {
        return new Channels(Environment.of(rootDirectory, applicationKey), hostService);
    }
}
