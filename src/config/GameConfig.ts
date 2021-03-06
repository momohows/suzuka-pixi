/**
 * Created by susanph.huang on 2016/1/14.
 */

class GameConfig extends PIXI.Container {

    private static _instance:GameConfig;

    public static gameId:number;
    public static totalMembers:number;
    public static channelKey:string = "";
    public static gameActor:string;
    public static gameType:string;
    public static isWaiting:boolean;
    public static isChannelLocked:boolean;

    public static playerStatus:Array<any>;
    public static playerDeviceWidth:Array<any>;
    public static playerDeviceHeight:Array<any>;
    public static playerRacingIndex:Array<any>;

    public static channelMembers:string;
    public static memberDeviceData:string;
    public static memberRacingData:string;
    public static memberData:Array<any>;
    public static memberVars:string;

    private socketConnector:SocketConnector;

    constructor() {
        super();
        if (GameConfig._instance) {
            throw new Error("Error: Please use GameConfig.instance() instead of new.");
        }
    }

    public static instance():GameConfig {
        if (!GameConfig._instance) {
            GameConfig._instance = new GameConfig();
        }
        return GameConfig._instance;
    }


    public toReset():void {

        GameConfig.gameId = 0;
        GameConfig.totalMembers = 0;
        GameConfig.gameActor = "LEADER";
        GameConfig.channelKey = "";
        GameConfig.isWaiting = false;
        GameConfig.isChannelLocked = false;

        /* 0:無人，1:已加入Channel，2:已準備好可開始遊戲 */
        GameConfig.channelMembers = '0|0|0|0';
        GameConfig.memberDeviceData = '0,0|0,0|0,0|0,0';
        //GameConfig.memberDeviceData = '360,640|320,568|0,0|0,0';
        GameConfig.memberRacingData = '0|0|0|0';

        GameConfig.memberData = [];

        GameConfig.playerStatus = [0, 0, 0, 0];
        GameConfig.playerDeviceWidth = [0, 0, 0, 0];
        GameConfig.playerDeviceHeight = [0, 0, 0, 0];
        GameConfig.playerRacingIndex = [0, 0, 0, 0];

    }


    public toInit():void {

        this.toReset();
    }


    public toInitSocket():void {

        if (!this.socketConnector) {

            App.loadingUI.toTransitionIn();
            this.socketConnector = SocketConnector.instance();
            this.socketConnector.toInit();
        }

        this.socketConnector.on(SocketEvent.ON_CONNECT_SUCCESS, this.onSocketStatus.bind(this));
        this.socketConnector.on(SocketEvent.ON_MESSAGE, this.onSocketStatus.bind(this));
        this.socketConnector.on(SocketEvent.ON_CLOSE, this.onSocketStatus.bind(this));
        this.socketConnector.on(SocketEvent.ON_CONNECT_ERROR, this.onSocketStatus.bind(this));
    }


    public toConnectSocket(msg:Object) {
        this.socketConnector.toSendMessage(msg);
    }


