class Measure{

    /**
     * Creates a Measure object
     * @constructor
     * @param {Object} table Table HTML element for this Measure
     * @param {Object} tableBody HTML tbody element for this Measure
     * @param {number} measurePos Position of this measure in the entire tab composition
     */
    constructor(table, tableBody, measurePos){
        this._inputCells = [];
        this._measureTable = table;
        this._measureTableBody = tableBody;
        this._measurePos = measurePos;
    }

    /**
     * @return {array} An array of cells containing ValueCells
     */
    get inputCells(){return this._inputCells;}

    /**
     * @return {Object} Table element of this Measure
     */
    get measureTable(){return this._measureTable;}

    /**
     * @return {Object} tbody element of this Measure
     */
    get measureTableBody(){return this._measureTableBody;}

    /**
     * @return {number} Position of this measure in the tab composition 
     */
    get measurePos(){return this._measurePos;}

    /**
     * @return {number} The total number of rows for every measure
     */
    static get NUM_ROWS(){return 6;}

    /**
     * @return {number} The total number of columns for every measure
     */
    static get NUM_COLS(){return 21;}
}