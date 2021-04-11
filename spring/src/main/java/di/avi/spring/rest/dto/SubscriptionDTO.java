package di.avi.spring.rest.dto;

import java.util.List;

public class SubscriptionDTO {
    private ChannelDTO source;
    private List<ChannelDTO> subsribers;

    public ChannelDTO getSource() {
        return source;
    }

    public void setSource(ChannelDTO source) {
        this.source = source;
    }

    public List<ChannelDTO> getSubsribers() {
        return subsribers;
    }

    public void setSubsribers(List<ChannelDTO> subsribers) {
        this.subsribers = subsribers;
    }
}
