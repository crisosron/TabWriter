/*jshint esversion: 6*/
window.onload = function(){
    setupFirstMeasure();
};

const setupFirstMeasure = () => {

    let firstMeasureTableBody = document.getElementById('firstMeasureTableBody');

    let stringLabel = ['e', 'B', 'G', 'D', 'A', 'E'];

    const rows = 6;
    const columns = 21; //One row is for EADGBe label
    let colInputWidth = 20;

    //Creating firstmeasure table
    for(let rowCount=0; rowCount<rows; rowCount++){
        let newRow = firstMeasureTableBody.insertRow(rowCount);
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
            if(colCount == 0) inputElementForCol.value = stringLabel[rowCount];
            else inputElementForCol.value = '—';
            
            newTableCol.appendChild(inputElementForCol);
        }
    }

};