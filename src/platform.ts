import { spawn } from 'child_process';
import vscode from 'vscode';

export type PlatformType = 'win' | 'darwin' | 'linux' | 'wsl';
export type ScriptList = Partial<Record<PlatformType, string>>;
export type ScriptHostList = Record<PlatformType, [string, string[]]>;

const pwshArgs = [
  '-noprofile',
  '-noninteractive',
  '-nologo',
  '-sta',
  '-executionpolicy',
  'bypass',
  '-windowstyle',
  'hidden',
  '-file',
];
export const defaultScriptHost: ScriptHostList = {
  win: ['powershell', pwshArgs],
  darwin: ['/bin/bash', []],
  linux: ['/bin/bash', []],
  wsl: ['powershell.exe', pwshArgs],
};

export const detectPlatform = (): PlatformType => {
  if (process.platform === 'win32') {
    return 'win';
  }
  if (process.platform === 'darwin') {
    return 'darwin';
  }

  // WSL check
  if (process.platform === 'linux') {
    if ('WSL_DISTRO_NAME' in process.env || 'WSLENV' in process.env) {
      return 'wsl';
    }
  }

  return 'linux';
};

export type ScriptExecutor = (
  list: ScriptList,
  args?: string[],
  timeout?: number,
) => Promise<string>;

export const createScriptExecutor = (
  context: vscode.ExtensionContext,
  scriptHost: ScriptHostList = defaultScriptHost,
): ScriptExecutor => {
  const platform = detectPlatform();
  const shell = scriptHost[platform];

  return (list: ScriptList, args = [], timeout = 10000) => {
    if (list[platform]) {
      const scriptPath = context.asAbsolutePath(list[platform]!);
      const shellArgs = [...shell[1], scriptPath, ...args];
      return new Promise((resolve, reject) => {
        const childProcess = spawn(shell[0], shellArgs, {
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout,
        });
        const chunks: string[] = [];

        childProcess.stdout.on('data', (chunk) => {
          chunks.push(Buffer.from(chunk).toString('utf-8'));
        });

        childProcess.stderr.on('data', (chunk) => {
          console.error(chunk);
        });

        childProcess.on('exit', (code, signal) => {
          if (code === 0) {
            resolve(chunks.join(''));
          } else {
            reject(new Error(`${signal}`));
          }
        });

        childProcess.once('error', (err) => reject(err));
      });
    } else {
      throw new Error('Platform script not found');
    }
  };
};
