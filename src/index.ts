import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { DocumentRegistry } from '@jupyterlab/docregistry';
import { NotebookPanel, INotebookModel } from '@jupyterlab/notebook';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import GistItWidget, { PLUGIN_NAME } from './gistitwidget';


export class GistItWidgetExtension
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {

  constructor(settingRegistry: ISettingRegistry) {
    this._settingRegistry = settingRegistry;
  }

  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ) {
    return new GistItWidget(panel, this._settingRegistry);
  }

  private _settingRegistry: ISettingRegistry;
}

const plugin: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_NAME,
  description: 'Upload Jupyter notebooks to GitHub Gist.',
  autoStart: true,
  optional: [ISettingRegistry],
  activate: (
    app: JupyterFrontEnd,
    settingsRegistry: ISettingRegistry
  ) => {

    app.docRegistry.addWidgetExtension(
      'Notebook',
      new GistItWidgetExtension(settingsRegistry)
    );
    console.log('JupyterLab extension jupyterlab_gist_it is activated!');

  }
};

export default plugin;
