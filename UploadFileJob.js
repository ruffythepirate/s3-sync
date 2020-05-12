const EventEmitter = require('events')
const { makeCall } = require('./s3-promise-helper')
const fs = require('fs')

class UploadFileJob extends EventEmitter {
  constructor (S3, filePath, s3Uri) {
    super()
    this.S3 = S3
    const [bucket, key] = splitS3UriToBucketAndKey(s3Uri)
    this.targetBucket = bucket
    this.targetKey = key
    this.sourceFilePath = filePath
  }

  start () {
    const fileBuffer = fs.readFileSync(this.sourceFilePath)
    this.emit('event', `Upload from ${this.sourceFilePath} to ${this.targetBucket}, ${this.targetKey} started`)
    return makeCall(this.S3, this.S3.putObject, {
      Body: fileBuffer,
      Key: this.targetKey,
      Bucket: this.targetBucket
    }).then((data) => {
      this.emit('event', `Upload from ${this.sourceFilePath} to ${this.targetBucket}, ${this.targetKey} successful`)
      return data
    }, (error) => {
      this.emit('event', `Upload from ${this.sourceFilePath} to ${this.targetBucket}, ${this.targetKey} failed`)
      throw error
    })
  }
}

function splitS3UriToBucketAndKey (s3Uri) {
  if (!s3Uri.startsWith('s3://')) {
    throw new Error(`s3Uri ${s3Uri} does not start with s3:// and is therefor not a valid s3 uri.`)
  }
  const [bucket, ...keyParts] = s3Uri.slice(5).split('/')

  const key = keyParts.join('/')
  if (!key) {
    throw new Error(`Key in s3Uri ${s3Uri} is undefined!`)
  }

  return [bucket, keyParts.join('/')]
}

function from (S3, filePath, s3Uri) {
  return new UploadFileJob(S3, filePath, s3Uri)
}

module.exports = {
  from
}
