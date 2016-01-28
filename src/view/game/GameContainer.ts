/**
 * Created by susanph.huang on 2016/1/27.
 */


class GameContainer extends PIXI.Container {

    private raceTrack:PIXI.Sprite;
    private resource:any;

    constructor(resource:any) {

        super();
        this.resource = resource;

        this.toCreateGuide();
        this.toCreateElements();
    }

    private racingCon:PIXI.Container;
    private deviceRange:PIXI.Rectangle;

    private toCreateElements():void {


        this.deviceRange = new PIXI.Rectangle(0, 0, GameUtil.toGetAllDeviceMaxWidth(), GameUtil.toGetAllDeviceMinHeight());

        this.racingCon = new PIXI.Container();
        this.addChild(this.racingCon);

        this.raceTrack = new PIXI.Sprite(this.resource["test_track"].texture);

        this.raceTrack.anchor.x = 0.5;
        this.raceTrack.x = this.raceTrack.width * 0.5;
        this.raceTrack.anchor.y = 0.5;
        this.raceTrack.y = this.raceTrack.height * 0.5;
        this.racingCon.addChild(this.raceTrack);

        GameUtil.toFittingElementOnRate(this.racingCon, this.deviceRange);
        this.racingCon.x = (this.deviceRange.width - this.racingCon.width) * 0.5;
        this.racingCon.y = (this.deviceRange.height - this.racingCon.height) * 0.5;
    }



    /* Guide */
    private guideCon:PIXI.Container;
    private toCreateGuide():void {

        this.guideCon = new PIXI.Container();
        this.addChild(this.guideCon);

        GameUtil.toGetDeviceData().forEach((item, index)=> {
            var w:number = item[0];
            if (w > 0) {
                var tmpBg:PIXI.Graphics = new PIXI.Graphics();
                tmpBg.beginFill(0x330000, 1);
                tmpBg.drawRect(0, 0, w, GameUtil.toGetAllDeviceMinHeight());
                tmpBg.endFill();

                var bgTitle:PIXI.Text = new PIXI.Text("DEVICE" + (index), {
                    font: '20px Arial',
                    fill: 0xffffff,
                    align: 'center'
                });

                bgTitle.x = (tmpBg.width - bgTitle.width) * 0.5;
                bgTitle.y = tmpBg.height - bgTitle.height - 80;
                tmpBg.addChild(bgTitle);

                tmpBg.x = index == 0 ? 0 : GameUtil.toGetDeviceStartX(index);
                this.guideCon.addChild(tmpBg);
            }
        });
    }


}
