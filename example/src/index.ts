import { App, ConfigBuilder } from "lynx-framework";

const port = Number(process.env.PORT) || 3000;

import LightBootstrapAdminModule from "lynx-light-bootstrap-admin-theme";
import UsersAdminModule from "lynx-users-administration";

let myConfig = new ConfigBuilder(__dirname).build();

const app = new App(myConfig, [
    new LightBootstrapAdminModule(),
    new UsersAdminModule()
]);
app.startServer(port);
