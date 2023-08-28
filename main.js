const path = require('path');
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img');
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');


let mainWindow;
let aboutWindow;

function createMainMenu() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: 'download.png',

        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },

    });

    // mainWindow.webContents.openDevTools();
    mainWindow.loadFile(path.join(__dirname, './pages/index.html'));


}
const env = process.env.NODE_ENV || 'development';

// If development environment
if (env === 'development') {
    try {
        require('electron-reloader')(module, {
            debug: true,
            watchRenderer: true
        });
    } catch (_) { console.log('Error'); }
}


function createAboutWindow() {
    aboutWindow = new BrowserWindow({
        width: 800,
        height: 600,
        title: 'About Electron',
        icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    });

    aboutWindow.loadFile(path.join(__dirname, './pages/about.html'));
}

app.whenReady().then(() => {
    createMainMenu()

    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainMenu()
        }
    })

    // Remove variable from memory
    mainWindow.on('closed', () => (mainWindow = null));
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

//When the app is ready, create the window
// app.on('ready', () => {
//     createMainMenu();
//     const mainMenu = Menu.buildFromTemplate(menu);
//     Menu.setApplicationMenu(mainMenu);

//     // Remove variable from memory
//     mainWindow.on('closed', () => (mainWindow = null));
// });



// Menu template
const menu = [

    {
        label: app.name,
        submenu: [
            {
                label: 'Home',
                click: createMainMenu,
            },
            {
                label: 'About',
                click: createAboutWindow,
            },
        ],
    },


    {
        role: 'fileMenu',
    },

    // OR
    //{
    //   label: 'File',
    //   submenu: [
    //     {
    //       label: 'Quit',
    //       click: () => app.quit(),
    //       accelerator: 'CmdOrCtrl+W',
    //     },
    //   ],
    // },

    {
        label: 'Help',
        submenu: [
            {
                label: 'About',
                click: createAboutWindow,
            },
        ],
    },
];

// Respond to ipcRenderer resize

ipcMain.on('image:resize', (e, options) => {
    options.dest = path.join(os.homedir(), 'imageresizer')
    resizeImage(options);
});

async function resizeImage({ imgPath, width, height, dest }) {

    try {
        const newPath = await resizeImg(fs.readFileSync(imgPath), {
            width: +width,
            height: +height,
        })

        // create filename
        const filename = path.basename(imgPath);

        // create destination folder if not exist
        if (!fs.existsSync(dest))
            fs.mkdirSync(dest);

        // write file to destination
        fs.writeFileSync(path.join(dest, filename), newPath);

        // send sucess message
        mainWindow.webContents.send('image:done');

        //open folder
        shell.openPath(dest);
    } catch (error) {
        console.log(err);
    }
}