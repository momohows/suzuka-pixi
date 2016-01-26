/**
 * Created by susanph.huang on 2016/1/4.
 */


class LoadingUI extends PIXI.Container {

    private bgColor:PIXI.Graphics;
    private progressBar:PIXI.Graphics;

    constructor() {

        super();
        this.alpha = 0;
        $(window).resize(this.onResize.bind(this));
        this.toInit();
    }

    public onResize(event:any):void {

        if (this.bgColor) {
            this.bgColor.clear();
            this.bgColor.lineStyle(0);
            this.bgColor.beginFill(0, 0.7);
            this.bgColor.drawRect(0, 0, Config.stageWidth, Config.stageHeight);
        }

        if (this.progressBar) {

            this.progressBar.clear();
            this.progressBar.beginFill(0xffffff, 1);
            this.progressBar.drawRect(0, 0, Config.stageWidth, Config.stageHeight);
            this.progressBar.endFill();
        }

    }

    private toInit():void {

        this.bgColor = new PIXI.Graphics();
        this.bgColor.lineStyle(0);
        this.bgColor.beginFill(0, 0.7);
        this.bgColor.drawRect(0, 0, Config.stageWidth, Config.stageHeight);
        this.addChild(this.bgColor);

        this.progressBar = new PIXI.Graphics();
        this.progressBar.scale.x = 0;
        this.progressBar.beginFill(0xffffff, 1);
        this.progressBar.drawRect(0, 0, Config.stageWidth, Config.stageHeight);
        this.progressBar.endFill();
        /*this.progressBar.lineStyle(10, 0xffffff, 1);
        this.progressBar.moveTo(0, 0);
        this.progressBar.lineTo(Config.stageWidth, 0);*/
        this.addChild(this.progressBar);

        this.toTransitionIn();
    }

    public onProgress(progress:number):void {

        var valueObj:any = {
            x: this.progressBar.scale.x,
            y: this.progressBar.scale.y
        };

        TweenMax.to(valueObj, 1, {
            x: progress / 100,
            y: this.progressBar.scale.y,
            ease: Back.easeOut,
            onUpdate: this.onDrawUpdate.bind(this),
            onUpdateParams: [valueObj]
        });
    }

    private onDrawUpdate(param:any):void {

        this.progressBar.scale.x = param.x;
    }


    public toTransitionIn():void {

        TweenMax.to(this, 0.5, {
            alpha: 0.5,
            ease: Quart.easeOut,
            onComplete: this.onTransitionComplete.bind(this),
            onCompleteParams: ["TRANSITION_IN_COMPLETE"]
        });
    }

    public toTransitionOut():void {

        this.onProgress(100);

        TweenMax.to(this, 0.5, {
            delay: 0.5,
            alpha: 0,
            ease: Quart.easeOut,
            onComplete: this.onTransitionComplete.bind(this),
            onCompleteParams: ["TRANSITION_OUT_COMPLETE"]
        });
    }

    private onTransitionComplete(type:string):void {

        if (type == "TRANSITION_IN_COMPLETE") {

        }

        if (type == "TRANSITION_OUT_COMPLETE") {

            if (this.progressBar) {

                this.progressBar.scale.x = 0;
            }
        }
    }
}
