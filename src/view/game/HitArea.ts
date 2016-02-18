/**
 * Created by susanph.huang on 2016/2/17.
 */


class HitArea extends PIXI.Container {

    private alphaRect:PIXI.Graphics;

    private maxVX:number;
    private minVX:number;
    private vx:number;
    private ax:number;
    private friction:number;
    private index:number;

    constructor() {

        super();
        this.toCreateElement();
    }


    private toCreateElement():void {

        this.maxVX = 5;
        this.minVX = 0.1;
        this.vx = 0;
        this.ax = 0.3;
        this.friction = 0.98;
        this.index = 0;

        this.alphaRect = new PIXI.Graphics();
        this.alphaRect.beginFill(0x000000, 0.3);
        this.alphaRect.drawRect(0, 0, Config.stageWidth, Config.stageHeight);
        this.alphaRect.endFill();
        this.addChild(this.alphaRect);

        this.toActive();
    }

    private toActive():void {

        if (this.alphaRect) {
            CreateUtil.toActivateItem(this.alphaRect, this.onAlphaRectStatus.bind(this));
            this.toUpdate();
        }
    }

    private onAlphaRectStatus(event:any):void {

        this.vx += this.ax;
        if (this.vx > this.maxVX) {
            this.vx = this.maxVX;
        }
    }

    private toUpdate():void {

        requestAnimationFrame(this.toUpdate.bind(this));

        this.vx *= this.friction;
        if (this.vx <= this.minVX) {
            this.vx = 0;
        }


        this.index += this.vx;
    }

    public getIndex(slpit:number):number {
        return +this.index.toFixed(slpit);
    }
}
