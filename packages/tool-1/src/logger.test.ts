import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { logWithId } from './logger';

const consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => {});

beforeEach(() => {
  consoleLogMock.mockClear()
})

describe('Logger', () => {
  it('should log with id', () => {
    expect(consoleLogMock).toHaveBeenCalledTimes(0)
    
    logWithId('Hello, world!')
    
    expect(consoleLogMock).toBeCalledTimes(1)
    expect(consoleLogMock.mock.calls[0][0]).toMatch(/^[0-9a-f-]+: Hello, world!$/)
  })
})