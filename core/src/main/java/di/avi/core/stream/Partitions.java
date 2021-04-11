package di.avi.core.stream;

import di.avi.core.Beat;
import di.avi.core.Range;
import di.avi.core.TimePartition;

import java.io.*;
import java.nio.ByteBuffer;
import java.nio.channels.SeekableByteChannel;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collector;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.nio.file.StandardOpenOption.READ;
import static java.nio.file.StandardOpenOption.WRITE;

public class Partitions {
    private static String TIMESTAMP_PATTERN = "yyyyMMddHHmm";

    public static <R> R get(String path,
                            Function<Stream<Partition>, R> onPartitionStream) {
        return forPartitions(path, null,
                new Range(0, Long.MAX_VALUE, 0, Long.MAX_VALUE),
                onPartitionStream);
    }

    public static <R> R get(String path,
                            TimePartition timePartition,
                            Range range,
                            Function<Stream<Partition>, R> onPartitionStream) {
        return forPartitions(path, timePartition, range, onPartitionStream);
    }

    public static void forEach(String path,
                               TimePartition timePartition,
                               Range range,
                               Consumer<Stream<Partition>> onPartitionStream) {
        forPartitions(path, timePartition, range, (partitionStream -> {
            onPartitionStream.accept(partitionStream);
            return null;
        }));
    }

