/*******************************************************************************************
 * @ Name : Pivot table generator
 * @ Author : Abbas Hosseini & Mohammad Feiz
 * @ Description : Generate a pivote table with pure (html5/js)
 * @ Version : 1.0.0
 * @ Last update : Thursday - 2018 08 February
 ******************************************************************************************/

/*
چند نکته مهم درباره این ماتژول 
اول باید برگ بودن رو به ازای هر نود مشخص کنیم برای این کار کافیه نود هایی که هیچ جا به عنوان پدر بهشون اشاره نشده پیدا کنیم
دوم باید بگیم هر برگ به کدوم پدر اشاره میکنه مثلا اگر دو برگ به یک پدر اشاره کرد اسپن اون پدر میشه دو
مرحله سوم رندره دقت کنید که به ازای هر برگ یک ردیف داریم
*/



function pivot() {
    this.model = [];
    this.container = null;''
    this.sortedModel = [];
    this.usedIds = []
}
pivot.prototype = {
    init: function (conf) {
        var self = this;
        this.container = conf.container;
        this.sort(conf.dataSource);
        this.model = this.sortedModel;
        this.leafs = this.findLeafs( this.model);
        this.findSpanValues( this.model, this.leafs);
        this.generateHtml( this.model, this.leafs);
    },
    /** 
     * @param {Object} 
     * @returns {Object} - return a copy of object
     * @description - when using deep copy memeory address of properties will be changed
     **/
    deepCopy: function (obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    /** 
     * @param {Array} - vm is main model
     * @param {String} - parentId is target parentId for node
     * @returns {Nothing} 
     * @description - sor model from root to leafs
     * @tip - find all child of any root and push in sortedArray then next root
     **/
    sort: function (vm, parentId) {
        var parentId = parentId || '#';
        for (var i = 0; i < vm.length; i++) {
            if (vm[i].parentId === parentId) {
                this.sortedModel.push(vm[i]);
                this.sort(vm, vm[i].id);
            }
        }
    },
    /** 
     * @param {Array} - vm is main model
     * @param {Object} - node is a item of main model
     * @returns {Boolean} 
     * @description - check that node is leaf or not
     * @tip - imagine all node are leaf unless be a parent
     **/
    isLeaf : function(vm, node){
        var isLeaf = true;
        for (i = 0; i < vm.length; i++) {
            if (vm[i].parentId == node.id) {
                isLeaf = false;
                break;
            }
        }
        return isLeaf;
    },
    /** 
     * @param {Array} - vm is main model
     * @returns {Nothing} 
     * @description - for finding leafs in tree looking for nodes that not parent 
    * @tip - imagine all node are leaf unless be a parent
     **/
    findLeafs: function (vm) {
        var vm = this.deepCopy(vm),
        self = this;
        return vm.filter(function(node){
            return (self.isLeaf(vm, node) == true)
        })
    },
    /** 
     * @param {Array} - vm is main model
     * @param {String} - id is parentId of leaf
     * @returns {Object} 
     * @description - find a node by id
     **/
    getParent: function (vm, id) {
        for (var i = 0; i < vm.length; i++) {
            if (vm[i].id == id) {
                return vm[i];
                break;
            }
        }
    },
    /** 
     * @param {Array}  - vm is main model
     * @param {Object}  - node is a leaf node
     * @returns {Nothing} 
     * @description - any time refer to parent (rowspan/colspan) increase one
     **/
    defineSpan: function (vm, node) {             
        node.span = 1;
        while (node.parentId != '#') {
            node = this.getParent(vm, node.parentId);
            if (node.span == undefined) {
                node.span = 1
            } else {
                node.span++;
            }
        }  
    },
    /** 
     * @param {Array} - vm is main model
     * @param {Array} - leafs is leafs of main model
     * @returns {Object} 
     * @description - traversing model with custom functionality
     **/
    findSpanValues: function (vm, leafs) {
        var self = this;
        leafs.forEach(function (node) {
            self.defineSpan(vm, node);
        });
    },
    /** 
     * @param {Array}  - vm is main model
     * @param {Object} - node is a leaf node
     * @returns {Nothing} 
     * @description - generate a tr tag with tds
     * */
    defineRow : function(vm , node){
        var tds = [];
        var str = '';
        str += '<tr>';
        //برگ رو قرار میدیم
        tds.push(node)
        //یک ردیف از برگ تا همه پدر ریشه تشکیل میدیم
        while (node.parentId != '#') {
            node = this.getParent(vm, node.parentId);
            if (this.usedIds.indexOf(node.id) === -1) {
                this.usedIds.push(node.id);
                tds.push(node);
            }
        }
        // چون از برگ شروع کردیم باید معکوش کنیم تا  زریشه به برگ بتونیم بچینیم
        tds.reverse();
        tds.forEach(function (td) {
            str += '<td rowspan="' + td.span + '">' + td.title+ '</td>';
        })
        str += '</tr>';
        return str;
    },
    /** 
     * @param {Array}  - vm is main model
     * @param {Array}  - leafs is leafs of main model
     * @returns {Nothing} 
     * @description - generate a table html and render in dom
     * */
    generateHtml: function (vm, leafs) {
        var str = '';
        this.usedIds = []
        var self = this;
        leafs.forEach(function (node) {
            str += self.defineRow(vm , node)    
        });
        var dom = document.querySelector(this.container);
        dom.innerHTML = str;

    }
}





var table = new pivot();
table.init({
    dataSource : pivot_model,
    container : '#my-pivot'
});