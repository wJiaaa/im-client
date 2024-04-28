import MenuContext from './index.vue';
import { h, render } from 'vue';
export interface MenusOption {
  label: string;
  icon: string;
  menuAction: () => void;
  hidden?: boolean;
}
// 维护一个菜单实例
let curInstance: any = null;
let seed = 1;

const createContextMenu = (e: MouseEvent, menuData: MenusOption[]) => {
  if (curInstance) {
    curInstance.destroy();
  }
  let id = seed++;
  // 创建一个临时的div，用于挂载我们的菜单
  const container: HTMLElement = document.createElement('div');
  // 获取body标签，用于挂载整个菜单
  const appendTo = document.body;
  // 传给menu组件的props
  const props = {
    menuData,
    onClose: () => {
      if (curInstance) {
        curInstance.destroy();
      }
    }
  };
  // 渲染虚拟节点
  const vnode: any = h(MenuContext, props);

  // vnode为需要渲染的虚拟节点，container为渲染的容器
  render(vnode, container);
  // 首先需要先把菜单真正渲染到页面，才能拿到它的宽度和高度
  appendTo.appendChild(container.firstElementChild as HTMLElement);
  // 当前真正的菜单节点，上面输出的vnode中可以看到，el就是我们的菜单节点
  const curMenu: HTMLElement = vnode.el;
  // 获取curMenu的高度和宽度，用于临界的计算
  const { offsetWidth, offsetHeight } = curMenu;
  // 获取body的可视区域的宽度
  const { clientWidth } = appendTo;
  // 取出右键点击时的坐标，clientX是距离左侧的位置，clientY是距离顶部的位置
  const { clientX, clientY } = e;
  curMenu.style.opacity = `1`;
  // 当前可视区域的宽度 - 当前鼠标距离浏览器左边的距离
  // 如果 大于菜单的宽度，说明正常设置菜单距离左边界的距离,即设置style.left
  // 否则菜单需要在鼠标左侧展示，即需要设置style.right组件距离可视区域右侧的距离
  const leftOrRight = clientWidth - clientX > offsetWidth ? 'left' : 'right';
  // 当前浏览器的高度(不包含滚动条) - 当前鼠标距离浏览器上边的距离
  // 如果 大于菜单的高度，说明可以正常设置菜单距离上边界的距离,即设置style.top
  // 否则需要设置菜单距离底部边界的位置，即style.bottom
  const topOrBottom = window.innerHeight - clientY > offsetHeight ? 'top' : 'bottom';
  const offsetLeft = Math.abs(clientWidth - clientX);
  //  设置left或者right的style
  curMenu.style[leftOrRight] = leftOrRight === 'left' ? `${clientX + 10}px` : `${offsetLeft}px`;
  // 设置top或者bottom的style
  curMenu.style[topOrBottom] = topOrBottom === 'bottom' ? '2px' : `${clientY}px`;
  curMenu.style.opacity = '1'; // 添加 show 类，触发过渡效果
  const instance = {
    id,
    destroy: () => {
      curMenu.style.opacity = '0';
      curInstance = null;
      curMenu.addEventListener('transitionend', handleTransitionEnd); // 监听过渡结束事件 为了给菜单显示/隐藏增加动画
      function handleTransitionEnd() {
        curMenu.removeEventListener('transitionend', handleTransitionEnd); // 移除过渡结束事件监听
        render(null, container);
      }
    }
  };
  curInstance = instance;
  return instance;
};

export default createContextMenu;
