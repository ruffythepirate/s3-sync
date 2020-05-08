const EventEmitter = require('events')
const UploadFileJob = require('./UploadFileJob')

class OrchestratorJob extends EventEmitter {
  constructor (S3, nextUploadGenerator, config) {
    super()
    this.S3 = S3
    this.nextJobGenerator = nextUploadGenerator
    this.config = config
  }

  async start () {
    const nextJob = await this.nextJobGenerator.next()
    console.log(nextJob)
    const uploadJob = UploadFileJob.from(this.S3, nextJob.value.source, nextJob.value.target)
    await uploadJob.start()
    return undefined
    // Start upload job for every next in the generator.
    // abort if any child job has aborted.
    // succeed if all child jobs are successful.
    // If child job emits, emit message further.
    // Look at config for max concurrency.
  }
}

function from (S3, nextUploadGenerator, config) {
  return new OrchestratorJob(S3, nextUploadGenerator, config)
}

module.exports = {
  from
}
