/**
 * Created by susanph.huang on 2015/12/4.
 */


/// <reference path="../../definition/pixi/pixi.js.d.ts"/>
/// <reference path="../../definition/jquery/jquery.d.ts"/>
/// <reference path="../../definition/fpsmeter/FPSMeter.d.ts"/>
/// <reference path="../config/Config.ts"/>
/// <reference path="../events/GameEvent.ts"/>

class GameScene extends PIXI.Container {

    private option:Object = {
        width: 0,
        height: 0,
        bgColor: 0,
        transparent: true,
        fps: true
    };
    private playerCon:HTMLElement;
    private canvas:any;
    private renderer:any;
    private meter:FPSMeter;

    constructor(option:Object) {

        super();

        this.toChangeOption(option);
        $(window).resize(this.onResize.bind(this));
        this.toInit();
    }

    public onResize(event:any):void {

        this.renderer.resize(window.innerWidth, window.innerHeight);
        Config.stageWidth = this.canvas.width;
        Config.stageHeight = this.canvas.height;
    }


    private toChangeOption(option:Object) {

        for (var key in option) {
            this.option[key] = option[key];
        }
    }

    private toInit():void {

        this.canvas = document.createElement("canvas");
        this.canvas.id = "pixiPlayer";
        this.canvas.style.position = "absolute";

        this.playerCon = document.getElementById("playerCon");
        this.playerCon.appendChild(this.canvas);

        var renderOption:any = {
            view: this.canvas,
            //resolution: window.devicePixelRatio,
            resolution: 1,
            backgroundColor: this.option["bgColor"],
            transparent: this.option["transparent"]
        };
        this.renderer = PIXI.autoDetectRenderer(this.option["width"], this.option["height"], renderOption);

        //this.toFixRatio();
        this.toUpdate();

        if (this.option["fps"]) {
            this.toCreateFpsMeter();
        }
    }

    private toFixRatio():void {

        // TODO 如果哪天html viewport不再支援，必須再研究
        Config.canvasScaleRate = 1 / window.devicePixelRatio;
        this.canvas.style.transform = 'scale3d(' + Config.canvasScaleRate + ',' + Config.canvasScaleRate + ',' + Config.canvasScaleRate + ')';
        this.canvas.style.transformOrigin = '0 0';
        Config.stageWidth = this.canvas.width * Config.canvasScaleRate;
        Config.stageHeight = this.canvas.height * Config.canvasScaleRate;
    }


    private toUpdate():void {
        requestAnimationFrame(this.toUpdate.bind(this));
        if (this.meter) {
            this.meter.tick();
        }
        this.renderer.render(this);
    }

    private toCreateFpsMeter():void {

        /**
         * FPS Meter
         * website:http://darsa.in/fpsmeter/
         * github:https://github.com/Darsain/fpsmeter/
         * */
        this.meter = new FPSMeter(document.body, {
            theme: 'transparent', // Meter theme. Build in: 'dark', 'light', 'transparent', 'colorful'.
            heat: 1,      // Allow themes to use coloring by FPS heat. 0 FPS = red, maxFps = green.
            graph: 1, // Whether to show history graph.
            history: 20 // How many history states to show in a graph.
        });
    }


}



