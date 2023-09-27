import { Widget } from '@lumino/widgets';
import { NotebookPanel } from '@jupyterlab/notebook';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { ToolbarButton } from '@jupyterlab/apputils';
import { showDialog, Notification } from '@jupyterlab/apputils';
import { Octokit } from "@octokit/core";

export const PLUGIN_NAME = 'jupyterlab_gist_it';

const GITHUB_HEADER = {
  'X-GitHub-Api-Version': '2022-11-28'
}

export interface IGistItSettings {
  personalAccessToken: string;
  }

// TODO: move elsewhere
export class GistItDialog extends Widget {
   constructor() {
    super({ node: GistItDialog.createFormNode() });
  }

  getValue(): string {
    // @ts-ignore:next-line
    return this.node.querySelector('input').value.trim();
  }

  private static createFormNode(): HTMLElement {
    const node = document.createElement('div');
    const label = document.createElement('label');
    const input = document.createElement('input');
    const text = document.createElement('span');

    text.textContent = 'Description: ';
    input.placeholder = '';

    label.appendChild(text);
    label.appendChild(input);
    node.appendChild(label);
    return node;
  }
}

export default class GistItWidget extends Widget {
  constructor(
  panel: NotebookPanel,
  settingRegistry: ISettingRegistry
  ) {
  super();
  this._panel = panel;
  this._settingRegistry = settingRegistry;

  this._settingRegistry.load(`${PLUGIN_NAME}:settings`).then(
    (settings: ISettingRegistry.ISettings) => {
      this._updateSettings(settings);
      settings.changed.connect(this._updateSettings.bind(this));
      console.log("yo dog");
    },
    (err: Error) => {
      console.error(
      `Could not load settings for ${PLUGIN_NAME}: ${err}`
      );
    }
  );

  // Set up notebook metadata:
  let model = this._panel.model;

  const buttons: Array<[string, ToolbarButton]> = [];
  buttons.push([
    'gistItSend',
    new ToolbarButton({
    className: 'gistItSend',
    iconClass: 'fa fa-github ',
    onClick: async () => {
      if (model == null) {
        // TODO: notification error
        return;
      }
      let gist_info = model.getMetadata('gist_info');
      console.log(gist_info);

      console.log(`Sup. ${this._settings.personalAccessToken} stuff`);
      const octokit = new Octokit({ auth: this._settings.personalAccessToken });

      if (gist_info == null || gist_info.gist_id == null) {
        console.log('Creating new gist');

        const result = await showDialog({
          title: 'Upload Gist',
          body: new GistItDialog(),
          checkbox: {
            label: 'Private?',
            caption: 'private',
            checked: false,
          }
        });
        // console.log(result);

        let _public, description;
        if (result.button.label == 'Cancel') {
          return;
        } else {
          _public = !result.isChecked;
          description = result.value ? result.value : "";
        }
        console.log(_public, description);

        const title = this._panel.title['_label'] as string;
        const content = model.toString();
        let files = { [title]: {"content": content } };
        console.log(files)

        // TODO: check response code and error handling...
        const resp = await octokit.request('POST /gists', {
          'description': description,
          'public': _public,
          'files': files,
          'headers': GITHUB_HEADER
          });

        console.log(resp);

        // TODO: error if bad response or response code

        Notification.success(`Created a new gist ${resp.data.id}`, {
            actions: [
              // @ts-ignore:next-line
              { label: 'Copy URL', callback: () => navigator.clipboard.writeText(resp.data.html_url) },
              { label: 'Open Gist', callback: () => window.open(resp.data.html_url, '_blank') }
            ],
            autoClose: 5000
          });

        gist_info = { gist_url: resp.data.html_url, gist_id: resp.data.id, create_date: resp.data.created_at};

        // @ts-ignore:next-line
        model.setMetadata('gist_info', gist_info);

      } else {
        console.log(`gist already exists: ${gist_info.gist_id}`);

        // TODO: check response code and error handling...
        const resp = await octokit.request(`GET /gists/${gist_info.gist_id}`, {
          gist_id: gist_info.gist_id,
          headers: GITHUB_HEADER
        });

        Notification.warning(`Gist already exists ${resp.data.id}`, {
          actions: [
            // @ts-ignore:next-line
            { label: 'Copy URL', callback: () => navigator.clipboard.writeText(resp.data.html_url) },
            { label: 'Open Gist', callback: () => window.open(resp.data.html_url, '_blank') },
            { label: 'Update Gist', callback: () => window.alert("TODO") }
          ],
          autoClose: 10000
        });
      }

    },
    tooltip: 'Gist It',
    // label: 'GistIt',
    })
  ]);

  this._panel.content;

  buttons.reverse();
  buttons.forEach((item) => {
    panel.toolbar.insertItem(9, item[0], item[1]);
  });
  }

  _updateSettings(settings: ISettingRegistry.ISettings) {
  this._settings.personalAccessToken = settings.get('personalAccessToken')
    .composite as string;
  }

  private _panel: NotebookPanel;
  private _settingRegistry: ISettingRegistry;
  private _settings: IGistItSettings = {
  personalAccessToken: ''
  };
}