package di.avi.spring.rest.dto;


public class LoginDTO {
    
    private String uuid;
    private String login;
    private String password;

    public String getLogin() {
        return login;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
