/*jshint esversion: 6*/
const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
const app = electron.remote; //.remote is 'bridge' between main and renderer processes
const dialog = app.dialog;
const fs = require('fs'); //For file system


class TabWriterManager{
    constructor(){
        this._measures = [];
        this._bars = [];
        this._guitarStringLabels = ['e', 'B', 'G', 'D', 'A', 'E'];
        this._measureCount = 0;
        this._barCount = 0;
        this._container = document.getElementById('container');
        this._isFirstMeasure = true;
        this._valueCells = []; //Used for opening a previously saved tab composition
    }

    get measures(){return this._measures;}
    get bars(){return this._bars;}
    get guitarStringLabels(){return this._guitarStringLabels;}
    get measureCount(){return this._measureCount;}
    get barCount(){return this._barCount;}
    get container(){return this._container;}
    get isFirstMeasure(){return this._isFirstMeasure;}
    get valueCells(){return this._valueCells;}
    
    set measureCount(val){this._measureCount = val;}    
    set barCount(val){this._barCount = val;}
    set isFirstMeasure(val){this._isFirstMeasure = val;}

    createBar(){
        let newBarDiv = document.createElement('div');
        newBarDiv.id = `bar${tabWriterManager.barCount}`;
        newBarDiv.style.marginBottom = '30px';

        //Changing barCount or not for zero indexing consistency with arrays
        if(tabWriterManager.isFirstMeasure) tabWriterManager.isFirstMeasure = false; //No increment if first measure for proper zero indexing
        else tabWriterManager.barCount += 1;

        let newBar = new Bar(newBarDiv);
        tabWriterManager.bars.push(newBar);
        container.appendChild(newBarDiv);

        //TODO: Crete a new measure with the new bar this.createMeasure();
    }

    createMeasure(){

        //Creating table and table body to hold the measure
        let newTable = document.createElement('table');
        let newTableBody = document.createElement('tbody');
        newTable.id = `measure${tabWriterManager.measureCount}`;
        newTable.style.display = 'inline';
        newTableBody.id = `measure${tabWriterManager.measureCount}body`;

        //Variables for rows and cols and width of cells in measure table
        const rows = 6;
        const columns = 21;
        let colInputWidth = 20;

        //Creating new Measure object for the current bar
        let newMeasure = new Measure(newTable, newTableBody, tabWriterManager.barCount);

        //Creating rows and columns and inputs within each table cell
        for(let rowCount=0; rowCount<rows; rowCount++){
            let newRow = newTableBody.insertRow(rowCount);
            for (let colCount=0; colCount<columns; colCount++){
    
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
                else inputElementForCol.value = '—';
                
                newMeasure.inputCells.push(inputElementForCol);
                newTableCol.appendChild(inputElementForCol);
            }
        }

        //Changing measureCount or not for zero indexing consistency with arrays
        if(tabWriterManager.isFirstMeasure) tabWriterManager.isFirstMeasure = false; //No increment if first measure for proper zero indexing
        else tabWriterManager.measureCount += 1;
        
        let currentBar = tabWriterManager.bars[tabWriterManager.barCount];
        currentBar.barDiv.appendChild(newTable);
        currentBar.measuresWithinBar.push(newMeasure);
        newTable.appendChild(newTableBody);
    }

    saveFile(){
        let measureArrays = [];
        let numBarsToSave = 0; //Controls which bar to load measure into when loading a file (see coordinate system)
        tabWriterManager.bars.forEach(bar => {

            numBarsToSave++;

            bar.measuresWithinBar.forEach(measure => {
                //Array of arrays - Represents ONE measure - Inner arrays are rows of cells (so there should be 6 other arrays in here)
                let measureArray = [];

                let table = measure.measureTable;
                let totalRowsPerMeasure = 6;
                let totalColsPerMeasure = 21;

                //Getting data cells
                for(let i=0; i<totalRowsPerMeasure; i++){
                    let rowInIteration = table.rows[i];
                    let rowInputCellsArray = [];

                    for(let j=0; j<totalColsPerMeasure; j++){
                        let colInIteration = rowInIteration.cells[j];
                        let inputCell = colInIteration.childNodes[0];
                        rowInputCellsArray.push(inputCell);
                    }

                    measureArray.push(rowInputCellsArray);
                }

                measureArrays.push(measureArray);
            });
        });

        //Save as dialog
        dialog.showSaveDialog(fileName => {
            if(fileName === undefined) { //If save is canceled or not a valid filename
                alert('No file selected - Cancelling save');
                return;
            }

            let contentToWrite = `Number of bars: ${numBarsToSave}\n`;
            
            /*Coordinate system for writing details to file
             measureInBar:row:col:val*/

             //TODO: Make this into a seperate function with a measureArray and contentToWrite as parameters
            //Looping through measures
            for(let i=0; i<measureArrays.length; i++){
                let measureArray = measureArrays[i];

                for(let j=0; j<measureArray.length; j++){
                    let measureRow = measureArray[j];

                    for(let k=0; k<measureRow.length; k++){
                        let value = measureRow[k].value;
                        if(value !== '—') contentToWrite += `${i}:${j}:${k}:${value} `;
                    }
                }
            }

            /*Writing contents to file - fileName argument came from callback function from
            showSaveDialog method*/
            fs.writeFile(fileName, contentToWrite, (error, fd) => { //Callback function similar to try/catch fulfillment
                if(error) {
                    alert(`Could not save file! - ${error}`);
                    return;
                }
                alert(`Saved Succssfully!`);
            });
        });
    }

