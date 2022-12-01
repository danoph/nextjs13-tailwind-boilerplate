import axios from "axios"

const API_BASE_URL = "/api/";

// initializing axios
const api = axios.create({
  baseURL: API_BASE_URL,
});

interface Part {
  ETag: string
  PartNumber: number
}

const FILE_CHUNK_SIZE = 10_000_000

// original source: https://github.com/pilovm/multithreaded-uploader/blob/master/frontend/uploader.js
export class Uploader {
  constructor(options) {
    // this must be bigger than or equal to 5MB,
    // otherwise AWS will respond with:
    // "Your proposed upload is smaller than the minimum allowed size"
    this.chunkSize = options.chunkSize || 1024 * 1024 * 5
    // number of parallel uploads
    this.threadsQuantity = Math.min(options.threadsQuantity || 5, 15)
    this.file = options.file
    this.fileName = options.fileName
    this.aborted = false
    this.uploadedSize = 0
    this.progressCache = {}
    this.activeConnections = {}
    this.parts = []
    this.uploadedParts = []
    this.fileId = null
    this.fileKey = null
    this.onProgressFn = (progress) => {
      console.log('progress', progress);
    }
    this.onErrorFn = (err) => {
      console.log('err', err);
    }
  }

  // starting the multipart upload request
  start() {
    this.initialize()
  }

  async initialize() {
    console.log('starting upload');
    try {
      // adding the the file extension (if present) to fileName
      let fileName = this.fileName
      const ext = this.file.name.split(".").pop()
      if (ext) {
        fileName += `.${ext}`
      }

      // initializing the multipart request
      const videoInitializationUploadInput = {
        filename: fileName,
      }
      const initializeReponse = await api.request({
        url: "/multipart_upload",
        method: "POST",
        data: videoInitializationUploadInput,
      })

      //console.log('initializeREsponse', initializeReponse);

      const AWSFileDataOutput = initializeReponse.data

      //this.fileId = "FDhUkMr8GQX8MkEQADI9mPdJZ_ee9wU_phoXDq2ZkoHevN1pU5aQvJIzTYhFJO6imi8xYhBJzH.qtWEyWrc8QY4r8DaWs4BJs4VbYHHr9AXeUqZIEKAN4EnHpPYFgc_s",
      //this.fileKey = "MediumTestFile"
      this.fileId = AWSFileDataOutput.fileId
      this.fileKey = AWSFileDataOutput.fileKey

      // retrieving the pre-signed URLs
      const numberOfparts = Math.ceil(this.file.size / this.chunkSize)

      const AWSMultipartFileDataInput = {
        fileId: this.fileId,
        fileKey: this.fileKey,
        parts: numberOfparts,
      }

      const urlsResponse = await api.request({
        url: "/multipart_upload_url",
        method: "POST",
        data: AWSMultipartFileDataInput,
      })

      console.log('urlsResponse', urlsResponse);

      const newParts = urlsResponse.data.parts
      this.parts.push(...newParts)

      this.sendNext()
    } catch (error) {
      console.log('completing with error', error);
      await this.complete(error)
    }
  }

  sendNext() {
    const activeConnections = Object.keys(this.activeConnections).length

    if (activeConnections >= this.threadsQuantity) {
      return
    }

    console.log('this.parts.length', this.parts.length);
    if (!this.parts.length) {
      if (!activeConnections) {
        console.log('completing successfully');
        this.complete()
      }

      return
    }

    const part = this.parts.pop()

    if (this.file && part) {
      const sentSize = (part.PartNumber - 1) * this.chunkSize
      const chunk = this.file.slice(sentSize, sentSize + this.chunkSize)

      const sendChunkStarted = () => {
        this.sendNext()
      }

      console.log('send chunk');
      this.sendChunk(chunk, part, sendChunkStarted)
        .then(() => {
          this.sendNext()
        })
        .catch((error) => {
          this.parts.push(part)

          console.log('completing with error3', error);
          this.complete(error)
        })
    }
  }

  // terminating the multipart upload request on success or failure
  async complete(error) {
    console.log('IN COMPLETE', 'error', error);
    if (error && !this.aborted) {
      this.onErrorFn(error)
      return
    }

    if (error) {
      this.onErrorFn(error)
      return
    }

    try {
      await this.sendCompleteRequest()
    } catch (error) {
      this.onErrorFn(error)
    }
  }

  // finalizing the multipart upload request on success by calling
  // the finalization API
  async sendCompleteRequest() {
    if (this.fileId && this.fileKey) {
      const videoFinalizationMultiPartInput = {
        uploadId: this.fileId,
        key: this.fileKey,
        parts: this.uploadedParts,
      }

      await api.request({
        url: "/finish_multipart_upload",
        method: "POST",
        data: videoFinalizationMultiPartInput,
      })
    }
  }

