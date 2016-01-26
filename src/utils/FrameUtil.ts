/**
 * Created by SusanHuang on 2016/1/6.
 */


module FrameUtil {

    export function toNextFrame(target:PIXI.extras.MovieClip):void {
        target.gotoAndStop(target.currentFrame + 1);
    }

    export function toPrevFrame(target:PIXI.extras.MovieClip):void {
        target.gotoAndStop(target.currentFrame - 1);
    }

    export function toLoop(target:PIXI.extras.MovieClip):void {
        target.loop = true;
        target.play();
    }

    export function toPlayTo(target:PIXI.extras.MovieClip, targetFrame:number):void {

        FrameUtil.toNextFrame(target);
        if (target.currentFrame != targetFrame) {

            if (targetFrame == target.totalFrames) {
                targetFrame = target.totalFrames - 1;
            }
            var timer:any = requestAnimationFrame(() => FrameUtil.toPlayTo(target, targetFrame));
        } else {
            window.cancelAnimationFrame(timer);
            target.emit("ANIMATION_COMPLETE");
        }
    }

    export function toReverseTo(target:PIXI.extras.MovieClip, targetFrame:number):void {

        FrameUtil.toPrevFrame(target);
        if (target.currentFrame != targetFrame) {
            var timer:any = requestAnimationFrame(() => FrameUtil.toReverseTo(target, targetFrame));
        } else {
            window.cancelAnimationFrame(timer);
            target.emit("ANIMATION_COMPLETE");
        }
    }
}
