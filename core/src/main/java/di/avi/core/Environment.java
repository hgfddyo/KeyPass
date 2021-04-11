package di.avi.core;

public class Environment {
    private String rootDirectory;
    private String applicationKey;

    public Environment() {
    }

    public Environment(String rootDirectory, String applicationKey) {
        this.rootDirectory = rootDirectory;
        this.applicationKey = applicationKey;
    }

    public String getRootDirectory() {
        return rootDirectory;
    }

    public void setRootDirectory(String rootDirectory) {
        this.rootDirectory = rootDirectory;
    }

    public String getApplicationKey() {
        return applicationKey;
    }

    public void setApplicationKey(String applicationKey) {
        this.applicationKey = applicationKey;
    }

    public static Environment of(String rootDirectory, String applicationKey) {
        return new Environment(rootDirectory, applicationKey);
    }
}
