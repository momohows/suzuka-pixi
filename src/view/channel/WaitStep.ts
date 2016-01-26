/**
 * Created by susanph.huang on 2015/12/29.
 */

/// <reference path="../../abstract/AbstractStepView.ts"/>
/// <reference path="../../utils/FrameUtil.ts"/>
/// <reference path="../../utils/CreateUtil.ts"/>
class WaitStep extends AbstractStepView {

    private numOfText:PIXI.Text;
    private totalText:PIXI.Text;

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

        this.numOfText = new PIXI.Text(GameConfig.gameId.toString(), {
            font: '120px Arial',
            fill: 0xffff,
            align: 'center'
        });

        CreateUtil.toAlignItem(this.numOfText, "CENTER", "CENTER");
        this.numOfText.y -= 50;
        this.addChild(this.numOfText);

        this.totalText = new PIXI.Text("已連線人數：" + GameConfig.totalMembers.toString() + "/4人", {
            font: '16px Menlo',
            fill: 0xc2c2c2,
            align: 'center'
        });
        CreateUtil.toAlignItem(this.totalText, "CENTER", "CENTER");
        this.totalText.y += 50;
        this.addChild(this.totalText);

        App.gameConfig.on(GameEvent.ON_JOIN_CHANNEL, this.onGameConfigStatus.bind(this));
        App.gameConfig.on(GameEvent.ON_GAME_UPDATE, this.onGameConfigStatus.bind(this));

        this.toUpdate();
        super.toCreateElements();
    }

    private onGameConfigStatus(event:any):void {

        if (event.type == GameEvent.ON_JOIN_CHANNEL) {
            console.log("WaitView.ON_JOIN_CHANNEL");
            App.gameConfig.toConnectSocket({
                key: GameConfig.channelKey,
                memberId: GameConfig.gameId,
                act: SocketEvent.SAVE_DEVICE_DATA,
                device: Config.stageWidth.toString() + "," + Config.stageHeight.toString()
            });
        }

        if (event.type == GameEvent.ON_GAME_UPDATE) {

            if (event.status == "toStandBy") {
                this.toTransitionOut(1, 3);
            }
        }
    }


    public toUpdate():void {
        super.toUpdate();
        this.totalText.text = "已連線人數：" + GameConfig.totalMembers.toString() + "/4人";
    }


    public onTransitionComplete(type:string, stepid:number = -1, pid:number = -1):void {
        super.onTransitionComplete(type, stepid, pid);
    }
}
