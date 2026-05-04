/* eslint no-useless-escape: "off" */
const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g
const MOZ_HACK_REGEXP = /^moz([A-Z])/

/**
 * 创建一个dom节点
 * @param tagName dom标签名称
 * @param className class类名
 * @param container 挂载节点
 * @param id dom id
 */
export const create = function (tagName: string, className: string, container: HTMLElement, id: string) {
  let el = document.createElement(tagName)
  el.className = className || ''
  if (id) {
    el.id = id
  }
  if (container) {
    container.appendChild(el)
  }
  return el
}

/**
 * 根据id获取dom节点
 * @param id id
 */
export const getElement = function (id: string): HTMLElement {
  return typeof id === 'string' ? document.getElementById(id) : id;
}

/**
 * 移除节点
 * @param el dom节点 
 */
export const remove = function (el: HTMLElement) {
  let parent = el.parentNode
  if (parent) {
    parent.removeChild(el)
  }
}

/**
 * 循环移除第一个节点？
 * @param el dom节点 
 */
export const empty = function (el: HTMLElement) {
  while (el.firstChild) {
    el.removeChild(el.firstChild)
  }
}

/**
 * 创建一个隐藏的dom节点
 * @param tagName 节点标签名称
 * @param parent 父节点
 * @param id id
 */
export const createHidden = function (tagName: string, parent: HTMLElement, id: string) {
  let element = document.createElement(tagName)
  element.style.display = 'none'
  if (id) {
    element.id = id
  }
  if (parent) {
    parent.appendChild(element)
  }
  return element
}
/**
 * 字符串去空格
 * @param str 字符串
 */
const trim = function (str: string) {
  return (str || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '')
}

/* istanbul ignore next */
const camelCase = function (name: string) {
  return name.replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
    return offset ? letter.toUpperCase() : letter
  }).replace(MOZ_HACK_REGEXP, 'Moz$1')
}

/**
 * document事件监听
 */
export const on = (function () {
  if (document.addEventListener) {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.addEventListener(event, handler, false)
      }
    }
  }
})()

/**
 * document事件监听移除
 */
export const off = (function () {
  if (document.removeEventListener) {
    return function (element, event, handler) {
      if (element && event) {
        element.removeEventListener(event, handler, false)
      }
    }
  }
})()

/**
 * document事件监听一次
 * @param el dom节点
 * @param event 事件
 * @param fn 回调函数
 */
export const once = function (el: HTMLElement, event, fn: () => {}) {
  const listener = function () {
    if (fn) {
      fn.apply(this, arguments)
    }
    off(el, event, listener)
  }
  on(el, event, listener)
}

/**
 * 是否有想过类名
 * @param el dom节点
 * @param cls 要查找的类名
 */
export function hasClass(el: HTMLElement, cls: string) {
  if (!el || !cls) return false
  if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.')
  if (el.classList) {
    return el.classList.contains(cls)
  } else {
    return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1
  }
}

/**
 * dom添加类名
 * @param el dom节点 
 * @param cls 类名
 */
export function addClass(el: HTMLElement, cls: string) {
  if (!el) return
  let curClass = el.className
  let classes = (cls || '').split(' ')
  for (let i = 0, j = classes.length; i < j; i++) {
    let clsName = classes[i]
    if (!clsName) continue
    if (el.classList) {
      el.classList.add(clsName)
    } else if (!hasClass(el, clsName)) {
      curClass += ' ' + clsName
    }
  }
  if (!el.classList) {
    el.className = curClass
  }
}

/**
 * 移除类名
 * @param el dom节点
 * @param cls 类名
 */
export function removeClass(el: HTMLElement, cls: string) {
  if (!el || !cls) return
  const classes = cls.split(' ')
  let curClass = ' ' + el.className + ' '
  for (let i = 0, j = classes.length; i < j; i++) {
    let clsName = classes[i]
    if (!clsName) continue
    if (el.classList) {
      el.classList.remove(clsName)
    } else if (hasClass(el, clsName)) {
      curClass = curClass.replace(' ' + clsName + ' ', ' ')
    }
  }
  if (!el.classList) {
    el.className = trim(curClass)
  }
}

/**
 * 获取dom节点指定样式的值
 * @param element dom节点
 * @param styleName 样式名称
 */
export function getStyle(element: HTMLElement, styleName: string) {
  if (!element || !styleName) return null
  styleName = camelCase(styleName)
  if (styleName === 'float') {
    styleName = 'cssFloat'
  }
  try {
    const computed = document.defaultView.getComputedStyle(element, '')
    return element.style[styleName] || computed ? computed[styleName] : null
  } catch (e) {
    return element.style[styleName]
  }
}

/**
 * 设置指定样式
 * @param element dom节点
 * @param styleName 样式属性对象或者具体值
 * @param value 样式值
 */
export function setStyle(element: HTMLElement, styleName: any, value: any) {
  if (!element || !styleName) return
  if (typeof styleName === 'object') {
    for (var prop in styleName) {
      if (styleName.hasOwnProperty(prop)) {
        setStyle(element, prop, styleName[prop])
      }
    }
  } else {
    styleName = camelCase(styleName)
    if (styleName === 'opacity') {
      element.style.filter = isNaN(value) ? '' : 'alpha(opacity=' + value * 100 + ')'
    } else {
      element.style[styleName] = value
    }
  }
}
