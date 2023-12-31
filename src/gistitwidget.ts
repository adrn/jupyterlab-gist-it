import { Widget } from '@lumino/widgets';
import { NotebookPanel } from '@jupyterlab/notebook';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { ToolbarButton } from '@jupyterlab/apputils';
import { GistHelper } from './GistHelper';

export const PLUGIN_NAME = 'jupyterlab_gist_it';

export interface IGistItSettings {
  personalAccessToken: string;
}

export default class GistItWidget extends Widget {
  constructor(panel: NotebookPanel, settingRegistry: ISettingRegistry) {
    super();
    this._panel = panel;
    this._settingRegistry = settingRegistry;

    this._settingRegistry.load(`${PLUGIN_NAME}:settings`).then(
      (settings: ISettingRegistry.ISettings) => {
        this._updateSettings(settings);
        settings.changed.connect(this._updateSettings.bind(this));
      },
      (err: Error) => {
        console.error(`Could not load settings for ${PLUGIN_NAME}: ${err}`);
      }
    );

    // Set up notebook metadata:
    const model = this._panel.model;

    const buttons: Array<[string, ToolbarButton]> = [];
    buttons.push([
      'gistItSend',
      new ToolbarButton({
        className: 'gistItSend',
        iconClass: 'fa fa-github ',
        onClick: async () => {
          if (model === null) {
            // TODO: notification error
            return;
          } else if (this._settings.personalAccessToken === '') {
            window.alert(
              'Please save a GitHub personal access token (with Gist access) in the Gist It settings.'
            );
            return;
          }
          let gist_info = model.getMetadata('gist_info');
          // console.log(gist_info);

          const gh = new GistHelper(
            this._settings.personalAccessToken,
            this._panel,
            model
          );

          if (gist_info === undefined || gist_info.gist_id === undefined) {
            // console.log('Creating new gist');
            gist_info = await gh.createGist();
          } else {
            // console.log(`gist already exists: ${gist_info.gist_id}`);
            gist_info = await gh.updateGist(gist_info);
          }
        },
        tooltip: 'Gist It'
        // label: 'GistIt',
      })
    ]);

    this._panel.content;

    buttons.reverse();
    buttons.forEach(item => {
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
