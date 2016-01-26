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

    public static tmpMembers:string;
    public static channelMembers:string;
    public static memberData:Array<any>;

    public static tmpMebmerUrl:string = "http://localhost:8888/Project/Taroko/SuzukaGame/20160120_Suzuka_LEADER/index.html?key=";

    private static socketConnector:SocketConnector;

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


    public static toInit():void {

        GameConfig.gameId = 0;
        GameConfig.totalMembers = 0;
        GameConfig.gameActor = "";
        GameConfig.channelKey = "";
        GameConfig.isWaiting = false;
        GameConfig.isChannelLocked = false;
        GameConfig.tmpMembers = '0,0,0,0';

        /* 0:無人，1:已加入Channel，2:已準備好可開始遊戲 */
        GameConfig.channelMembers = '0,0,0,0';
        GameConfig.memberData = [
            {
                device: '0,0',
                racing: 'x,y,r'
            },
            {
                device: '0,0',
                racing: 'x,y,r'
            },
            {
                device: '0,0',
                racing: 'x,y,r'
            },
            {
                device: '0,0',
                racing: 'x,y,r'
            }
        ];
    }


    public toInitSocket():void {

        if (!GameConfig.socketConnector) {

            App.loadingUI.toTransitionIn();
            GameConfig.socketConnector = SocketConnector.instance();
            GameConfig.socketConnector.toInit();
        }

        GameConfig.socketConnector.on(SocketEvent.ON_CONNECT_SUCCESS, this.onSocketStatus.bind(this));
        GameConfig.socketConnector.on(SocketEvent.ON_MESSAGE, this.onSocketStatus.bind(this));
        GameConfig.socketConnector.on(SocketEvent.ON_CLOSE, this.onSocketStatus.bind(this));
        GameConfig.socketConnector.on(SocketEvent.ON_CONNECT_ERROR, this.onSocketStatus.bind(this));
    }


    public toConnectSocket(msg:Object) {
        GameConfig.socketConnector.toSendMessage(msg);
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

                    if (GameConfig.gameActor == "LEADER") {
                        console.log(GameConfig.tmpMebmerUrl + result.key);
                    }
                    this.toKeepConnect();
                }

                /* 加入Channel後可取得Channel資訊 */
                if (action == SocketEvent.GET_CHANNEL_STATUS) {

                    GameConfig.channelKey = result.key;
                    GameConfig.totalMembers = result.totalMembers;

                    if (result.totalMembers == 1) {
                        GameConfig.gameActor = "LEADER";
                    }

                    if (!GameConfig.isChannelLocked) {

                        GameConfig.toSetMemberStatus(result.memberId - 1, 1);
                        if (GameConfig.gameActor == "LEADER") {
                            this.toConnectSocket({
                                key: GameConfig.channelKey,
                                act: SocketEvent.UPDATE_CHANNEL_STATUS,
                                channelLocked: GameConfig.isChannelLocked,
                                channelMembers: GameConfig.channelMembers
                            });
                        }
                    }

                    this.emit(GameEvent.ON_CHANNEL_STATUS, {
                        type: GameEvent.ON_CHANNEL_STATUS
                    });
                }

                /* LEADER廣播:所有遊戲成員更新Channel資訊 */
                if (action == SocketEvent.UPDATE_CHANNEL_STATUS) {

                    GameConfig.channelMembers = result.channelMembers;
                    GameConfig.isChannelLocked = result.channelLocked;
                    GameConfig.totalMembers = GameConfig.toGetTotalMembers();
                    console.log("members:" + GameConfig.channelMembers + "/locked:" + GameConfig.isChannelLocked);
                }

                /* 鎖定Channel，阻止玩家加入 */
                if (action == SocketEvent.LOCK_CHANNEL_SUCCESS) {

                    this.emit(GameEvent.CHANNEL_LOCKED, {
                        type: GameEvent.CHANNEL_LOCKED
                    });
                }

                /* MEMBER加入Channel後，傳送Device資訊至LEADER儲存 */
                if (action == SocketEvent.SAVE_DEVICE_DATA) {
                    GameConfig.memberData[result.memberId - 1]["device"] = result.device;
                }


                /**
                 * 遊戲開始：
                 * LEADER廣播給所有Channel的遊戲玩家
                 **/
                if (action == SocketEvent.UPDATE_GAME) {

                    /* 如果等於0，表示未加入或者是Lock Channel後才加入 */

                    if (GameConfig.toGetMemberStatus(GameConfig.gameId - 1) == 0) return;

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
                            console.log(GameConfig.channelMembers);
                            this.emit(GameEvent.ON_GAME_UPDATE, {
                                type: GameEvent.ON_GAME_UPDATE,
                                status: "memberAction",
                                racingData: GameConfig.memberData
                            });
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

                            GameConfig.toSetMemberStatus(result.memberId - 1, 2);
                            if (GameConfig.gameActor == "LEADER") {
                                this.toConnectSocket({
                                    key: GameConfig.channelKey,
                                    act: SocketEvent.UPDATE_CHANNEL_STATUS,
                                    channelLocked: GameConfig.isChannelLocked,
                                    channelMembers: GameConfig.channelMembers
                                });
                            }

                            var allMembersReady:boolean = GameConfig.toCheckMemberReady();
                            console.log('allMembersReady:' + allMembersReady);
                            if (allMembersReady) {
                                this.emit(GameEvent.ON_GAME_UPDATE, {
                                    type: GameEvent.ON_GAME_UPDATE,
                                    status: "allMemberReady"
                                });
                            }
                            break;

                        case "onMemberUpdate":
                            GameConfig.memberData[result.memberId - 1]["racing"] = result.racing;
                            this.toConnectSocket({
                                key: GameConfig.channelKey,
                                act: SocketEvent.UPDATE_GAME,
                                gameStatus: "memberAction",
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

                    this.toConnectSocket({
                        key: GameConfig.channelKey,
                        act: SocketEvent.UPDATE_CHANNEL_STATUS,
                        channelLocked: GameConfig.isChannelLocked,
                        channelMembers: GameConfig.channelMembers
                    });
                }

                GameConfig.socketConnector = null;
                this.emit(GameEvent.ON_SERVER_DISCONNECTED, {
                    type: GameEvent.ON_SERVER_DISCONNECTED
                });

                break;
            /* ========================================================= */



        /**
         *  Websocket連接錯誤時發生
         **/
            case SocketEvent.ON_CONNECT_ERROR:

                GameConfig.socketConnector = null;
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


    public static toGetGameKey():string {
        var key:string =
            ((((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1))
            + ((((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1));
        return key;
    }

    public static toSetMemberStatus(id:number, status:number):void {

        var statusArr:Array<any> = GameConfig.channelMembers.split(",");
        statusArr[id] = status;

        GameConfig.channelMembers = '';
        statusArr.forEach(item=> {
            GameConfig.channelMembers = GameConfig.channelMembers + item.toString() + ",";
        });

        GameConfig.channelMembers = GameConfig.channelMembers.slice(0, -1);
    }

    public static toGetMemberStatus(id:number):number {

        var arr:Array<any> = GameConfig.channelMembers.split(",");
        return +arr[id];
    }

    public static toGetTotalMembers():number {

        var total:number = 0;
        var memberArr:Array<any> = GameConfig.channelMembers.split(",");
        memberArr.forEach(item=> {
            if (+item == 1) {
                total += 1;
            }
        });
        return total;
    }

    public static toCheckMemberReady():boolean {

        var total:number = 0;
        var memberArr:Array<any> = GameConfig.channelMembers.split(",");
        memberArr.forEach(item=> {
            if (+item == 2) {
                total += 1;
            }
        });

        return total == GameConfig.totalMembers ? true : false;
    }

}