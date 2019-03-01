/*jshint esversion: 6*/
const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
const app = electron.remote; //.remote is 'bridge' between main and renderer processes
const dialog = app.dialog;
const fs = require('fs'); //For file system
const BrowserWindow = electron.remote.BrowserWindow;
const remote = electron.remote;

class TabWriterManager{
    constructor(){
        this._measures = [];
        this._guitarStringLabels = ['e', 'B', 'G', 'D', 'A', 'E'];
        this._measureCount = 0;
        this._container = document.getElementById('container');
        this._isFirstMeasure = true;
        this._valueCells = []; //Used for opening a previously saved tab composition
        this._MEASURE_NUM_ROWS = 6;
        this._MEASURE_NUM_COLS = 21;
        this._scoreTitleInput = document.getElementById('scoreTitleInput');
        this._scoreInfoTextArea = document.getElementById('tabInfoTextArea');
        this._fileName = null;
    }

    get measures(){return this._measures;}
    get guitarStringLabels(){return this._guitarStringLabels;}
    get measureCount(){return this._measureCount;}
    get container(){return this._container;}
    get isFirstMeasure(){return this._isFirstMeasure;}
    get valueCells(){return this._valueCells;}
    get MEASURE_NUM_ROWS(){return this._MEASURE_NUM_ROWS;}
    get MEASURE_NUM_COLS(){return this._MEASURE_NUM_COLS;}
    get currentBar(){return this._currentBar;}
    get scoreTitleInput(){return this._scoreTitleInput;}
    get scoreInfoTextArea(){return this._scoreInfoTextArea;}
    get fileName(){return this._fileName;}
    
    set measureCount(val){this._measureCount = val;}    
    set isFirstMeasure(val){this._isFirstMeasure = val;}
    set measures(val){this._measures = val;}
    set valueCells(val){this._valueCells = val;}
    set fileName(val){this._fileName = val;}
}

let tabWriterManager = new TabWriterManager();

class Measure{
    constructor(table, tableBody, measurePos){
        this._inputCells = [];
        this._measureTable = table;
        this._measureTableBody = tableBody;
        this._measurePos = measurePos;
    }

    get inputCells(){return this._inputCells;}
    get measureTable(){return this._measureTable;}
    get measureTableBody(){return this._measureTableBody;}
    get measurePos(){return this._measurePos;}
}

//Used primarily for opening a file (see processData method on TabWriterManager class)
class ValueCell {
    constructor(positionOfMeasure, rowVal, colVal, heldValue){
        this._positionOfMeasure = positionOfMeasure;
        this._rowVal = rowVal;
        this._colVal = colVal;
        this._heldValue = heldValue;
    }
    
    get positionOfMeasure(){return this._positionOfMeasure;}
    get rowVal(){return this._rowVal;}
    get colVal(){return this._colVal;}
    get heldValue(){return this._heldValue;}
}

function createMeasure(){

    //Creating table and table body to hold the measure
    let newTable = document.createElement('table');
    let newTableBody = document.createElement('tbody');
    newTable.id = `measure${tabWriterManager.measureCount}`;
    newTable.style.display = 'inline-block';
    newTableBody.id = `measure${tabWriterManager.measureCount}body`;

    //Variable for width of cells in measure table
    let colInputWidth = 20;

    //Changing measureCount or not for zero indexing consistency with arrays
    if(tabWriterManager.isFirstMeasure) tabWriterManager.isFirstMeasure = false; //No increment if first measure for proper zero indexing
    else tabWriterManager.measureCount += 1;

    //Creating new Measure object for the current bar
    let newMeasure = new Measure(newTable, newTableBody, tabWriterManager.measureCount);
    tabWriterManager.measures.push(newMeasure);

    //Creating rows and columns and inputs within each table cell
    for(let rowCount=0; rowCount<tabWriterManager.MEASURE_NUM_ROWS; rowCount++){
        let newRow = newTableBody.insertRow(rowCount);
        for (let colCount=0; colCount<tabWriterManager.MEASURE_NUM_COLS; colCount++){

            //Creating cell node and input element
            let newTableCol = newRow.insertCell(colCount);
            let inputElementForCol = document.createElement('input');
            inputElementForCol.type = 'text';

            //Setting styles for the newly created input field
            inputElementForCol.style.fontFamily = 'Avenir';
            inputElementForCol.style.width = `${colInputWidth}px`;
            inputElementForCol.style.textAlign = 'center';
            inputElementForCol.style.border = 'none';
            
            //Indicates end of measure barline
            if(colCount == 20) inputElementForCol.style.borderRight = '1px solid black';

            //Determining value
            if(colCount == 0) inputElementForCol.value = tabWriterManager.guitarStringLabels[rowCount];
            else inputElementForCol.defaultValue = '—';

            attachInputCellListener(inputElementForCol);
            
            newMeasure.inputCells.push(inputElementForCol);
            newTableCol.appendChild(inputElementForCol);
        }
    }
    
    //Making the table and the input cells appear on the application
    newTable.appendChild(newTableBody);
    container.appendChild(newTable);

    return newMeasure;
}

