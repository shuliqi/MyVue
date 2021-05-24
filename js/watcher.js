// 订阅者
function Watcher(vm, prop, callback) {
  this.vm = vm;
  this.prop = prop;
  this.callback = callback;
  this.value = this.get();
}
Watcher.prototype = {
  update: function() {
    const value = this.vm.$data[this.prop];
    const oldValue = this.value;
    if (value !== oldValue) {
      this.callback(value);
    }
  },
  get: function() {
    Dep.target = this;
    // 这一步很关键：因为属性被监听，这一步会执行监听器的 get 方法
    const value = this.vm.$data[this.prop];
    Dep.target = null; // 清空订阅器，因为上一步订阅器已经被加上了
    return value;
  }
}