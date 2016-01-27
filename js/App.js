/**
 * Created by susanph.huang on 2015/12/30.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Config = (function (_super) {
    __extends(Config, _super);
    function Config() {
        _super.call(this);
        if (Config._instance) {
            throw new Error("Error: Please use Config.instance() instead of new.");
        }
    }
    Config.instance = function () {
        if (!Config._instance) {
            Config._instance = new Config();
        }
        return Config._instance;
    };
    Config.toInit = function () {
        Config.stageWidth = window.innerWidth;
        Config.stageHeight = window.innerHeight;
    };
    return Config;
})(PIXI.Container);
/**
 * Created by susanph.huang on 2015/12/3.
 */
var GameEvent;
(function (GameEvent) {
    GameEvent.ON_GAME_UPDATE = "onGameUpdate";
    /* Game Channel */
    GameEvent.ON_JOIN_CHANNEL = "onJoinChannel";
    GameEvent.ON_CHANNEL_STATUS = "onChannelStatus";
    GameEvent.ON_SERVER_CONNECTED = "onServerConnected";
    GameEvent.ON_SERVER_DISCONNECTED = "onServerDisconnected";
    GameEvent.CHANNEL_LOCKED = "channelLocked";
    /* Game */
    GameEvent.ON_COUNTDOWN = "onCountDown";
})(GameEvent || (GameEvent = {}));
/**
 * Created by susanph.huang on 2015/12/4.
 */
/// <reference path="../../definition/pixi/pixi.js.d.ts"/>
/// <reference path="../../definition/jquery/jquery.d.ts"/>
/// <reference path="../../definition/fpsmeter/FPSMeter.d.ts"/>
/// <reference path="../config/Config.ts"/>
/// <reference path="../events/GameEvent.ts"/>
var GameScene = (function (_super) {
    __extends(GameScene, _super);
    function GameScene(option) {
        _super.call(this);
        this.option = {
            width: 0,
            height: 0,
            bgColor: 0,
            transparent: true,
            fps: true
        };
        this.toChangeOption(option);
        $(window).resize(this.onResize.bind(this));
        this.toInit();
    }
    GameScene.prototype.onResize = function (event) {
        this.renderer.resize(window.innerWidth, window.innerHeight);
        Config.stageWidth = this.canvas.width;
        Config.stageHeight = this.canvas.height;
    };
    GameScene.prototype.toChangeOption = function (option) {
        for (var key in option) {
            this.option[key] = option[key];
        }
    };
    GameScene.prototype.toInit = function () {
        this.canvas = document.createElement("canvas");
        this.canvas.id = "pixiPlayer";
        this.canvas.style.position = "absolute";
        this.playerCon = document.getElementById("playerCon");
        this.playerCon.appendChild(this.canvas);
        var renderOption = {
            view: this.canvas,
            //resolution: window.devicePixelRatio,
            resolution: 1,
            backgroundColor: this.option["bgColor"],
            transparent: this.option["transparent"]
        };
        this.renderer = PIXI.autoDetectRenderer(this.option["width"], this.option["height"], renderOption);
        //this.toFixRatio();
        this.toUpdate();
        if (this.option["fps"]) {
            this.toCreateFpsMeter();
        }
    };
    GameScene.prototype.toFixRatio = function () {
        // TODO 如果哪天html viewport不再支援，必須再研究
        Config.canvasScaleRate = 1 / window.devicePixelRatio;
        this.canvas.style.transform = 'scale3d(' + Config.canvasScaleRate + ',' + Config.canvasScaleRate + ',' + Config.canvasScaleRate + ')';
        this.canvas.style.transformOrigin = '0 0';
        Config.stageWidth = this.canvas.width * Config.canvasScaleRate;
        Config.stageHeight = this.canvas.height * Config.canvasScaleRate;
    };
    GameScene.prototype.toUpdate = function () {
        requestAnimationFrame(this.toUpdate.bind(this));
        if (this.meter) {
            this.meter.tick();
        }
        this.renderer.render(this);
    };
    GameScene.prototype.toCreateFpsMeter = function () {
        /**
         * FPS Meter
         * website:http://darsa.in/fpsmeter/
         * github:https://github.com/Darsain/fpsmeter/
         * */
        this.meter = new FPSMeter(document.body, {
            theme: 'transparent',
            heat: 1,
            graph: 1,
            history: 20 // How many history states to show in a graph.
        });
    };
    return GameScene;
})(PIXI.Container);
/**
 * Created by susanph.huang on 2015/12/3.
 */
var ResourceEvent;
(function (ResourceEvent) {
    ResourceEvent.CONFIG_COMPLETE = "configComplete";
    ResourceEvent.GROUP_COMPLETE = "groupComplete";
    ResourceEvent.GROUP_PROGRESS = "groupProgress";
    ResourceEvent.GROUP_LOAD_ERROR = "groupLoadError";
})(ResourceEvent || (ResourceEvent = {}));
/**
 * Created by susanph.huang on 2015/12/28.
 */
/// <reference path="../events/ResourceEvent.ts"/>
var GameRes = (function (_super) {
    __extends(GameRes, _super);
    function GameRes() {
        _super.call(this);
        /**
         *
         * */
        this.loadedGroups = [];
        this.loadDelayGroups = [];
        this.loadingGroup = "";
        if (GameRes._instance) {
            throw new Error("Error: Instantiation failed: Use GameRes.instance() instead of new.");
        }
        GameRes._instance = this;
    }
    GameRes.instance = function () {
        return GameRes._instance;
    };
    GameRes.prototype.toLoadConfig = function (url, name) {
        if (name === void 0) { name = "resConfig"; }
        if (!this.resLoader) {
            this.resLoader = new PIXI.loaders.Loader();
        }
        this.resLoader.once("complete", this.onLoadConfigComplete.bind(this));
        this.resLoader.add(name, url);
        this.resLoader.load();
    };
    GameRes.prototype.onLoadConfigComplete = function (loader, resources) {
        this.resConfig = resources.resConfig.data;
        this.emit(ResourceEvent.CONFIG_COMPLETE);
    };
    GameRes.prototype.toQueueGroups = function (groupName, priority) {
        //TODO loadDelayGroup priority 搜尋未存入Group，自動重新排序陣列
        if (priority === void 0) { priority = 0; }
        var isLoaded = this.toCheckLoaded(groupName);
        if (isLoaded)
            return;
        this.loadDelayGroups[priority] = groupName;
    };
    GameRes.prototype.toLoadGroup = function () {
        var _this = this;
        this.resLoader.reset();
        this.resLoader.on("progress", this.onLoadGroupProgress.bind(this));
        this.resLoader.once("complete", this.onLoadGroupComplete.bind(this));
        this.loadingGroup = this.loadDelayGroups[0];
        var loadList = this.toGetLoadList(this.loadDelayGroups[0]);
        loadList.forEach(function (item) { return _this.resLoader.add(item["name"], item["url"]); });
        this.resLoader.load();
    };
    GameRes.prototype.onLoadGroupProgress = function (loader) {
        this.emit(ResourceEvent.GROUP_PROGRESS, loader.progress);
    };
    GameRes.prototype.onLoadGroupComplete = function (loader, resources) {
        this.loadDelayGroups.shift();
        this.loadedGroups.push({
            name: this.loadingGroup,
            resources: resources
        });
        this.emit(ResourceEvent.GROUP_COMPLETE, this.loadingGroup);
        if (this.loadDelayGroups.length > 0) {
            this.toLoadGroup();
        }
    };
    GameRes.prototype.toGetLoadList = function (groupName) {
        var resources = [];
        this.resConfig["groups"].forEach(function (item) {
            if (item["name"] === groupName) {
                resources = item["resources"];
            }
        });
        return resources;
    };
    GameRes.prototype.toCheckLoaded = function (groupName) {
        var isLoaded = this.loadedGroups.some(function (value) {
            return value["name"] == groupName ? true : false;
        });
        return isLoaded;
    };
    GameRes.prototype.toGetRes = function (groupName) {
        var targetSources = {};
        this.loadedGroups.forEach(function (item) {
            if (item["name"] == groupName) {
                targetSources = item["resources"];
            }
        });
        return targetSources;
    };
    GameRes._instance = new GameRes();
    return GameRes;
})(PIXI.Container);
/**
 * Created by susanph.huang on 2016/1/14.
 */
