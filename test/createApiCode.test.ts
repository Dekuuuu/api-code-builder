import createApiCode from "../src/createApiCode"
import docs from './docs.json'

test('', () => {
  const a = createApiCode({
    paths: docs.paths as any,
    definitions: docs.definitions as any,
    version: 'js',
    customResponse: 'any',
  })
  // console.log(a)
})
