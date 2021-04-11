package di.avi.spring.rest.dto;

public class ResultDTO {
    private String message;
    private Object data;

    public ResultDTO() {
    }

    public ResultDTO(String message, Object data) {
        this.message = message;
        this.data = data;
    }

    public ResultDTO(String message) {
        this.message = message;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
