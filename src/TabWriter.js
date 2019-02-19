/*jshint esversion: 6*/
/*Notes - 
    Each measure is constructed using a table
    Each measure should be contained within a bar (which is a div)
*/
class TabWriterManager{
    constructor(){
        this._measures = [];
        this._bars = [];
        this._guitarStringLabels = ['e', 'B', 'G', 'D', 'A', 'E'];
        this._measureCount = 0;
        this._barCount = 0;
        this._container = document.getElementById('container');
        this._isFirstMeasure = true;
    }

    get measures(){return this._measures;}
    get bars(){return this._bars;}
    get guitarStringLabels(){return this._guitarStringLabels;}
    get measureCount(){return this._measureCount;}
    get barCount(){return this._barCount;}
    get container(){return this._container;}
    get isFirstMeasure(){return this._isFirstMeasure;}
    
    set measureCount(val){this._measureCount = val;}    
    set barCount(val){this._barCount = val;}
    set isFirstMeasure(val){this._isFirstMeasure = val;}

    createBar(){
        let newBarDiv = document.createElement('div');
        newBarDiv.id = `bar${tabWriterManager.barCount}`;

        //Changing barCount or not for zero indexing consistency with arrays
        if(tabWriterManager.isFirstMeasure) tabWriterManager.isFirstMeasure = false; //No increment if first measure for proper zero indexing
        else tabWriterManager.barCount += 1;

        let newBar = new Bar(newBarDiv);
        tabWriterManager.bars.push(newBar);
        container.appendChild(newBarDiv);
        alert('Created new bar');
    }

    createMeasure(){

        //Creating table and table body to hold the measure
        let newTable = document.createElement('table');
        let newTableBody = document.createElement('tbody');
        newTable.id = `measure${tabWriterManager.measureCount}`;
        newTableBody.id = `measure${tabWriterManager.measureCount}body`;

        //Variables for rows and cols and width of cells in measure table
        const rows = 6;
        const columns = 21;
        let colInputWidth = 20;

        let newMeasure = new Measure();


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
        newTable.appendChild(newTableBody);
        alert('Created new measure');
    }

}

class Measure{
    constructor(table, tableBody){
        this._inputCells = [];
        this._measureTable = table;
        this._measureTableBody = tableBody;
    }

    get inputCells(){return this._inputCells;}
    get measureTable(){return this._measureTable;}
    get measureTableBody(){return this._measureTableBody;}
}

class Bar{
    constructor(barDiv){
        this._measuresWithinBar = [];
        this._barDiv = barDiv;
    }

    get measuresWithinBar(){return this._measuresWithinBar;}
    get barDiv(){return this._barDiv;}
}

window.onload = function(){
    setupFirstMeasure();
};

const setupFirstMeasure = () => {
    tabWriterManager.createBar();
    tabWriterManager.createMeasure();

};

function rendering(){
    //TODO: Automatically fill empty input cells with an em dash (–)
}

let tabWriterManager = new TabWriterManager();
