import vscode from 'vscode';
import { readClipboard } from './clipboard';
import { createLaTeXTable } from './latex/table';
import { parseExcelHtml } from './parser';
import { createScriptExecutor } from './platform';

export function activate(context: vscode.ExtensionContext) {
  const executeScript = createScriptExecutor(context);
  const disposable = vscode.commands.registerCommand(
    'excel-to-latex-copypaste.copyTableToLaTeX',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const clipboardText = await readClipboard(executeScript);

      if (!clipboardText) {
        vscode.window.showErrorMessage('Failed to get clipboard content');
        return;
      }

      const table = parseExcelHtml(clipboardText);
      if (!table) {
        vscode.window.showErrorMessage(
          'Clipboard does not contain Excel format',
        );
        return;
      }
      const renderText = createLaTeXTable(table, {
        space: !!editor.options.insertSpaces,
        spaceSize: Number(editor.options.tabSize ?? 4),
        baseIndent: 0,
      });

      editor.edit((edit) => {
        const current = editor.selection;
        if (current.isEmpty) {
          edit.insert(current.start, renderText);
        } else {
          edit.replace(current, renderText);
        }
      });
    },
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
