package di.avi.core;

public class Range {
    private long from;
    private long to;
    private long offset;
    private long limit;
    private boolean reversed;

    public static Range interval(long from, long to) {
        return new Range(from, to, 0, Long.MAX_VALUE);
    }

    public static Range page(long offset, long limit) {
        return new Range(0, Long.MAX_VALUE, offset, limit);
    }

    public static Range of(long from, long to, long offset, long limit) {
        return new Range(from, to, offset, limit);
    }

    public Range(long from, long to, long offset, long limit) {
        this.from = from;
        this.to = to;
        this.offset = offset;
        this.limit = limit;
        this.reversed = from > to;
    }

    public Range copy() {
        return new Range(from, to, offset, limit);
    }

    public void newInterval(long from, long to) {
        this.from = from;
        this.to = to;
        this.reversed = from > to;
    }

    public boolean isReversed() {
        return reversed;
    }

    public long getFrom() {
        return from;
    }

    public long getTo() {
        return to;
    }

    public long getOffset() {
        return offset;
    }

    public long getLimit() {
        return limit;
    }
}
