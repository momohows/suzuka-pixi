/**
 * Created by susanph.huang on 2015/12/29.
 */

/// <reference path="../../abstract/AbstractStepView.ts"/>
/// <reference path="../../utils/FrameUtil.ts"/>
/// <reference path="../../utils/CreateUtil.ts"/>

class MultiGameStep extends AbstractStepView {

    private action:boolean;

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

        this.action = false;
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
            this.action = true;
        }

        if (event.status == "memberAction") {
            this.spdArr = GameUtil.toSwapStrToNumberArr(event.racing, "|");
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

        this.gameCon = new PIXI.Container();
        this.addChild(this.gameCon);

        GameUtil.toGetDeviceData().forEach((item, index)=> {
            var w:number = item[0];
            if (w > 0) {
                var tmpBg:PIXI.Graphics = new PIXI.Graphics();
                tmpBg.beginFill(Math.random() * 0xFFFFFF, 1);
                tmpBg.drawRect(0, 0, w, GameUtil.toGetAllDeviceMinHeight());
                tmpBg.endFill();

                var bgTitle:PIXI.Text = new PIXI.Text("DEVICE" + (index), {
                    font: '20px Arial',
                    fill: 0xffffff,
                    align: 'center'
                });

                bgTitle.x = (tmpBg.width - bgTitle.width) * 0.5;
                bgTitle.y = tmpBg.height - bgTitle.height - 50;
                tmpBg.addChild(bgTitle);

                tmpBg.x = index == 0 ? 0 : GameUtil.toGetDeviceStartX(index);
                this.gameCon.addChild(tmpBg);
            }
        });

        this.gameCon.x = GameConfig.gameId - 1 == 0 ? 0 : -1 * GameUtil.toGetDeviceStartX(GameConfig.gameId - 1);
        this.gameCon.y = (Config.stageHeight - this.gameCon.height) * 0.5;

        this.toCreateBall();
    }


    private ball:PIXI.Graphics;
    private spdArr:Array<number>;
    private allBalls:Array<PIXI.Graphics>;
    private easing:number = 0.5;
    private vxArr:Array<number>;

    private toCreateBall():void {

        var ballTotal:number = GameUtil.toGetTotalMembers();
        this.spdArr = [5, 7, 8, 3];
        this.allBalls = [];
        this.vxArr = [];
        for (var i:number = 0; i < ballTotal; i++) {

            this.ball = new PIXI.Graphics();
            this.ball.beginFill(0xc2c2c2, 1);
            this.ball.drawCircle(0, 0, 15);
            this.ball.endFill();

            this.ball.x = this.ball.width * 0.5;
            this.ball.y = ((this.gameCon.height - (this.ball.height * ballTotal)) * 0.5) + (i * (this.ball.height + 10));
            this.gameCon.addChild(this.ball);

            this.allBalls.push(this.ball);
            this.vxArr.push(1);
        }
    }


    private toActionBall():void {

        for (var i:number = 0; i < this.allBalls.length; i++) {

            var targetBall:PIXI.Graphics = this.allBalls[i];
            var targetX:number = targetBall.x + this.spdArr[i];
            targetBall.x += (targetX - targetBall.x) * this.easing * this.vxArr[i];
            if (
                targetBall.x > (GameUtil.toGetAllDeviceMaxWidth() - (targetBall.width * 0.5))
                || targetBall.x < 0 + (targetBall.width * 0.5)
            ) {
                this.vxArr[i] *= -1;
            }
        }
    }


    public toUpdate():void {

        super.toUpdate();
        if (this.action) {
            this.toActionBall();
            App.gameConfig.toConnectSocket({
                key: GameConfig.channelKey,
                memberId: GameConfig.gameId,
                act: SocketEvent.MEMBER_TO_LEADER,
                gameStatus: "onMemberUpdate",
                racing: this.spdArr[GameConfig.gameId - 1].toString()
            });
        }
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
