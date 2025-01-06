import { v7 } from 'uuid'

export const logWithId = (message: string) => {
  console.log(`${v7()}: ${message}`);
}
