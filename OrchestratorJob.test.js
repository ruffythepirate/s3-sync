const { from: uploadJobFrom } = require('./UploadFileJob')
const { from } = require('./OrchestratorJob')

const S3 = {}

jest.mock('./UploadFileJob')

async function * gen (arr) {
  return yield * arr
}

const mockJob = {
  start: jest.fn(),
  on: jest.fn()
}

let sut

function createJobPromise (source, target) {
  return Promise.resolve({ source, target })
}

beforeEach(function () {
  jest.resetAllMocks()
  uploadJobFrom.mockReturnValue(mockJob)
  mockJob.on.mockImplementation((event, listener) => {
    listener(event)
  })
  withMultiPromiseJob()
})

function withMultiPromiseJob () {
  sut = from(S3, gen([createJobPromise('s1', 't1'),
    createJobPromise('s2', 't2'),
    createJobPromise('s3', 't3'),
    createJobPromise('s4', 't4')])
  , {})
}

function withSinglePromiseJob () {
  sut = from(S3, gen([createJobPromise('s1', 't1')]), {})
}

test('start should start upload job for every item in nextGenerator', async () => {
  await sut.start()
  for (const i of [1, 2, 3, 4]) {
    expect(uploadJobFrom).toHaveBeenCalledWith(S3, `s${i}`, `t${i}`)
  }
  expect(mockJob.start).toHaveBeenCalled()
})

test('orchestrator should emit event on upload job event.', async () => {
  withSinglePromiseJob()
  const eventListener = jest.fn()
  sut.on('event', eventListener)

  await sut.start()

  expect(uploadJobFrom).toHaveBeenCalledTimes(1)
  expect(mockJob.on).toHaveBeenCalled()
  expect(eventListener).toHaveBeenCalledTimes(1)
})
