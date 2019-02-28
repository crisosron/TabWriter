/*jshint esversion: 6*/
const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
const app = electron.remote; //.remote is 'bridge' between main and renderer processes
const dialog = app.dialog;
const fs = require('fs'); //For file system

//TODO: Make margin bottom for tables
//TODO: Test save and open functionality after the removal of bars
//TODO: Overhaul save functionality?
//TODO: Fix open file processing to handle double digits - split string by :?

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
    
    set measureCount(val){this._measureCount = val;}    
    set isFirstMeasure(val){this._isFirstMeasure = val;}
    set measures(val){this._measures = val;}
    set valueCells(val){this._valueCells = val;}

    /*
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

    }
    */

    createMeasure(){

        //Creating table and table body to hold the measure
        let newTable = document.createElement('table');
        let newTableBody = document.createElement('tbody');
        let newDiv = document.createElement('div');
        newDiv.style.marginBottom = '300px';
        newDiv.style.height = '500px';
        newDiv.style.display = 'inline';
        newTable.id = `measure${tabWriterManager.measureCount}`;
        newTable.style.display = 'inline';
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
                else inputElementForCol.value = '—';
                
                newMeasure.inputCells.push(inputElementForCol);
                newTableCol.appendChild(inputElementForCol);
            }
        }
        
        //Making the table and the input cells appear on the application
        newTable.appendChild(newTableBody);
        newDiv.appendChild(newTable);
        container.appendChild(newDiv);

        return newMeasure;
    }

    reset(){
        tabWriterManager.isFirstMeasure = true;
        tabWriterManager.measureCount = 0;
        tabWriterManager.valueCells = [];
        tabWriterManager.measures = [];
    }

    saveFile(){
        
        let measureArrays = [];
        let allMeasures = tabWriterManager.measures;
        console.log(allMeasures);

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
        

        //Save as dialog
        dialog.showSaveDialog(fileName => {
            if(fileName === undefined) { //If save is canceled or not a valid filename
                alert('No file selected - Cancelling save');
                return;
            }

            let contentToWrite = '';
            
            /*Coordinate system for writing details to file
             positionOfMeasure:row:col:val*/

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

        //Constant variable that help navigating through the readContents parameter to get info needed to create the tab composition
        const INDEX_OF_MEASURE_MODEL_START = 0;

        let infoAsString = '';
        let infoStringArray = [];

        //Going through readContents and processing contents to create valueCell objects
        for(let i=INDEX_OF_MEASURE_MODEL_START; i<readContents.length; i++){
            if(readContents[i] != ' ') infoAsString += readContents[i];
            else {
                infoStringArray = infoAsString.split(':');
                console.log(infoStringArray);
                let newValueCell = new ValueCell(infoStringArray[0], infoStringArray[1], infoStringArray[2], infoStringArray[3]);
                tabWriterManager.valueCells.push(newValueCell);
                infoAsString = '';
                infoStringArray = [];

            }
        }
        
        tabWriterManager.createOpenedTabComposition();
    }

    createOpenedTabComposition(){
        let valueCells = tabWriterManager.valueCells;
        let maxNumMeasures = 0;

        //Creating measures
        valueCells.forEach(valueCell => {
            let measurePos = parseInt(valueCell.positionOfMeasure);
            if(measurePos > maxNumMeasures) maxNumMeasures = measurePos;
        });

        let measuresToCreate = maxNumMeasures + 1; //+1 because measurePos is zero indexed

        for(let i=0; i<measuresToCreate; i++){
            tabWriterManager.createMeasure();
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
}

/*
class Bar{
    constructor(barDiv){
        this._measuresWithinBar = [];
        this._barDiv = barDiv;
    }

    get measuresWithinBar(){return this._measuresWithinBar;}
    get barDiv(){return this._barDiv;}
}
*/

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

let tabWriterManager = new TabWriterManager();

window.onload = () => {

    //First inital send to ipcMain in main.js - Note that the chain must start from the renderer process to the main process - Hence the first send is here
    ipcRenderer.send('setup-first-measure');
};

//Correlated with first inital send to ipcMain - ipcMain will reply by sending a request to this channel
ipcRenderer.on('create-first-measure', function(event){
    tabWriterManager.createMeasure();
    console.log('Created first bar and measure');
});

//For menu items from main process
ipcRenderer.on('create-measure', tabWriterManager.createMeasure);
ipcRenderer.on('save-file', tabWriterManager.saveFile);
ipcRenderer.on('open-file', () => {
    tabWriterManager.reset();
    tabWriterManager.openFile();
});
