/*
 * @Description: 异步任务池控制器
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 */
export class asyncTaskController {
  maxConcurrent: number;
  currentConcurrent: number;
  executing: Function[];
  allTasks: number;
  completedTasks: number;
  cb: Function | null = null;
  // 构造函数，接受最大并发数作为参数
  constructor(maxConcurrent: number, cb: Function) {
    // 初始化最大并发数
    this.maxConcurrent = maxConcurrent;
    // 初始化当前并发数
    this.currentConcurrent = 0;
    // 初始化任务队列
    this.executing = [];
    this.allTasks = 0;
    this.completedTasks = 0;
    this.cb = cb;
  }

  // 添加一个异步任务到队列中，接受一个返回promise的函数作为参数
  add(task: Function) {
    // 将任务函数加入队列
    this.executing.push(task);
    this.allTasks++;
    // 尝试执行下一个任务
    this.next();
  }
  // 执行下一个任务，如果当前并发数小于最大并发数，并且队列不为空，则从队列中取出一个任务并执行，否则什么都不做
  next() {
    if (this.currentConcurrent < this.maxConcurrent && this.executing.length > 0) {
      // 取出队列中的第一个任务函数，并从队列中移除它
      const task = this.executing.shift() as Function;
      // 增加当前并发数
      this.currentConcurrent++;
      // 执行任务函数，并处理其返回的promise对象
      task().finally(() => {
        // 不管成功还是失败，都要减少当前并发数，并执行下一个任务（递归调用）
        this.currentConcurrent--;
        this.completedTasks++;
        if (this.completedTasks === this.allTasks) {
          this.onLastTaskComplete();
        }
        this.next();
      });
    }
  }
  onLastTaskComplete() {
    this.cb?.();
    this.cb = null;
  }
}
