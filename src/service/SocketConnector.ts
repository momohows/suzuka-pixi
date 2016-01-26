/**
 * Created by susanph.huang on 2016/1/5.
 */

class SocketConnector extends PIXI.Container {

    private static _instance:SocketConnector;
    private static socketUrl:string = "ws://" + "nameless-eyrie-8008" + ".herokuapp.com";
    private webSocket:WebSocket;

    constructor() {
        super();
        if (SocketConnector._instance) {
            throw new Error("Error: Please use SocketConnector.instance() instead of new.");
        }
    }

    public static instance():SocketConnector {
        if (!SocketConnector._instance) {
            SocketConnector._instance = new SocketConnector();
        }
        return SocketConnector._instance;
    }


    /**
     * */
    public toInit():void {

        this.webSocket = new WebSocket(SocketConnector.socketUrl);
        this.webSocket.onopen = this.onConnect.bind(this);
        this.webSocket.onclose = this.onDisconnect.bind(this);
        this.webSocket.onmessage = this.onMessage.bind(this);
        this.webSocket.onerror = this.onError.bind(this);
    }


    public toSendMessage(msg:any):void {
        this.webSocket.send(JSON.stringify(msg));
    }

    private onConnect(event:any):void {

        this.emit(SocketEvent.ON_CONNECT_SUCCESS, {
            type: SocketEvent.ON_CONNECT_SUCCESS
        });
    }

    private onDisconnect(event:any):void {

        this.emit(SocketEvent.ON_CLOSE, {
            type: SocketEvent.ON_CLOSE
        });
        console.dir(event);
    }

    private onError(event:any):void {

        this.emit(SocketEvent.ON_CONNECT_ERROR, {
            type: SocketEvent.ON_CONNECT_ERROR
        });

        console.dir(event);
    }

    private onMessage(event:any):void {

        this.emit(SocketEvent.ON_MESSAGE, {
            data: JSON.parse(event.data),
            type: SocketEvent.ON_MESSAGE
        })
    }


}

