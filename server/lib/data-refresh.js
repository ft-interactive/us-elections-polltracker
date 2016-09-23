import { EventEmitter } from 'events';
import { CronJob } from 'cron';

export default class DataRefresher extends EventEmitter {
  data = null;

  // Cache the last successful request.
  // If a request throws an exception this.data should
  // be the result of the last successful job or the fallbackData (if specified).
  pendingRequest = null;

  constructor(schedule, delegate, { fallbackData, start = true, logErrors = true } = {}) {
    super();
    this.schedule = schedule;
    this.delegate = delegate;
    this.fallbackData = fallbackData;
    this.job = new CronJob(this.schedule, () => {
      this.emit('tick');
      this.createRequest();
    }, null, start, 'Etc/UTC', null, start);

    if (logErrors) {
      this.on('error', err => {
        if (err instanceof Error) {
          console.error(err.message, err.code);
        } else {
          console.error(err);
        }
      });
    }

    if (start) {
      process.nextTick(() => {
        this.emit('start');
      });
    }
  }

  stop() {
    this.job.stop();
    this.emit('stop');
  }

  start() {
    this.job.start();
    this.emit('start');
  }

  promise() {
    if (this.data) {
      return this.data;
    }

    if (this.lastPendingPromise) {
      return this.lastPendingPromise;
    }

    if (!this.pendingRequest) {
      this.createRequest();
    }

    this.pendingRequest = new Promise((resolve, reject) => {
      this.once('error', reason => {
        console.log('on error');
        this.lastPendingPromise = null;
        if (!this.data) {
          reject(reason);
        } else {
          resolve(this.data);
        }
      });

      this.once('result', data => {
        console.log('on result');
        this.lastPendingPromise = null;
        resolve(data);
      });
    });

    return this.pendingRequest;
  }

  createRequest() {
    // Only one job can run at a time
    if (this.pendingRequest) return;

    this.pendingRequest = this.delegate().then(data => {
      this.data = Promise.resolve(data);
      this.pendingRequest = null;
      process.nextTick(() => {
        this.emit('result', this.data);
      });
    }).catch(err => {
      if (!this.data && typeof this.fallbackData !== 'undefined') {
        this.data = Promise.resolve(this.fallbackData);
      }
      this.pendingRequest = null;
      process.nextTick(() => {
        this.emit('error', err);
      });
    });
  }
}
