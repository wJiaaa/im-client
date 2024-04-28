/*
 * @Description: 引用消息格式
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 */
import Quill from 'quill';

const BlockEmbed = Quill.import('blots/block/embed');

class QuoteBlot extends BlockEmbed {
  static blotName = 'quote';
  static tagName = 'div';
  static className = 'quote-card';

  static create(value: any): any {
    const node = super.create(value);

    const { id, title, describe } = value;

    node.dataset.id = id;
    node.dataset.title = title;
    node.dataset.describe = describe;

    node.setAttribute('contenteditable', 'false');

    const quoteCardContent = document.createElement('span');
    quoteCardContent.classList.add('quote-card-content');

    const close = document.createElement('span');
    close.classList.add('quote-card-remove');
    close.textContent = '×';
    close.addEventListener('click', () => {
      node.remove();
    });

    const quoteCardTitle = document.createElement('span');
    quoteCardTitle.classList.add('quote-card-title');
    quoteCardTitle.textContent = title;
    quoteCardTitle.appendChild(close);
    quoteCardContent.appendChild(quoteCardTitle);
    const quoteCardMeta = document.createElement('span');
    quoteCardMeta.classList.add('quote-card-meta');
    quoteCardMeta.textContent = describe;
    quoteCardContent.appendChild(quoteCardMeta);
    node.ondblclick = () => {
      console.log('quote card ondblclick');
    };
    node.appendChild(quoteCardContent);
    return node;
  }

  static value(node: HTMLElement): any {
    return {
      id: node.dataset.id,
      title: node.dataset.title,
      describe: node.dataset.describe
    };
  }
}

export default QuoteBlot;
