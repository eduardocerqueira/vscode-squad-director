import * as vscode from 'vscode';

/** Placeholder for GitHub queue API — wired in follow-up iterations. */
export async function getGitHubSession(): Promise<vscode.AuthenticationSession | undefined> {
  return vscode.authentication.getSession('github', ['read:user', 'repo'], {
    createIfNone: false,
  });
}
