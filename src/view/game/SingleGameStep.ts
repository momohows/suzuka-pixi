/**
 * Created by susanph.huang on 2015/12/29.
 */

/// <reference path="../../abstract/AbstractStepView.ts"/>
/// <reference path="../../utils/FrameUtil.ts"/>
/// <reference path="../../utils/CreateUtil.ts"/>

class SingleGameStep extends AbstractStepView {

    constructor(name:string, resources:Object) {

        super(name, resources);
    }

    public toRemove():void {
        super.toRemove();
    }

    public onResize(event):void {

        super.onResize(event);
    }

    public toCreateElements():void {

        console.log("SingleGameStep.toCreateElements()");
        // 程式碼寫在super之上
        super.toCreateElements();
    }


    public toUpdate():void {
        super.toUpdate();
    }




}
