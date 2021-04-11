package di.avi.core.channel;

import di.avi.core.Beat;
import di.avi.core.Channel;
import di.avi.core.Configuration;

public interface ChannelService {

    Beat get(Channel channel);

    void put(Channel channel, Beat beat);

    void configure(Channel channel, Configuration configuration);
}
