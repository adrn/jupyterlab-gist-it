import { Widget } from '@lumino/widgets';
import { NotebookPanel } from '@jupyterlab/notebook';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

import {
    ToolbarButton,
  } from '@jupyterlab/apputils';

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

    const buttons: Array<[string, ToolbarButton]> = [];
    buttons.push([
        'gistItSend',
        new ToolbarButton({
        className: 'gistItSend',
        iconClass: 'fa fa-github ',
        onClick: (): void => {
            // downloadNotebookFromBrowser(panel);
            console.log(`Sup. ${this._settings.personalAccessToken} stuff`);
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