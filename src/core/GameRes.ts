/**
 * Created by susanph.huang on 2015/12/28.
 */

/// <reference path="../events/ResourceEvent.ts"/>
class GameRes extends PIXI.Container {

    private static _instance:GameRes = new GameRes();

    constructor() {

        super();
        if (GameRes._instance) {
            throw new Error("Error: Instantiation failed: Use GameRes.instance() instead of new.");
        }
        GameRes._instance = this;
    }

    public static instance():GameRes {
        return GameRes._instance;
    }


    /**
     * Load Resource config
     * */
    private resLoader:PIXI.loaders.Loader;
    private resConfig:any;

    public toLoadConfig(url:string, name:string = "resConfig"):void {

        if (!this.resLoader) {
            this.resLoader = new PIXI.loaders.Loader();
        }

        this.resLoader.once("complete", this.onLoadConfigComplete.bind(this));
        this.resLoader.add(name, url);
        this.resLoader.load();
    }

    private onLoadConfigComplete(loader:PIXI.loaders.Loader, resources:any):void {

        this.resConfig = resources.resConfig.data;
        this.emit(ResourceEvent.CONFIG_COMPLETE);
    }


    /**
     *
     * */
    private loadedGroups:Array<any> = [];
    private loadDelayGroups:Array<string> = [];
    private loadingGroup:string = "";

    public toQueueGroups(groupName:string, priority:number = 0):void {

        //TODO loadDelayGroup priority 搜尋未存入Group，自動重新排序陣列

        var isLoaded:boolean = this.toCheckLoaded(groupName);
        if (isLoaded) return;

        this.loadDelayGroups[priority] = groupName;
    }

    public toLoadGroup():void {

        this.resLoader.reset();
        this.resLoader.on("progress", this.onLoadGroupProgress.bind(this));
        this.resLoader.once("complete", this.onLoadGroupComplete.bind(this));

        this.loadingGroup = this.loadDelayGroups[0];
        var loadList:Array<Object> = this.toGetLoadList(this.loadDelayGroups[0]);
        loadList.forEach(item => this.resLoader.add(item["name"], item["url"]));

        this.resLoader.load();
    }

    private onLoadGroupProgress(loader:PIXI.loaders.Loader):void {
        this.emit(ResourceEvent.GROUP_PROGRESS, loader.progress);
    }

    private onLoadGroupComplete(loader:PIXI.loaders.Loader, resources:any):void {
        this.loadDelayGroups.shift();
        this.loadedGroups.push({
            name: this.loadingGroup,
            resources: resources
        });

        this.emit(ResourceEvent.GROUP_COMPLETE, this.loadingGroup);

        if (this.loadDelayGroups.length > 0) {
            this.toLoadGroup();
        }
    }

    private toGetLoadList(groupName:string):Array<Object> {

        var resources:Array<Object> = [];
        this.resConfig["groups"].forEach(item=> {
            if (item["name"] === groupName) {
                resources = item["resources"];
            }
        });
        return resources;
    }

    private toCheckLoaded(groupName:string):boolean {

        var isLoaded:boolean = this.loadedGroups.some(function (value) {
            return value["name"] == groupName ? true : false;
        });
        return isLoaded;
    }


    public toGetRes(groupName:string):any {

        var targetSources:any = {};
        this.loadedGroups.forEach(item => {
            if (item["name"] == groupName) {
                targetSources = item["resources"];
            }
        });

        return targetSources;
    }
}
