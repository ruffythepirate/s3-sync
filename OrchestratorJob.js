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
    let nextJob = await this.nextJobGenerator.next()
    while (!nextJob.done) {
      const uploadJob = UploadFileJob.from(this.S3, nextJob.value.source, nextJob.value.target)
      await uploadJob.start()
      nextJob = await this.nextJobGenerator.next()
    }
    // Start upload job for every next in the generator.
    // goes throug the generators.
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
