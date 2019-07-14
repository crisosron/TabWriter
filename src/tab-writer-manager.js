class TabWriterManager{

    /**
     * Creates a TabWriterManager object
     * @constructor
     */
    constructor(){
        this._measures = [];
        this._guitarStringLabels = ['e', 'B', 'G', 'D', 'A', 'E'];
        this._measureCount = 0;
        this._container = document.getElementById('container');
        this._isFirstMeasure = true;
        this._valueCells = []; //Used for opening a previously saved tab composition
        //this._MEASURE_NUM_ROWS = 6;
        //this._MEASURE_NUM_COLS = 21;
        this._scoreTitleInput = document.getElementById('scoreTitleInput');
        this._scoreInfoTextArea = document.getElementById('tabInfoTextArea');
        this._fileName = null;
    }

    /**
     * @return {array} An array of Measure objects
     */
    get measures(){return this._measures;}

    /**
     * @return {array} An array of strings with guitar string letters
     */
    get guitarStringLabels(){return this._guitarStringLabels;}

    /**
     * @return {number} The total number of measures so far
     */
    get measureCount(){return this._measureCount;}

    /**
     * @return {Object} The container div for this TabWriterManager
     */
    get container(){return this._container;}

    /**
     * @return {boolean} A boolean indicating if there are no measures yet
     */
    get isFirstMeasure(){return this._isFirstMeasure;}

    /**
     * @return {boolean} An array of ValueCell objects
     */
    get valueCells(){return this._valueCells;}
    
    /**
     * @return {Object} Input element for the title of the composition
     */
    get scoreTitleInput(){return this._scoreTitleInput;}

    /**
     * @return {Object} Input element for info about the composition
     */
    get scoreInfoTextArea(){return this._scoreInfoTextArea;}

    /**
     * @return {string} The name of the opened file
     */
    get fileName(){return this._fileName;}
    
    /**
     * @param {number} val The new measure count value
     */
    set measureCount(val){this._measureCount = val;}
    
    /**
     * Note that isFirstMeasure should only be set once for every TabWriterManager instance
     * @param {boolean} val Boolean indicating that the first measure has been created
     */
    set isFirstMeasure(val){this._isFirstMeasure = val;}

    /**
     * @param {array} val An array of Measure objects
     */
    set measures(val){this._measures = val;}

    /**
     * @param {array} val An array of ValueCell objects
     */
    set valueCells(val){this._valueCells = val;}

    /**
     * @param {string} val The filename to set for the tab composition
     */
    set fileName(val){this._fileName = val;}

    /**
     * @return {number} The total number of rows for every measure
     */
    static get MEASURE_NUM_ROWS(){return 6;}

    /**
     * @return {number} The total number of columns for every measure
     */
    static get MEASURE_NUM_COLS(){return 21;}
}