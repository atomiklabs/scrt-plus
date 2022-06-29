import fs from 'fs'
import path from 'path'

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath: string) => path.resolve(appDirectory, relativePath);

export const PATHS = Object.freeze({
  get artifacts() { return resolveApp('artifacts') },
  get root() { return resolveApp('..') },
});
