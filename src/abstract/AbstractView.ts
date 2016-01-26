/**
 * Created by susanph.huang on 2015/12/3.
 */

/// <reference path="../../definition/greensock/greensock.d.ts"/>
/// <reference path="../../definition/jquery/jquery.d.ts"/>
/// <reference path="../events/ViewEvent.ts"/>
/// <reference path="../abstract/AbstractStepView.ts"/>
class AbstractView extends PIXI.Container {

    public stepId:number;
    public name:string;
    public resources:Object;
    public stepView:AbstractStepView;

    constructor(name:string, resourses:Object, stepid:number = 0) {

        super();

        this.name = name;
        this.resources = resourses;
        this.alpha = 0;
        this.stepId = stepid;

        $(window).resize(this.onResize.bind(this));
        this.toInit();
    }

    public onResize(event:any):void {
    }

    private toInit():void {
        this.toCreateElements();
    }

    public toCreateElements():void {

        this.toCreateBg();
        this.toTransitionIn();
    }

    private toCreateBg():void {

        var bg:PIXI.Graphics = new PIXI.Graphics();
        bg.beginFill(0x000033, 1);
        bg.drawRect(0, 0, Config.stageWidth, Config.stageHeight);
        bg.endFill();
        this.addChildAt(bg, 0);

        var viewTitle:PIXI.Text = new PIXI.Text(this.name.toUpperCase(), {
            font: '40px Arial',
            fill: 0xffffff,
            align: 'center'
        });

        viewTitle.x = (Config.stageWidth - viewTitle.width) * 0.5;
        viewTitle.y = 80;
        this.addChildAt(viewTitle, 1);
    }

    public toRemove():void {

        if (this.children.length > 0) {

            this.children.forEach(item => {
                this.removeChild(item);
                item = null;
            });
        }
    }

    public toUpdate():void {
        requestAnimationFrame(this.toUpdate.bind(this));
    }


    public toCreateStepView(id:number):void {

    }


    public toTransitionIn():void {

        TweenMax.to(this, 0.5, {
            delay: 0.3,
            alpha: 1,
            ease: Quart.easeOut,
            onComplete: this.onTransitionComplete.bind(this),
            onCompleteParams: ["TRANSITION_IN_COMPLETE"]
        });
    }

    public toTransitionOut(pid:number = -1, stepid:number = -1):void {

        if (this.stepView) {
            this.stepView.toTransitionOut(stepid, pid);
            return;
        }

        TweenMax.to(this, 0.5, {
            alpha: 0,
            ease: Quart.easeOut,
            onComplete: this.onTransitionComplete.bind(this),
            onCompleteParams: ["TRANSITION_OUT_COMPLETE", pid, stepid]
        });
    }

    public onTransitionComplete(type:string, pid:number = -1, stepid:number = -1):void {

        TweenMax.killTweensOf(this);
        if (type == "TRANSITION_IN_COMPLETE") {

            this.toUpdate();
            this.toCreateStepView(this.stepId);
            this.emit(ViewEvent.TRANSITION_IN_COMPLETE, {
                type: ViewEvent.TRANSITION_IN_COMPLETE
            });
        }

        if (type == "TRANSITION_OUT_COMPLETE") {

            this.toRemove();
            this.emit(ViewEvent.TRANSITION_OUT_COMPLETE, {
                id: pid,
                stepid: stepid,
                type: ViewEvent.TRANSITION_OUT_COMPLETE
            });
        }
    }

}
