
// 老的数组的原型
const oldArrayProperty = Array.prototype;

// 创建一个新的空对象，但是会继承原数组的一些方法，因为当使用我们没有重写的方法的时候，能使用到
const arrayMethodObj = Object.create(oldArrayProperty);

// 要重写的数组
const arrayMethods =  ["push", "shift", "unshift", "pop","reverse", "sort", "splice"];
arrayMethods.forEach(method => {
  arrayMethodObj[method] = function(...arg) {
     // 执行老的数组的方法，得到结果
    const result = oldArrayProperty[method].apply(this, arg);
    // 进行监听： 1.找到增加的元素； 2.实现监听
    // 1.找到新增加的元素
    let inserted;
    switch(method) {
      case "push":
      case "unshift":
        inserted = arg;
        break
      case "splice":
         // vm.list.splice(3, 0,"哈哈哈", "怎么着") ---> arg = [3, 0, "哈哈哈", "怎么着"]
        inserted = arg.slice(2);
        break
      default:
        break;
    }
    if (inserted) {
      // 2.实现对新增加元素的监听：当然是新增的元素是数组的话才会去监听，observer函数有处理
      observerArray(inserted);
    }
    console.log(`数组有变化了，方法：${method}, 新增加的值为: ${inserted}`);
    // 剩下的就需要通知订阅者去更新视图了
    // ...
    return result;
  }
})



function Observer(data) {
  if (Array.isArray(data)) {
    data.__proto__ = arrayMethodObj;
    observerArray(data);
  } else {
    Object.keys(data).forEach((key) => {
      defineObserver(data, key, data[key]);
    })
  }
}
function observerArray(items) {
  for (let i = 0; i < items.length; i++) {
    observer(items[i]);
  }
}

function observer(value) {
  // 如果数据不存在，或者data 不是一个对象的话， 则不处理
  if (!value || typeof value !== "object") {
    return;
  }
  return new Observer(value);
}

function defineObserver(data, key, value) {
  // 监听子元素
  observer(value);
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
        console.log("监听对象属性到变化了，新的值为：", newValue)
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