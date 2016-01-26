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

        App.gameConfig.on(GameEvent.ON_GAME_UPDATE, this.onGameConfigStatus.bind(this));
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
            //console.log("racing:" + event.racingData);
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

    public toUpdate():void {
        super.toUpdate();
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


}
