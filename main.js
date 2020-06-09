const electron = require('electron')
const url = require('url')
const path = require('path')

const db = require('./db');

const {app, BrowserWindow, Menu, ipcMain} = electron;
const globalShortcut = electron.globalShortcut

// SET ENV
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

// Listen for app to be ready
app.on('ready', function(){
    // Create new window
    mainWindow = new BrowserWindow({
        webPreferences: {nodeIntegration: true}
    });

    // Load html into Window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Build menu from the template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    // Insert Menu
    Menu.setApplicationMenu(mainMenu); 

    // Quit app when closed
    mainWindow.on('closed', function(){
        app.quit();
    })

    //***//
	globalShortcut.register('f5', function() {
		mainWindow.reload()
	})
	globalShortcut.register('CommandOrControl+R', function() {
		mainWindow.reload()
	})
});

// Handle create add window
function createAddWindow(){
    // Create new window
    addWindow = new BrowserWindow({
        width: 350,
        height: 200,
        title: 'Add Shopping List Item',

        // Fix the “Uncaught ReferenceError: require is not defined”
        webPreferences: {nodeIntegration: true}
    });
    // Load html into Window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Garbage collection handle
    addWindow.on('close', function(){
        addWindow = null;
    });
}

// Create menu template
const mainMenuTemplate = [
    {
        label:'File',
        submenu: [
            {
                label: 'Add Item',
                accelerator: process.platform == 'darwin' ? 'Command+Shift+A' : 'Ctrl+Shift+A',
                click(){
                    createAddWindow();
                }
            },
            {
                label: 'Clear Items',
                accelerator: process.platform == 'darwin' ? 'Command+Shift+C' : 'Ctrl+Shift+C',
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Shift+Q' : 'Ctrl+Shift+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

// MAC USERS
if(process.platform == 'darwin'){
    // Fix for mac showing File as Electron and Add empty object to menu
    mainMenuTemplate.unshift({});
}

// Add developer tools item if not in prod
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}

ipcMain.on('item:add', function(e, item){
    // mainWindow.webContents.send('item:add', item);
    addShopplingLists({sample_column1: item});
    reloadShoppingLists();
    addWindow.close();
});

ipcMain.on('item:remove', function(e, id){
    removeShoppingLists(id)
    reloadShoppingLists();
});

ipcMain.on('item:load', reloadShoppingLists);

function reloadShoppingLists(){
    mainWindow.webContents.send('item:clear');

    db.query('SELECT * FROM `sample_table` LIMIT 10', function(err, result) {
        if (err) throw err;

        // console.log("Query succesfully executed", rows);
        for (i = 0; i < result.length; i++) { 
            // console.log("Query succesfully executed", rows[i]['sample_column1']);
            mainWindow.webContents.send('item:add', {id: result[i]['ID'], item: result[i]['sample_column1']});
        } 
    });
}

function addShopplingLists(post){
    db.query('INSERT INTO `sample_table` SET ?', post, function(err, result) {
        if (err) throw err;

        // console.log("Query succesfully executed", rows);
        for (i = 0; i < result.length; i++) { 
            // console.log("Query succesfully executed", rows[i]['sample_column1']);
            mainWindow.webContents.send('item:add', result[i]['sample_column1']);
        } 
    });
}

function removeShoppingLists(id){
    db.query('DELETE FROM `sample_table` WHERE id = ' + id, function(err, result) {
        if (err) throw err;

        // console.log("Query succesfully executed", rows);
        for (i = 0; i < result.length; i++) { 
            // console.log("Query succesfully executed", rows[i]['sample_column1']);
            mainWindow.webContents.send('item:add', {id: result[i]['ID'], item: result[i]['sample_column1']});
        } 
    });
}

// server.listen(3000);

// # Others
// ### YouTube Tutorial Followed - Build an Electron App in Under 60 Minutes
// https://www.youtube.com/watch?v=kN1Czs0m1SU

// Materiialized CSS
// https://materializecss.com/collections.html

// ### Install Electron Packager
// https://www.christianengvall.se/electron-packager-tutorial/
// Command: npm install --save-dev electron-packager

// ### Using Electron Packager to Window Release Application
// npm run package-win

// ### Connect to MySQL
// https://ourcodeworld.com/articles/read/259/how-to-connect-to-a-mysql-database-in-electron-framework

// ### Run the Applicaiton
// npm start