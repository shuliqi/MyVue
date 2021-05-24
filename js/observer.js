function Observer(data) {
  // 如果数据不存在，或者data 不是一个对象的话， 则不处理
  if (!data || typeof data !== "object") {
    return;
  }
  Object.keys(data).forEach((key) => {
    defineObserver(data, key, data[key]);
  })
}

function defineObserver(data, key, value) {
  // 监听子元素
  Observer(data[key]);
  const dep = new Dep();
  Object.defineProperty(data, key, {
    get: function() {
      // 把订阅者添加到容器里面，统一管理
      if (Dep.target) {
        dep.addSub(Dep.target)
      }
      return value;
    },
    set: function(newValue) {
      if (value !== newValue) {
        console.log("监听到变化了", newValue)
        value = newValue;
        // 通知收集的容器的 notify，notify 去更新每一个订阅者的 update 方法去更新视图
        dep.notify();
      }
    }
  })
}

// 管理每一个订阅者的容器:
// 该容器维护一个数组，用来收集订阅者。
// 该容器有一个 notify 方法 去触发订阅者的 update 去更新视图。
function Dep() {
  this.subs = [];
}
Dep.prototype = {
  addSub: function(sub) {
    this.subs.push(sub);
  },
  notify: function() {
    this.subs.forEach((sub) => {
      sub.update();
    })
  }
};
Dep.target = null;