// index.js ---> 入口函数
function MyVue(options) {
  this.$el = document.querySelector(options.el);
  this.$data = options.data;
  //数据代理
  Object.keys(this.$data).forEach(key => {
    this.proxyData(key);
  });
  this.init();
}
MyVue.prototype = {
  init: function() {
    new Observer(this.$data);
    new Compile(this);
  },
  proxyData: function(key) {
    // 代理第一层即可
    Object.defineProperty(this, key, {
      get: function () {
        return this.$data[key]
      },
      set: function (value) {
        this.$data[key] = value;
      }
    });
  }
}