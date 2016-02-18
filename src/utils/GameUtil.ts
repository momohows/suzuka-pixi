/**
 * Created by susanph.huang on 2016/1/26.
 */


module GameUtil {

    /* COUNTDOWN */
    export class CountDown extends PIXI.Container {

        private ticker:any;
        private repeat:number;
        private count:number;

        constructor(repeat:number = 1) {
            super();
            this.repeat = repeat;
            this.toCreateElement(repeat);
        }

        private toCreateElement(repeat:number):void {

            this.count = 0;
            this.ticker = setInterval(()=> {
                if (this.count <= this.repeat) {

                    this.emit(GameEvent.ON_COUNTDOWN, {
                        count: this.count + 1,
                        type: GameEvent.ON_COUNTDOWN
                    });

                    this.count++;

                } else {
                    this.toStop();
                }

            }, 1000)
        }

        public toReset():void {
            this.toStop();
            this.toCreateElement(this.repeat);
        }

        public toStop():void {
            window.clearInterval(this.ticker);
            this.ticker = null;
        }
    }
    /* COUNTDOWN End */


    /* TOOLS */
    export function toCreateGameKey():string {

        var key:string =
            ((((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1))
            + ((((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1));
        return key;
    }

    export function toSwapStrToNumberArr(str:string, arg:string):Array<number> {

        var tmpArr:Array<number> = [];
        str.split(arg).forEach(item=> {
            tmpArr.push(+item);
        });
        return tmpArr;
    }

    export function toSwapArrayToStr(arr:Array<any>):string {

        console.dir(typeof GameConfig.playerStatus);

        return "";
    }

    export function toSetValueInStr(id:number, value:any, targetStr:string):string {

        var tmpStr:string = '';
        targetStr.split("|").forEach((item, index)=> {
            if (index == id) {
                item = value;
            }
            tmpStr = tmpStr + item.toString() + "|";
        });

        return tmpStr.slice(0, -1);
    }

    export function toGetDeviceData():Array<any> {

        var deviceData:Array<any> = [];
        GameConfig.memberDeviceData.split("|").forEach((item, index)=> {
            deviceData.push(GameUtil.toSwapStrToNumberArr(item, ","));
        });
        return deviceData;
    }

    export function toGetMemberStatus(id:number):number {

        var arr:Array<any> = GameConfig.channelMembers.split("|");
        return +arr[id];
    }

    export function toGetTotalMembers():number {

        var total:number = 0;
        var memberArr:Array<any> = GameConfig.channelMembers.split("|");
        memberArr.forEach(item=> {
            if (+item == 1) {
                total += 1;
            }
        });
        return total;
    }

    export function toCheckMemberReady():boolean {

        var total:number = 0;
        var memberArr:Array<any> = GameConfig.channelMembers.split("|");
        memberArr.forEach(item=> {
            if (+item == 2) {
                total += 1;
            }
        });
        return total == GameConfig.totalMembers ? true : false;
    }


    /* Game */
    export function toGetDeviceStartX(id:number):number {

        var targetX:number = 0;
        for (var i:number = 0; i < id; i++) {
            targetX = targetX + GameUtil.toGetDeviceData()[i][0];
        }
        return targetX;
    }

    export function toGetAllDeviceMinHeight():number {

        var heightArr:Array<number> = [];
        GameUtil.toGetDeviceData().forEach(item=> {
            if (item[1] > 0) {
                heightArr.push(item[1]);
            }
        });

        var minH:number = Math.min.apply(null, heightArr);
        return minH;
    }

    export function toGetAllDeviceMaxWidth():number {

        var w:number = 0;
        GameUtil.toGetDeviceData().forEach(item=> {
            if (item[0] > 0) w += item[0];
        });

        return w;
    }

    export function toFixElementByRate(element:any, parent:any):void {

        var wRate:number = parent.width / element.width;
        var hRate:number = parent.height / element.height;
        var targetRate:number = wRate < hRate ? wRate : hRate;
        element.scale.x = element.scale.y = targetRate - 0.02;
    }

}