function attachInputCellListener(inputCell){
    inputCell.addEventListener('keyup', (e) => {
        if(e.key == 'Backspace') {
            if(inputCell.value == '' || inputCell.value == ' ')inputCell.value = inputCell.defaultValue;
            inputCell.select(); //Selects all text in input field after backspace
        }
    });

    inputCell.addEventListener('click', () => {
        inputCell.select();
    });
}

function reset(){
    tabWriterManager.isFirstMeasure = true;
    tabWriterManager.measureCount = 0;
    tabWriterManager.valueCells = [];
    tabWriterManager.measures = [];
    while(container.firstChild) container.removeChild(container.firstChild);//Removing child nodes (measures/tables) being stored in the container
}

function saveFile(promptSaveAs){
    
    let measureArrays = [];
    let allMeasures = tabWriterManager.measures;

    let scoreTitle = tabWriterManager.scoreTitleInput.value;
    let scoreInfo = tabWriterManager.scoreInfoTextArea.value;

    allMeasures.forEach(measure => {

        let table = measure.measureTable;

        //Array of arrays - Represents ONE measure - Inner arrays are rows of cells (so there should be 6 other arrays in here)
        let measureArray = [];

        //Getting data cells
        for(let i=0; i<tabWriterManager.MEASURE_NUM_ROWS; i++){
            let rowInIteration = table.rows[i];
            let rowInputCellsArray = [];

            for(let j=0; j<tabWriterManager.MEASURE_NUM_COLS; j++){
                let colInIteration = rowInIteration.cells[j];
                let inputCell = colInIteration.childNodes[0];
                rowInputCellsArray.push(inputCell);
            }

            measureArray.push(rowInputCellsArray);

        }

        measureArrays.push(measureArray);
        
    });

    let contentToSave = createContentToSave(measureArrays, scoreTitle, scoreInfo);
    
    if(promptSaveAs || tabWriterManager.fileName === null || tabWriterManager.fileName === undefined){
        
        //Save as dialog
        dialog.showSaveDialog(fileName => {
            if(fileName === undefined) { //If save is canceled or not a valid filename
                alert('No file selected - Cancelling save');
                return;
            }

            /*Writing contents to file - fileName argument came from callback function from
            showSaveDialog method*/
            writeToFile(fileName, contentToSave);

            tabWriterManager.fileName = fileName;
        });

    } else writeToFile(tabWriterManager.fileName, contentToSave);

    ipcRenderer.send('change-window-title', tabWriterManager.fileName);
    
}

function createContentToSave(arrayOfMeasures, scoreTitleToSave, scoreInfoToSave){
    let contentToWrite = `${scoreTitleToSave}\n${scoreInfoToSave}\n`;

    //Coordinate system for writing details to file - positionOfMeasure:row:col:val
    //Looping through measures
    for(let i=0; i<arrayOfMeasures.length; i++){
        let measureArray = arrayOfMeasures[i];

        for(let j=0; j<measureArray.length; j++){
            let measureRow = measureArray[j];

            for(let k=0; k<measureRow.length; k++){
                let value = measureRow[k].value;
                if(value !== '—') contentToWrite += `${i}:${j}:${k}:${value} `;
            }
        }
    }

    return contentToWrite;
}

function writeToFile(fileName, contentToWrite){

    //Writing contents to file - fileName argument came from callback function from showSaveDialog method
    fs.writeFile(fileName, contentToWrite, (error, fd) => { //Callback function similar to try/catch fulfillment
        if(error) {
            alert(`Could not save file! - ${error}`);
            return;
        }
        alert(`Saved Succssfully!`);
    });
}

