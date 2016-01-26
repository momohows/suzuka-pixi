/**
 * Created by susanph.huang on 2015/12/29.
 */

/// <reference path="../abstract/AbstractView.ts"/>
/// <reference path="../abstract/AbstractStepView.ts"/>
/// <reference path="../utils/CreateUtil.ts"/>
/// <reference path="result/AwardStep.ts"/>
/// <reference path="../service/SocketConnector.ts"/>

class ResultView extends AbstractView {

    constructor(name:string, resources:Object, stepid:number) {

        super(name, resources, stepid);
    }

    public toRemove():void {
        super.toRemove();
    }

    public onResize(event):void {

        super.onResize(event);
    }

    public toCreateElements():void {

        super.toCreateElements();
    }


    public toUpdate():void {
        super.toUpdate();
    }


    /**
     * Step
     * */
    private stepData:Array<Object> = [
        {name: "awardStep", className: AwardStep}
    ];

    public toCreateStepView(id:number):void {

        if (this.stepView) {
            this.stepView.toTransitionOut(id);
            return;
        }

        this.stepId = id;
        var StepClass:any = this.stepData[id]["className"];
        this.stepView = new StepClass(this.stepData[id]["name"], this.resources);
        this.stepView.once(ViewEvent.TRANSITION_IN_COMPLETE, this.onStepViewStatus.bind(this));
        this.stepView.once(ViewEvent.TRANSITION_OUT_COMPLETE, this.onStepViewStatus.bind(this));
        this.addChild(this.stepView);
    }

    private onStepViewStatus(event:any):void {

        if (event.type == ViewEvent.TRANSITION_IN_COMPLETE) {

        }

        if (event.type == ViewEvent.TRANSITION_OUT_COMPLETE) {

            this.removeChild(this.stepView);
            this.stepView.destroy();
            this.stepView = null;

            if (event.pid == -1) {

                this.toCreateStepView(event.stepid);

            } else {

                this.toTransitionOut(event.pid, event.stepid);
            }
        }
    }

}
