import * as vscode from 'vscode';

const QUEUE_REPO_KEY = 'squadDirector.queueRepo';

export function activate(context: vscode.ExtensionContext): void {
  const provider = new SquadQueueProvider();
  vscode.window.registerTreeDataProvider('squadDirector.queue', provider);

  context.subscriptions.push(
    vscode.commands.registerCommand('squadDirector.refresh', () => provider.refresh()),
    vscode.commands.registerCommand('squadDirector.signIn', async () => {
      await vscode.authentication.getSession('github', ['read:user', 'repo'], {
        createIfNone: true,
      });
      void vscode.window.showInformationMessage('Squad Director: signed in with GitHub');
      provider.refresh();
    }),
  );

  void provider.refresh();
}

class SquadQueueProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private readonly onDidChangeTreeDataEmitter = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;

  refresh(): void {
    this.onDidChangeTreeDataEmitter.fire();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(): vscode.ProviderResult<vscode.TreeItem[]> {
    const repo = vscode.workspace.getConfiguration().get<string>(QUEUE_REPO_KEY)
      ?? 'eduardocerqueira/ai-alpha-squad';
    const root = new vscode.TreeItem(`Queue: ${repo}`, vscode.TreeItemCollapsibleState.Expanded);
    root.contextValue = 'squadQueueRoot';

    const needsYou = section('Needs you', 'awaiting-approval, release-candidate');
    const intake = section('Intake / analysis', 'new, business-owner');
    const build = section('Build', 'director-approved, designed, implemented');
    const validation = section('Validation', 'validation');
    const done = section('Done / blocked', 'released, blocked');

    return [root, needsYou, intake, build, validation, done];
  }
}

function section(label: string, subtitle: string): vscode.TreeItem {
  const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.Collapsed);
  item.description = subtitle;
  item.contextValue = 'squadSection';
  return item;
}

export function deactivate(): void {}
