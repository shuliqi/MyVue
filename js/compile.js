function Compile(vm) {
  this.vm = vm;
  this.el = vm.$el;
  this.fragment = null;
  this.init();
}
Compile.prototype = {
  init: function() {
    // 文档片段
    this.fragment = this.nodeFragment(this.el);
    
    // 解析DOM元素
    this.compileNode(this.fragment);
    
    // 解析完成添加到元素中去
    this.el.appendChild(this.fragment); 
  },
  // 获取当前 el 下面的所有元素 放到 文档片段 fragment 里面去
  nodeFragment: function(el) {
    // 创建一个空白的文档片段
    const fragment = document.createDocumentFragment();
    
    // 把页面 el 下面的所有 子节点都放到文档片段里面去
    // appendChild:Node.appendChild() 方法将一个节点附加到指定父节点的子节点列表的末尾处。
    // 如果将被插入的节点已经存在于当前文档的文档树中，那么 appendChild() 只会将它从原先的位置移动到新的位置
    //（不需要事先移除要移动的节点）。
    let child = el.firstChild;
    while(child) {
      fragment.appendChild(child);
      child = el.firstChild;
    }
    return fragment;
  },
  // 解析节点： 也就是替换 {{}}
  compileNode: function(fragment) {
    // Node.childNodes 返回包含指定节点的子节点的集合
    const childNodes = fragment.childNodes;
    [...childNodes].forEach(node => {
      if (this.isElementNode(node)) {
        //如果是元素节点
        this.compile(node);
      } else {
        // 文本元素的内容
        // textContent 属性表示一个节点及其后代的文本内容。
        const text = node.textContent;

        // 匹配插槽如： {{ name }}
        const reg = /\{\{(.*)\}\}/; 

        // test() 方法执行一个检索，用来查看正则表达式与指定的字符串是否匹配。返回 true 或 false。
        if(reg.test(text)) {
          // exec() 方法在一个指定字符串中执行一个搜索匹配。返回一个结果数组或 null
          const prop = reg.exec(text)[1].trim();
          this.compileText(node, prop);
        }
      }
      if (node.childNodes && node.childNodes.length) {
        this.compileNode(node);
      }
    });
  },
  compile: function(node) {
    // Element.attributes 属性返回该元素所有属性节点的一个实时集合。该集合是一个 NamedNodeMap 对象
    let nodeAttrs = node.attributes;
    [...nodeAttrs].forEach((attr) => {
      const name = attr.name;
      if (this.isDirective(name)) {
        if (name === "v-model") {
          const value = attr.value;
          this.compileModel(node, value)
        }
      }
    })
  },

  compileModel: function(node, prop) {
    const val = this.vm.$data[prop];
    // 更新 model 类型的 value 值
    this.updateModel(node, val);
    // 给 input 框添加 input事件

    // 添加订阅者
    new Watcher(this.vm, prop, (newValue) => {
      this.updateModel(node, newValue);
    })

    node.addEventListener('input', (e) => {
      const newValue = e.target.value;
      if (newValue === val) {
        return;
      }
      // 设置新值
      this.vm.$data[prop] = newValue;
    })
  },
  compileText: function(node, prop) {
    const val = this.vm.$data[prop];
    this.updateView(node, val);
    // 添加订阅者
    new Watcher(this.vm, prop, (newValue) => {
      this.updateView(node, newValue);
    })
  },

  updateView: function(node, value) {
    node.textContent = value == 'undefined' ? "" : value;
  },
  updateModel: function(node, value) {
    node.value = typeof value == 'undefined' ? "" : value;
  },

  // 是否是一个指令
  isDirective: function(attr) {
    return attr.indexOf('v-') !== -1;
  },
  isElementNode: function(node) {
    // nodeType 属性返回节点类型。
    // 如果节点是一个元素节点，nodeType 属性返回 1。
    // 如果节点是属性节点, nodeType 属性返回 2。
    // 如果节点是一个文本节点，nodeType 属性返回 3。
    // 如果节点是一个注释节点，nodeType 属性返回 8。

    // 元素节点：构成了DOM的基础。文档结构中，<html>是根元素，代表整个文档，其他的还有<head>,<body>,<p>,<span>等等。元素节点之间可以相互包含(当然遵循一定的规则)
    // 文本节点：包含在元素节点中。
    // 属性节点：元素都可以包含一些属性，属性的作用是对元素做出更具体的描述，比如id,name之类的。
     return node.nodeType === 1;
  }
}