var GameConfig = (function (_super) {
    __extends(GameConfig, _super);
    function GameConfig() {
        _super.call(this);
        if (GameConfig._instance) {
            throw new Error("Error: Please use GameConfig.instance() instead of new.");
        }
    }
    GameConfig.instance = function () {
        if (!GameConfig._instance) {
            GameConfig._instance = new GameConfig();
        }
        return GameConfig._instance;
    };
    GameConfig.prototype.toReset = function () {
        GameConfig.gameId = 0;
        GameConfig.totalMembers = 0;
        GameConfig.gameActor = "LEADER";
        GameConfig.channelKey = "";
        GameConfig.isWaiting = false;
        GameConfig.isChannelLocked = false;
        /* 0:無人，1:已加入Channel，2:已準備好可開始遊戲 */
        GameConfig.channelMembers = '0,0,0,0';
        GameConfig.memberDeviceData = '0,0|0,0|0,0|0,0';
        GameConfig.memberRacingData = 'x,y,r|x,y,r|x,y,r|x,y,r';
        GameConfig.memberData = [];
    };
    GameConfig.prototype.toInit = function () {
        this.toReset();
    };
    GameConfig.prototype.toInitSocket = function () {
        if (!this.socketConnector) {
            App.loadingUI.toTransitionIn();
            this.socketConnector = SocketConnector.instance();
            this.socketConnector.toInit();
        }
        this.socketConnector.on(SocketEvent.ON_CONNECT_SUCCESS, this.onSocketStatus.bind(this));
        this.socketConnector.on(SocketEvent.ON_MESSAGE, this.onSocketStatus.bind(this));
        this.socketConnector.on(SocketEvent.ON_CLOSE, this.onSocketStatus.bind(this));
        this.socketConnector.on(SocketEvent.ON_CONNECT_ERROR, this.onSocketStatus.bind(this));
    };
    GameConfig.prototype.toConnectSocket = function (msg) {
        this.socketConnector.toSendMessage(msg);
    };
    GameConfig.prototype.onSocketStatus = function (event) {
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
                var result = event.data;
                var action = result.act;
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
                            GameUtil.toSetMemberStatus(result.memberId - 1, 1);
                        }
                        GameUtil.toSetDeviceData(result.memberId - 1, result.device);
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
                    //console.clear();
                    console.log("==============================="
                        + "\n" + "key:" + GameConfig.channelKey
                        + "\n" + "id:" + GameConfig.gameId
                        + "\n" + "members:" + GameConfig.channelMembers
                        + "\n" + "device:" + GameConfig.memberDeviceData
                        + "\n" + "locked:" + GameConfig.isChannelLocked
                        + "\n" + "===============================");
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
                    GameUtil.toSetDeviceData(result.memberId - 1, result.device);
                }
                /**
                 * 遊戲開始：
                 * LEADER廣播給所有Channel的遊戲玩家
                 **/
                if (action == SocketEvent.UPDATE_GAME) {
                    /* 如果此時等於0，表示未加入或者是Lock Channel後才加入 */
                    if (GameUtil.toGetMemberStatus(GameConfig.gameId - 1) == 0)
                        return;
                    var status = result.gameStatus;
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
                            this.emit(GameEvent.ON_GAME_UPDATE, {
                                type: GameEvent.ON_GAME_UPDATE,
                                status: "memberAction",
                                device: GameConfig.memberDeviceData,
                                racing: GameConfig.memberRacingData
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
                    var status = result.gameStatus;
                    switch (status) {
                        case "saveDeviceData":
                            break;
                        case "onMemberReady":
                            GameUtil.toSetMemberStatus(result.memberId - 1, 2);
                            if (GameConfig.gameActor == "LEADER") {
                                this.toConnectSocket({
                                    key: GameConfig.channelKey,
                                    act: SocketEvent.UPDATE_CHANNEL_STATUS,
                                    channelLocked: GameConfig.isChannelLocked,
                                    channelMembers: GameConfig.channelMembers,
                                    deviceData: GameConfig.memberDeviceData
                                });
                            }
                            var allMembersReady = GameUtil.toCheckMemberReady();
                            if (allMembersReady) {
                                this.emit(GameEvent.ON_GAME_UPDATE, {
                                    type: GameEvent.ON_GAME_UPDATE,
                                    status: "allMemberReady"
                                });
                            }
                            break;
                        case "onMemberUpdate":
                            this.toConnectSocket({
                                key: GameConfig.channelKey,
                                act: SocketEvent.UPDATE_GAME,
                                gameStatus: "memberAction"
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
                        channelMembers: GameConfig.channelMembers,
                        deviceData: GameConfig.memberDeviceData
                    });
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
        }
    };
    GameConfig.prototype.toKeepConnect = function () {
        var _this = this;
        setInterval(function () {
            _this.toConnectSocket({
                key: GameConfig.channelKey,
                act: "keepConnectting"
            });
        }, 100);
    };
    GameConfig.prototype.toUpdateChannelStatus = function () {
        this.toConnectSocket({
            key: GameConfig.channelKey,
            act: SocketEvent.UPDATE_CHANNEL_STATUS,
            channelLocked: GameConfig.isChannelLocked,
            channelMembers: GameConfig.channelMembers,
            deviceData: GameConfig.memberDeviceData
        });
    };
    GameConfig.channelKey = "";
    return GameConfig;
})(PIXI.Container);
/**
 * Created by susanph.huang on 2016/1/4.
 */
var LoadingUI = (function (_super) {
    __extends(LoadingUI, _super);
    function LoadingUI() {
        _super.call(this);
        this.alpha = 0;
        $(window).resize(this.onResize.bind(this));
        this.toInit();
    }
    LoadingUI.prototype.onResize = function (event) {
        if (this.bgColor) {
            this.bgColor.clear();
            this.bgColor.lineStyle(0);
            this.bgColor.beginFill(0, 0.7);
            this.bgColor.drawRect(0, 0, Config.stageWidth, Config.stageHeight);
        }
        if (this.progressBar) {
            this.progressBar.clear();
            this.progressBar.beginFill(0xffffff, 1);
            this.progressBar.drawRect(0, 0, Config.stageWidth, Config.stageHeight);
            this.progressBar.endFill();
        }
    };
    LoadingUI.prototype.toInit = function () {
        this.bgColor = new PIXI.Graphics();
        this.bgColor.lineStyle(0);
        this.bgColor.beginFill(0, 0.7);
        this.bgColor.drawRect(0, 0, Config.stageWidth, Config.stageHeight);
        this.addChild(this.bgColor);
        this.progressBar = new PIXI.Graphics();
        this.progressBar.scale.x = 0;
        this.progressBar.beginFill(0xffffff, 1);
        this.progressBar.drawRect(0, 0, Config.stageWidth, Config.stageHeight);
        this.progressBar.endFill();
        /*this.progressBar.lineStyle(10, 0xffffff, 1);
        this.progressBar.moveTo(0, 0);
        this.progressBar.lineTo(Config.stageWidth, 0);*/
        this.addChild(this.progressBar);
        this.toTransitionIn();
    };
    LoadingUI.prototype.onProgress = function (progress) {
        var valueObj = {
            x: this.progressBar.scale.x,
            y: this.progressBar.scale.y
        };
        TweenMax.to(valueObj, 1, {
            x: progress / 100,
            y: this.progressBar.scale.y,
            ease: Back.easeOut,
            onUpdate: this.onDrawUpdate.bind(this),
            onUpdateParams: [valueObj]
        });
    };
    LoadingUI.prototype.onDrawUpdate = function (param) {
        this.progressBar.scale.x = param.x;
    };
    LoadingUI.prototype.toTransitionIn = function () {
        TweenMax.to(this, 0.5, {
            alpha: 0.5,
            ease: Quart.easeOut,
            onComplete: this.onTransitionComplete.bind(this),
            onCompleteParams: ["TRANSITION_IN_COMPLETE"]
        });
    };
    LoadingUI.prototype.toTransitionOut = function () {
        this.onProgress(100);
        TweenMax.to(this, 0.5, {
            delay: 0.5,
            alpha: 0,
            ease: Quart.easeOut,
            onComplete: this.onTransitionComplete.bind(this),
            onCompleteParams: ["TRANSITION_OUT_COMPLETE"]
        });
    };
    LoadingUI.prototype.onTransitionComplete = function (type) {
        if (type == "TRANSITION_IN_COMPLETE") {
        }
        if (type == "TRANSITION_OUT_COMPLETE") {
            if (this.progressBar) {
                this.progressBar.scale.x = 0;
            }
        }
    };
    return LoadingUI;
})(PIXI.Container);
/**
 * Created by susanph.huang on 2015/12/3.
 */
var ViewEvent;
(function (ViewEvent) {
    ViewEvent.CHANGE_VIEW = "changeView";
    ViewEvent.TRANSITION_IN_COMPLETE = "transitionInComplete";
    ViewEvent.TRANSITION_OUT_COMPLETE = "transitionOutComplete";
})(ViewEvent || (ViewEvent = {}));
/**
 * Created by susanph.huang on 2015/12/3.
 */
/// <reference path="../../definition/greensock/greensock.d.ts"/>
/// <reference path="../../definition/jquery/jquery.d.ts"/>
/// <reference path="../events/ViewEvent.ts"/>
var AbstractStepView = (function (_super) {
    __extends(AbstractStepView, _super);
    function AbstractStepView(name, resourses) {
        _super.call(this);
        this.name = name;
        this.resources = resourses;
        this.alpha = 0;
        $(window).resize(this.onResize.bind(this));
        this.toInit();
    }
    AbstractStepView.prototype.onResize = function (event) {
    };
    AbstractStepView.prototype.toInit = function () {
        this.toCreateElements();
    };
    AbstractStepView.prototype.toCreateElements = function () {
        this.toTransitionIn();
    };
    AbstractStepView.prototype.toRemove = function () {
        var _this = this;
        if (this.children.length > 0) {
            this.children.forEach(function (item) {
                _this.removeChild(item);
                item = null;
            });
        }
    };
    AbstractStepView.prototype.toUpdate = function () {
        requestAnimationFrame(this.toUpdate.bind(this));
    };
    AbstractStepView.prototype.toTransitionIn = function () {
        TweenMax.to(this, 0.5, {
            delay: 0.3,
            alpha: 1,
            ease: Quart.easeOut,
            onComplete: this.onTransitionComplete.bind(this),
            onCompleteParams: ["TRANSITION_IN_COMPLETE"]
        });
    };
    AbstractStepView.prototype.toTransitionOut = function (stepid, pid) {
        if (stepid === void 0) { stepid = -1; }
        if (pid === void 0) { pid = -1; }
        TweenMax.to(this, 0.5, {
            alpha: 0,
            ease: Quart.easeOut,
            onComplete: this.onTransitionComplete.bind(this),
            onCompleteParams: ["TRANSITION_OUT_COMPLETE", stepid, pid]
        });
    };
    AbstractStepView.prototype.onTransitionComplete = function (type, stepid, pid) {
        if (stepid === void 0) { stepid = -1; }
        if (pid === void 0) { pid = -1; }
        TweenMax.killTweensOf(this);
        if (type == "TRANSITION_IN_COMPLETE") {
            this.toUpdate();
            this.emit(ViewEvent.TRANSITION_IN_COMPLETE, {
                type: ViewEvent.TRANSITION_IN_COMPLETE
            });
        }
        if (type == "TRANSITION_OUT_COMPLETE") {
            this.toRemove();
            this.emit(ViewEvent.TRANSITION_OUT_COMPLETE, {
                stepid: stepid,
                pid: pid,
                type: ViewEvent.TRANSITION_OUT_COMPLETE
            });
        }
    };
    return AbstractStepView;
})(PIXI.Container);
/**
 * Created by susanph.huang on 2015/12/3.
 */
/// <reference path="../../definition/greensock/greensock.d.ts"/>
/// <reference path="../../definition/jquery/jquery.d.ts"/>
/// <reference path="../events/ViewEvent.ts"/>
/// <reference path="../abstract/AbstractStepView.ts"/>
var AbstractView = (function (_super) {
    __extends(AbstractView, _super);
    function AbstractView(name, resourses, id, stepid) {
        if (id === void 0) { id = 0; }
        if (stepid === void 0) { stepid = 0; }
        _super.call(this);
        this.name = name;
        this.resources = resourses;
        this.alpha = 0;
        this.id = id;
        this.stepId = stepid;
        $(window).resize(this.onResize.bind(this));
        this.toInit();
    }
    AbstractView.prototype.onResize = function (event) {
    };
    AbstractView.prototype.toInit = function () {
        this.toCreateElements();
    };
    AbstractView.prototype.toCreateElements = function () {
        this.toCreateBg();
        this.toTransitionIn();
    };
    AbstractView.prototype.toCreateBg = function () {
        var bg = new PIXI.Graphics();
        bg.beginFill(0x000033, 1);
        bg.drawRect(0, 0, Config.stageWidth, Config.stageHeight);
        bg.endFill();
        this.addChildAt(bg, 0);
        var viewTitle = new PIXI.Text(this.name.toUpperCase(), {
            font: '40px Arial',
            fill: 0xffffff,
            align: 'center'
        });
        viewTitle.x = (Config.stageWidth - viewTitle.width) * 0.5;
        viewTitle.y = 80;
        this.addChildAt(viewTitle, 1);
    };
    AbstractView.prototype.toRemove = function () {
        var _this = this;
        if (this.children.length > 0) {
            this.children.forEach(function (item) {
                _this.removeChild(item);
                item = null;
            });
        }
    };
    AbstractView.prototype.toUpdate = function () {
        requestAnimationFrame(this.toUpdate.bind(this));
    };
    AbstractView.prototype.toCreateStepView = function (id) {
    };
    AbstractView.prototype.toTransitionIn = function () {
        TweenMax.to(this, 0.5, {
            delay: 0.3,
            alpha: 1,
            ease: Quart.easeOut,
            onComplete: this.onTransitionComplete.bind(this),
            onCompleteParams: ["TRANSITION_IN_COMPLETE"]
        });
    };
    AbstractView.prototype.toTransitionOut = function (pid, stepid) {
        if (pid === void 0) { pid = -1; }
        if (stepid === void 0) { stepid = -1; }
        if (this.stepView) {
            console.log("pid:" + pid + "/id:" + this.id);
            if (pid == this.id) {
                this.stepView.toTransitionOut(stepid, -1);
            }
            else {
                this.stepView.toTransitionOut(stepid, pid);
            }
            return;
        }
        TweenMax.to(this, 0.5, {
            alpha: 0,
            ease: Quart.easeOut,
            onComplete: this.onTransitionComplete.bind(this),
            onCompleteParams: ["TRANSITION_OUT_COMPLETE", pid, stepid]
        });
    };
    AbstractView.prototype.onTransitionComplete = function (type, pid, stepid) {
        if (pid === void 0) { pid = -1; }
        if (stepid === void 0) { stepid = -1; }
        TweenMax.killTweensOf(this);
        if (type == "TRANSITION_IN_COMPLETE") {
            this.toUpdate();
            this.toCreateStepView(this.stepId);
            this.emit(ViewEvent.TRANSITION_IN_COMPLETE, {
                type: ViewEvent.TRANSITION_IN_COMPLETE
            });
        }
        if (type == "TRANSITION_OUT_COMPLETE") {
            this.toRemove();
            this.emit(ViewEvent.TRANSITION_OUT_COMPLETE, {
                id: pid,
                stepid: stepid,
                type: ViewEvent.TRANSITION_OUT_COMPLETE
            });
        }
    };
    return AbstractView;
})(PIXI.Container);
/**
 * Created by susanph.huang on 2015/12/31.
 */
var CreateUtil;
(function (CreateUtil) {
    function toCreateCustomBtn(txt) {
        var shape = new PIXI.Graphics();
        var text = new PIXI.Text(txt, { font: '20px Arial', fill: 0xffffff, align: 'center' });
        text.x = 15;
        text.y = 10;
        shape.beginFill(0x6c6c6c, 1);
        shape.drawRect(0, 0, text.width + 30, text.height + 20);
        shape.endFill();
        shape.addChild(text);
        return shape;
    }
    CreateUtil.toCreateCustomBtn = toCreateCustomBtn;
    function toGetSpSheetTexture(name, textures) {
        var texture;
        for (var key in textures) {
            if (key === name) {
                texture = PIXI.Texture.fromFrame(key);
            }
        }
        return texture;
    }
    CreateUtil.toGetSpSheetTexture = toGetSpSheetTexture;
    function toCreateMovieClip(textures) {
        var textureArr = [];
        for (var key in textures) {
            var texture = PIXI.Texture.fromFrame(key);
            textureArr.push(texture);
        }
        var mc = new PIXI.extras.MovieClip(textureArr);
        return mc;
    }
    CreateUtil.toCreateMovieClip = toCreateMovieClip;
    function toActivateItem(target, callback) {
        target.buttonMode = true;
        target.interactive = true;
        target.on('mousedown', callback)
            .on('touchstart', callback);
    }
    CreateUtil.toActivateItem = toActivateItem;
    function toAlignItem(item, horizontal, vertical) {
        if (horizontal === void 0) { horizontal = "LEFT"; }
        if (vertical === void 0) { vertical = "TOP"; }
        if (horizontal == "LEFT") {
            item.x = 0;
        }
        else if (horizontal == "CENTER") {
            item.x = (Config.stageWidth - item.width) * 0.5;
        }
        else if (horizontal == "RIGHT") {
            item.x = (Config.stageWidth - item.width);
        }
        if (vertical == "TOP") {
            item.y = 0;
        }
        else if (vertical == "CENTER") {
            item.y = (Config.stageHeight - item.height) * 0.5;
        }
        else if (vertical == "BOTTOM") {
            item.y = (Config.stageHeight - item.height);
        }
    }
    CreateUtil.toAlignItem = toAlignItem;
})(CreateUtil || (CreateUtil = {}));
/**
 * Created by SusanHuang on 2016/1/6.
 */
var FrameUtil;
(function (FrameUtil) {
    function toNextFrame(target) {
        target.gotoAndStop(target.currentFrame + 1);
    }
    FrameUtil.toNextFrame = toNextFrame;
    function toPrevFrame(target) {
        target.gotoAndStop(target.currentFrame - 1);
    }
    FrameUtil.toPrevFrame = toPrevFrame;
    function toLoop(target) {
        target.loop = true;
        target.play();
    }
    FrameUtil.toLoop = toLoop;
    function toPlayTo(target, targetFrame) {
        FrameUtil.toNextFrame(target);
        if (target.currentFrame != targetFrame) {
            if (targetFrame == target.totalFrames) {
                targetFrame = target.totalFrames - 1;
            }
            var timer = requestAnimationFrame(function () { return FrameUtil.toPlayTo(target, targetFrame); });
        }
        else {
            window.cancelAnimationFrame(timer);
            target.emit("ANIMATION_COMPLETE");
        }
    }
    FrameUtil.toPlayTo = toPlayTo;
    function toReverseTo(target, targetFrame) {
        FrameUtil.toPrevFrame(target);
        if (target.currentFrame != targetFrame) {
            var timer = requestAnimationFrame(function () { return FrameUtil.toReverseTo(target, targetFrame); });
        }
        else {
            window.cancelAnimationFrame(timer);
            target.emit("ANIMATION_COMPLETE");
        }
    }
    FrameUtil.toReverseTo = toReverseTo;
})(FrameUtil || (FrameUtil = {}));
/**
 * Created by susanph.huang on 2015/12/29.
 */
/// <reference path="../../abstract/AbstractStepView.ts"/>
/// <reference path="../../utils/FrameUtil.ts"/>
/// <reference path="../../utils/CreateUtil.ts"/>
var CatchStep = (function (_super) {
    __extends(CatchStep, _super);
    function CatchStep(name, resources) {
        _super.call(this, name, resources);
    }
    CatchStep.prototype.toRemove = function () {
        _super.prototype.toRemove.call(this);
    };
    CatchStep.prototype.onResize = function (event) {
        _super.prototype.onResize.call(this, event);
    };
    CatchStep.prototype.toCreateElements = function () {
        this.ctaBtn = CreateUtil.toCreateCustomBtn("出發吧GO");
        CreateUtil.toAlignItem(this.ctaBtn, "CENTER", "CENTER");
        CreateUtil.toActivateItem(this.ctaBtn, this.onCtaBtnStatus.bind(this));
        this.addChild(this.ctaBtn);
        // 程式碼寫在super之上
        _super.prototype.toCreateElements.call(this);
    };
    CatchStep.prototype.onCtaBtnStatus = function (event) {
        if (event.type == "mousedown" || event.type == "touchstart") {
            this.onCtaBtnEffect();
        }
    };
    CatchStep.prototype.onCtaBtnEffect = function () {
        this.ctaBtn.alpha = 0.5;
        /* StartView > NumberOfStep */
        this.toTransitionOut(0, 1);
    };
    CatchStep.prototype.toUpdate = function () {
        _super.prototype.toUpdate.call(this);
    };
    return CatchStep;
})(AbstractStepView);
/**
 * Created by susanph.huang on 2016/1/5.
 */
var SocketConnector = (function (_super) {
    __extends(SocketConnector, _super);
    function SocketConnector() {
        _super.call(this);
        if (SocketConnector._instance) {
            throw new Error("Error: Please use SocketConnector.instance() instead of new.");
        }
    }
    SocketConnector.instance = function () {
        if (!SocketConnector._instance) {
            SocketConnector._instance = new SocketConnector();
        }
        return SocketConnector._instance;
    };
    /**
     * */
    SocketConnector.prototype.toInit = function () {
        this.webSocket = new WebSocket(SocketConnector.socketUrl);
        this.webSocket.onopen = this.onConnect.bind(this);
        this.webSocket.onclose = this.onDisconnect.bind(this);
        this.webSocket.onmessage = this.onMessage.bind(this);
        this.webSocket.onerror = this.onError.bind(this);
    };
    SocketConnector.prototype.toSendMessage = function (msg) {
        this.webSocket.send(JSON.stringify(msg));
    };
    SocketConnector.prototype.onConnect = function (event) {
        this.emit(SocketEvent.ON_CONNECT_SUCCESS, {
            type: SocketEvent.ON_CONNECT_SUCCESS
        });
    };
    SocketConnector.prototype.onDisconnect = function (event) {
        this.emit(SocketEvent.ON_CLOSE, {
            type: SocketEvent.ON_CLOSE
        });
        console.dir(event);
    };
    SocketConnector.prototype.onError = function (event) {
        this.emit(SocketEvent.ON_CONNECT_ERROR, {
            type: SocketEvent.ON_CONNECT_ERROR
        });
        console.dir(event);
    };
    SocketConnector.prototype.onMessage = function (event) {
        this.emit(SocketEvent.ON_MESSAGE, {
            data: JSON.parse(event.data),
            type: SocketEvent.ON_MESSAGE
        });
    };
    SocketConnector.socketUrl = "ws://" + "nameless-eyrie-8008" + ".herokuapp.com";
    return SocketConnector;
})(PIXI.Container);
/**
 * Created by susanph.huang on 2015/12/29.
 */
/// <reference path="../abstract/AbstractView.ts"/>
/// <reference path="../abstract/AbstractStepView.ts"/>
/// <reference path="../utils/CreateUtil.ts"/>
/// <reference path="home/CatchStep.ts"/>
/// <reference path="../service/SocketConnector.ts"/>
var HomeView = (function (_super) {
    __extends(HomeView, _super);
    function HomeView(name, resources, id, stepid) {
        _super.call(this, name, resources, id, stepid);
        /**
         * Step
         * */
        this.stepData = [
            { name: "catchStep", className: CatchStep }
        ];
    }
    HomeView.prototype.toRemove = function () {
        _super.prototype.toRemove.call(this);
    };
    HomeView.prototype.onResize = function (event) {
        _super.prototype.onResize.call(this, event);
    };
    HomeView.prototype.toCreateElements = function () {
        _super.prototype.toCreateElements.call(this);
    };
    HomeView.prototype.toUpdate = function () {
        _super.prototype.toUpdate.call(this);
    };
    HomeView.prototype.toCreateStepView = function (id) {
        if (this.stepView) {
            this.stepView.toTransitionOut(id);
            return;
        }
        this.stepId = id;
        var StepClass = this.stepData[id]["className"];
        this.stepView = new StepClass(this.stepData[id]["name"], this.resources);
        this.stepView.once(ViewEvent.TRANSITION_IN_COMPLETE, this.onStepViewStatus.bind(this));
        this.stepView.once(ViewEvent.TRANSITION_OUT_COMPLETE, this.onStepViewStatus.bind(this));
        this.addChild(this.stepView);
    };
    HomeView.prototype.onStepViewStatus = function (event) {
        if (event.type == ViewEvent.TRANSITION_IN_COMPLETE) {
        }
        if (event.type == ViewEvent.TRANSITION_OUT_COMPLETE) {
            this.removeChild(this.stepView);
            this.stepView.destroy();
            this.stepView = null;
            if (event.pid == -1) {
                this.toCreateStepView(event.stepid);
            }
            else {
                this.toTransitionOut(event.pid, event.stepid);
            }
        }
    };
    return HomeView;
})(AbstractView);
/**
 * Created by susanph.huang on 2015/12/29.
 */
/// <reference path="../../abstract/AbstractStepView.ts"/>
/// <reference path="../../utils/FrameUtil.ts"/>
/// <reference path="../../utils/CreateUtil.ts"/>
var NumberOfStep = (function (_super) {
    __extends(NumberOfStep, _super);
    function NumberOfStep(name, resources) {
        _super.call(this, name, resources);
    }
    NumberOfStep.prototype.toRemove = function () {
        _super.prototype.toRemove.call(this);
    };
    NumberOfStep.prototype.onResize = function (event) {
        _super.prototype.onResize.call(this, event);
    };
    NumberOfStep.prototype.toCreateElements = function () {
        this.singleBtn = CreateUtil.toCreateCustomBtn("單人連線");
        this.addChild(this.singleBtn);
        CreateUtil.toAlignItem(this.singleBtn, "CENTER", "CENTER");
        this.singleBtn.y -= 50;
        CreateUtil.toActivateItem(this.singleBtn, this.onSingleBtnStatus.bind(this));
        this.multiBtn = CreateUtil.toCreateCustomBtn("多人連線");
        this.addChild(this.multiBtn);
        CreateUtil.toAlignItem(this.multiBtn, "CENTER", "CENTER");
        this.multiBtn.y += 50;
        CreateUtil.toActivateItem(this.multiBtn, this.onMultiBtnStatus.bind(this));
        // 程式碼寫在super之上
        _super.prototype.toCreateElements.call(this);
    };
    NumberOfStep.prototype.onSingleBtnStatus = function (event) {
        if (event.type == "mousedown" || event.type == "touchstart") {
            GameConfig.gameType = "SingleGame";
            /* GameView > SingleGameStep */
            this.toTransitionOut(0, 3);
        }
    };
    NumberOfStep.prototype.onMultiBtnStatus = function (event) {
        if (event.type == "mousedown" || event.type == "touchstart") {
            GameConfig.gameType = "MultiGame";
            /* 初始化Websocket */
            App.gameConfig.toInitSocket();
        }
    };
    NumberOfStep.prototype.toUpdate = function () {
        _super.prototype.toUpdate.call(this);
    };
    return NumberOfStep;
})(AbstractStepView);
/**
 * Created by susanph.huang on 2016/1/26.
 */
var GameUtil;
(function (GameUtil) {
    /* COUNTDOWN */
    var CountDown = (function (_super) {
        __extends(CountDown, _super);
        function CountDown(repeat) {
            if (repeat === void 0) { repeat = 1; }
            _super.call(this);
            this.repeat = repeat;
            this.toCreateElement(repeat);
        }
        CountDown.prototype.toCreateElement = function (repeat) {
            var _this = this;
            this.count = 0;
            this.ticker = setInterval(function () {
                if (_this.count <= _this.repeat) {
                    _this.emit(GameEvent.ON_COUNTDOWN, {
                        count: _this.count + 1,
                        type: GameEvent.ON_COUNTDOWN
                    });
                    _this.count++;
                }
                else {
                    _this.toStop();
                }
            }, 1000);
        };
        CountDown.prototype.toReset = function () {
            this.toStop();
            this.toCreateElement(this.repeat);
        };
        CountDown.prototype.toStop = function () {
            window.clearInterval(this.ticker);
            this.ticker = null;
        };
        return CountDown;
    })(PIXI.Container);
    GameUtil.CountDown = CountDown;
    /* COUNTDOWN End */
    /* TOOLS */
    function toCreateGameKey() {
        var key = ((((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1))
            + ((((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1));
        return key;
    }
    GameUtil.toCreateGameKey = toCreateGameKey;
    function toSwapStrToNumberArr(str) {
        var tmpArr = [];
        str.split(",").forEach(function (item) {
            tmpArr.push(+item);
        });
        return tmpArr;
    }
    GameUtil.toSwapStrToNumberArr = toSwapStrToNumberArr;
    function toSetDeviceData(id, data) {
        var tmpStr = "";
        GameConfig.memberDeviceData.split("|").forEach(function (item, index) {
            if (index == id) {
                item = data;
            }
            tmpStr = tmpStr + item + "|";
        });
        GameConfig.memberDeviceData = tmpStr.slice(0, -1);
    }
    GameUtil.toSetDeviceData = toSetDeviceData;
    function toGetDeviceData() {
        var deviceData = [];
        GameConfig.memberDeviceData.split("|").forEach(function (item, index) {
            deviceData.push(GameUtil.toSwapStrToNumberArr(item));
        });
        return deviceData;
    }
    GameUtil.toGetDeviceData = toGetDeviceData;
    function toSetMemberStatus(id, status) {
        var statusArr = GameConfig.channelMembers.split(",");
        statusArr[id] = status;
        GameConfig.channelMembers = '';
        statusArr.forEach(function (item) {
            GameConfig.channelMembers = GameConfig.channelMembers + item.toString() + ",";
        });
        GameConfig.channelMembers = GameConfig.channelMembers.slice(0, -1);
    }
    GameUtil.toSetMemberStatus = toSetMemberStatus;
    function toGetMemberStatus(id) {
        var arr = GameConfig.channelMembers.split(",");
        return +arr[id];
    }
    GameUtil.toGetMemberStatus = toGetMemberStatus;
    function toGetTotalMembers() {
        var total = 0;
        var memberArr = GameConfig.channelMembers.split(",");
        memberArr.forEach(function (item) {
            if (+item == 1) {
                total += 1;
            }
        });
        return total;
    }
    GameUtil.toGetTotalMembers = toGetTotalMembers;
    function toCheckMemberReady() {
        var total = 0;
        var memberArr = GameConfig.channelMembers.split(",");
        memberArr.forEach(function (item) {
            if (+item == 2) {
                total += 1;
            }
        });
        return total == GameConfig.totalMembers ? true : false;
    }
    GameUtil.toCheckMemberReady = toCheckMemberReady;
    function toGetDeviceStartX(id) {
        var targetX = 0;
        for (var i = 0; i < id - 1; i++) {
            targetX = targetX + GameUtil.toGetDeviceData()[i][0];
        }
        return targetX;
    }
    GameUtil.toGetDeviceStartX = toGetDeviceStartX;
    function toGetAllDeviceMinHeight() {
        var heightArr = [];
        GameUtil.toGetDeviceData().forEach(function (item) {
            if (item[1] > 0) {
                heightArr.push(item[1]);
            }
        });
        var minH = Math.min.apply(null, heightArr);
        return minH;
    }
    GameUtil.toGetAllDeviceMinHeight = toGetAllDeviceMinHeight;
    function toGetAllDeviceMaxWidth() {
        var w = 0;
        GameUtil.toGetDeviceData().forEach(function (item) {
            if (item[0] > 0)
                w += item[0];
        });
        return w;
    }
    GameUtil.toGetAllDeviceMaxWidth = toGetAllDeviceMaxWidth;
})(GameUtil || (GameUtil = {}));
/**
 * Created by susanph.huang on 2015/12/29.
 */
/// <reference path="../../../definition/pixi/pixi.js.d.ts"/>
/// <reference path="../../abstract/AbstractStepView.ts"/>
/// <reference path="../../utils/FrameUtil.ts"/>
/// <reference path="../../utils/CreateUtil.ts"/>
/// <reference path="../../utils/GameUtil.ts"/>
var ChooseActorStep = (function (_super) {
    __extends(ChooseActorStep, _super);
    function ChooseActorStep(name, resources) {
        _super.call(this, name, resources);
    }
    ChooseActorStep.prototype.toRemove = function () {
        _super.prototype.toRemove.call(this);
    };
    ChooseActorStep.prototype.onResize = function (event) {
        _super.prototype.onResize.call(this, event);
    };
    ChooseActorStep.prototype.toCreateElements = function () {
        this.leaderBtn = CreateUtil.toCreateCustomBtn("我是隊長");
        this.addChild(this.leaderBtn);
        CreateUtil.toAlignItem(this.leaderBtn, "CENTER", "CENTER");
        this.leaderBtn.y -= 50;
        CreateUtil.toActivateItem(this.leaderBtn, this.onLeaderBtnStatus.bind(this));
        this.memberBtn = CreateUtil.toCreateCustomBtn("我是隊員");
        this.addChild(this.memberBtn);
        CreateUtil.toAlignItem(this.memberBtn, "CENTER", "CENTER");
        this.memberBtn.y += 50;
        CreateUtil.toActivateItem(this.memberBtn, this.onMemberBtnStatus.bind(this));
        // 程式碼寫在super之上
        _super.prototype.toCreateElements.call(this);
    };
    ChooseActorStep.prototype.onLeaderBtnStatus = function (event) {
        if (event.type == "mousedown" || event.type == "touchstart") {
            GameConfig.gameActor = "LEADER";
            GameConfig.channelKey = GameUtil.toCreateGameKey();
            App.gameConfig.toConnectSocket({
                key: GameConfig.channelKey,
                act: SocketEvent.JOIN_CHANNEL,
                device: Config.stageWidth.toString() + "," + Config.stageHeight.toString()
            });
        }
    };
    ChooseActorStep.prototype.onMemberBtnStatus = function (event) {
        if (event.type == "mousedown" || event.type == "touchstart") {
            GameConfig.gameActor = "MEMBER";
            /* StartView > InputKeyStep */
            this.toTransitionOut(2, -1);
        }
    };
    ChooseActorStep.prototype.toUpdate = function () {
        _super.prototype.toUpdate.call(this);
    };
    return ChooseActorStep;
})(AbstractStepView);
/**
 * Created by susanph.huang on 2015/12/29.
 */
/// <reference path="../../../definition/pixi/pixi.js.d.ts"/>
/// <reference path="../../abstract/AbstractStepView.ts"/>
/// <reference path="../../utils/FrameUtil.ts"/>
/// <reference path="../../utils/CreateUtil.ts"/>
var InputKeyStep = (function (_super) {
    __extends(InputKeyStep, _super);
    function InputKeyStep(name, resources) {
        _super.call(this, name, resources);
    }
    InputKeyStep.prototype.toRemove = function () {
        _super.prototype.toRemove.call(this);
    };
    InputKeyStep.prototype.onResize = function (event) {
        _super.prototype.onResize.call(this, event);
    };
    InputKeyStep.prototype.toCreateElements = function () {
        this.toInitForm();
        this.toDisplayForm(true);
        this.submitBtn = CreateUtil.toCreateCustomBtn("加入遊戲");
        this.addChild(this.submitBtn);
        CreateUtil.toAlignItem(this.submitBtn, "CENTER", "CENTER");
        this.submitBtn.y += 80;
        CreateUtil.toActivateItem(this.submitBtn, this.onSubmitBtnStatus.bind(this));
        // 程式碼寫在super之上
        _super.prototype.toCreateElements.call(this);
    };
    InputKeyStep.prototype.onSubmitBtnStatus = function (event) {
        if (this.$keyInput.val() == "" || /[A-Za-z0-9]{8}/.test(this.$keyInput.val()) == false) {
            alert("Key < 8");
            return;
        }
        GameConfig.channelKey = this.$keyInput.val();
        App.gameConfig.toConnectSocket({
            key: GameConfig.channelKey,
            act: SocketEvent.JOIN_CHANNEL,
            device: Config.stageWidth.toString() + "," + Config.stageHeight.toString()
        });
    };
    InputKeyStep.prototype.toInitForm = function () {
        this.$form = $("form");
        this.$form.submit(this.onFormStatus.bind(this));
        this.$keyInput = $("input[name='keyInput']");
    };
    InputKeyStep.prototype.onFormStatus = function (event) {
        event.preventDefault();
        this.onSubmitBtnStatus(null);
    };
    InputKeyStep.prototype.toDisplayForm = function (boo) {
        var _alpha = boo == true ? 1 : 0;
        TweenMax.to(this.$form, 0.3, {
            delay: 0.3,
            autoAlpha: _alpha,
            ease: Quart.easeOut
        });
        this.$keyInput.val("");
    };
    InputKeyStep.prototype.toUpdate = function () {
        _super.prototype.toUpdate.call(this);
    };
    InputKeyStep.prototype.toTransitionOut = function (id, pid) {
        if (id === void 0) { id = -1; }
        if (pid === void 0) { pid = -1; }
        this.toDisplayForm(false);
        _super.prototype.toTransitionOut.call(this, id, pid);
    };
    return InputKeyStep;
})(AbstractStepView);
/**
 * Created by susanph.huang on 2015/12/29.
 */
/// <reference path="../abstract/AbstractView.ts"/>
/// <reference path="../abstract/AbstractStepView.ts"/>
/// <reference path="../utils/CreateUtil.ts"/>
/// <reference path="start/NumberOfStep.ts"/>
/// <reference path="start/ChooseActorStep.ts"/>
/// <reference path="start/InputKeyStep.ts"/>
/// <reference path="../service/SocketConnector.ts"/>
var StartView = (function (_super) {
    __extends(StartView, _super);
    function StartView(name, resources, id, stepid) {
        _super.call(this, name, resources, id, stepid);
        /**
         * Step
         * */
        this.stepData = [
            { name: "numberOfStep", className: NumberOfStep },
            { name: "chooseActorStep", className: ChooseActorStep },
            { name: "inputKeyStep", className: InputKeyStep }
        ];
    }
    StartView.prototype.toRemove = function () {
        _super.prototype.toRemove.call(this);
    };
    StartView.prototype.onResize = function (event) {
        _super.prototype.onResize.call(this, event);
    };
    StartView.prototype.toCreateElements = function () {
        _super.prototype.toCreateElements.call(this);
    };
    StartView.prototype.toUpdate = function () {
        _super.prototype.toUpdate.call(this);
    };
    StartView.prototype.toCreateStepView = function (id) {
        if (this.stepView) {
            this.stepView.toTransitionOut(id);
            return;
        }
        this.stepId = id;
        var StepClass = this.stepData[id]["className"];
        this.stepView = new StepClass(this.stepData[id]["name"], this.resources);
        this.stepView.once(ViewEvent.TRANSITION_IN_COMPLETE, this.onStepViewStatus.bind(this));
        this.stepView.once(ViewEvent.TRANSITION_OUT_COMPLETE, this.onStepViewStatus.bind(this));
        this.addChild(this.stepView);
    };
    StartView.prototype.onStepViewStatus = function (event) {
        if (event.type == ViewEvent.TRANSITION_IN_COMPLETE) {
        }
        if (event.type == ViewEvent.TRANSITION_OUT_COMPLETE) {
            this.removeChild(this.stepView);
            this.stepView.destroy();
            this.stepView = null;
            if (event.pid == -1) {
                this.toCreateStepView(event.stepid);
            }
            else {
                this.toTransitionOut(event.pid, event.stepid);
            }
        }
    };
    return StartView;
})(AbstractView);
/**
 * Created by susanph.huang on 2015/12/29.
 */
/// <reference path="../../abstract/AbstractStepView.ts"/>
/// <reference path="../../utils/FrameUtil.ts"/>
/// <reference path="../../utils/CreateUtil.ts"/>
var KeyStep = (function (_super) {
    __extends(KeyStep, _super);
    function KeyStep(name, resources) {
        _super.call(this, name, resources);
    }
    KeyStep.prototype.toRemove = function () {
        _super.prototype.toRemove.call(this);
    };
    KeyStep.prototype.onResize = function (event) {
        _super.prototype.onResize.call(this, event);
    };
    KeyStep.prototype.toCreateElements = function () {
        this.keyText = new PIXI.Text(GameConfig.channelKey.toUpperCase(), {
            font: '50px Menlo',
            fill: 0xffff,
            align: 'center'
        });
        CreateUtil.toAlignItem(this.keyText, "CENTER", "CENTER");
        this.keyText.y -= 50;
        this.addChild(this.keyText);
        this.totalText = new PIXI.Text("已連線人數：" + GameConfig.totalMembers.toString() + "/4人", {
            font: '16px Menlo',
            fill: 0xc2c2c2,
            align: 'center'
        });
        CreateUtil.toAlignItem(this.totalText, "CENTER", "CENTER");
        this.totalText.y -= 10;
        this.addChild(this.totalText);
        this.lockChannelBtn = CreateUtil.toCreateCustomBtn("連線完成");
        this.addChild(this.lockChannelBtn);
        CreateUtil.toAlignItem(this.lockChannelBtn, "CENTER", "BOTTOM");
        this.lockChannelBtn.y -= 90;
        CreateUtil.toActivateItem(this.lockChannelBtn, this.onLockBtnStatus.bind(this));
        this.toUpdate();
        _super.prototype.toCreateElements.call(this);
    };
    KeyStep.prototype.onLockBtnStatus = function (event) {
        if (event.type == "mousedown" || event.type == "touchstart") {
            /* 在LEADER按下連線完成後，鎖定Channel人數，不讓人加入 */
            App.gameConfig.toConnectSocket({
                key: GameConfig.channelKey,
                act: SocketEvent.LOCK_CHANNEL
            });
        }
    };
    KeyStep.prototype.toUpdate = function () {
        _super.prototype.toUpdate.call(this);
        this.totalText.text = "已連線人數：" + GameConfig.totalMembers.toString() + "/4人";
    };
    return KeyStep;
})(AbstractStepView);
/**
 * Created by susanph.huang on 2015/12/29.
 */
/// <reference path="../../abstract/AbstractStepView.ts"/>
/// <reference path="../../utils/FrameUtil.ts"/>
/// <reference path="../../utils/CreateUtil.ts"/>
var GuideStep = (function (_super) {
    __extends(GuideStep, _super);
    function GuideStep(name, resources) {
        _super.call(this, name, resources);
    }
    GuideStep.prototype.toRemove = function () {
        _super.prototype.toRemove.call(this);
    };
    GuideStep.prototype.onResize = function (event) {
        _super.prototype.onResize.call(this, event);
    };
    GuideStep.prototype.toCreateElements = function () {
        this.playBtn = CreateUtil.toCreateCustomBtn("開始遊戲");
        this.addChild(this.playBtn);
        CreateUtil.toAlignItem(this.playBtn, "CENTER", "CENTER");
        CreateUtil.toActivateItem(this.playBtn, this.onPlayBtnStatus.bind(this));
        // 程式碼寫在super之上
        _super.prototype.toCreateElements.call(this);
    };
    GuideStep.prototype.onPlayBtnStatus = function (event) {
        if (GameConfig.totalMembers > 1) {
            App.gameConfig.toConnectSocket({
                key: GameConfig.channelKey,
                memberId: GameConfig.gameId,
                act: SocketEvent.UPDATE_GAME,
                gameStatus: "toStandBy"
            });
        }
        else {
            GameConfig.gameType = "SingleGame";
            this.toTransitionOut(0, 3);
        }
    };
    GuideStep.prototype.toUpdate = function () {
        _super.prototype.toUpdate.call(this);
        //this.fighter.rotation += 0.01;
    };
    return GuideStep;
})(AbstractStepView);
/**
 * Created by susanph.huang on 2015/12/29.
 */
/// <reference path="../../abstract/AbstractStepView.ts"/>
/// <reference path="../../utils/FrameUtil.ts"/>
/// <reference path="../../utils/CreateUtil.ts"/>
var WaitStep = (function (_super) {
    __extends(WaitStep, _super);
    function WaitStep(name, resources) {
        _super.call(this, name, resources);
    }
    WaitStep.prototype.toRemove = function () {
        _super.prototype.toRemove.call(this);
    };
    WaitStep.prototype.onResize = function (event) {
        _super.prototype.onResize.call(this, event);
    };
    WaitStep.prototype.toCreateElements = function () {
        this.numOfText = new PIXI.Text(GameConfig.gameId.toString(), {
            font: '120px Arial',
            fill: 0xffff,
            align: 'center'
        });
        CreateUtil.toAlignItem(this.numOfText, "CENTER", "CENTER");
        this.numOfText.y -= 50;
        this.addChild(this.numOfText);
        this.totalText = new PIXI.Text("已連線人數：" + GameConfig.totalMembers.toString() + "/4人", {
            font: '16px Menlo',
            fill: 0xc2c2c2,
            align: 'center'
        });
        CreateUtil.toAlignItem(this.totalText, "CENTER", "CENTER");
        this.totalText.y += 50;
        this.addChild(this.totalText);
        App.gameConfig.on(GameEvent.ON_JOIN_CHANNEL, this.onGameConfigStatus.bind(this));
        App.gameConfig.on(GameEvent.ON_GAME_UPDATE, this.onGameConfigStatus.bind(this));
        this.toUpdate();
        _super.prototype.toCreateElements.call(this);
    };
    WaitStep.prototype.onGameConfigStatus = function (event) {
        if (event.type == GameEvent.ON_JOIN_CHANNEL) {
            console.log("WaitView.ON_JOIN_CHANNEL");
            App.gameConfig.toConnectSocket({
                key: GameConfig.channelKey,
                memberId: GameConfig.gameId,
                act: SocketEvent.SAVE_DEVICE_DATA,
                device: Config.stageWidth.toString() + "," + Config.stageHeight.toString()
            });
        }
        if (event.type == GameEvent.ON_GAME_UPDATE) {
            if (event.status == "toStandBy") {
                this.toTransitionOut(1, 3);
            }
        }
    };
    WaitStep.prototype.toUpdate = function () {
        _super.prototype.toUpdate.call(this);
        this.totalText.text = "已連線人數：" + GameConfig.totalMembers.toString() + "/4人";
    };
    WaitStep.prototype.onTransitionComplete = function (type, stepid, pid) {
        if (stepid === void 0) { stepid = -1; }
        if (pid === void 0) { pid = -1; }
        _super.prototype.onTransitionComplete.call(this, type, stepid, pid);
    };
    return WaitStep;
})(AbstractStepView);
/**
 * Created by susanph.huang on 2015/12/29.
 */
/// <reference path="../abstract/AbstractView.ts"/>
/// <reference path="../abstract/AbstractStepView.ts"/>
/// <reference path="../utils/CreateUtil.ts"/>
/// <reference path="channel/KeyStep.ts"/>
/// <reference path="channel/GuideStep.ts"/>
/// <reference path="channel/WaitStep.ts"/>
/// <reference path="../service/SocketConnector.ts"/>
var ChannelView = (function (_super) {
    __extends(ChannelView, _super);
    function ChannelView(name, resources, id, stepid) {
        _super.call(this, name, resources, id, stepid);
        /**
         * Step
         * */
        this.stepData = [
            { name: "keyStep", className: KeyStep },
            { name: "guideStep", className: GuideStep },
            { name: "waitStep", className: WaitStep }
        ];
    }
    ChannelView.prototype.toRemove = function () {
        _super.prototype.toRemove.call(this);
    };
    ChannelView.prototype.onResize = function (event) {
        _super.prototype.onResize.call(this, event);
    };
    ChannelView.prototype.toCreateElements = function () {
        _super.prototype.toCreateElements.call(this);
    };
    ChannelView.prototype.toUpdate = function () {
        _super.prototype.toUpdate.call(this);
    };
    ChannelView.prototype.toCreateStepView = function (id) {
        if (this.stepView) {
            this.stepView.toTransitionOut(id, -1);
            return;
        }
        this.stepId = id;
        var StepClass = this.stepData[id]["className"];
        this.stepView = new StepClass(this.stepData[id]["name"], this.resources);
        this.stepView.once(ViewEvent.TRANSITION_IN_COMPLETE, this.onStepViewStatus.bind(this));
        this.stepView.once(ViewEvent.TRANSITION_OUT_COMPLETE, this.onStepViewStatus.bind(this));
        this.addChild(this.stepView);
    };
    ChannelView.prototype.onStepViewStatus = function (event) {
        if (event.type == ViewEvent.TRANSITION_IN_COMPLETE) {
        }
        if (event.type == ViewEvent.TRANSITION_OUT_COMPLETE) {
            this.removeChild(this.stepView);
            this.stepView.destroy();
            this.stepView = null;
            if (event.pid == -1) {
                this.toCreateStepView(event.stepid);
            }
            else {
                this.toTransitionOut(event.pid, event.stepid);
            }
        }
    };
    return ChannelView;
})(AbstractView);
/**
 * Created by susanph.huang on 2015/12/29.
 */
/// <reference path="../../abstract/AbstractStepView.ts"/>
/// <reference path="../../utils/FrameUtil.ts"/>
/// <reference path="../../utils/CreateUtil.ts"/>
var SingleGameStep = (function (_super) {
    __extends(SingleGameStep, _super);
    function SingleGameStep(name, resources) {
        _super.call(this, name, resources);
    }
    SingleGameStep.prototype.toRemove = function () {
        _super.prototype.toRemove.call(this);
    };
    SingleGameStep.prototype.onResize = function (event) {
        _super.prototype.onResize.call(this, event);
    };
    SingleGameStep.prototype.toCreateElements = function () {
        console.log("SingleGameStep.toCreateElements()");
        // 程式碼寫在super之上
        _super.prototype.toCreateElements.call(this);
    };
    SingleGameStep.prototype.toUpdate = function () {
        _super.prototype.toUpdate.call(this);
    };
    return SingleGameStep;
})(AbstractStepView);
/**
 * Created by susanph.huang on 2015/12/29.
 */
/// <reference path="../../abstract/AbstractStepView.ts"/>
/// <reference path="../../utils/FrameUtil.ts"/>
/// <reference path="../../utils/CreateUtil.ts"/>
var MultiGameStep = (function (_super) {
    __extends(MultiGameStep, _super);
    function MultiGameStep(name, resources) {
        _super.call(this, name, resources);
    }
    MultiGameStep.prototype.toRemove = function () {
        _super.prototype.toRemove.call(this);
    };
    MultiGameStep.prototype.onResize = function (event) {
        _super.prototype.onResize.call(this, event);
    };
    MultiGameStep.prototype.toCreateElements = function () {
        this.action = false;
        this.toCreateGame();
        _super.prototype.toCreateElements.call(this);
    };
    MultiGameStep.prototype.onGameConfigStatus = function (event) {
        if (event.status == "allMemberReady") {
            if (GameConfig.gameActor == "LEADER") {
                this.toCreateCountDown();
            }
        }
        if (event.status == "onCountDown") {
            console.log("countDown:" + event.countDown);
        }
        if (event.status == "startGame") {
            this.action = true;
        }
        if (event.status == "memberAction") {
        }
    };
    MultiGameStep.prototype.toCreateCountDown = function () {
        this.gameCownDown = new GameUtil.CountDown(3);
        this.gameCownDown.on(GameEvent.ON_COUNTDOWN, this.onCountDown.bind(this));
    };
    MultiGameStep.prototype.onCountDown = function (event) {
        if (event.count <= 3) {
            App.gameConfig.toConnectSocket({
                key: GameConfig.channelKey,
                act: SocketEvent.UPDATE_GAME,
                gameStatus: GameEvent.ON_COUNTDOWN,
                countDown: event.count
            });
        }
        else {
            App.gameConfig.toConnectSocket({
                key: GameConfig.channelKey,
                act: SocketEvent.UPDATE_GAME,
                gameStatus: "startGame"
            });
        }
    };
    MultiGameStep.prototype.toCreateGame = function () {
        this.gameCon = new PIXI.Container();
        this.addChild(this.gameCon);
    };
    MultiGameStep.prototype.toUpdate = function () {
        _super.prototype.toUpdate.call(this);
        if (this.action) {
            App.gameConfig.toConnectSocket({
                key: GameConfig.channelKey,
                memberId: GameConfig.gameId,
                act: SocketEvent.MEMBER_TO_LEADER,
                gameStatus: "onMemberUpdate",
                racing: '0,0,0'
            });
        }
    };
    MultiGameStep.prototype.onTransitionComplete = function (type, stepid, pid) {
        if (stepid === void 0) { stepid = -1; }
        if (pid === void 0) { pid = -1; }
        _super.prototype.onTransitionComplete.call(this, type, stepid, pid);
        if (type == "TRANSITION_IN_COMPLETE") {
            App.gameConfig.on(GameEvent.ON_GAME_UPDATE, this.onGameConfigStatus.bind(this));
            App.gameConfig.toConnectSocket({
                key: GameConfig.channelKey,
                memberId: GameConfig.gameId,
                act: SocketEvent.MEMBER_TO_LEADER,
                gameStatus: "onMemberReady"
            });
        }
    };
    return MultiGameStep;
})(AbstractStepView);
/**
 * Created by susanph.huang on 2015/12/29.
 */
/// <reference path="../abstract/AbstractView.ts"/>
/// <reference path="../abstract/AbstractStepView.ts"/>
/// <reference path="../utils/CreateUtil.ts"/>
/// <reference path="game/SingleGameStep.ts"/>
/// <reference path="game/MultiGameStep.ts"/>
/// <reference path="../service/SocketConnector.ts"/>
var GameView = (function (_super) {
    __extends(GameView, _super);
    function GameView(name, resources, id, stepid) {
        _super.call(this, name, resources, id, stepid);
        /**
         * Step
         * */
        this.stepData = [
            { name: "singleGameStep", className: SingleGameStep },
            { name: "multiGameStep", className: MultiGameStep }
        ];
    }
    GameView.prototype.toRemove = function () {
        _super.prototype.toRemove.call(this);
    };
    GameView.prototype.onResize = function (event) {
        _super.prototype.onResize.call(this, event);
    };
    GameView.prototype.toCreateElements = function () {
        _super.prototype.toCreateElements.call(this);
    };
    GameView.prototype.toUpdate = function () {
        _super.prototype.toUpdate.call(this);
    };
    GameView.prototype.toCreateStepView = function (id) {
        if (this.stepView) {
            this.stepView.toTransitionOut(id);
            return;
        }
        this.stepId = id;
        var StepClass = this.stepData[id]["className"];
        this.stepView = new StepClass(this.stepData[id]["name"], this.resources);
        this.stepView.once(ViewEvent.TRANSITION_IN_COMPLETE, this.onStepViewStatus.bind(this));
        this.stepView.once(ViewEvent.TRANSITION_OUT_COMPLETE, this.onStepViewStatus.bind(this));
        this.addChild(this.stepView);
    };
    GameView.prototype.onStepViewStatus = function (event) {
        if (event.type == ViewEvent.TRANSITION_IN_COMPLETE) {
        }
        if (event.type == ViewEvent.TRANSITION_OUT_COMPLETE) {
            this.removeChild(this.stepView);
            this.stepView.destroy();
            this.stepView = null;
            if (event.pid == -1) {
                this.toCreateStepView(event.stepid);
            }
            else {
                this.toTransitionOut(event.pid, event.stepid);
            }
        }
    };
    return GameView;
})(AbstractView);
/**
 * Created by susanph.huang on 2015/12/29.
 */
/// <reference path="../../abstract/AbstractStepView.ts"/>
/// <reference path="../../utils/FrameUtil.ts"/>
/// <reference path="../../utils/CreateUtil.ts"/>
var AwardStep = (function (_super) {
    __extends(AwardStep, _super);
    function AwardStep(name, resources) {
        _super.call(this, name, resources);
    }
    AwardStep.prototype.toRemove = function () {
        _super.prototype.toRemove.call(this);
    };
    AwardStep.prototype.onResize = function (event) {
        _super.prototype.onResize.call(this, event);
    };
    AwardStep.prototype.toCreateElements = function () {
        // 程式碼寫在super之上
        _super.prototype.toCreateElements.call(this);
    };
    AwardStep.prototype.toUpdate = function () {
        _super.prototype.toUpdate.call(this);
    };
    return AwardStep;
})(AbstractStepView);
/**
 * Created by susanph.huang on 2015/12/29.
 */
/// <reference path="../abstract/AbstractView.ts"/>
/// <reference path="../abstract/AbstractStepView.ts"/>
/// <reference path="../utils/CreateUtil.ts"/>
/// <reference path="result/AwardStep.ts"/>
/// <reference path="../service/SocketConnector.ts"/>
var ResultView = (function (_super) {
    __extends(ResultView, _super);
    function ResultView(name, resources, id, stepid) {
        _super.call(this, name, resources, id, stepid);
        /**
         * Step
         * */
        this.stepData = [
            { name: "awardStep", className: AwardStep }
        ];
    }
    ResultView.prototype.toRemove = function () {
        _super.prototype.toRemove.call(this);
    };
    ResultView.prototype.onResize = function (event) {
        _super.prototype.onResize.call(this, event);
    };
    ResultView.prototype.toCreateElements = function () {
        _super.prototype.toCreateElements.call(this);
    };
    ResultView.prototype.toUpdate = function () {
        _super.prototype.toUpdate.call(this);
    };
    ResultView.prototype.toCreateStepView = function (id) {
        if (this.stepView) {
            this.stepView.toTransitionOut(id);
            return;
        }
        this.stepId = id;
        var StepClass = this.stepData[id]["className"];
        this.stepView = new StepClass(this.stepData[id]["name"], this.resources);
        this.stepView.once(ViewEvent.TRANSITION_IN_COMPLETE, this.onStepViewStatus.bind(this));
        this.stepView.once(ViewEvent.TRANSITION_OUT_COMPLETE, this.onStepViewStatus.bind(this));
        this.addChild(this.stepView);
    };
    ResultView.prototype.onStepViewStatus = function (event) {
        if (event.type == ViewEvent.TRANSITION_IN_COMPLETE) {
        }
        if (event.type == ViewEvent.TRANSITION_OUT_COMPLETE) {
            this.removeChild(this.stepView);
            this.stepView.destroy();
            this.stepView = null;
            if (event.pid == -1) {
                this.toCreateStepView(event.stepid);
            }
            else {
                this.toTransitionOut(event.pid, event.stepid);
            }
        }
    };
    return ResultView;
})(AbstractView);
/**
 * Created by susanph.huang on 2015/12/3.
 */
var SocketEvent;
(function (SocketEvent) {
    /* Websocket事件 */
    SocketEvent.ON_CONNECT_SUCCESS = "onConnectSuccess";
    SocketEvent.ON_CONNECT_ERROR = "onConnectError";
    SocketEvent.ON_CLOSE = "onClose";
    SocketEvent.ON_MESSAGE = "onMessage";
    /* 遊戲串接Websocket事件 */
    SocketEvent.JOIN_CHANNEL = "joinChannel";
    SocketEvent.JOIN_CHANNEL_SUCCESS = "joinChannelSuccess";
    SocketEvent.LOCK_CHANNEL = "lockChannel";
    SocketEvent.LOCK_CHANNEL_SUCCESS = "lockChannelSuccess";
    SocketEvent.GET_CHANNEL_STATUS = "getChannelStatus";
    SocketEvent.UPDATE_CHANNEL_STATUS = "updateChannelStatus";
    /* 遊戲玩家溝通事件 */
    SocketEvent.MEMBER_TO_LEADER = "memberToLeader";
    SocketEvent.UPDATE_GAME = "updateGame"; // =  LEADER_TO_MEMBERS
    SocketEvent.SAVE_DEVICE_DATA = "saveDeviceData";
    SocketEvent.LEADER_TO_MEMBERS = "leaderToMembers";
})(SocketEvent || (SocketEvent = {}));
/**
 * Created by susanph.huang on 2016/1/5.
 */
var Util;
(function (Util) {
    function toGetParam(key, casesensitive) {
        if (casesensitive === void 0) { casesensitive = false; }
        var name = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var url = window.location.href;
        if (!casesensitive)
            name = name.toLowerCase();
        if (!casesensitive)
            url = url.toLowerCase();
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(url);
        if (results == null) {
            return "";
        }
        else {
            return results[1];
        }
    }
    Util.toGetParam = toGetParam;
})(Util || (Util = {}));
/**
 * Created by susanph.huang on 2015/12/3.
 */
/// <reference path="../definition/jquery/jquery.d.ts"/>
/// <reference path="core/GameScene.ts"/>
/// <reference path="core/GameRes.ts"/>
/// <reference path="config/GameConfig.ts"/>
/// <reference path="./LoadingUI.ts"/>
/// <reference path="view/HomeView.ts"/>
/// <reference path="view/StartView.ts"/>
/// <reference path="view/ChannelView.ts"/>
/// <reference path="view/GameView.ts"/>
/// <reference path="view/ResultView.ts"/>
/// <reference path="events/SocketEvent.ts"/>
/// <reference path="utils/Util.ts"/>
var App;
(function (App) {
    $(document).ready(function () {
        toCrateGame();
        toLoadResConfig();
    });
    /**
     * 一開始判斷URL有無帶Key參數，若有就是MEMBER
     * */
    function toCheckUrl() {
        GameConfig.channelKey = Util.toGetParam("key");
        if (GameConfig.channelKey == "" || /[A-Za-z0-9]{8}/.test(GameConfig.channelKey) == false) {
            toCreatePage(0, 0);
        }
        else {
            GameConfig.gameActor = "MEMBER";
            App.gameConfig.toInitSocket();
        }
    }
    /**
     * CreateGame
     */
    var gameScene;
    function toCrateGame() {
        gameScene = new GameScene({
            width: window.innerWidth,
            height: window.innerHeight,
            bgColor: 0xc2c2c2,
            transparent: false,
            fps: true
        });
        toInitConfig();
        toCreateLoadingUI();
    }
    function toCreateLoadingUI() {
        App.loadingUI = new LoadingUI();
        gameScene.addChild(App.loadingUI);
    }
    /**
     * Resource
     * */
    var RES;
    function toLoadResConfig() {
        RES = GameRes.instance();
        RES.on(ResourceEvent.CONFIG_COMPLETE, onResConfigComplete);
        RES.toLoadConfig("resource/resource.json", "resConfig");
    }
    function onResConfigComplete() {
        RES.on(ResourceEvent.GROUP_PROGRESS, onResGroupProgress);
        RES.on(ResourceEvent.GROUP_COMPLETE, onResGroupComplete);
        RES.toQueueGroups("preload_assets", 0);
        RES.toQueueGroups("home_assets", 1);
        RES.toQueueGroups("start_assets", 2);
        RES.toQueueGroups("channel_assets", 3);
        RES.toQueueGroups("play_assets", 4);
        RES.toQueueGroups("result_assets", 5);
        RES.toLoadGroup();
    }
    function onResGroupProgress(progress) {
        //console.log("progress:" + progress);
        App.loadingUI.onProgress(progress);
    }
    function onResGroupComplete(complete) {
        if (complete == "preload_assets") {
        }
        if (complete == "nav_assets") {
        }
        if (complete == "home_assets") {
            viewData[0]["isLoaded"] = true;
        }
        if (complete == "start_assets") {
            viewData[1]["isLoaded"] = true;
        }
        if (complete == "channel_assets") {
            viewData[2]["isLoaded"] = true;
        }
        if (complete == "play_assets") {
            viewData[3]["isLoaded"] = true;
        }
        if (complete == "result_assets") {
            App.loadingUI.toTransitionOut();
            viewData[4]["isLoaded"] = true;
            toCheckUrl();
        }
    }
    /**
     * CreatePage
     * */
    var currentPage;
    var viewData = [
        { assetsName: "home", className: HomeView, isLoaded: false },
        { assetsName: "start", className: StartView, isLoaded: false },
        { assetsName: "channel", className: ChannelView, isLoaded: false },
        { assetsName: "game", className: GameView, isLoaded: false },
        { assetsName: "result", className: ResultView, isLoaded: false },
    ];
    function toCreatePage(id, stepid) {
        if (stepid === void 0) { stepid = 0; }
        if (currentPage != null) {
            currentPage.toTransitionOut(id, stepid);
            return;
        }
        if (viewData[id]["isLoaded"] == false) {
            App.loadingUI.toTransitionIn();
            RES.toQueueGroups(viewData[id]["assetsName"] + "_assets", 0);
            RES.toLoadGroup();
            return;
        }
        var viewClass = viewData[id]["className"];
        var viewResources = RES.toGetRes(viewData[id]["assetsName"] + "_assets");
        currentPage = new viewClass(viewData[id]["assetsName"], viewResources, id, stepid);
        currentPage.once(ViewEvent.TRANSITION_IN_COMPLETE, onViewStatus);
        currentPage.once(ViewEvent.TRANSITION_OUT_COMPLETE, onViewStatus);
        gameScene.addChildAt(currentPage, 0);
    }
    function onViewStatus(event) {
        if (event.type == ViewEvent.TRANSITION_IN_COMPLETE) {
        }
        if (event.type == ViewEvent.TRANSITION_OUT_COMPLETE) {
            gameScene.removeChild(currentPage);
            currentPage.destroy();
            currentPage = null;
            toCreatePage(event.id, event.stepid);
        }
    }
    /**
     * GameConfig
     * */
    function toInitConfig() {
        Config.toInit();
        window["PixiConfig"] = Config;
        App.gameConfig = GameConfig.instance();
        App.gameConfig.toInit();
        App.gameConfig.on(GameEvent.ON_SERVER_CONNECTED, onGameConfigStatus);
        App.gameConfig.on(GameEvent.ON_SERVER_DISCONNECTED, onGameConfigStatus);
        App.gameConfig.on(GameEvent.ON_CHANNEL_STATUS, onGameConfigStatus);
        App.gameConfig.on(GameEvent.CHANNEL_LOCKED, onGameConfigStatus);
        App.gameConfig.on(GameEvent.ON_GAME_UPDATE, onGameConfigStatus);
    }
    function onGameConfigStatus(event) {
        /* LEADER */
        if (GameConfig.gameActor == "LEADER") {
            switch (event.type) {
                case GameEvent.ON_SERVER_CONNECTED:
                    /* StartView > ChooseActorStep */
                    toCreatePage(1, 1);
                    break;
                case GameEvent.ON_SERVER_DISCONNECTED:
                    /* HomeView > CatchStep */
                    toCreatePage(0, 0);
                    break;
                case GameEvent.ON_CHANNEL_STATUS:
                    if (!GameConfig.isWaiting) {
                        /* ChannelView > KeyStep */
                        toCreatePage(2, 0);
                        GameConfig.isWaiting = true;
                    }
                    break;
                case GameEvent.CHANNEL_LOCKED:
                    /* ChannelView > GuideStep */
                    toCreatePage(2, 1);
                    break;
                case GameEvent.ON_GAME_UPDATE:
                    if (event.status == "toStandBy") {
                        /* GameView > MultiGameStep */
                        toCreatePage(3, 1);
                    }
                    break;
            }
        }
        /* MEMBER */
        if (GameConfig.gameActor == "MEMBER") {
            switch (event.type) {
                case GameEvent.ON_SERVER_CONNECTED:
                    App.gameConfig.toConnectSocket({
                        key: GameConfig.channelKey,
                        act: SocketEvent.JOIN_CHANNEL,
                        device: Config.stageWidth.toString() + "," + Config.stageHeight.toString()
                    });
                    break;
                case GameEvent.ON_SERVER_DISCONNECTED:
                    /* HomeView > CatchStep */
                    toCreatePage(0, 0);
                    break;
                case GameEvent.ON_CHANNEL_STATUS:
                    if (!GameConfig.isWaiting) {
                        /* ChannelView > WaitStep */
                        toCreatePage(2, 2);
                        GameConfig.isWaiting = true;
                    }
                    break;
                case GameEvent.ON_GAME_UPDATE:
                    if (event.status == "toStandBy") {
                        /* GameView > MultiGameStep */
                        toCreatePage(3, 1);
                    }
                    break;
            }
        }
    }
})(App || (App = {}));