function openFile(){
    dialog.showOpenDialog(fileNames => {
        if(fileNames === undefined){
            alert('No file selected');
            return;
        }else{
            fs.readFile(fileNames[0], 'utf-8', (error, data) => {
                if(error){
                    alert(`Cannot open file -  ${error}`);
                    return;
                }

                tabWriterManager.fileName = fileNames[0];

                //For some reason, passing a string as an argument does not work as it cannot be read in the main process, so using an object literal instead
                ipcRenderer.send('change-window-title', tabWriterManager.fileName);

                processData(data);       
            });
        }
    });
}

function processData(readContents){

    //Splits readContents by \n
    let readContentsSplit = readContents.toString().split(/\r?\n/); 

    //Title is the first line in the opened file
    let scoreTitle = readContentsSplit[0];
    let scoreInfo = '';
    for(let i=1; i< readContentsSplit.length - 1; i++){
        scoreInfo += readContentsSplit[i] + '\n';
    }

    //Line with value cells is the last line in the doc
    let valueCellsInfo = readContentsSplit[readContentsSplit.length - 1];
    let infoAsString = '';
    let infoStringArray = [];

    //Going through readContents and processing contents to create valueCell objects
    for(let i=0; i<valueCellsInfo.length; i++){
        if(valueCellsInfo[i] != ' ') infoAsString += valueCellsInfo[i];
        else {
            infoStringArray = infoAsString.split(':');
            let newValueCell = new ValueCell(infoStringArray[0], infoStringArray[1], infoStringArray[2], infoStringArray[3]);
            tabWriterManager.valueCells.push(newValueCell);
            infoAsString = '';
            infoStringArray = [];
        }
    }

    createOpenedTabComposition(scoreTitle, scoreInfo);

}

function createOpenedTabComposition(scoreTitle, scoreInfo){
    let valueCells = tabWriterManager.valueCells;
    let maxNumMeasures = 0;

    //Setting score title and score info
    tabWriterManager.scoreTitleInput.value = scoreTitle;
    tabWriterManager.scoreInfoTextArea.value = scoreInfo;

    //Creating measures
    valueCells.forEach(valueCell => {
        let measurePos = parseInt(valueCell.positionOfMeasure);
        if(measurePos > maxNumMeasures) maxNumMeasures = measurePos;
    });

    let measuresToCreate = maxNumMeasures + 1; //+1 because measurePos is zero indexed

    for(let i=0; i<measuresToCreate; i++){
        createMeasure();
    }

    valueCells.forEach(valueCell => {
        let positionOfMeasure = parseInt(valueCell.positionOfMeasure);
        let rowVal = valueCell.rowVal;
        let colVal = valueCell.colVal;
        let heldValue = valueCell.heldValue;

        let measureOfInterest = tabWriterManager.measures[positionOfMeasure];
        let tableOfInterest = measureOfInterest.measureTable;

        for(let i=0; i<tabWriterManager.MEASURE_NUM_ROWS; i++){
            if(i != rowVal) continue;
            let rowInIteration = tableOfInterest.rows[i];
            
            for(let j=0; j<tabWriterManager.MEASURE_NUM_COLS; j++){
                if(j != colVal) continue;
                let colInIteration = rowInIteration.cells[j];

                if(rowVal == i && colVal == j) colInIteration.childNodes[0].value = heldValue;
            }
        }

    });
}

window.onload = () => {

    //First inital send to ipcMain in main.js - Note that the chain must start from the renderer process to the main process - Hence the first send is here
    ipcRenderer.send('setup-first-measure');
};

//For menu items from main process
ipcRenderer.on('create-measure', createMeasure);

ipcRenderer.on('save-file-as', () => {
    saveFile(true);
});

ipcRenderer.on('save-file', () => {
    saveFile(false);
});

ipcRenderer.on('open-file', () => {
    //TODO: Add savecheck
    reset();
    openFile();
});

ipcRenderer.on('invoke-create-new-window', () => {

    //Creates a new window in the main process so that the new window is not contained within this renderer process
    /*Note that this differs from using remote BrowserWindow which creates a BrowserWindow instance in the main process and 
    returns it to this renderer process */
    ipcRenderer.send('create-new-window');
});

ipcRenderer.on('exit', () => {
    let currentWindow = remote.getCurrentWindow();
    alert(currentWindow);
    currentWindow.close();
});

ipcRenderer.on('new', () => {
    //TODO: Add savecheck
    reset();
    createMeasure();
});