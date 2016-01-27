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

    public onTransitionComplete(type:string, stepid:number = -1, pid:number = -1):void {

        super.onTransitionComplete(type, stepid, pid);
        if (type == "TRANSITION_IN_COMPLETE") {

            App.gameConfig.toConnectSocket({
                key: GameConfig.channelKey,
                memberId: GameConfig.gameId,
                act: SocketEvent.MEMBER_TO_LEADER,
                gameStatus: "onMemberReady",
            });
        }
    }


    public toCreateElements():void {

        this.toCreateRacingBG();
        this.toCreateBall();
        this.toUpdate();

        App.gameConfig.on(GameEvent.ON_GAME_UPDATE, this.onGameConfigStatus.bind(this));
        super.toCreateElements();
    }


    /**
     *  game
     **/
    private racingCon:PIXI.Container;
    private racingBG:PIXI.Graphics;
    private racingRange:PIXI.Rectangle;
    private ball:PIXI.Graphics;
    private spdX:number = 5;
    private easing:number = 0.8;
    private action:boolean = false;

    private toCreateRacingBG():void {

        this.racingRange = new PIXI.Rectangle(0, 0, this.toGetMaxWidth(), this.toGetMinHeight());
        console.log("racingRange:" + this.racingRange.width + "/" + this.racingRange.height);


        this.racingCon = new PIXI.Container();
        var bgX:number = 0;
        for (var i:number = 0; i < GameUtil.toGetDeviceData().length; i++) {

            if (GameUtil.toGetDeviceData()[i][0] > 0) {

                this.racingBG = new PIXI.Graphics();
                this.racingBG.beginFill(0x882222, 0.8);
                this.racingBG.drawRect(0, 0, GameUtil.toGetDeviceData()[i][0], this.toGetMinHeight());
                this.racingBG.endFill();

                var txt:PIXI.Text = new PIXI.Text("D" + (i + 1), {
                    font: '50px Menlo',
                    fill: 0xffffff,
                    align: 'left'
                });
                txt.x = (this.racingBG.width - txt.width) * 0.5;
                txt.y = (this.racingBG.height - txt.height) - 100;
                this.racingBG.addChild(txt);

                this.racingBG.x = bgX;
                this.racingCon.addChild(this.racingBG);
                bgX = bgX + GameUtil.toGetDeviceData()[i][0];
            }
        }

        var conX:number = GameConfig.gameId - 1 == 0 ? 0 : this.toGetConX(GameConfig.gameId);
        this.racingCon.x = -1 * conX;
        this.addChild(this.racingCon);
    }

    private toCreateBall():void {

        this.ball = new PIXI.Graphics();
        this.ball.beginFill(0xCCCCCC, 1);
        this.ball.drawCircle(0, 0, 30);
        this.ball.endFill();

        this.ball.x = this.ball.width * 0.5;
        this.ball.y = (this.racingCon.height - this.ball.height) * 0.5;
        this.racingCon.addChild(this.ball);
    }

    private toActionBall():void {

        this.action = true;
    }


    public toUpdate():void {

        super.toUpdate();
        if (this.action) {

            var dx:number = (this.ball.x + this.spdX) - this.ball.x;
            var vx:number = dx * this.easing;
            this.ball.x += vx;
            if (this.ball.x > this.racingRange.width - (this.ball.width * 0.5)
                || this.ball.x < 0 + (this.ball.width * 0.5)) {
                this.spdX *= -1;
            }
        }

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
            this.toActionBall();
        }
    }

    private toCreateCountDown():void {

        var count:number = 1;
        var countTotal:number = 3;
        var countDown:any = setInterval(()=> {
            if (count <= countTotal) {
                App.gameConfig.toConnectSocket({
                    key: GameConfig.channelKey,
                    act: SocketEvent.UPDATE_GAME,
                    gameStatus: "onCountDown",
                    countDown: count
                });
                count++;

            } else {

                window.clearInterval(countDown);
                countDown = null;
                App.gameConfig.toConnectSocket({
                    key: GameConfig.channelKey,
                    act: SocketEvent.UPDATE_GAME,
                    gameStatus: "startGame"
                });
            }
        }, 1000);
    }

    private toGetConX(id:number):number {

        var targetX:number = 0;
        for (var i:number = 0; i < id - 1; i++) {
            targetX = targetX + GameUtil.toGetDeviceData()[i][0];
        }
        return targetX;
    }

    private toGetMinHeight():number {

        var heightArr:Array<number> = [];
        GameUtil.toGetDeviceData().forEach(item=> {
            if (item[1] > 0) {
                heightArr.push(item[1]);
            }
        });

        var minH:number = Math.min.apply(null, heightArr);
        return minH;
    }

    private toGetMaxWidth():number {

        var w:number = 0;
        GameUtil.toGetDeviceData().forEach(item=> {
            if (item[0] > 0) w += item[0];
        });

        return w;
    }


}