    openFile(){
        dialog.showOpenDialog(fileNames => {
            if(fileNames === undefined){
                alert('No file selected');
            }else{
                fs.readFile(fileNames[0], 'utf-8', (error, data) => {
                    if(error){
                        alert(`Cannot open file -  ${error}`);
                        return;
                    }

                    //(for some reason this.processData does not work)
                    tabWriterManager.processData(data);
                    
                });
            }
        });
    }

    processData(readContents){

        //Constant variables that help navigating through the readContents parameter to get info needed to create the tab
        const INDEX_OF_NUM_BARS_TO_CREATE = 16;
        const INDEX_OF_MEASURE_MODEL_START = 18;

        const numBarsToCreate = parseInt(readContents[INDEX_OF_NUM_BARS_TO_CREATE]);
        let separatorIndicator = 0;

        //For creating a ValueCell object
        let valueCellHomeBar = 0;
        let valueCellRowVal = 0;
        let valueCellColVal = 0;
        let valueCellHeldValue = 0;

        for(let i=INDEX_OF_MEASURE_MODEL_START; i<readContents.length; i++){
            let val = readContents[i];
            if(val === ':') continue;
            if(val === ' ') { //Space separates different value cells
                let newValueCell = new ValueCell(valueCellHomeBar, valueCellRowVal, valueCellColVal, valueCellHeldValue);
                tabWriterManager.valueCells.push(newValueCell);
                separatorIndicator = 0;
            }
            else{

                //Switch statement to determine what the current value represents in relation to the value cell
                switch(separatorIndicator){
                    case 0: valueCellHomeBar = val; break;
                    case 1: valueCellRowVal = val; break;
                    case 2: valueCellColVal = val; break;
                    case 3: valueCellHeldValue = val; break;
                }

                separatorIndicator++;
            }
        }

        tabWriterManager.valueCells.forEach(valueCell => {
            console.log(`${valueCell.homeBar}:${valueCell.rowVal}:${valueCell.colVal}:${valueCell.heldValue} \n`);
            //console.log(valueCell);
        });
    }
}

class Bar{
    constructor(barDiv){
        this._measuresWithinBar = [];
        this._barDiv = barDiv;
    }

    get measuresWithinBar(){return this._measuresWithinBar;}
    get barDiv(){return this._barDiv;}
}

class Measure{
    constructor(table, tableBody, homeBarNum){
        this._inputCells = [];
        this._measureTable = table;
        this._measureTableBody = tableBody;
        this._homeBar = homeBarNum;
    }

    get inputCells(){return this._inputCells;}
    get measureTable(){return this._measureTable;}
    get measureTableBody(){return this._measureTableBody;}
    get homeBarNum(){return this._homeBar;}
}

//Used primarily for opening a file (see processData method on TabWriterManager class)
class ValueCell {
    constructor(homeBar, rowVal, colVal, heldValue){
        this._homeBar = homeBar;
        this._rowVal = rowVal;
        this._colVal = colVal;
        this._heldValue = heldValue;
    }

    get homeBar(){return this._homeBar;}
    get rowVal(){return this._rowVal;}
    get colVal(){return this._colVal;}
    get heldValue(){return this._heldValue;}
}

let tabWriterManager = new TabWriterManager();

window.onload = () => {

    //First inital send to ipcMain in main.js - Note that the chain must start from the renderer process to the main process - Hence the first send is here
    ipcRenderer.send('setup-first-bar-and-measure');
};

//Correlated with first inital send to ipcMain - ipcMain will reply by sending a request to this channel
ipcRenderer.on('create-first-bar-and-measure', function(event){
    tabWriterManager.createBar();
    tabWriterManager.createMeasure();
    console.log('Created first bar and measure');
});

ipcRenderer.on('create-bar', tabWriterManager.createBar);
ipcRenderer.on('create-measure', tabWriterManager.createMeasure);
ipcRenderer.on('save-file', tabWriterManager.saveFile);
ipcRenderer.on('open-file', tabWriterManager.openFile);