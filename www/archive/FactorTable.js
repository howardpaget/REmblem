var FactorTable = function(element, factor_name, levels, mapping, callback, model){
    this.dom = null;
    this.element = element;
    this.factor_name = factor_name;
    this.levels = levels;
    this.mapping = mapping;
    this.callback = callback;
    this.model = model;

    this.factorNameInput = null;
    this.hot = null;
    this.finishedButton = null;

    this.init()
}

FactorTable.prototype.init = function(){
    var data = [['Level', 'Group']];

    for(var i = 0; i < this.levels.length; i++){
        if(Array.isArray(this.levels[i])){
            data.push(this.levels[i]);
        }else{
            data.push([this.levels[i], '0']);
        }
    }

    var container = this.element;
    container.innerHTML = '';

    this.factorNameInput = document.createElement('input');
    this.factorNameInput.type = 'text';
    this.factorNameInput.value = this.factor_name;

    this.finishedButton = document.createElement('input');
    this.finishedButton.type = 'button';
    this.finishedButton.value = 'Create factor';
    this.finishedButton.addEventListener('click', this.onFinishedClicked.bind(this));

    this.cancelButton = document.createElement('input');
    this.cancelButton.type = 'button';
    this.cancelButton.value = 'Cancel';
    this.cancelButton.addEventListener('click', this.onCancelClicked.bind(this));

    this.hot = new Handsontable(container, {
        'data': data,
        'columns': [{'readOnly': true}, {'data': 1}]
    });
    container.insertBefore(this.factorNameInput, container.firstChild);
    container.appendChild(this.finishedButton);
    container.appendChild(this.cancelButton);
}

FactorTable.prototype.onFinishedClicked = function(event){
    console.log(this.model);
    if(!modelContainsFactor(this.model, this.factorNameInput.value)){
        var data = this.hot.getData();
        data.splice(0, 1);
        this.callback(this.factorNameInput.value, data);
        this.element.innerHTML = '';
    }
}

FactorTable.prototype.onCancelClicked = function(event){
    this.element.innerHTML = '';
}
