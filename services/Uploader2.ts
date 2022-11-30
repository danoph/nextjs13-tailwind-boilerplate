export class Uploader {
  chunkSize: number;
  threadsQuantity: number;
  file: File | null;
  aborted: boolean;
  uploadedSize: number;
  progressCache: any;
  activeConnections: any;
  chunksQueue: any[];
  fileId: string | undefined;

  constructor() {
    this.chunkSize = 1024 * 1024;
    this.threadsQuantity = 2;

    this.file = null;
    this.aborted = false;
    this.uploadedSize = 0;
    this.progressCache = {};
    this.activeConnections = {};
    this.chunksQueue = [];
  }

  setOptions(options = {}) {
    this.chunkSize = options.chunkSize;
    this.threadsQuantity = options.threadsQuantity;
  }

  setupFile(file) {
    if (!file) {
      return;
    }

    this.file = file;
  }

  start() {
    if (!this.file) {
      throw new Error("Can't start uploading: file have not chosen");
    }

    const chunksQuantity = Math.ceil(this.file.size / this.chunkSize);
    this.chunksQueue = new Array(chunksQuantity).fill().map((_, index) => index).reverse();

    const xhr = new XMLHttpRequest();

    xhr.open("post", "/upload/init");

    xhr.setRequestHeader("X-Content-Length", `${this.file.size}`);
    xhr.setRequestHeader("X-Content-Name", this.file.name);
    xhr.setRequestHeader("X-Chunks-Quantity", `${chunksQuantity}`);

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);

        if (!response.fileId || response.status !== 200) {
          this.complete(new Error("Can't create file id"));
          return;
        }

        this.fileId = response.fileId;
        this.sendNext();
      }
    };

    xhr.onerror = (error) => {
      this.complete(error);
    };

    xhr.send();
  }

  sendNext = function() {
    const activeConnections = Object.keys(this.activeConnections).length;

    if (activeConnections >= this.threadsQuantity) {
      return;
    }

    if (!this.chunksQueue.length) {
      if (!activeConnections) {
        this.complete(null);
      }

      return;
    }

    const chunkId = this.chunksQueue.pop();
    const sentSize = chunkId * this.chunkSize;
    const chunk = this.file.slice(sentSize, sentSize + this.chunkSize);

    this.sendChunk(chunk, chunkId)
    .then(() => {
      this.sendNext();
    })
    .catch((error) => {
      this.chunksQueue.push(chunkId);

      this.complete(error);
    });

    this.sendNext();
  }

  complete(error) {
    if (error && !this.aborted) {
      this.end(error);
      return;
    }

    setTimeout(() => init());

    this.end(error);
  }

  sendChunk(chunk, id) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await this.upload(chunk, id);
        const {status, size} = JSON.parse(response);

        if (status !== 200 || size !== chunk.size) {
          reject(new Error("Failed chunk upload"));
          return;
        }
      } catch (error) {
        reject(error);
        return;
      }

      resolve();
    })
  }

  handleProgress(chunkId, event) {
    if (event.type === "progress" || event.type === "error" || event.type === "abort") {
      this.progressCache[chunkId] = event.loaded;
    }

    if (event.type === "loadend") {
      this.uploadedSize += this.progressCache[chunkId] || 0;
      delete this.progressCache[chunkId];
    }

    const inProgress = Object.keys(this.progressCache).reduce((memo, id) => memo += this.progressCache[id], 0);

    const sendedLength = Math.min(this.uploadedSize + inProgress, this.file.size);

    this.onProgress({
      loaded: sendedLength,
      total: this.file.size
    })
  }

  upload = function(file, id) {
    return new Promise((resolve, reject) => {
      const xhr = this.activeConnections[id] = new XMLHttpRequest();
      const progressListener = this.handleProgress.bind(this, id);

      xhr.upload.addEventListener("progress", progressListener);

      xhr.addEventListener("error", progressListener);
      xhr.addEventListener("abort", progressListener);
      xhr.addEventListener("loadend", progressListener);

      xhr.open("post", "/upload");

      xhr.setRequestHeader("Content-Type", "application/octet-stream");
      xhr.setRequestHeader("Content-Length", file.size);
      xhr.setRequestHeader("X-Content-Id", `${this.fileId}`);
      xhr.setRequestHeader("X-Chunk-Id", id);

      xhr.onreadystatechange = (event) => {
        if (xhr.readyState === 4 && xhr.status === 200) {
          resolve(xhr.responseText);
          delete this.activeConnections[id];
        }
      };

      xhr.onerror = (error) => {
        reject(error);
        delete this.activeConnections[id];
      };

      xhr.onabort = () => {
        reject(new Error("Upload canceled by user"));
        delete this.activeConnections[id];
      };

      xhr.send(file);
    })
  }

  on(method, callback) {
    if (typeof callback !== "function") {
      callback = () => {};
    }

    this[method] = callback;
  }

  abort() {
    Object.keys(this.activeConnections).forEach((id) => {
      this.activeConnections[id].abort();
    });

    this.aborted = true;
  }

  //const multithreadedUploader = new Uploader();

  //options(options) {
    //multithreadedUploader.setOptions(options);
    //return this;
  //}

  //send(file) {
    //multithreadedUploader.setupFile(file);
    //return this;
  //}

  //continue() {
    //multithreadedUploader.sendNext();
  //}

  //onProgress(callback) {
    //multithreadedUploader.on("onProgress", callback);
    //return this;
  //}

  //end(callback) {
    //multithreadedUploader.on("end", callback);
    //multithreadedUploader.start();

    //return this;
  //}

  //abort() {
    //multithreadedUploader.abort();
  //}
};
