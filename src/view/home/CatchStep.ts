/**
 * Created by susanph.huang on 2015/12/29.
 */

/// <reference path="../../abstract/AbstractStepView.ts"/>
/// <reference path="../../utils/FrameUtil.ts"/>
/// <reference path="../../utils/CreateUtil.ts"/>

class CatchStep extends AbstractStepView {

    private ctaBtn:PIXI.Graphics;

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

        this.ctaBtn = CreateUtil.toCreateCustomBtn("出發吧GO");
        CreateUtil.toAlignItem(this.ctaBtn, "CENTER", "CENTER");

        CreateUtil.toActivateItem(this.ctaBtn,  this.onCtaBtnStatus.bind(this));
        this.addChild(this.ctaBtn);

        // 程式碼寫在super之上
        super.toCreateElements();
    }

    private onCtaBtnStatus(event:any):void {
        if (event.type == "mousedown" || event.type == "touchstart") {
            this.onCtaBtnEffect();
        }
    }

    private onCtaBtnEffect():void {
        this.ctaBtn.alpha = 0.5;

        /* StartView > NumberOfStep */
        this.toTransitionOut(0, 1)
    }


    public toUpdate():void {
        super.toUpdate();
    }

}
