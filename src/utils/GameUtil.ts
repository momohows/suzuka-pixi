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


    export function toGetDataVarsArr():Array<Object> {

        var memberData:Array<Object> = [];
        GameConfig.memberVars.split("|").forEach((item, index)=> {
            var dataObj:Object = {
                device: GameUtil.toSwapStrToNumberArr(item.split("-")[0]),
                racing: GameUtil.toSwapStrToNumberArr(item.split("-")[1])
            };
            memberData.push(dataObj);
        });

        return memberData;
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
}