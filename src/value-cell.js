class ValueCell {

    /**
     * Creates a ValueCell object - This is a single cell in a measure
     * @constructor
     * @param {number} positionOfMeasure Indicates the position of the measure in the tab composition
     * @param {number} rowVal Row of this cell in the measure
     * @param {number} colVal Columns of this cell in the measure
     * @param {string} heldValue Value in this ValueCell
     */
    constructor(positionOfMeasure, rowVal, colVal, heldValue){
        this._positionOfMeasure = positionOfMeasure;
        this._rowVal = rowVal;
        this._colVal = colVal;
        this._heldValue = heldValue;
    }
    
    /**
     * @return {number} The position of the Measure object this ValueCell belongs to
     */
    get positionOfMeasure(){return this._positionOfMeasure;}

    /**
     * @return {number} Row of this ValueCell in its measure
     */
    get rowVal(){return this._rowVal;}

    /**
     * @return {number} Column of this ValueCell in its measure
     */
    get colVal(){return this._colVal;}

    /**
     * @return {string} Value in this ValueCell
     */
    get heldValue(){return this._heldValue;}
}