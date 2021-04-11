var ConnectListener = /** @class */ (function () {
    function ConnectListener() {
        this.initializeMessagesListener();
    }
    ConnectListener.prototype.initializeMessagesListener = function () {
        chrome.runtime.onConnect.addListener(this.onConnectHandler.bind(this));
    };
    ConnectListener.prototype.onConnectHandler = function (port) {
        port.onMessage.addListener(this.onConnectMessageHandler.bind(this));
    };
    ConnectListener.prototype.onConnectMessageHandler = function (msg, port) {
        console.log('Received connection message: ' + msg);
        var response = 'Greetings!';
        port.postMessage(response);
    };
    return ConnectListener;
}());
var RuntimeListener = /** @class */ (function () {
    function RuntimeListener() {
        this.initializeMessagesListener();
    }
    RuntimeListener.prototype.initializeMessagesListener = function () {
        chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
            var command = message['command'];
            console.log('Received runtime command: ' + command);
            var response = { message: 'Aye!' };
            sendResponse(response);
        });
    };
    return RuntimeListener;
}());
var runtimeListener = new RuntimeListener();
