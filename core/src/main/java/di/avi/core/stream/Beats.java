package di.avi.core.stream;

import di.avi.core.Beat;

import java.io.DataInputStream;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.ByteBuffer;
import java.util.UUID;

public class Beats {
    public static void put(ByteBuffer buffer, Beat beat, long offset) {
        buffer.putLong(beat.getTimestamp());
        buffer.putLong(offset);
        UUID sign = beat.getSign();
        buffer.putLong(sign.getMostSignificantBits());
        buffer.putLong(sign.getLeastSignificantBits());
        byte[] data = beat.getData();
        int size = data.length;
        buffer.putInt(size);
        buffer.put(data, 0, size);
    }

    public static void put(ByteBuffer buffer, Index index) {
        buffer.putLong(index.getTimestamp());
        buffer.putLong(index.getOffset());
    }

    public static Index readIndex(ByteBuffer buffer) {
        return new Index(buffer.getLong(), buffer.getLong());
    }

    public static Beat readBeat(DataInputStream logInputStream) throws IOException {//Todo remove duplicates
        long timestamp = logInputStream.readLong();
        long offset = logInputStream.readLong();
        UUID sign = new UUID(logInputStream.readLong(), logInputStream.readLong());
        int size = logInputStream.readInt();
        byte[] data = new byte[size];
        int dataRead = logInputStream.read(data);
        if (dataRead != size) {
            throw new RuntimeException(
                    "wrong data: size: " + size + " does no match actual data size: " + dataRead);
        }
        return new Beat(timestamp, sign, data);
    }

    public static Beat readBeat(RandomAccessFile log) throws IOException {
        long timestamp = log.readLong();
        log.readLong();
        UUID sign = new UUID(log.readLong(), log.readLong());
        int size = log.readInt();
        byte[] data = new byte[size];
        int dataRead = log.read(data);
        if (dataRead != size) {
            throw new RuntimeException(
                    "wrong data: size: " + size + " does no match actual data size: " + dataRead);
        }
        return new Beat(timestamp, sign, data);
    }
}
