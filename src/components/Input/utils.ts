/*
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-28 20:45:13
 */
import { getImageInfo } from '@/utils/common';
import { MESSAGE_TYPE_IMAGE, MESSAGE_TYPE_TEXT } from '@/utils/constant';
import { Delta } from '@vueup/vue-quill';
interface Item {
  messageType: number;
  content: string;
  extra?: Object;
}
interface AnalysisResp {
  items: Item[];
  mentions: any[];
  quoteId: String | undefined;
}
function removeLeadingNewlines(str: string) {
  return str.replace(/^[\n\s]+/, '');
}
function removeTrailingNewlines(str: string) {
  return str.replace(/[\n\s]+$/, '');
}
export async function deltaToMessage(delta: Delta): Promise<AnalysisResp> {
  const resp: AnalysisResp = {
    items: [],
    mentions: [],
    quoteId: undefined
  };
  for (const iterator of delta.ops) {
    const insert: any = iterator.insert;
    let node: any = null;
    console.log('insert', insert);
    if (resp.items.length) {
      node = resp.items[resp.items.length - 1];
    }
    if (typeof insert === 'string') {
      if (!insert || insert == '\n') continue;
      if (node && node.messageType == MESSAGE_TYPE_TEXT) {
        node.content = node.content + insert;
        continue;
      }
      resp.items.push({
        messageType: MESSAGE_TYPE_TEXT,
        content: insert
      });
      continue;
    }
    // @好友
    // TODO 不能@自己
    if (insert && insert.mention) {
      const mention = insert.mention;
      resp.mentions.push(mention.userId);
      if (node && node.messageType == MESSAGE_TYPE_TEXT) {
        node.content = node.content + ` ${mention.denotationChar}${mention.value}`;
        continue;
      }
      resp.items.push({
        messageType: MESSAGE_TYPE_TEXT,
        content: `${mention.denotationChar}${mention.value}`
      });
      continue;
    }
    // 图片
    if (insert && insert.image) {
      const imageInfo = await getImageInfo(insert.image);
      resp.items.push({
        messageType: MESSAGE_TYPE_IMAGE,
        content: insert.image,
        extra: imageInfo
      });
      continue;
    }
    // 表情
    if (insert && insert.emoji) {
      const { emoji } = insert;
      if (node && node.messageType == MESSAGE_TYPE_TEXT) {
        node.content = node.content + emoji.alt;
        continue;
      }
      resp.items.push({
        messageType: MESSAGE_TYPE_TEXT,
        content: emoji.alt
      });
      continue;
    }
    if (insert && insert.quote) {
      resp.quoteId = insert.quote.id;
      continue;
    }
  }
  // 去除前后多余空格
  if (resp.items.length) {
    if (resp.items[0].messageType == MESSAGE_TYPE_TEXT) {
      resp.items[0].content = removeLeadingNewlines(resp.items[0].content);
    }
    if (resp.items[resp.items.length - 1].messageType == MESSAGE_TYPE_TEXT) {
      resp.items[resp.items.length - 1].content = removeTrailingNewlines(resp.items[resp.items.length - 1].content);
    }
  }
  return resp;
}
export function deltaToString(delta: Delta): string {
  let content = '';

  for (const o of delta.ops) {
    const insert: any = o.insert;
    if (typeof insert === 'string') {
      if (!insert || insert == '\n') continue;
      content += insert;
      continue;
    }
    // @好友
    if (insert && insert.mention) {
      const { mention } = insert;
      content += ` ${mention.denotationChar}${mention.value} `;
      continue;
    }
    // 图片
    if (insert && insert.image) {
      content += '[图片]';
      continue;
    }
    // 表情
    if (insert && insert.emoji) {
      content += insert.emoji.alt;
      continue;
    }
  }
  return content;
}
export function isEmptyDelta(delta: Delta): boolean {
  return delta.ops.length == 1 && delta.ops[0].insert == '\n';
}
