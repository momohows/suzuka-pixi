/**
 * Created by susanph.huang on 2015/12/3.
 */

/// <reference path="../../definition/greensock/greensock.d.ts"/>
/// <reference path="../../definition/jquery/jquery.d.ts"/>
/// <reference path="../events/ViewEvent.ts"/>

class AbstractStepView extends PIXI.Container {

    public name:string;
    public resources:Object;

    constructor(name:string, resourses:Object) {

        super();

        this.name = name;
        this.resources = resourses;
        this.alpha = 0;

        $(window).resize(this.onResize.bind(this));
        this.toInit();
    }

    public onResize(event:any):void {
    }

    private toInit():void {
        this.toCreateElements();
    }

    public toCreateElements():void {
        this.toTransitionIn();
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


    public toTransitionIn():void {

        TweenMax.to(this, 0.5, {
            delay: 0.3,
            alpha: 1,
            ease: Quart.easeOut,
            onComplete: this.onTransitionComplete.bind(this),
            onCompleteParams: ["TRANSITION_IN_COMPLETE"]
        });
    }

    public toTransitionOut(stepid:number = -1, pid:number = -1):void {

        TweenMax.to(this, 0.5, {
            alpha: 0,
            ease: Quart.easeOut,
            onComplete: this.onTransitionComplete.bind(this),
            onCompleteParams: ["TRANSITION_OUT_COMPLETE", stepid, pid]
        });
    }

    public onTransitionComplete(type:string, stepid:number = -1, pid:number = -1):void {

        TweenMax.killTweensOf(this);
        if (type == "TRANSITION_IN_COMPLETE") {

            this.toUpdate();
            this.emit(ViewEvent.TRANSITION_IN_COMPLETE, {
                type: ViewEvent.TRANSITION_IN_COMPLETE
            });
        }

        if (type == "TRANSITION_OUT_COMPLETE") {

            this.toRemove();
            this.emit(ViewEvent.TRANSITION_OUT_COMPLETE, {
                stepid: stepid,
                pid: pid,
                type: ViewEvent.TRANSITION_OUT_COMPLETE
            })
        }
    }

}
