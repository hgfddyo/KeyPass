package di.avi.core.store.streams;

import di.avi.core.Beat;
import di.avi.core.Range;
import di.avi.core.Stream;
import di.avi.core.stream.Beats;
import di.avi.core.stream.Streams;
import di.avi.core.TimePartition;
import org.junit.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.Assert.*;

public class StreamsUnitTC {
    @Test
    public void put() throws Exception {
        Streams.put(
                Stream.of("path", TimePartition.min),
                Beat.of(System.currentTimeMillis(),
                        UUID.randomUUID(), new byte[]{0, 1, 0}));
    }

    @Test
    public void get() throws Exception {
        long timestamp = System.currentTimeMillis();
        UUID sign = UUID.randomUUID();
        byte[] data = {0, 1, 0};
        Stream stream = Stream.of("path", TimePartition.min);
        Streams.put(stream, Beat.of(timestamp, sign, data));
        Beat beat = Streams.get(stream);
        assertEquals(timestamp, beat.getTimestamp());
        assertEquals(sign, beat.getSign());
        assertArrayEquals(data, beat.getData());
    }

    @Test
    public void get1_positive() throws Exception {
        long timestamp = System.currentTimeMillis();
        UUID sign = UUID.randomUUID();
        byte[] data = {0, 1, 0};
        Stream stream = Stream.of("path", TimePartition.min);
        Streams.put(stream, Beat.of(timestamp, sign, data));
        List<Beat> beats = Streams.get(stream, Range.interval(timestamp - 1L, timestamp + 1L));
        assertEquals(1, beats.size());
        Beat beat = beats.get(0);
        assertEquals(timestamp, beat.getTimestamp());
        assertEquals(sign, beat.getSign());
        assertArrayEquals(data, beat.getData());
    }

    @Test
    public void get1_negative() throws Exception {
        long timestamp = System.currentTimeMillis();
        UUID sign = UUID.randomUUID();
        byte[] data = {0, 1, 0};
        Stream stream = Stream.of("path", TimePartition.min);
        Streams.put(stream, Beat.of(timestamp, sign, data));
        List<Beat> beats = Streams.get(stream, Range.interval(timestamp + 100L, timestamp + 200L));
        assertEquals(0, beats.size());
    }

    @Test
    public void scan() throws Exception {
        long timestamp = System.currentTimeMillis();
        UUID sign = UUID.randomUUID();
        byte[] data = {0, 1, 0};
        Stream stream = Stream.of("path", TimePartition.min);
        Streams.put(stream, Beat.of(timestamp, sign, data));
        final int[] count = {0};
        Streams.scan(stream, Range.interval(timestamp - 1L, timestamp + 1L), beat -> {
            count[0]++;
            assertEquals(timestamp, beat.getTimestamp());
            assertEquals(sign, beat.getSign());
            assertArrayEquals(data, beat.getData());
        });
        assertEquals(1, count[0]);
    }

    @Test
    public void scan_negative() throws Exception {
        long timestamp = System.currentTimeMillis();
        UUID sign = UUID.randomUUID();
        byte[] data = {0, 1, 0};
        Stream stream = Stream.of("path", TimePartition.min);
        Streams.put(stream, Beat.of(timestamp, sign, data));
        final int[] count = {0};
        Streams.scan(stream, Range.interval(timestamp + 100L, timestamp + 200L), beat -> {
            count[0]++;
        });
        assertEquals(0, count[0]);
    }
}