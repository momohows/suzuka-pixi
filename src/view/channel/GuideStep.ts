/**
 * Created by susanph.huang on 2015/12/29.
 */

/// <reference path="../../abstract/AbstractStepView.ts"/>
/// <reference path="../../utils/FrameUtil.ts"/>
/// <reference path="../../utils/CreateUtil.ts"/>
class GuideStep extends AbstractStepView {

    private playBtn:PIXI.Graphics;

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

        this.playBtn = CreateUtil.toCreateCustomBtn("開始遊戲");
        this.addChild(this.playBtn);
        CreateUtil.toAlignItem(this.playBtn, "CENTER", "CENTER");
        CreateUtil.toActivateItem(this.playBtn, this.onPlayBtnStatus.bind(this));

        // 程式碼寫在super之上
        super.toCreateElements();
    }

    private onPlayBtnStatus(event:any):void {

        if (GameConfig.totalMembers > 1) {
            App.gameConfig.on(GameEvent.ON_GAME_UPDATE, this.onGameConfigStatus.bind(this));
            App.gameConfig.toConnectSocket({
                key: GameConfig.channelKey,
                memberId: GameConfig.gameId,
                act: SocketEvent.UPDATE_GAME,
                gameStatus: "toStandBy"
            });

        } else {

            GameConfig.gameType = "SingleGame";
            this.toTransitionOut(0, 3);
        }

    }

    private onGameConfigStatus(event:any):void {

        if (event.type == GameEvent.ON_GAME_UPDATE) {

            if (event.status == "toStandBy") {
                this.toTransitionOut(1, 3);
            }
        }
    }


    public toUpdate():void {
        super.toUpdate();
        //this.fighter.rotation += 0.01;
    }

}
