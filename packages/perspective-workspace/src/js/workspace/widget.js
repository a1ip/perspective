/******************************************************************************
 *
 * Copyright (c) 2018, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

import "@finos/perspective-viewer";
import {Widget} from "@phosphor/widgets";

export class PerspectiveViewerWidget extends Widget {
    constructor({name, viewer, node}) {
        super({node});
        viewer.setAttribute("name", name);
        this.title.label = name;
        this.viewer = viewer;
        this.master = false;
    }

    set master(value) {
        if (value !== undefined && this._master !== value) {
            if (value) {
                this.viewer.classList.add("workspace-master-widget");
                this.viewer.classList.remove("workspace-detail-widget");

                // TODO jsdom lacks `toggleAttribute` until 12.2.0
                // https://github.com/jsdom/jsdom/blob/master/Changelog.md#1220
                this.viewer.toggleAttribute?.("selectable", true);
            } else {
                this.viewer.classList.add("workspace-detail-widget");
                this.viewer.classList.remove("workspace-master-widget");
                this.viewer.removeAttribute("selectable");
            }
            this._master = value;
        }
    }

    get master() {
        return this._master;
    }

    get table() {
        return this.viewer.table;
    }

    toggleConfig() {
        return this.viewer.toggleConfig();
    }

    restore(config) {
        const {master, table, name, ...viewerConfig} = config;
        this.master = master;
        if (table) {
            this.viewer.setAttribute("table", table);
        }
        if (name) {
            this.viewer.setAttribute("name", name);
            this.title.label = name;
        }
        this.viewer.restore({...viewerConfig});
    }

    save() {
        return {
            ...this.viewer.save(),
            master: this.master,
            name: this.viewer.getAttribute("name"),
            table: this.viewer.getAttribute("table")
        };
    }

    removeClass(name) {
        super.removeClass(name);
        this.viewer && this.viewer.classList.remove(name);
    }

    async onCloseRequest(msg) {
        super.onCloseRequest(msg);
        if (this.viewer.parentElement) {
            this.viewer.parentElement.removeChild(this.viewer);
        }
        await this.viewer.delete();
    }

    onResize(msg) {
        this.notifyResize();
        super.onResize(msg);
    }

    async notifyResize() {
        if (this.isVisible) {
            await this.viewer.notifyResize();
        }
    }
}
