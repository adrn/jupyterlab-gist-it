import { Widget } from '@lumino/widgets';
import { NotebookPanel } from '@jupyterlab/notebook';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { ToolbarButton } from '@jupyterlab/apputils';
import { Notification } from '@jupyterlab/apputils';
import { Octokit } from "@octokit/core";

export const PLUGIN_NAME = 'jupyterlab_gist_it';

export interface IGistItSettings {
  personalAccessToken: string;
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
      `Could not load settings, so did not active ${PLUGIN_NAME}: ${err}`
      );
    }
  );

  // Set up notebook metadata:
  let model = this._panel.model;
  if (model == null) {
    return;
  }
  let gist_info = model.getMetadata('gist_info');

  if (gist_info == undefined) {
    gist_info = { gist_url: null, gist_id: null, create_date: null, update_date: null};
    model.setMetadata('gist_info', gist_info);
  }
  console.log("gist_info:");
  console.log(gist_info);

  const buttons: Array<[string, ToolbarButton]> = [];
  buttons.push([
    'gistItSend',
    new ToolbarButton({
    className: 'gistItSend',
    iconClass: 'fa fa-github ',
    onClick: async () => {
      // downloadNotebookFromBrowser(panel);
      console.log(`Sup. ${this._settings.personalAccessToken} stuff`);
      const octokit = new Octokit({ auth: this._settings.personalAccessToken });

      if (gist_info.gist_id == null) {
        console.log('Creating new gist');
        const resp = await octokit.request('POST /gists', {
          description: 'Example of a gist',
          'public': false,
          files: {
            'README.md': {
            content: 'Hello World'
            }
          },
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          }
          });

          console.log(resp);
        // TODO: check response code...

        Notification.success(`Created a new gist at ${resp.data.html_url}`, {
            actions: [
              { label: 'Open Gist', callback: () => window.open(resp.data.html_url, '_blank') }
            ],
            autoClose: 5000
          });

        gist_info = { gist_url: resp.data.html_url, gist_id: resp.data.id, create_date: resp.data.created_at, update_date: null};

        // @ts-ignore:next-line
        model.setMetadata('gist_info', gist_info);

      } else {
        console.log(`gist already exists: ${gist_info.gist_id}`);

        const resp = await octokit.request(`GET /gists/${gist_info.gist_id}`, {
          gist_id: gist_info.gist_id,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          }
        });

        Notification.warning(`Gist already exists at ${resp.data.html_url}`, {
          actions: [
            { label: 'Open Gist', callback: () => window.open(resp.data.html_url, '_blank') },
            { label: 'Update Gist', callback: () => window.alert("TODO") }
          ],
          autoClose: 10000
        });
      }

      // Load public gists:
      // const test = await octokit.request('GET /gists/public', {
      //     headers: {
      //       'X-GitHub-Api-Version': '2022-11-28'
      //     }
      //   });
      // console.log(test);
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