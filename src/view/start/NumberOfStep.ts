/**
 * Created by susanph.huang on 2015/12/29.
 */

/// <reference path="../../abstract/AbstractStepView.ts"/>
/// <reference path="../../utils/FrameUtil.ts"/>
/// <reference path="../../utils/CreateUtil.ts"/>
class NumberOfStep extends AbstractStepView {

    private singleBtn:PIXI.Graphics;
    private multiBtn:PIXI.Graphics;

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
        super.toCreateElements();
    }

    private onSingleBtnStatus(event:any):void {

        if (event.type == "mousedown" || event.type == "touchstart") {

            GameConfig.gameType = "SingleGame";
            /* GameView > SingleGameStep */
            this.toTransitionOut(0, 3);
        }
    }

    private onMultiBtnStatus(event:any):void {

        if (event.type == "mousedown" || event.type == "touchstart") {
            GameConfig.gameType = "MultiGame";

            /* 初始化Websocket */
            App.gameConfig.toInitSocket();
            App.gameConfig.on(GameEvent.ON_SERVER_CONNECTED, this.onGameConfigStatus.bind(this));
        }
    }

    private onGameConfigStatus(event:any):void {

        /* StartView > ChooseActorStep */
        this.toTransitionOut(1, -1);
    }


    public toUpdate():void {
        super.toUpdate();
    }

}
