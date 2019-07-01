import { Injectable } from '@angular/core';
import * as schedule from 'node-schedule';

@Injectable()
export class CacheService {
  private cache: {
    [prop: string]: {
      [prop: string]: {
        updateTime?: Date;
        maxAge?: number;
        schedule?: schedule.Job;
        value: any;
      };
    };
  } = {};
  constructor() {}

  get(comName: string, key: string, isClone = true) {
    const allCache = this.cache;
    if (allCache[comName] && allCache[comName][key]) {
      const cache = allCache[comName][key];
      return isClone ? JSON.parse(JSON.stringify(cache.value)) : cache.value;
    } else {
      return null;
    }
  }

  update(
    comName: string,
    key: string,
    newVal: any,
    maxAge?: number,
    afterMaxAge?: (c: string, k: string) => void,
  ) {
    const allCache = this.cache;
    this.cancelSchedule(comName, key);
    const parentCache = (allCache[comName] = allCache[comName] || {});
    parentCache[key] = { value: newVal };
    if (maxAge) {
      const cache = parentCache[key];
      cache.updateTime = new Date();
      cache.maxAge = maxAge;
      const thatTime = new Date(Date.now() + maxAge);
      const d = schedule.scheduleJob(thatTime, () => {
        delete allCache[comName][key];
        if (typeof afterMaxAge === 'function') {
          afterMaxAge(comName, key);
        }
      });
      cache.schedule = d;
    }
  }

  cancelSchedule(comName: string, key: string) {
    const allCache = this.cache;
    if (allCache[comName] && allCache[comName][key]) {
      const cache = allCache[comName][key];
      if (cache.schedule) {
        cache.schedule.cancel();
        cache.schedule = null;
      }
    }
  }
  clear(comName: string) {
    delete this.cache[comName];
  }
}
