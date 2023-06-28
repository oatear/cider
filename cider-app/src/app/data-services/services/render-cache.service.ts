import { Injectable } from '@angular/core';
import { AsyncSubject, BehaviorSubject, Observable, withLatestFrom } from 'rxjs';

/**
 * RenderCacheService contains a hashmap of number, string values
 * that represent: hash, imageUrl
 */
@Injectable({
  providedIn: 'root'
})
export class RenderCacheService {
  renderCache: BehaviorSubject<Map<number, string | AsyncSubject<string>>>;

  constructor() {
    this.renderCache = new BehaviorSubject<Map<number, any>>(new Map());
  }

  public getRenderCache(): Observable<any> {
    return this.renderCache.asObservable();
  }

  public getOrSet(key: number, setter: () => Promise<string>): Observable<string> {
    const cachedValue: any = this.renderCache.getValue().get(key);
    if (typeof cachedValue === 'string') {
      console.log('read string', key);
      return new Observable((subscriber) => {
        subscriber.next(cachedValue);
        subscriber.complete();
      });
    }
    else if (cachedValue instanceof AsyncSubject) {
      console.log('read AsyncSubject', key)
      return cachedValue.asObservable();
    }
    else {
      console.log('write AsyncSubject', key);
      const imageSubject = new AsyncSubject<string>();
      this.renderCache.getValue().set(key, imageSubject);
      setter().then(base64 => {
        const url = this.setBase64(key, base64);
        imageSubject.next(url);
        imageSubject.complete();
      });
      return imageSubject.asObservable();
    }
  }

  public get(key: number) {
    return this.renderCache.getValue().get(key);
  }

  public has(key: number) {
    return this.renderCache.getValue().has(key);
  }

  private set(key: number, value: string) {
    var renderCache = this.renderCache.getValue();
    renderCache.set(key, value);
    this.renderCache.next(renderCache);
  }

  public setBase64(key: number, base64: string) {
    const file = this.base64ToFile(base64, '' + key);
    const url = URL.createObjectURL(file);
    this.set(key, url);
    return url;
  }

  public delete(key: number) {
    const renderCache = this.renderCache.getValue();
    const url = renderCache.get(key);
    if (url && typeof url === 'string') {
      URL.revokeObjectURL(url);
    }
    renderCache.delete(key);
    this.renderCache.next(renderCache);
  }

  public calculateHash(input: string) {
    let hash = 0;
    for (let i = 0, len = input.length; i < len; i++) {
        let chr = input.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

  private base64ToFile(base64: string, fileName: string) {
    let byteString;
    const mime = base64.split(',')[0].split(':')[1].split(';')[0];
    if (base64.split(',')[0].indexOf('base64') >= 0) {
      byteString = atob(base64.split(',')[1]);
    } else {
      byteString = unescape(base64.split(',')[1]);
    }
    var blobArray = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
      blobArray[i] = byteString.charCodeAt(i);
    }
    return new File([blobArray], fileName, {type: mime});
  }

}
