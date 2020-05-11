const sut = require('./ParallelGenerator')

function * syncGenerator (from, to) {
  let i = from
  while (i < to) {
    yield i
    i++
  }
}

async function * asyncGenerator (from, to) {
  let i = from
  while (i < to) {
    yield i
    i++
  }
}

const mockFunc = jest.fn()

beforeEach(function () {
  jest.resetAllMocks()
  mockFunc.mockReturnValue(new Promise((resolve, reject) => undefined))
})

test('parallel should schedule num number of operations on first next().', () => {
  const gen = sut.parallel(syncGenerator(1, 20), (i) => mockFunc(), 4)

  gen.next()

  expect(mockFunc).toHaveBeenCalledTimes(4)
})

test('parallel should schedule one new operation once first promise is done.', async () => {
  mockFunc.mockReset()
  mockFunc.mockReturnValueOnce(Promise.resolve(1))
  mockFunc.mockReturnValue(new Promise(() => undefined))
  const gen = sut.parallel(syncGenerator(1, 20), mockFunc, 4)

  await gen.next()
  gen.next()
  expect(mockFunc).toHaveBeenCalledTimes(5)
})

test('parallel should handle when upstream is an async generator', async () => {
  const gen = sut.parallel(sut.parallel(asyncGenerator(1, 5), mockFunc, 1))

  await gen.next()

  expect(mockFunc).toHaveBeenCalledWith(1)
})
