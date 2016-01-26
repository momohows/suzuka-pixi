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

module App {

    $(document).ready(function () {

        toCrateGame();
        toLoadResConfig();
    });


    /**
     * 一開始判斷URL有無帶Key參數，若有就是MEMBER
     * */
    function toCheckUrl():void {

        GameConfig.channelKey = Util.toGetParam("key");
        if (GameConfig.channelKey == "" || /[A-Za-z0-9]{8}/.test(GameConfig.channelKey) == false) {

            toCreatePage(0, 0);

        } else {

            GameConfig.gameActor = "MEMBER";
            gameConfig.toInitSocket();
        }
    }


    /**
     * CreateGame
     */
    var gameScene:GameScene;
    export var loadingUI:LoadingUI;
    export var gameConfig:GameConfig;

    function toCrateGame():void {

        gameScene = new GameScene({
            width: window.innerWidth,
            height: window.innerHeight,
            bgColor: 0x3339,
            transparent: false,
            fps: true
        });

        toInitConfig();
        toCreateLoadingUI();
    }

    function toCreateLoadingUI():void {

        loadingUI = new LoadingUI();
        gameScene.addChild(loadingUI);
    }


    function toInitConfig():void {

        Config.toInit();
        window["PixiConfig"] = Config;

        GameConfig.toInit();
        GameConfig.toSetMemberStatus(0, 1);
        console.log(GameConfig.tmpMembers);
        console.log(GameConfig.toGetMemberStatus(0) + "/" + typeof GameConfig.toGetMemberStatus(0));

        gameConfig = GameConfig.instance();
        gameConfig.on(GameEvent.ON_SERVER_CONNECTED, onGameConfigStatus);
        gameConfig.on(GameEvent.ON_SERVER_DISCONNECTED, onGameConfigStatus);
        gameConfig.on(GameEvent.ON_CHANNEL_STATUS, onGameConfigStatus);
    }

    function onGameConfigStatus(event:any):void {

        if (event.type == GameEvent.ON_SERVER_CONNECTED) {

            if (GameConfig.gameActor == "MEMBER") {

                App.gameConfig.toConnectSocket({
                    key: GameConfig.channelKey,
                    act: SocketEvent.JOIN_CHANNEL
                });
            }
        }


        if (event.type == GameEvent.ON_SERVER_DISCONNECTED) {

            toCreatePage(0, 0);
        }


        if (event.type == GameEvent.ON_CHANNEL_STATUS) {

            if (GameConfig.isWaiting == false) {

                if (GameConfig.gameActor == "LEADER") {

                    /* ChannelView > KeyStep */
                    toCreatePage(2, 0);
                }

                if (GameConfig.gameActor == "MEMBER") {

                    /* ChannelView > WaitStep */
                    toCreatePage(2, 2);
                }
                GameConfig.isWaiting = true;
            }
        }

    }


    /**
     * Resource
     * */
    var RES:GameRes;

    function toLoadResConfig():void {

        RES = GameRes.instance();
        RES.on(ResourceEvent.CONFIG_COMPLETE, onResConfigComplete);
        RES.toLoadConfig("resource/resource.json", "resConfig");
    }

    function onResConfigComplete():void {

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

    function onResGroupProgress(progress:number):void {
        //console.log("progress:" + progress);
        loadingUI.onProgress(progress);
    }

    function onResGroupComplete(complete:string):void {

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

            loadingUI.toTransitionOut();
            viewData[4]["isLoaded"] = true;
            toCheckUrl();
        }
    }


    /**
     * CreatePage
     * */
    var currentPage:any;
    var viewData:Array<any> = [
        {assetsName: "home", className: HomeView, isLoaded: false},
        {assetsName: "start", className: StartView, isLoaded: false},
        {assetsName: "channel", className: ChannelView, isLoaded: false},
        {assetsName: "game", className: GameView, isLoaded: false},
        {assetsName: "result", className: ResultView, isLoaded: false},
    ];

    function toCreatePage(id:number, stepid:number = 0):void {

        if (currentPage != null) {
            currentPage.toTransitionOut(id, stepid);
            return;
        }

        if (viewData[id]["isLoaded"] == false) {

            loadingUI.toTransitionIn();
            RES.toQueueGroups(viewData[id]["assetsName"] + "_assets", 0);
            RES.toLoadGroup();
            return;
        }


        var viewClass:any = viewData[id]["className"];
        var viewResources:any = RES.toGetRes(viewData[id]["assetsName"] + "_assets");
        currentPage = new viewClass(viewData[id]["assetsName"], viewResources, stepid);
        currentPage.once(ViewEvent.TRANSITION_IN_COMPLETE, onViewStatus);
        currentPage.once(ViewEvent.TRANSITION_OUT_COMPLETE, onViewStatus);

        gameScene.addChildAt(currentPage, 0);
    }

    function onViewStatus(event:any):void {

        if (event.type == ViewEvent.TRANSITION_IN_COMPLETE) {

        }

        if (event.type == ViewEvent.TRANSITION_OUT_COMPLETE) {

            gameScene.removeChild(currentPage);
            currentPage.destroy();
            currentPage = null;

            toCreatePage(event.id, event.stepid);
        }
    }


}