    private onSocketStatus(event:any):void {

        App.loadingUI.toTransitionOut();

        //console.log("SocketStatus:" + event.type);
        switch (event.type) {

        /**
         * Websocket連接成功
         **/
            case SocketEvent.ON_CONNECT_SUCCESS:

                this.emit(GameEvent.ON_SERVER_CONNECTED, {
                    type: GameEvent.ON_SERVER_CONNECTED
                });
                break;
            /* ========================================================= */



        /**
         * Websocket Message
         **/
            case SocketEvent.ON_MESSAGE:

                var result:any = event.data;
                var action:string = result.act;

                /* 成功加入Channel */
                if (action == SocketEvent.JOIN_CHANNEL_SUCCESS) {

                    GameConfig.channelKey = result.key;
                    GameConfig.gameId = result.memberId;

                    this.emit(GameEvent.ON_JOIN_CHANNEL, {
                        type: GameEvent.ON_JOIN_CHANNEL
                    });


                    /* 正式上線砍掉 */
                    if (GameConfig.gameActor == "LEADER") {
                        console.log(window.location.href + "?key=" + result.key);
                    }
                    this.toKeepConnect();
                    /* 正式上線砍掉 */
                }

                /* 加入Channel後可取得Channel資訊 */
                if (action == SocketEvent.GET_CHANNEL_STATUS) {

                    GameConfig.channelKey = result.key;
                    GameConfig.totalMembers = result.totalMembers;

                    if (result.totalMembers == 1) {
                        GameConfig.gameActor = "LEADER";
                    }

                    if (GameConfig.gameActor == "LEADER") {

                        if (!GameConfig.isChannelLocked) {

                            GameConfig.channelMembers =
                                GameUtil.toSetValueInStr(result.memberId - 1, 1, GameConfig.channelMembers);
                        }

                        GameConfig.memberDeviceData =
                            GameUtil.toSetValueInStr(result.memberId - 1, result.device, GameConfig.memberDeviceData);

                        this.toUpdateChannelStatus();
                    }

                    this.emit(GameEvent.ON_CHANNEL_STATUS, {
                        type: GameEvent.ON_CHANNEL_STATUS
                    });
                }

                /* LEADER廣播:所有遊戲成員更新Channel資訊 */
                if (action == SocketEvent.UPDATE_CHANNEL_STATUS) {

                    GameConfig.channelMembers = result.channelMembers;
                    GameConfig.memberDeviceData = result.deviceData;
                    GameConfig.isChannelLocked = result.channelLocked;
                    GameConfig.totalMembers = GameUtil.toGetTotalMembers();
                    console.log(
                        "==============================="
                        + "\n" + "key:" + GameConfig.channelKey
                        + "\n" + "id:" + GameConfig.gameId
                        + "\n" + "members:" + GameConfig.channelMembers
                        + "\n" + "device:" + GameConfig.memberDeviceData
                        + "\n" + "locked:" + GameConfig.isChannelLocked
                        + "\n" + "==============================="
                    );
                }

                /* 鎖定Channel，阻止玩家加入 */
                if (action == SocketEvent.LOCK_CHANNEL_SUCCESS) {

                    GameConfig.isChannelLocked = true;
                    this.toUpdateChannelStatus();

                    this.emit(GameEvent.CHANNEL_LOCKED, {
                        type: GameEvent.CHANNEL_LOCKED
                    });
                }

                /* MEMBER加入Channel後，傳送Device資訊至LEADER儲存 */
                if (action == SocketEvent.SAVE_DEVICE_DATA) {

                    GameConfig.memberDeviceData =
                        GameUtil.toSetValueInStr(result.memberId - 1, result.device, GameConfig.memberDeviceData);
                }


                /**
                 * 遊戲開始：
                 * LEADER廣播給所有Channel的遊戲玩家
                 **/
                if (action == SocketEvent.UPDATE_GAME) {

                    /* 如果此時等於0，表示未加入或者是Lock Channel後才加入 */
                    if (GameUtil.toGetMemberStatus(GameConfig.gameId - 1) == 0) return;

                    var status:string = result.gameStatus;
                    switch (status) {

                        case "toStandBy":

                            this.emit(GameEvent.ON_GAME_UPDATE, {
                                type: GameEvent.ON_GAME_UPDATE,
                                status: "toStandBy"
                            });
                            break;

                        case "onCountDown":

                            this.emit(GameEvent.ON_GAME_UPDATE, {
                                countDown: result.countDown,
                                type: GameEvent.ON_GAME_UPDATE,
                                status: "onCountDown"
                            });
                            break;

                        case "startGame":
                            this.emit(GameEvent.ON_GAME_UPDATE, {
                                type: GameEvent.ON_GAME_UPDATE,
                                status: "startGame"
                            });
                            break;

                        case "memberAction":

                            GameConfig.memberRacingData = result.racing;
                            var buffer:any = setTimeout(()=> {
                                this.emit(GameEvent.ON_GAME_UPDATE, {
                                    type: GameEvent.ON_GAME_UPDATE,
                                    status: "memberAction",
                                    racing: GameConfig.memberRacingData,
                                    count: result.count
                                });

                                if (buffer) window.clearTimeout(buffer);
                            }, 1000);
                            break;

                        case "stopGame":
                            this.emit(GameEvent.ON_GAME_UPDATE, {
                                type: GameEvent.ON_GAME_UPDATE,
                                status: "stopGame"
                            });
                            break;
                    }

                }


                /**
                 * 遊戲開始：
                 * MEMBERS 傳遞訊息給 LEADER，
                 * 只有LEADER收的到
                 **/
                if (action == SocketEvent.MEMBER_TO_LEADER) {

                    var status:string = result.gameStatus;
                    switch (status) {

                        case "saveDeviceData":
                            break;

                        case "onMemberReady":

                            GameConfig.channelMembers =
                                GameUtil.toSetValueInStr(result.memberId - 1, 2, GameConfig.channelMembers);

                            if (GameConfig.gameActor == "LEADER") {
                                this.toUpdateChannelStatus();
                            }

                            var allMembersReady:boolean = GameUtil.toCheckMemberReady();
                            if (allMembersReady) {
                                this.emit(GameEvent.ON_GAME_UPDATE, {
                                    type: GameEvent.ON_GAME_UPDATE,
                                    status: "allMemberReady"
                                });
                            }
                            break;

                        case "onMemberUpdate":

                            GameConfig.memberRacingData =
                                GameUtil.toSetValueInStr(result.memberId - 1, result.racing, GameConfig.memberRacingData);

                            this.toConnectSocket({
                                key: GameConfig.channelKey,
                                act: SocketEvent.UPDATE_GAME,
                                gameStatus: "memberAction",
                                racing: GameConfig.memberRacingData,
                                count: null
                            });
                            break;
                    }
                }
                break;
            /* ========================================================= */



        /**
         * Websocket斷線時發生
         **/
            case SocketEvent.ON_CLOSE:

                if (GameConfig.gameActor == "LEADER") {

                    this.toUpdateChannelStatus();
                }

                this.socketConnector = null;
                this.emit(GameEvent.ON_SERVER_DISCONNECTED, {
                    type: GameEvent.ON_SERVER_DISCONNECTED
                });

                break;
            /* ========================================================= */



        /**
         *  Websocket連接錯誤時發生
         **/
            case SocketEvent.ON_CONNECT_ERROR:

                this.socketConnector = null;
                this.emit(GameEvent.ON_SERVER_DISCONNECTED, {
                    type: GameEvent.ON_SERVER_DISCONNECTED
                });

                break;
            /* ========================================================= */
        }

    }


    private toKeepConnect():void {
        setInterval(()=> {
            this.toConnectSocket({
                key: GameConfig.channelKey,
                act: "keepConnectting"
            })
        }, 100);
    }


    private toUpdateChannelStatus():void {

        this.toConnectSocket({
            key: GameConfig.channelKey,
            act: SocketEvent.UPDATE_CHANNEL_STATUS,
            channelLocked: GameConfig.isChannelLocked,
            channelMembers: GameConfig.channelMembers,
            deviceData: GameConfig.memberDeviceData
        });
    }


}