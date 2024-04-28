/*
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 */
import mitt from 'mitt';
import type { Emitter } from 'mitt';

type Events = {
  focusMsgInput?: void;
  updateGroupAnnouncement?: void;
  handleSessionScroll?: { sessionId: number };
  mentionUser?: void;
  onSubscribeQuote?: any;
  receiveMessage?: void;
  receiveReadMessage?: void;
  receiveRevokeMessage?: void;
  receiveDeleteMessage?: void;
  receiveTopMessage?: void;
  resize?: void;
  addEmote?: { width: number; height: number; src: string };
  updateGroupMember?: void;
};
const eventEmitter: Emitter<Events> = mitt<Events>();
export default eventEmitter;
