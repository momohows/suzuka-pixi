/**
 * Created by susanph.huang on 2015/12/29.
 */

/// <reference path="../../abstract/AbstractStepView.ts"/>
/// <reference path="../../utils/FrameUtil.ts"/>
/// <reference path="../../utils/CreateUtil.ts"/>
class KeyStep extends AbstractStepView {

    private keyText:PIXI.Text;
    private totalText:PIXI.Text;
    private lockChannelBtn:PIXI.Graphics;

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

        this.keyText = new PIXI.Text(GameConfig.channelKey.toUpperCase(), {
            font: '50px Menlo',
            fill: 0xffff,
            align: 'center'
        });
        CreateUtil.toAlignItem(this.keyText, "CENTER", "CENTER");
        this.keyText.y -= 50;
        this.addChild(this.keyText);


        this.totalText = new PIXI.Text("已連線人數：" + GameConfig.totalMembers.toString() + "/4人", {
            font: '16px Menlo',
            fill: 0xc2c2c2,
            align: 'center'
        });
        CreateUtil.toAlignItem(this.totalText, "CENTER", "CENTER");
        this.totalText.y -= 10;
        this.addChild(this.totalText);


        this.lockChannelBtn = CreateUtil.toCreateCustomBtn("連線完成");
        this.addChild(this.lockChannelBtn);
        CreateUtil.toAlignItem(this.lockChannelBtn, "CENTER", "BOTTOM");
        this.lockChannelBtn.y -= 90;
        CreateUtil.toActivateItem(this.lockChannelBtn, this.onLockBtnStatus.bind(this));


        this.toUpdate();
        super.toCreateElements();
    }


    private onLockBtnStatus(event:any):void {

        if (event.type == "mousedown" || event.type == "touchstart") {

            /* 在LEADER按下連線完成後，鎖定Channel人數，不讓人加入 */
            App.gameConfig.on(GameEvent.CHANNEL_LOCKED, this.onGameConfigStatus.bind(this));
            App.gameConfig.toConnectSocket({
                key: GameConfig.channelKey,
                act: SocketEvent.LOCK_CHANNEL,
            });
        }
    }

    private onGameConfigStatus(event:any):void {

        if (event.type == GameEvent.CHANNEL_LOCKED) {
            this.toTransitionOut(1, -1);
        }
    }


    public toUpdate():void {

        super.toUpdate();
        this.totalText.text = "已連線人數：" + GameConfig.totalMembers.toString() + "/4人";
    }

}
