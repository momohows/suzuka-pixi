/**
 * Created by susanph.huang on 2015/12/3.
 */


module SocketEvent {

    /* Websocket事件 */
    export const ON_CONNECT_SUCCESS:string = "onConnectSuccess";
    export const ON_CONNECT_ERROR:string = "onConnectError";
    export const ON_CLOSE:string = "onClose";
    export const ON_MESSAGE:string = "onMessage";

    /* 遊戲串接Websocket事件 */
    export const JOIN_CHANNEL:string = "joinChannel";
    export const JOIN_CHANNEL_SUCCESS:string = "joinChannelSuccess";
    export const LOCK_CHANNEL:string = "lockChannel";
    export const LOCK_CHANNEL_SUCCESS:string = "lockChannelSuccess";
    export const GET_CHANNEL_STATUS:string = "getChannelStatus";
    export const UPDATE_CHANNEL_STATUS:string = "updateChannelStatus";


    /* 遊戲玩家溝通事件 */
    export const MEMBER_TO_LEADER:string = "memberToLeader";
    export const UPDATE_GAME:string = "updateGame"; // =  LEADER_TO_MEMBERS

    export const SAVE_DEVICE_DATA:string = "saveDeviceData";
    export const LEADER_TO_MEMBERS:string = "leaderToMembers";


}