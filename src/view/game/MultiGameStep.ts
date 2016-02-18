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


    private gameCownDown:GameUtil.CountDown;

    private toCreateCountDown():void {

        this.gameCownDown = new GameUtil.CountDown(3);
        this.gameCownDown.on(GameEvent.ON_COUNTDOWN, this.onCountDown.bind(this));
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

            this.gameCownDown.toStop();
            this.gameCownDown = null;

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
    private dataIndex:number = 0;
    private gameCon:PIXI.Container;

    private toCreateGame():void {

        this.gameCon = new PIXI.Container();
        this.gameCon.x = GameConfig.gameId - 1 == 0 ? 0 : -1 * GameUtil.toGetDeviceStartX(GameConfig.gameId - 1);
        this.gameCon.y = (Config.stageHeight - this.gameCon.height) * 0.5;
        this.addChild(this.gameCon);

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
        this.addChild(this.hitRect);
    }

    /* ========================================================= */


    /**
     * ScoreBoard
     **/
    private scoreBoard:ScoreBoard;

    private toCreateScoreBoard():void {

        this.scoreBoard = new ScoreBoard();
        this.addChild(this.scoreBoard);
    }

    /* ========================================================= */


    public toUpdate():void {

        super.toUpdate();
        console.log("index:" + this.hitRect.getIndex(0));

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
