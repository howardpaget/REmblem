var Factor = function(factor_name, levels, factor, model){
    this.dom = null;
    this.factor_name = factor_name;
    this.levels = levels;
    this.factor = factor;
    this.model = model;

    this.sub_factor_list = null;

    this.init(factor)
}

Factor.prototype.init = function(factor) {
    this.dom = document.createElement('li');
    this.dom.innerText = factor_name;

    var newFactorButton = document.createElement('a');
    newFactorButton.className = 'factor-button';
    newFactorButton.innerText = 'Add group';
    newFactorButton.addEventListener('click', this.onClickNewFactorButton.bind(this));
    this.dom.appendChild(newFactorButton);

    var newVariateButton = document.createElement('a');
    newVariateButton.className = 'factor-button';
    newVariateButton.innerText = 'Add variate';
    newVariateButton.addEventListener('click', this.onClickNewVariateButton.bind(this));
    this.dom.appendChild(newVariateButton);

    var chartButton = document.createElement('a');
    chartButton.className = 'factor-button';
    chartButton.innerText = 'Plot';
    chartButton.addEventListener('click', this.onClickChartButton.bind(this));
    this.dom.appendChild(chartButton);

    this.sub_factor_list = document.createElement('ul');

    for(sub_factor_name in factor){
        var sub_factor = new SubFactor(this.factor_name, sub_factor_name, factor[sub_factor_name], this.levels)
        this.sub_factor_list.appendChild(sub_factor.getDom());
    }

    this.dom.appendChild(this.sub_factor_list);
}

Factor.prototype.getDom = function(){
    return this.dom;
}

Factor.prototype.onClickNewFactorButton = function(event){
    console.log('Add new factor');
    var element = document.getElementById('example');
    element.innerHTML = '';
    var factorTable = new FactorTable(element, this.factor_name, this.levels, null, this.onDefinedFactor.bind(this), this.model);
    event.stopPropagation();
}

Factor.prototype.onClickNewVariateButton = function(event){
    console.log('Add new variate');
    var element = document.getElementById('example');
    element.innerHTML = '';
    var factorTable = new FactorTable(element, this.factor_name, this.levels, null, this.onDefinedVariate.bind(this), this.model);
    event.stopPropagation();
    event.preventDefault();
}

Factor.prototype.onClickChartButton = function(event){
    console.log('Chart factor');
    // Shiny.onInputChange('chartvariable', this.factor_name);
    Shiny.onInputChange('request_chart', this.factor_name);
    event.stopPropagation();
}


Factor.prototype.onDefinedFactor = function(sub_factor_name, mapping){
    console.log(sub_factor_name, mapping);
    var def = {
        'factor_name': this.factor_name,
        'sub_factor_name': sub_factor_name,
        'factor': [
            {'type': 'grouped', 'name': sub_factor_name, 'in_model': true, 'mapping': mapping}
        ]};

    Shiny.onInputChange('changedfactor', JSON.stringify(def));

    this.factor.push(def.factor[0]);

    var sub_factor = new SubFactor(this.factor_name, sub_factor_name, def.factor[0]);
    this.sub_factor_list.appendChild(sub_factor.getDom());

}

Factor.prototype.onDefinedVariate = function(sub_factor_name, mapping){
    console.log(sub_factor_name, mapping);
    var def = {
        'factor_name': this.factor_name,
        'sub_factor_name': sub_factor_name,
        'factor': [
            {'type': 'variate', 'name': sub_factor_name, 'in_model': true, 'mapping': mapping}
        ]};

    Shiny.onInputChange('changedfactor', JSON.stringify(def));

    this.factor.push(def.factor[0]);

    var sub_factor = new SubFactor(this.factor_name, sub_factor_name, def.factor[0]);
    this.sub_factor_list.appendChild(sub_factor.getDom());

}
