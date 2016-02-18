/**
 * Created by susanph.huang on 2015/12/29.
 */

/// <reference path="../../abstract/AbstractStepView.ts"/>
/// <reference path="../../utils/FrameUtil.ts"/>
/// <reference path="../../utils/CreateUtil.ts"/>
/// <reference path="./ScoreBoard.ts"/>
/// <reference path="./RacingTrack.ts"/>
/// <reference path="./HitArea.ts"/>

class MultiGameStep extends AbstractStepView {


    constructor(name:string, resources:Object) {

        super(name, resources);
    }

    public toRemove():void {
        super.toRemove();
    }

    public onResize(event):void {
        super.onResize(event);
    }


    public toCreateElements():void {

        this.toCreateGame();
        super.toCreateElements();
    }

    private onGameConfigStatus(event:any) {

        switch (event.status) {

            case "allMemberReady":
                if (GameConfig.gameActor == "LEADER") {
                    this.toCreateCountDown();
                }
                break;

            case "onCountDown":
                console.log("countDown:" + event.countDown);
                break;

            case "startGame":
                this.toUpdate();
                break;

            case "memberAction":
                break;
        }
    }


    private countDown:GameUtil.CountDown;

    private toCreateCountDown():void {

        this.countDown = new GameUtil.CountDown(3);
        this.countDown.on(GameEvent.ON_COUNTDOWN, this.onCountDown.bind(this));
    }

    private onCountDown(event:any):void {

        if (event.count <= 3) {

            App.gameConfig.toConnectSocket({
                key: GameConfig.channelKey,
                act: SocketEvent.UPDATE_GAME,
                gameStatus: GameEvent.ON_COUNTDOWN,
                countDown: event.count
            });

        } else {

            this.countDown.toStop();
            this.countDown = null;

            App.gameConfig.toConnectSocket({
                key: GameConfig.channelKey,
                act: SocketEvent.UPDATE_GAME,
                gameStatus: "startGame"
            });

        }
    }


    /**
     * CreateGame
     **/

    private deviceRange:PIXI.Rectangle;
    private gameCon:PIXI.Container;
    private trackCon:PIXI.Container;
    private raceTrack:PIXI.Sprite;
    private raceJsonData:Array<any>;
    private raceData:Array<any>;
    private car:PIXI.Graphics;

    private dataIndex:number;

    private toCreateGame():void {

        var tmpStr:string = Config.stageWidth.toString() + "," + Config.stageHeight.toString();
        GameConfig.memberDeviceData = GameUtil.toSetValueInStr(0, tmpStr, GameConfig.memberDeviceData);
        this.deviceRange = new PIXI.Rectangle(0, 0, GameUtil.toGetAllDeviceMaxWidth(), GameUtil.toGetAllDeviceMinHeight());

        this.gameCon = new PIXI.Container();
        this.gameCon.x = GameConfig.gameId - 1 == 0 ? 0 : -1 * GameUtil.toGetDeviceStartX(GameConfig.gameId - 1);
        this.addChild(this.gameCon);

        this.trackCon = new PIXI.Container();
        this.gameCon.addChild(this.trackCon);

        this.raceTrack = new PIXI.Sprite(this.resources["track"].texture);
        this.raceTrack.anchor.x = 0.5;
        this.raceTrack.anchor.y = 0.5;
        this.raceTrack.x = this.raceTrack.width * 0.5;
        this.raceTrack.y = this.raceTrack.height * 0.5;
        this.trackCon.addChild(this.raceTrack);

        GameUtil.toFixElementByRate(this.trackCon, this.deviceRange);
        this.trackCon.x = (this.deviceRange.width - this.trackCon.width) * 0.5;
        this.trackCon.y = (this.deviceRange.height - this.trackCon.height) * 0.5;


        this.raceJsonData = this.resources["race_data"].data;
        this.raceData = [];
        for (var i:number = 0; i < this.raceJsonData["car1"].length; i++) {

            var localPT:PIXI.Point = new PIXI.Point(this.raceJsonData["car1"][i].x, this.raceJsonData["car1"][i].y);
            var globalPT:PIXI.Point = this.trackCon.toGlobal(localPT);

            var tmpObj:Object = {};
            tmpObj["position"] = globalPT;
            tmpObj["rotation"] = this.raceJsonData["car1"][i].rotation;
            this.raceData.push(tmpObj);
        }


        this.car = new PIXI.Graphics;
        this.car.beginFill(0xff0000, 0.7);
        this.car.drawRect(-10, -20, 20, 40);
        this.car.endFill();

        this.car.x = this.raceData[0]["position"].x;
        this.car.y = this.raceData[0]["position"].y;
        this.gameCon.addChild(this.car);


        this.toCreateScoreBoard();
        this.toCreateHitArea();
    }

    /* ========================================================= */


    /**
     * HitArea
     **/
    private hitRect:HitArea;

    private toCreateHitArea():void {

        this.hitRect = new HitArea();
        this.hitRect.alpha = 0;
        this.addChild(this.hitRect);
    }

    /* ========================================================= */


    /**
     * ScoreBoard
     **/
    private scoreBoard:ScoreBoard;

    private toCreateScoreBoard():void {
        console.log((Math.PI * 2));
        this.scoreBoard = new ScoreBoard();
        this.addChild(this.scoreBoard);
    }

    /* ========================================================= */


    public toUpdate():void {

        super.toUpdate();

        this.dataIndex = this.hitRect.getIndex(0);
        if (this.car) {

            if (this.dataIndex > this.raceData.length - 1) return;
            var targetX:number = this.raceData[this.dataIndex]["position"].x;
            var targetY:number = this.raceData[this.dataIndex]["position"].y;

            var dx:number = Math.floor(targetX - this.car.x);
            var dy:number = Math.floor(targetY - this.car.y);
            var targetR:number = Math.atan2(dy, dx) * 180 / Math.PI * 2;
            targetR = targetR / 100;
            //console.log(this.raceData[this.dataIndex]["rotation"]);
            this.car.rotation = (this.raceData[this.dataIndex]["rotation"] * Math.PI / 180);

            TweenMax.to(this.car, 0.5, {
                x: targetX,
                y: targetY,
                ease: Quart.easeOut
            });
        }

        /*App.gameConfig.toConnectSocket({
         key: GameConfig.channelKey,
         memberId: GameConfig.gameId,
         act: SocketEvent.MEMBER_TO_LEADER,
         gameStatus: "onMemberUpdate",
         dataIndex: this.dataIndex.toFixed(0)
         });*/

    }

    public onTransitionComplete(type:string, stepid:number = -1, pid:number = -1):void {

        TweenMax.killTweensOf(this);
        if (type == "TRANSITION_IN_COMPLETE") {

            this.toUpdate();
            /*if (!App.gameConfig) return;
             App.gameConfig.on(GameEvent.ON_GAME_UPDATE, this.onGameConfigStatus.bind(this));
             App.gameConfig.toConnectSocket({
             key: GameConfig.channelKey,
             memberId: GameConfig.gameId,
             act: SocketEvent.MEMBER_TO_LEADER,
             gameStatus: "onMemberReady"
             });*/

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
            })
        }

    }


}
