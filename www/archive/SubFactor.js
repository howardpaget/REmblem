var SubFactor = function(factor_name, sub_factor_name, sub_factor, levels){
    this.dom = null;
    this.factor_name = factor_name;
    this.sub_factor_name = sub_factor_name;
    this.sub_factor = sub_factor;
    this.levels = levels;
    this.init(sub_factor)
    this.listeners = [];
}

SubFactor.prototype.init = function(sub_factor) {
    this.dom = document.createElement('li');

    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = sub_factor.in_model;
    checkbox.style = 'margin-right: 5px'
    this.dom.appendChild(checkbox);

    checkbox.addEventListener('change', this.onCheckboxChange.bind(this));

    var span = document.createElement('span');
    if(sub_factor.type == 'simple'){
        span.innerText = 'Simple Factor';
    }else{
        span.innerText = (sub_factor.type == 'grouped' ? 'G: ' : 'V: ') + sub_factor.name;
    }
    this.dom.appendChild(span);

    if(sub_factor.type != 'simple'){
        var editButton = document.createElement('a');
        editButton.className = 'factor-button';
        editButton.innerText = 'Edit';
        editButton.addEventListener('click', this.onClickEditButton.bind(this));
        this.dom.appendChild(editButton);
    }
}

SubFactor.prototype.getDom = function(){
    return this.dom;
}

SubFactor.prototype.onCheckboxChange = function(event){
    console.log(event.target.checked);
    console.log(this);
    this.sub_factor.in_model = event.target.checked;
    this.triggerChangeEvent();
}

SubFactor.prototype.addEventListener = function (event, listener) {
    this.listeners.push(listener);
}

SubFactor.prototype.triggerChangeEvent = function(){
    for(var i in this.listeners){
        this.listeners[i](this.sub_factor);
    }
    if(this.sub_factor.type == 'simple'){
        Shiny.onInputChange('changedfactor', JSON.stringify({'factor_name': this.factor_name, 'factor': this.sub_factor}));
    }else{
        Shiny.onInputChange('changedfactor', JSON.stringify({'factor_name': this.factor_name, 'sub_factor_name': this.sub_factor_name, 'factor': [this.sub_factor]}));
    }
}

SubFactor.prototype.onClickEditButton = function(event){
    console.log('Add new variate');
    var element = document.getElementById('example');
    element.innerHTML = '';
    console.log(this);
    var factorTable = new FactorTable(element, this.factor_name, this.sub_factor.mapping, null, this.onEditedFactor.bind(this), this.model);
    event.stopPropagation();
}

SubFactor.prototype.onEditedFactor = function(sub_factor_name, mapping){
    console.log(sub_factor_name, mapping);
}
