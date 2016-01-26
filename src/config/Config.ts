/**
 * Created by susanph.huang on 2015/12/30.
 */


class Config extends PIXI.Container {

    private static _instance:Config;
    public static canvasScaleRate:number;
    public static stageWidth:number;
    public static stageHeight:number;

    constructor() {
        super();
        if (Config._instance) {
            throw new Error("Error: Please use Config.instance() instead of new.");
        }
    }

    public static instance():Config {
        if (!Config._instance) {
            Config._instance = new Config();
        }
        return Config._instance;
    }


    public static toInit():void {

        Config.stageWidth = window.innerWidth;
        Config.stageHeight = window.innerHeight;
    }


}
