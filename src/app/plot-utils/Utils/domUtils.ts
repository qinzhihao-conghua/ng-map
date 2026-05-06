/* eslint no-useless-escape: "off" */
/**
 * Created by FDD on 2017/5/1.
 * @desc DOM操作工具类
 */

const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
const MOZ_HACK_REGEXP = /^moz([A-Z])/;

export interface StyleObject {
  [key: string]: string | number;
}

/**
 * 创建DOM元素
 * @param tagName 标签名
 * @param className 类名
 * @param container 父容器
 * @param id 元素ID
 * @returns 创建的DOM元素
 */
export const create = function (tagName: string, className: string, container: HTMLElement, id: string): HTMLElement {
  const el = document.createElement(tagName);
  el.className = className || '';
  if (id) {
    el.id = id;
  }
  if (container) {
    container.appendChild(el);
  }
  return el;
};

/**
 * 获取DOM元素
 * @param id 元素ID或元素对象
 * @returns DOM元素
 */
export const getElement = function (id: string): HTMLElement | null {
  return typeof id === 'string' ? document.getElementById(id) : id;
};

/**
 * 移除DOM元素
 * @param el 要移除的元素
 */
export const remove = function (el: HTMLElement): void {
  const parent = el.parentNode;
  if (parent) {
    parent.removeChild(el);
  }
};

/**
 * 清空DOM元素的所有子元素
 * @param el 要清空的元素
 */
export const empty = function (el: HTMLElement): void {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
};

/**
 * 创建隐藏DOM元素
 * @param tagName 标签名
 * @param parent 父容器
 * @param id 元素ID
 * @returns 隐藏的DOM元素
 */
export const createHidden = function (tagName: string, parent: HTMLElement, id: string): HTMLElement {
  const element = document.createElement(tagName);
  element.style.display = 'none';
  if (id) {
    element.id = id;
  }
  if (parent) {
    parent.appendChild(element);
  }
  return element;
};

/**
 * 去除字符串两端空格
 * @param str 字符串
 * @returns 处理后的字符串
 */
const trim = function (str: string): string {
  return (str || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '');
};

/* istanbul ignore next */
/**
 * 将连线命名转换为驼峰命名
 * @param name 原始名称
 * @returns 驼峰命名
 */
const camelCase = function (name: string): string {
  return name.replace(SPECIAL_CHARS_REGEXP, function (_, _separator: string, letter: string, offset: number) {
    return offset ? letter.toUpperCase() : letter;
  }).replace(MOZ_HACK_REGEXP, 'Moz$1');
};

/**
 * 绑定事件监听器
 * @param element DOM元素
 * @param event 事件名
 * @param handler 事件处理函数
 */
export const on = (function () {
  if (document.addEventListener) {
    return function (element: HTMLElement | Element, event: string, handler: EventListenerOrEventListenerObject): void {
      if (element && event && handler) {
        element.addEventListener(event, handler, false);
      }
    };
  }
  return function (_element: HTMLElement | Element, _event: string, _handler: EventListenerOrEventListenerObject): void {
    // fallback
  };
})();

/**
 * 移除事件监听器
 * @param element DOM元素
 * @param event 事件名
 * @param handler 事件处理函数
 */
export const off = (function () {
  if (document.removeEventListener) {
    return function (element: HTMLElement | Element, event: string, handler: EventListenerOrEventListenerObject): void {
      if (element && event) {
        element.removeEventListener(event, handler, false);
      }
    };
  }
  return function (_element: HTMLElement | Element, _event: string, _handler: EventListenerOrEventListenerObject): void {
    // fallback
  };
})();

/**
 * 绑定只执行一次的事件监听器
 * @param el DOM元素
 * @param event 事件名
 * @param fn 事件处理函数
 */
export const once = function (el: HTMLElement, event: string, fn: (...args: unknown[]) => void): void {
  const listener = function (this: HTMLElement, ...args: unknown[]) {
    if (fn) {
      fn.apply(this, args);
    }
    off(el, event, listener);
  };
  on(el, event, listener);
};

/**
 * 判断元素是否包含指定类名
 * @param el DOM元素
 * @param cls 类名
 * @returns 是否包含
 */
export function hasClass(el: HTMLElement, cls: string): boolean {
  if (!el || !cls) return false;
  if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.');
  if (el.classList) {
    return el.classList.contains(cls);
  } else {
    return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1;
  }
}

/**
 * 为元素添加类名
 * @param el DOM元素
 * @param cls 类名
 */
export function addClass(el: HTMLElement, cls: string): void {
  if (!el) return;
  let curClass = el.className;
  const classes = (cls || '').split(' ');
  for (let i = 0, j = classes.length; i < j; i++) {
    const clsName = classes[i];
    if (!clsName) continue;
    if (el.classList) {
      el.classList.add(clsName);
    } else if (!hasClass(el, clsName)) {
      curClass += ' ' + clsName;
    }
  }
  if (!el.classList) {
    el.className = curClass;
  }
}

/**
 * 从元素移除类名
 * @param el DOM元素
 * @param cls 类名
 */
export function removeClass(el: HTMLElement, cls: string): void {
  if (!el || !cls) return;
  const classes = cls.split(' ');
  let curClass = ' ' + el.className + ' ';
  for (let i = 0, j = classes.length; i < j; i++) {
    const clsName = classes[i];
    if (!clsName) continue;
    if (el.classList) {
      el.classList.remove(clsName);
    } else if (hasClass(el, clsName)) {
      curClass = curClass.replace(' ' + clsName + ' ', ' ');
    }
  }
  if (!el.classList) {
    el.className = trim(curClass);
  }
}

/**
 * 获取元素的计算样式
 * @param element DOM元素
 * @param styleName 样式名
 * @returns 样式值
 */
export function getStyle(element: HTMLElement, styleName: string): string | null {
  if (!element || !styleName) return null;
  styleName = camelCase(styleName);
  if (styleName === 'float') {
    styleName = 'cssFloat';
  }
  try {
    const computed = document.defaultView!.getComputedStyle(element, '');
    return element.style[styleName as any] || computed ? computed[styleName as any] : null;
  } catch {
    return element.style[styleName as any];
  }
}

/**
 * 设置元素的样式
 * @param element DOM元素
 * @param styleName 样式名或样式对象
 * @param value 样式值
 */
export function setStyle(element: HTMLElement, styleName: any, value?: any): void {
  if (!element || !styleName) return;
  if (typeof styleName === 'object') {
    for (const prop in styleName) {
      if (styleName.hasOwnProperty(prop)) {
        setStyle(element, prop, styleName[prop]);
      }
    }
  } else {
    styleName = camelCase(styleName);
    if (styleName === 'opacity') {
      element.style.filter = isNaN(value) ? '' : 'alpha(opacity=' + value * 100 + ')';
    } else {
      (element.style as any)[styleName] = value;
    }
  }
}
