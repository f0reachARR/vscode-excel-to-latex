import { ScriptExecutor, ScriptList } from './platform';

const clipboardGrabberScript: ScriptList = {
  win: 'res/get_html.ps1',
};

export const readClipboard = async (
  execute: ScriptExecutor,
): Promise<string | undefined> => {
  const renderBase64 = await execute(clipboardGrabberScript);
  if (!renderBase64) {
    return;
  }

  const clipboardText = Buffer.from(renderBase64, 'base64').toString('utf8');

  return clipboardText;
};