  sendChunk(chunk, part, sendChunkStarted) {
    return new Promise((resolve, reject) => {
      this.upload(chunk, part, sendChunkStarted)
        .then((status) => {
          if (status !== 200) {
            reject(new Error("Failed chunk upload"))
            return
          }

          resolve()
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  // calculating the current progress of the multipart upload request
  handleProgress(part, event) {
    //console.log('part', part, 'event', event);
    if (this.file) {
      if (event.type === "progress" || event.type === "error" || event.type === "abort") {
        this.progressCache[part] = event.loaded
      }

      if (event.type === "uploaded") {
        this.uploadedSize += this.progressCache[part] || 0
        delete this.progressCache[part]
      }

      const inProgress = Object.keys(this.progressCache)
        .map(Number)
        .reduce((memo, id) => (memo += this.progressCache[id]), 0)

      const sent = Math.min(this.uploadedSize + inProgress, this.file.size)

      const total = this.file.size

      const percentage = Math.round((sent / total) * 100)

      this.onProgressFn({
        sent: sent,
        total: total,
        percentage: percentage,
      })
    }
  }

  //upload(file, part, sendChunkStarted) {
    //return new Promise((resolve, reject) => {
      //const http = axios.create();

      //const putFile = async () => {
        //delete http.defaults.headers.put['Content-Type']

        //const response = await http.put(part.signedUrl, file, {
          //headers: {
            //'ETag': ''
          //}
        //})
        //console.log('response', response);

        //const uploadedPart = {
          //PartNumber: part.PartNumber,
          //// removing the " enclosing carachters from
          //// the raw ETag
          ////ETag: ETag.replaceAll('"', ""),
        //}

        //console.log('pushing uploaded part', this.uploadedParts);
        //this.uploadedParts.push(uploadedPart)

        //console.log('resolving xhr');
        //resolve(response.status)
        //delete this.activeConnections[part.PartNumber - 1]
      //};

      //putFile();
      //sendChunkStarted()

    ////const keys = Object.keys(urls)
    ////const promises = []

    ////for (const indexStr of keys) {
      ////const index = parseInt(indexStr)
      ////const start = index * FILE_CHUNK_SIZE
      ////const end = (index + 1) * FILE_CHUNK_SIZE
      ////const blob = index < keys.length
        ////? file.slice(start, end)
        ////: file.slice(start)

        ////promises.push(http.put(urls[index], blob))
    ////}

    ////const resParts = await Promise.all(promises)
    //sendChunkStarted()

    ////console.log('resParts', resParts);

    ////return resParts.map((part, index) => ({
      ////ETag: (part as any).headers.etag,
      ////PartNumber: index + 1
    ////}))
    //});
  //}

  // uploading a part through its pre-signed URL
  upload(file, part, sendChunkStarted) {
    // uploading each part with its pre-signed URL
    return new Promise((resolve, reject) => {
      if (this.fileId && this.fileKey) {
        // - 1 because PartNumber is an index starting from 1 and not 0
        const xhr = (this.activeConnections[part.PartNumber - 1] = new XMLHttpRequest())

        sendChunkStarted()

        const progressListener = this.handleProgress.bind(this, part.PartNumber - 1)

        xhr.upload.addEventListener("progress", progressListener)

        xhr.addEventListener("error", progressListener)
        xhr.addEventListener("abort", progressListener)
        xhr.addEventListener("loadend", progressListener)

        xhr.open("PUT", part.signedUrl)

        xhr.onreadystatechange = () => {
          if (xhr.readyState === 2) {

            // Get the raw header string
            const headers = xhr.getAllResponseHeaders();

            // Convert the header string into an array
            // of individual headers
            const arr = headers.trim().split(/[\r\n]+/);

            // Create a map of header names to values
            const headerMap = {};
            arr.forEach((line) => {
              const parts = line.split(': ');
              const header = parts.shift();
              const value = parts.join(': ');
              headerMap[header] = value;
            });
            console.log('headerMap', headerMap);
          }
          console.log('ready state change');
          console.log('xhr.readyState', xhr.readyState);

          if (xhr.readyState === 2) {
            console.log('HEADERS', xhr.getAllResponseHeaders());
          }

          if (xhr.readyState === 4 && xhr.status === 200) {
            console.log('xhr.response', xhr.response);
            console.log('xhr', xhr);

            const allHeaders = xhr.getAllResponseHeaders()
            console.log('all headers', allHeaders);
            // retrieving the ETag parameter from the HTTP headers
            const ETag = xhr.getResponseHeader("etag")
            console.log('ETag', ETag);

            if (ETag) {
              const uploadedPart = {
                PartNumber: part.PartNumber,
                // removing the " enclosing carachters from
                // the raw ETag
                ETag: ETag.replaceAll('"', ""),
              }

              console.log('pushing uploaded part', this.uploadedParts);
              this.uploadedParts.push(uploadedPart)

              console.log('resolving xhr');
              resolve(xhr.status)
              delete this.activeConnections[part.PartNumber - 1]
            }
            console.log('didnt find etag');
          }
        }

        xhr.onload = () => {
          console.log('on load', xhr.readyState, xhr.getAllResponseHeaders());
        };

        xhr.onerror = (error) => {
          console.log('xhr error', error);
          reject(error)
          delete this.activeConnections[part.PartNumber - 1]
        }

        xhr.onabort = () => {
          console.log('xhr abort');
          reject(new Error("Upload canceled by user"))
          delete this.activeConnections[part.PartNumber - 1]
        }

        console.log('sending file');
        xhr.send(file)
      }
    })
  }

  onProgress(onProgress) {
    this.onProgressFn = onProgress
    return this
  }

  onError(onError) {
    this.onErrorFn = onError
    return this
  }

  abort() {
    Object.keys(this.activeConnections)
      .map(Number)
      .forEach((id) => {
        this.activeConnections[id].abort()
      })

    this.aborted = true
  }
}
