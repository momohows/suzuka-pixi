/**
 * Created by susanph.huang on 2016/1/26.
 */


module GameUtil {


    export function toCreateGameKey():string {

        var key:string =
            ((((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1))
            + ((((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1));
        return key;
    }


    export function toSwapStrToNumberArr(str:string):Array<number> {

        var tmpArr:Array<number> = [];
        str.split(",").forEach(item=> {
            tmpArr.push(+item);
        });
        return tmpArr;
    }


    export function toSetDeviceData(id:number, data:string):void {

        var tmpStr:string = "";
        GameConfig.memberDeviceData.split("|").forEach((item, index)=> {
            if (index == id) {
                item = data;
            }
            tmpStr = tmpStr + item + "|";
        });
        GameConfig.memberDeviceData = tmpStr.slice(0, -1);
    }

    export function toGetDeviceData():Array<any> {

        var deviceData:Array<any> = [];
        GameConfig.memberDeviceData.split("|").forEach((item, index)=> {
            deviceData.push(GameUtil.toSwapStrToNumberArr(item));
        });
        return deviceData;
    }


    export function toSetMemberStatus(id:number, status:number):void {

        var statusArr:Array<any> = GameConfig.channelMembers.split(",");
        statusArr[id] = status;

        GameConfig.channelMembers = '';
        statusArr.forEach(item=> {
            GameConfig.channelMembers = GameConfig.channelMembers + item.toString() + ",";
        });

        GameConfig.channelMembers = GameConfig.channelMembers.slice(0, -1);
    }

    export function toGetMemberStatus(id:number):number {

        var arr:Array<any> = GameConfig.channelMembers.split(",");
        return +arr[id];
    }

    export function toGetTotalMembers():number {

        var total:number = 0;
        var memberArr:Array<any> = GameConfig.channelMembers.split(",");
        memberArr.forEach(item=> {
            if (+item == 1) {
                total += 1;
            }
        });
        return total;
    }

    export function toCheckMemberReady():boolean {

        var total:number = 0;
        var memberArr:Array<any> = GameConfig.channelMembers.split(",");
        memberArr.forEach(item=> {
            if (+item == 2) {
                total += 1;
            }
        });

        return total == GameConfig.totalMembers ? true : false;
    }
}