    public static <R> R forPartitions(String path,
                                      TimePartition timePartition,
                                      Range range,
                                      Function<Stream<Partition>, R> onPartitionStream) {
        Path dir = timePartition != null ?
                new PathBuilder(path)
                        .partition(timePartition)
                        .partitionRoot() :
                Paths.get(path);
        if(!Files.exists(dir)) {
            return null;
        }
        try (java.util.stream.Stream<Path> pathStream = timePartition != null ?
                Files.list(dir) : Files.walk(dir)) {
            Comparator<Partition> comparing = Comparator.comparing(
                    Partition::getTimestamp);
            if (range.isReversed()) {
                comparing.reversed();
            }
            Stream<Partition> partitionSt = pathStream
                    .filter(isLogFile())
                    .map(partition())
                    .filter(within(range))
                    .sorted(comparing);
            return onPartitionStream.apply(partitionSt);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public static void rIndex(String path,
                              Range range) {
        Partitions.forEach(path, null, range, (partitionsStream -> {
            partitionsStream.forEach(partition -> {
                Path indexFile = Partitions.partitionFile(path, partition, FileType.index);
                Path rIndexFile = Partitions.partitionFile(path, partition, FileType.rindex);
                createIfNotExists(rIndexFile);
                try (
                        SeekableByteChannel indexChannel = Files.newByteChannel(indexFile, READ);
                        SeekableByteChannel rIndexChannel = Files.newByteChannel(rIndexFile, WRITE)
                ) {
                    ByteBuffer buffer = ByteBuffer.allocate(16);
                    long size = Files.size(indexFile);
                    int recordSize = 16;
                    for (long position = size - recordSize; position >= 0; position -= 16) {
                        indexChannel.position(position);
                        indexChannel.read(buffer);
                        buffer.flip();
                        rIndexChannel.write(buffer);
                        buffer.clear();
                    }
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            });
        }));
    }


    public static void pack(String path,
                            TimePartition fromPartition,
                            TimePartition toPartition,
                            Range range) throws IOException {
        Partitions.forEach(path, fromPartition, range,
                (partitionsStream -> {
                    partitionsStream
                            .collect(groupBy(toPartition))
                            .entrySet()
                            .forEach(pair -> {
                                try {
                                    Partition targetPartition = pair.getKey();
                                    List<Partition> partitions = pair.getValue();
                                    Path indexFile = Partitions.partitionFile(
                                            path, targetPartition, FileType.index);
                                    Path logFile = Partitions.partitionFile(
                                            path, targetPartition, FileType.log);
                                    createIfNotExists(indexFile);
                                    createIfNotExists(logFile);
                                    try (
                                            SeekableByteChannel logChannel = Files.newByteChannel(logFile, WRITE);
                                            SeekableByteChannel indexChannel = Files.newByteChannel(indexFile, WRITE)
                                    ) {
                                        ByteBuffer buffer = ByteBuffer.allocate(1024);
                                        for (Partition partition : partitions) {
                                            Path componentIndexFile = Partitions.partitionFile(
                                                    path, partition, FileType.index);
                                            Path componentLogFile = Partitions.partitionFile(
                                                    path, partition, FileType.log);
                                            try (
                                                    SeekableByteChannel componentIndexChannel
                                                            = Files.newByteChannel(componentIndexFile, READ);
                                                    SeekableByteChannel componentLogChannel
                                                            = Files.newByteChannel(componentLogFile, READ)
                                            ) {
                                                while (componentLogChannel.read(buffer) > 0) {

                                                    buffer.flip();
                                                    logChannel.write(buffer);
                                                    buffer.clear();
                                                }
                                                while (componentIndexChannel.read(buffer) > 0) {
                                                    buffer.flip();
                                                    indexChannel.write(buffer);
                                                    buffer.clear();
                                                }
                                            }
                                            Files.delete(componentIndexFile);
                                            Files.delete(componentLogFile);
                                        }
                                    }
                                } catch (IOException e) {
                                    throw new RuntimeException(e);
                                }
                            });
                }));
    }

    public static Partition toPartition(Partition partition, TimePartition toPartition) {
        long timestamp = partition.getTimestamp();
        long toPartitionTimestamp = partitionTimestamp(timestamp, toPartition);
        return new Partition(toPartition, toPartitionTimestamp);
    }

    public static Path partitionFile(String path, Partition partition, FileType type) {
        return new Partitions.PathBuilder(path)
                .fileType(type)
                .timestamp(partition.getTimestamp())
                .partition(partition.getType())
                .partitionPath();
    }

    public static String partitionTimestampString(long timestamp, TimePartition partitionType) {
        LocalDateTime localDateTime = partitionDateTime(timestamp, partitionType);
        return localDateTime.format(DateTimeFormatter.ofPattern(TIMESTAMP_PATTERN));
    }

    public static long partitionTimestamp(long timestamp, TimePartition partitionType) {
        return partitionDateTime(timestamp, partitionType)
                .atZone(ZoneId.systemDefault())
                .toInstant()
                .toEpochMilli();
    }

    public static String partitionTimestampString(Path path) {
        String name = path.getName(path.getNameCount() - 1).toString();
        name = name.substring(0, name.indexOf("."));
        return name;
    }

    private static LocalDateTime partitionDateTime(long timestamp, TimePartition partitionType) {
        LocalDateTime localDate = Instant.ofEpochMilli(timestamp)
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();
        int year = 0;
        Month month = Month.JANUARY;
        int day = 1;
        int hr = 0;
        int min = 0;
        switch (partitionType) {
            case min:
                min = localDate.getMinute();
            case hr:
                hr = localDate.getHour();
            case day:
                day = localDate.getDayOfMonth();
            case month:
                month = localDate.getMonth();
            case year:
                year = localDate.getYear();
        }
        return LocalDateTime.of(year, month, day, hr, min);
    }

    private static Function<Path, Partition> partition() {
        return path -> new Partition(partitionType(path), timestamp(path));
    }

    private static Predicate<Partition> within(Range range) {
        return partition -> {
            long normalisedTime = partitionTimestamp(partition.getTimestamp(), partition.getType());
            long normalisedTo = partitionTimestamp(range.getTo(), partition.getType());
            long normalisedFrom = partitionTimestamp(range.getFrom(), partition.getType());
            return range.isReversed() ?
                    normalisedTime <= normalisedFrom && normalisedTime >= normalisedTo :
                    normalisedTime <= normalisedTo && normalisedTime >= normalisedFrom;
        };
    }

    private static Predicate<Path> isLogFile() {
        return path -> path.toString().endsWith(".log");
    }

    private static TimePartition partitionType(Path path) {
        int nameCount = path.getNameCount();
        return TimePartition.valueOf(path.getName(nameCount - 2).toString());
    }

    private static long timestamp(Path path) {
        String timestampString = partitionTimestampString(path);
        return timestamp(timestampString);
    }

    private static long timestamp(String timestampString) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(TIMESTAMP_PATTERN);
        ZoneId zone = ZoneId.systemDefault();
        return LocalDateTime.parse(timestampString, formatter)
                .atZone(zone).toInstant().toEpochMilli();
    }

    public static class PathBuilder {
        private FileType fileType;
        private String path;
        private long timestamp = -1;
        private TimePartition partitionType;

        PathBuilder() {
        }

        PathBuilder(String path) {
            this.path = path;
        }

        PathBuilder fileType(FileType fileType) {
            this.fileType = fileType;
            return this;
        }

        PathBuilder path(String root) {
            this.path = root;
            return this;
        }

        PathBuilder timestamp(long timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        PathBuilder partition(TimePartition partitionType) {
            this.partitionType = partitionType;
            return this;
        }

        Path partitionPath() {
            Objects.requireNonNull(fileType);
            Objects.requireNonNull(path);
            Objects.requireNonNull(partitionType);
            return Paths.get(String.join(File.separator,
                    path,
                    partitionType.name(),
                    partitionTimestampString(timestamp, partitionType))
                    + '.' + fileType.name());
        }

        Path partitionRoot() {
            Objects.requireNonNull(path);
            Objects.requireNonNull(partitionType);
            return Paths.get(String.join(File.separator,
                    path,
                    partitionType.name()));
        }
    }

    public static void forEachBeat(String rootPath,
                                   Range range,
                                   Consumer<Beat> onBeat,
                                   Partition partition,
                                   AtomicLong counter) {
        if (range.isReversed()) {
            forEachBeatReverseOrder(rootPath, range, onBeat, partition, counter);
        } else {
            forEachBeatDirectOrder(rootPath, range, onBeat, partition, counter);
        }
    }

    public static void forEachBeatDirectOrder(String rootPath,
                                              Range range,
                                              Consumer<Beat> onBeat,
                                              Partition partition,
                                              AtomicLong counter) {
        Path indexFile = Partitions.partitionFile(rootPath, partition, FileType.index);
        Path logFile = Partitions.partitionFile(rootPath, partition, FileType.log);
        try (
                SeekableByteChannel indexChannel = Files.newByteChannel(indexFile, READ);
                DataInputStream logInputStream = dataInputStream(logFile)
        ) {
            ByteBuffer buffer = ByteBuffer.allocate(1024);
            long startOffset = -1;
            channel:
            while (indexChannel.read(buffer) > 0) {
                buffer.flip();
                while (buffer.remaining() >= 16) {
                    Index index = Beats.readIndex(buffer);
                    if (index.getTimestamp() > range.getFrom()
                            && counter.getAndIncrement() >= range.getOffset()) {
                        startOffset = index.getOffset();
                        break channel;
                    }
                }
                buffer.clear();
            }
            buffer.clear();
            if (startOffset < 0) {
                return;
            }
            long read = logInputStream.skip(startOffset);
            while (read >= 0 && logInputStream.available() > 0) {
                Beat beat = Beats.readBeat(logInputStream);
                if (beat.getTimestamp() > range.getTo()
                        || counter.getAndIncrement() >= range.getOffset() + range.getLimit()) {
                    break;
                }
                onBeat.accept(beat);
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public static void forEachBeatReverseOrder(String rootPath,
                                               Range range,
                                               Consumer<Beat> onBeat,
                                               Partition partition,
                                               AtomicLong counter) {
        Path indexFile = Partitions.partitionFile(rootPath, partition, FileType.index);
        Path logFile = Partitions.partitionFile(rootPath, partition, FileType.log);
        try (
                SeekableByteChannel indexChannel = Files.newByteChannel(indexFile, READ);
                RandomAccessFile log = new RandomAccessFile(logFile.toString(), "r")
        ) {
            int capacity = 1024;
            ByteBuffer buffer = ByteBuffer.allocate(capacity);
            long position = indexChannel.size();
            long endTime = range.getFrom();
            long startTime = range.getTo();
            boolean read = true;
            channel:
            while (read) {
                position = position - capacity;
                if (position < 0) {
                    buffer = ByteBuffer.allocate((int) (capacity + position));
                    position = 0;
                }
                if (position == 0) {
                    read = false;
                }
                indexChannel.position(position);
                if (indexChannel.read(buffer) <= 0) {
                    break;
                }
                buffer.flip();
                long timestamp = Long.MAX_VALUE;
                List<Long> offsets = new LinkedList<>();
                while (buffer.remaining() >= 16 && timestamp > startTime) {
                    Index index = Beats.readIndex(buffer);
                    timestamp = index.getTimestamp();
                    long increment = counter.getAndIncrement();
                    if (increment >= range.getOffset()) {
                        if (timestamp < endTime && increment <= range.getLimit()) {
                            offsets.add(index.getOffset());
                        } else {
                            break channel;
                        }
                    }
                }
                Collections.reverse(offsets);
                offsets.forEach(offset -> {
                    try {
                        log.seek(offset);
                        onBeat.accept(Beats.readBeat(log));
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                });
                buffer.clear();
            }
            buffer.clear();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public static long getOffset(String rootPath, Partition partition) {
        long lastRecordOffset;
        Path rIndexFile = Partitions.partitionFile(rootPath, partition, FileType.rindex);
        if (Files.exists(rIndexFile)) {
            try (
                    SeekableByteChannel indexChannel = Files.newByteChannel(rIndexFile, READ);
            ) {
                ByteBuffer buffer = ByteBuffer.allocate(16);
                indexChannel.read(buffer);
                buffer.flip();
                long timestamp = buffer.getLong();
                lastRecordOffset = buffer.getLong();
                return lastRecordOffset;
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        } else {
            Path indexFile = Partitions.partitionFile(rootPath, partition, FileType.index);
            try (
                    SeekableByteChannel indexChannel = Files.newByteChannel(indexFile, READ);
            ) {
                //calculate position of the last record
                long size = Files.size(indexFile);
                int recordSize = 16;
                long position = size - recordSize;

                //seek to the position
                indexChannel.position(position);

                //read offset
                ByteBuffer buffer = ByteBuffer.allocate(16);
                indexChannel.read(buffer);
                buffer.flip();
                long timestamp = buffer.getLong();
                lastRecordOffset = buffer.getLong();
                return lastRecordOffset;
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
    }

    public static Beat getLastBeat(String rootPath, Partition partition) {
        long lastRecordOffset = getOffset(rootPath, partition);
        Path logFile = Partitions.partitionFile(rootPath, partition, FileType.log);
        try (
                DataInputStream logInputStream = dataInputStream(logFile)
        ) {
            if (lastRecordOffset > 0) {
                long read = logInputStream.skip(lastRecordOffset);
                if (read <= 0) {
                    throw new RuntimeException("wrong offset: " + lastRecordOffset);
                }
            }
            return Beats.readBeat(logInputStream);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private static Collector<Partition, ?, Map<Partition, List<Partition>>> groupBy(
            TimePartition toPartition) {
        return Collectors.groupingBy(partition -> Partitions.toPartition(partition, toPartition));
    }

    private static DataInputStream dataInputStream(Path logFile) throws IOException {
        return new DataInputStream(
                new BufferedInputStream(
                        Files.newInputStream(logFile, READ)));
    }

    public static void createIfNotExists(Path path) {
        try {
            if (!Files.exists(path)) {
                Path parent = path.getParent();
                if (!Files.exists(parent)) {
                    Files.createDirectories(parent);
                }
                Files.createFile(path);
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}