# lynx-users-administration

Users administration module for the Lynx framework

## Installation

```
npm install --save lynx-users-administration
```

## Dependencies

You should install also an administration theme to correctly use this module.
For example the [Light Bootstrap Theme](https://github.com/jellyfishsolutions/lynx-light-bootstrap-admin-theme).

## Usage

In your main app file:

```
import LightBootstrapAdminModule from "lynx-light-bootstrap-admin-theme";
import UsersAdminModule from "lynx-users-administration";
...

let myConfig = new ConfigBuilder(__dirname).build();

const app = new App(myConfig, [new LightBootstrapAdminModule(), new UsersAdminModule()]);
app.startServer(port);
```
