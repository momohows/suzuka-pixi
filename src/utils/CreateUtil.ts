/**
 * Created by susanph.huang on 2015/12/31.
 */


module CreateUtil {

    export function toCreateCustomBtn(txt:string):PIXI.Graphics {

        var shape:PIXI.Graphics = new PIXI.Graphics();
        var text:PIXI.Text = new PIXI.Text(txt, {font: '20px Arial', fill: 0xffffff, align: 'center'});
        text.x = 15;
        text.y = 10;

        shape.beginFill(0x6c6c6c, 1);
        shape.drawRect(0, 0, text.width + 30, text.height + 20);
        shape.endFill();
        shape.addChild(text);

        return shape;
    }

    export function toGetSpSheetTexture(name:string, textures:Object):PIXI.Texture {

        var texture:PIXI.Texture;
        for (var key in textures) {
            if (key === name) {
                texture = PIXI.Texture.fromFrame(key);
            }
        }

        return texture;
    }

    export function toCreateMovieClip(textures:Object):PIXI.extras.MovieClip {

        var textureArr:Array<PIXI.Texture> = [];
        for (var key in textures) {
            var texture:PIXI.Texture = PIXI.Texture.fromFrame(key);
            textureArr.push(texture);
        }
        var mc:PIXI.extras.MovieClip = new PIXI.extras.MovieClip(textureArr);

        return mc;
    }


    export function toActivateItem(target:any, callback:any):void {

        target.buttonMode = true;
        target.interactive = true;
        target.on('mousedown', callback)
            .on('touchstart', callback);
    }



    export function toAlignItem(item:any, horizontal:string = "LEFT", vertical:string = "TOP"):void {

        if (horizontal == "LEFT") {

            item.x = 0;

        } else if (horizontal == "CENTER") {

            item.x = (Config.stageWidth - item.width) * 0.5;

        } else if (horizontal == "RIGHT") {

            item.x = (Config.stageWidth - item.width);
        }


        if (vertical == "TOP") {

            item.y = 0;

        } else if (vertical == "CENTER") {

            item.y = (Config.stageHeight - item.height) * 0.5;

        } else if (vertical == "BOTTOM") {

            item.y = (Config.stageHeight - item.height);
        }

    }

}