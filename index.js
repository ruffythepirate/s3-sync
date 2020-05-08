/**
 * Syncs the content from the local path to the given s3 path.
 * @param S3
 * The S3 object given by the aws-sdk.
 * @param localPath
 * The local path to sync.
 * @param s3Path
 * The place in S3 where to sync the content.
 * @param options
 * An object with different options regarding how the sync should be performed.
 */
function syncToS3 (S3, localPath, s3Path, options) {
  // verify can run command.
  // initialize generators
  // create Orchestrator with EventEmitter. Orchestrator creates Upload Job with EventEmitter.
}

module.exports = {
  syncToS3
}
