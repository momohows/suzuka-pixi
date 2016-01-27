/**
 * Created by susanph.huang on 2015/12/29.
 */
/// <reference path="../../../definition/pixi/pixi.js.d.ts"/>
/// <reference path="../../abstract/AbstractStepView.ts"/>
/// <reference path="../../utils/FrameUtil.ts"/>
/// <reference path="../../utils/CreateUtil.ts"/>
/// <reference path="../../utils/GameUtil.ts"/>

class ChooseActorStep extends AbstractStepView {


    private leaderBtn:PIXI.Graphics;
    private memberBtn:PIXI.Graphics;

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
        super.toCreateElements();
    }

    private onLeaderBtnStatus(event:any):void {

        if (event.type == "mousedown" || event.type == "touchstart") {

            GameConfig.gameActor = "LEADER";
            GameConfig.channelKey = GameUtil.toCreateGameKey();
            App.gameConfig.toConnectSocket({
                key: GameConfig.channelKey,
                act: SocketEvent.JOIN_CHANNEL,
                device: Config.stageWidth.toString() + "," + Config.stageHeight.toString()
            });
        }
    }


    private onMemberBtnStatus(event:any):void {

        if (event.type == "mousedown" || event.type == "touchstart") {

            GameConfig.gameActor = "MEMBER";
            /* StartView > InputKeyStep */
            this.toTransitionOut(2, -1);
        }
    }


    public toUpdate():void {
        super.toUpdate();
    }

}
