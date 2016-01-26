/**
 * Created by susanph.huang on 2015/12/29.
 */
/// <reference path="../../../definition/pixi/pixi.js.d.ts"/>
/// <reference path="../../abstract/AbstractStepView.ts"/>
/// <reference path="../../utils/FrameUtil.ts"/>
/// <reference path="../../utils/CreateUtil.ts"/>

class InputKeyStep extends AbstractStepView {

    private $form:JQuery;
    private $keyInput:JQuery;

    private submitBtn:PIXI.Graphics;

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

        this.toInitForm();
        this.toDisplayForm(true);

        this.submitBtn = CreateUtil.toCreateCustomBtn("加入遊戲");
        this.addChild(this.submitBtn);
        CreateUtil.toAlignItem(this.submitBtn, "CENTER", "CENTER");
        this.submitBtn.y += 80;
        CreateUtil.toActivateItem(this.submitBtn, this.onSubmitBtnStatus.bind(this));

        // 程式碼寫在super之上
        super.toCreateElements();
    }

    private onSubmitBtnStatus(event:any):void {

        if (this.$keyInput.val() == "" || /[A-Za-z0-9]{8}/.test(this.$keyInput.val()) == false) {
            alert("Key < 8");
            return;
        }

        GameConfig.channelKey = this.$keyInput.val();
        App.gameConfig.on(GameEvent.ON_JOIN_CHANNEL, this.onGameConfigStatus.bind(this));
        App.gameConfig.toConnectSocket({
            key: GameConfig.channelKey,
            act: SocketEvent.JOIN_CHANNEL
        });
        //window.open(GameConfig.tmpMebmerUrl + GameConfig.channelKey, "_self");
    }

    private onGameConfigStatus(event:any):void {

        if (event.type == GameEvent.ON_JOIN_CHANNEL) {
            
            App.gameConfig.toConnectSocket({
                key: GameConfig.channelKey,
                memberId: GameConfig.gameId,
                act: SocketEvent.SAVE_DEVICE_DATA,
                device: "'" + Config.stageWidth.toString() + "," + Config.stageHeight.toString() + "'"
            });
        }
    }


    private toInitForm():void {

        this.$form = $("form");
        this.$form.submit(this.onFormStatus.bind(this));
        this.$keyInput = $("input[name='keyInput']");
    }

    private onFormStatus(event:any):void {

        event.preventDefault();
        this.onSubmitBtnStatus(null);
    }

    private toDisplayForm(boo:boolean):void {

        var _alpha:number = boo == true ? 1 : 0;
        TweenMax.to(this.$form, 0.3, {
            delay: 0.3,
            autoAlpha: _alpha,
            ease: Quart.easeOut
        });

        this.$keyInput.val("");
    }


    public toUpdate():void {
        super.toUpdate();
    }


    public toTransitionOut(id:number = -1, pid:number = -1):void {

        this.toDisplayForm(false);
        super.toTransitionOut(id, pid);
    }
}
