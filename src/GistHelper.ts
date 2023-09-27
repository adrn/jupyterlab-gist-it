import { Widget } from '@lumino/widgets';
import { NotebookPanel, INotebookModel } from '@jupyterlab/notebook';
import { Octokit } from "@octokit/core";
import { showDialog } from '@jupyterlab/apputils';
import { Notification } from '@jupyterlab/apputils';
import { PartialJSONObject} from '@lumino/coreutils';

const GITHUB_HEADER = {
  'X-GitHub-Api-Version': '2022-11-28'
}

export interface IGistInfo extends PartialJSONObject {
  gist_url?: string;
  gist_id?: string;
  create_date?: string;
}

export class GistItDialog extends Widget {

  constructor(defaultDescription: string = "", headerText: string = "") {
    super({ node: GistItDialog.createFormNode(headerText, defaultDescription) });
  }

  getValue(): string {
    // @ts-ignore:next-line
    return this.node.querySelector('input').value.trim();
  }

  public static createFormNode(headerText: string, defaultDescription: string):
  HTMLElement {

    const hdrNode = document.createElement('div');
    const hdr = document.createElement('span');

    const node = document.createElement('div');
    const label = document.createElement('label');
    const input = document.createElement('input');
    const text = document.createElement('span');

    hdr.innerHTML = headerText;
    hdrNode.appendChild(hdr);
    node.appendChild(hdrNode);

    text.textContent = 'Description: ';
    input.placeholder = '';
    input.value = defaultDescription;

    label.appendChild(text);
    label.appendChild(input);
    node.appendChild(label);
    return node;
  }
}

export class GistHelper {
  public octokit: Octokit;
  public panel: NotebookPanel;
  public model: INotebookModel;

  constructor(accessToken: string, panel: NotebookPanel, model: INotebookModel) {
    if (accessToken == null || accessToken == "") {
      throw new Error("A Personal Access Token is required");
    }
    this.octokit = new Octokit({ auth: accessToken });
    this.panel = panel;
    this.model = model;
  }

  public getFiles(): any {
    const title = this.panel.title['_label'] as string;
    const content = this.model.toString();
    let files = { [title]: {"content": content } };
    return files;
  }

  public async createGist(): Promise<IGistInfo> {
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
      return {} as IGistInfo;
    } else {
      _public = !result.isChecked;
      description = result.value ? result.value : "";
    }
    console.log(_public, description);

    let files = this.getFiles();
    console.log(files)

    let gist_info = {} as IGistInfo;
    try {
      const resp = await this.octokit.request('POST /gists', {
        'description': description,
        'public': _public,
        'files': files,
        'headers': GITHUB_HEADER
      });

      gist_info.gist_url = resp.data.html_url;
      gist_info.gist_id = resp.data.id;
      gist_info.create_date = resp.data.created_at;

      Notification.success(`Created a new gist ${gist_info.gist_id}`, {
        actions: [
          // @ts-ignore:next-line
          { label: 'Copy URL', callback: () => navigator.clipboard.writeText(resp.data.html_url) },
          { label: 'Open Gist', callback: () => window.open(gist_info.gist_url, '_blank') }
        ],
        autoClose: 10000
      });

    } catch (error: any) {
      Notification.error(`Failed to create Gist`, {
        autoClose: 5000
      });
      return gist_info;
    }

    // @ts-ignore:next-line
    this.model.setMetadata('gist_info', gist_info);
    console.log("Saved metadata", gist_info);

    return gist_info;
  }

  public async updateGist(oldGistInfo: IGistInfo): Promise<IGistInfo> {

    // first, try to load existing info from Gist
    let initResp;
    try {
      initResp = await this.octokit.request(`GET /gists/${oldGistInfo.gist_id}`, {
        gist_id: oldGistInfo.gist_id,
        headers: GITHUB_HEADER
      });

    } catch (error: any) {
      if (error.status == 404) {
        // Gist doesn't exist on GitHub, but it does in the notebook metadata
        console.log("Gist doesn't exist, but notebook metadata contains a Gist ID");

        const result = await showDialog({
          title: "Gist does not exist on GitHub but a Gist ID is stored in the notebook metadata. Create a new Gist instead?"
        });
        console.log(result);

        if (result.button.label == 'Cancel') {
          return {} as IGistInfo;
        } else if (result.button.label == 'Ok') {
          return this.createGist();
        } else {
          throw new Error("Unexpected error");
        }

      } else {
        Notification.error("Unexpected error with Gist It", {
          autoClose: 5000
        });
        throw error;
      }
    }
    console.log(initResp);

    // Gist exists - ask to update
    const result = await showDialog({
      title: 'Gist already exists! Update Existing Gist?',
      body: new GistItDialog(
        initResp.data.description,
        `Existing gist: <a href='${oldGistInfo.gist_url}'>${oldGistInfo.gist_id}</a>`
      ),
    });

    let description;
    if (result.button.label == 'Cancel') {
      return {} as IGistInfo;
    } else {
      description = result.value ? result.value : "";
    }

    let gist_info = {} as IGistInfo;
    try {
      const resp = await this.octokit.request(`PATCH /gists/${oldGistInfo.gist_id}`, {
        'description': description,
        'files': this.getFiles(),
        'headers': GITHUB_HEADER
      });
      gist_info.gist_url = resp.data.html_url;
      gist_info.gist_id = resp.data.id;
      gist_info.create_date = resp.data.created_at;

      Notification.success(`Updated gist ${gist_info.gist_id}`, {
        actions: [
          // @ts-ignore:next-line
          { label: 'Copy URL', callback: () => navigator.clipboard.writeText(resp.data.html_url) },
          { label: 'Open Gist', callback: () => window.open(gist_info.gist_url, '_blank') }
        ],
        autoClose: 10000
      });

    } catch (error: any) {
      Notification.error(`Failed to update gist ${gist_info.gist_id}`, {
        autoClose: 5000
      });
    }

    // @ts-ignore:next-line
    this.model.setMetadata('gist_info', gist_info);
    console.log("Saved metadata", gist_info);

    return gist_info;
  }
}