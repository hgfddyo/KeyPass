package di.avi.core.stream;

import di.avi.core.Beat;
import di.avi.core.Range;
import di.avi.core.Stream;
import di.avi.core.TimePartition;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.SeekableByteChannel;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Consumer;
import java.util.stream.Collectors;

import static java.nio.file.StandardOpenOption.APPEND;

public abstract class Streams  {

    public static void scan(Stream stream, Range range, Consumer<Beat> callback) {
        scan(stream.getPath(), range,
                (callback));
    }

    public static void put(Stream stream, Beat beat) throws IOException {
        String path = stream.getPath();
        TimePartition partitionType = stream.getPartitionType();
        long offset = log(path, beat, partitionType);
        index(path, beat, offset, partitionType);
    }

    public static void scan(String path,
                            Range range,
                            Consumer<Beat> onBeat) {
        AtomicLong counter = new AtomicLong();
        Partitions.forEach(path, null, range, (partitionsStream ->
                partitionsStream.forEach(
                        partition -> {
                            Partitions.forEachBeat(path, range, onBeat, partition, counter);
                        })));
    }

    public static Beat get(Stream stream) {
        return Partitions.get(stream.getPath(), (partitionsStream ->
                partitionsStream.max(Comparator.comparing(Partition::getTimestamp))
                        .map(partition ->
                                Partitions.getLastBeat(stream.getPath(), partition))
                        .orElseThrow(() ->
                                new IllegalArgumentException("cannot get beat for stream " + stream.getPath()))));
    }

    public static List<Beat> get(Stream stream, Range range) {
        String rootPath = stream.getPath();
        TimePartition timePartition = stream.getPartitionType();
        final AtomicLong count = new AtomicLong();
        return Partitions.get(rootPath, timePartition, range, (partitionsStream ->
                partitionsStream.flatMap(partition -> {
                    List<Beat> beats = new ArrayList<>();
                    Partitions.forEachBeat(rootPath, range, (beats::add), partition, count);
                    return beats.stream();
                }).collect(Collectors.toList())));
    }

    private static void index(String path1,
                              Beat beat,
                              long offset,
                              TimePartition partitionType) throws IOException {
        long timestamp = beat.getTimestamp();

        // path to partitionType file
        Path path = new Partitions.PathBuilder()
                .path(path1)
                .fileType(FileType.index)
                .partition(partitionType)
                .timestamp(timestamp)
                .partitionPath();

        // creates new if does not exists
        Partitions.createIfNotExists(path);

        // put beat to file
        try (SeekableByteChannel channel = Files.newByteChannel(path, APPEND)) {
            ByteBuffer buffer = ByteBuffer.allocate(2 * 8);
            buffer.rewind();
            Beats.put(buffer, new Index(timestamp, offset));
            buffer.flip();
            channel.write(buffer);
        }
    }

    private static long log(String root,
                            Beat beat,
                            TimePartition partitionType) throws IOException {
        byte[] data = beat.getData();
        long timestamp = beat.getTimestamp();
        UUID sign = beat.getSign();

        // path to partitionType file
        Path path = new Partitions.PathBuilder()
                .path(root)
                .fileType(FileType.log)
                .partition(partitionType)
                .timestamp(timestamp)
                .partitionPath();

        // creates new if does not exists
        Partitions.createIfNotExists(path);

        long offset = 0;

        // put beat to file
        try (SeekableByteChannel channel = Files.newByteChannel(path, APPEND)) {
            ByteBuffer buffer = ByteBuffer.allocate(data.length + 4 * 8 + 4);
            buffer.rewind();
            offset += channel.position();
            Beats.put(buffer, beat, offset);
            buffer.flip();
            channel.write(buffer);
        }

        return offset;
    }
}
