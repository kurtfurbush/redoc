import { debounce, bind } from 'decko';
import { EventEmitter } from 'eventemitter3';

import { querySelector, isBrowser } from '../utils';

const EVENT = 'scroll';

export class ScrollService {
  private _scrollParent: Window | HTMLElement | undefined;
  private _emiter: EventEmitter;
  private _prevOffsetY: number = 0;
  constructor() {
    this._scrollParent = isBrowser ? window : undefined;
    this._emiter = new EventEmitter();
    this.bind();
  }

  bind() {
    this._prevOffsetY = this.scrollY();
    this._scrollParent && this._scrollParent.addEventListener('scroll', this.handleScroll);
  }

  dispose() {
    this._scrollParent && this._scrollParent.removeEventListener('scroll', this.handleScroll);
    this._emiter.removeAllListeners(EVENT);
  }

  scrollY(): number {
    if (typeof HTMLElement !== 'undefined' && this._scrollParent instanceof HTMLElement) {
      return this._scrollParent.scrollTop;
    } else if (this._scrollParent !== undefined) {
      return (this._scrollParent as Window).pageYOffset;
    } else {
      return 0;
    }
  }

  isElementBellow(el: Element | null) {
    if (el === null) return;
    return el.getBoundingClientRect().top > 0;
  }

  isElementAbove(el: Element | null) {
    if (el === null) return;
    return Math.trunc(el.getBoundingClientRect().top) <= 0;
  }

  subscribe(cb): () => void {
    const emmiter = this._emiter.addListener(EVENT, cb);
    return () => emmiter.removeListener(EVENT, cb);
  }

  scrollIntoView(element: Element | null) {
    if (element === null) {
      return;
    }
    element.scrollIntoView();
  }

  scrollIntoViewBySelector(selector: string) {
    const element = querySelector(selector);
    this.scrollIntoView(element);
  }

  @bind
  @debounce(100)
  handleScroll() {
    const scrollY = this.scrollY();
    const isScrolledDown = scrollY - this._prevOffsetY > 0;
    this._prevOffsetY = this.scrollY();
    this._emiter.emit(EVENT, isScrolledDown);
  }
}
