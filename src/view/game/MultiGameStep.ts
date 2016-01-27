/**
 * Created by susanph.huang on 2015/12/29.
 */

/// <reference path="../../abstract/AbstractStepView.ts"/>
/// <reference path="../../utils/FrameUtil.ts"/>
/// <reference path="../../utils/CreateUtil.ts"/>

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

        if (event.status == "allMemberReady") {
            if (GameConfig.gameActor == "LEADER") {
                this.toCreateCountDown();
            }
        }

        if (event.status == "onCountDown") {
            console.log("countDown:" + event.countDown);
        }

        if (event.status == "startGame") {

            console.log("startGame");
            setInterval(()=> {
                App.gameConfig.toConnectSocket({
                    key: GameConfig.channelKey,
                    memberId: GameConfig.gameId,
                    act: SocketEvent.MEMBER_TO_LEADER,
                    gameStatus: "onMemberUpdate",
                    racing: '0,0,0'
                });
            }, 300);
        }

        if (event.status == "memberAction") {

        }
    }


    /* Game Logic */
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

            App.gameConfig.toConnectSocket({
                key: GameConfig.channelKey,
                act: SocketEvent.UPDATE_GAME,
                gameStatus: "startGame"
            });
        }
    }


    //
    private gameCon:PIXI.Container;
    private conRange:PIXI.Rectangle;
    private raceTrack:any;
    private toCreateGame():void {

    }


    public toUpdate():void {
        super.toUpdate();
    }

    public onTransitionComplete(type:string, stepid:number = -1, pid:number = -1):void {

        super.onTransitionComplete(type, stepid, pid);

        if (type == "TRANSITION_IN_COMPLETE") {

            App.gameConfig.on(GameEvent.ON_GAME_UPDATE, this.onGameConfigStatus.bind(this));
            App.gameConfig.toConnectSocket({
                key: GameConfig.channelKey,
                memberId: GameConfig.gameId,
                act: SocketEvent.MEMBER_TO_LEADER,
                gameStatus: "onMemberReady",
            });
        }
    }


}
