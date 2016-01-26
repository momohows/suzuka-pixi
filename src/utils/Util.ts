/**
 * Created by susanph.huang on 2016/1/5.
 */


module Util {

    export function toGetParam(key:string, casesensitive:boolean = false):string {

        var name = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var url = window.location.href;
        if (!casesensitive) name = name.toLowerCase();
        if (!casesensitive) url = url.toLowerCase();

        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(url);
        if (results == null) {

            return "";

        } else {

            return results[1];
        }
    }
}