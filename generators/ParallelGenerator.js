/**
 * Takes an upstream generator and performs an operation on it in parallel. Keeps the state of the number of operations that are being performed,
 * so that calling next will make sure that a maximum of num processes are active at the same time.
 * @param upstream
 * A generator that is either async or sync.
 * @param asyncOp
 * An async operation that should be performed on the elements of the generator.
 * @param num
 * The maximum number of operations that should be running at the same time.
 * @returns {Generator<*, void, *>}
 */
async function * parallel (upstream, asyncOp, num) {
  const runningsOps = []
  let upstreamRes = upstream.next()

  let isRunning = true

  function verifyIsRunning (upstreamRes) {
    if (upstreamRes.then) {
      upstreamRes.then((res) => {
        isRunning = isRunning && !res.done
      })
    }
  }
  verifyIsRunning(upstreamRes)
  while (isRunning) {
    let newOps = []
    while (newOps.length + runningsOps.length < num && isRunning) {
      newOps.push(doOperation(upstreamRes, asyncOp))
      upstreamRes = upstream.next()
      verifyIsRunning(upstreamRes)
    }
    runningsOps.push(...newOps)

    newOps.forEach(p => {
      p.then(() => {
        const i = runningsOps.indexOf(p)
        if (i > -1) {
          runningsOps.splice(i, 1)
        } else {
          console.error('Could not find index of promise in parallel op. This should be impossible!')
        }
      })
    })
    if (runningsOps.length > 0) { yield anyPromise(runningsOps) } else { break }
    newOps = []
  }
}

function anyPromise (promiseArr) {
  return new Promise((resolve, reject) => promiseArr.forEach(p => p.then(resolve, reject)))
}

function doOperation (upstreamRes, asyncOp) {
  if (typeof upstreamRes.then === 'function') {
    return upstreamRes.then(a => a.value).then(asyncOp)
  } else {
    return asyncOp(upstreamRes.value)
  }
}

module.exports = {
  parallel
}
