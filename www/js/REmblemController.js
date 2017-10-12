var REmblemController = function(){
    window.addEventListener('load', this.init);
    this.model = {};
    this.lastFactorChanged = null;
    this.lastChartVariableRequest = null;

    for(i in this){
        if(typeof(this[i]) == 'function'){
            this[i] = this[i].bind(this);
        }
    }
}

REmblemController.prototype.init = function(){
    this.loginElement = document.querySelector('login-element');
    this.loadModelElement = document.querySelector('load-model');
    this.selectModelVariableElement = document.querySelector('select-model-variable');
    this.modelFactorListElement = document.querySelector('model-factor-list');
    this.modelChartElement = document.querySelector('model-chart');
    this.modelSummaryElement = document.querySelector('model-summary');
    this.editGroupingElement = document.querySelector('edit-grouping');
    this.fitModelButton = document.querySelector('#fit-model');
    this.fitModelSpinner = document.querySelector('#fit-model-spinner');

    this.loginElement.hide();
    this.loadModelElement.show();
    this.selectModelVariableElement.hide();
    this.modelFactorListElement.hide();
    this.modelChartElement.hide();
    this.modelSummaryElement.hide();
    this.fitModelButton.style.display = 'none';
    this.fitModelSpinner.style.display = 'none';
}

/* Request list of models and datasets */
REmblemController.prototype.login = function(email, password){
    if(Shiny.onInputChange){
        Shiny.onInputChange('login', JSON.stringify({'email': email, 'password': password}));
    }else{
        setTimeout(this.login.bind(this), 100);
    }
}

REmblemController.prototype.onLoginResponse = function(loggedIn){
    console.log("onLoginResponse", loggedIn);
    if(loggedIn){
        this.requestLists();
    }else{
        console.log('not logged in');
        /* TODO: handle incorrect login details */
    }
}

/* Request list of models and datasets */
REmblemController.prototype.requestLists = function(){
    Shiny.onInputChange('request_models', '');
    Shiny.onInputChange('request_datasets', '');
    this.loginElement.hide();
    this.loadModelElement.show();
}

/* Pass the list of models to the <list-model> element */
REmblemController.prototype.onListModelResponse = function(models){
    console.log("onListModelResponse", models);
    this.loadModelElement.setModelList(models);
}

/* Pass the list of datasets to the <list-model> element */
REmblemController.prototype.onListDatasetsResponse = function(datasets){
    console.log("onListDatasetsResponse", datasets);
    this.loadModelElement.setDatasetList(datasets);
}

REmblemController.prototype.onSetDatasetResponse = function(dataset){
    dataset = dataset.toString();
    console.log("onSetDatasetResponse", dataset);
    console.log(dataset);
    this.loadModelElement.setDataset(dataset);
}

/* Send the selected saved model to the server to load */
REmblemController.prototype.onLoadModelClicked = function(model){
    Shiny.onInputChange('load_model', JSON.stringify({'model': model}));
}

/* Send the dataset, distribution, and link function to the server to build the model */
REmblemController.prototype.onCreateModelClicked = function(dataset, distribution, link){
    Shiny.onInputChange('create_model', JSON.stringify({'dataset': dataset, 'distribution': distribution, 'link': link}));
}

/* Pass the list of variables to the <select-model-variable> element */
REmblemController.prototype.onListDataVariablesResponse = function(variableList){
    console.log('onListDataVariablesResponse', variableList);
    if(variableList == null){
        console.log('Dataset doesn\'t exist');
        return;
    }
    this.selectModelVariableElement.setVariableList(variableList);
    this.loadModelElement.hide();
    this.selectModelVariableElement.show();
}

/* Send the selected model variable to the server */
REmblemController.prototype.onSelectVariableClicked = function(variable){
    console.log(variable);
    Shiny.onInputChange('select_model_variable', JSON.stringify({'variable': variable}));
}

REmblemController.prototype.onSelectModelVariableResponse = function(model){
    this.model = model;

    this.loadModelElement.hide();
    this.selectModelVariableElement.hide();
    this.modelFactorListElement.setModel(model);
    this.modelFactorListElement.show();
    this.modelChartElement.show();
    this.modelSummaryElement.show();
    this.fitModelButton.style.display = '';
    console.log(model);
}

REmblemController.prototype.onLoadModelResponse = function(model){
    this.model = model;

    this.loadModelElement.hide();
    this.selectModelVariableElement.hide();
    this.modelFactorListElement.setModel(model);
    this.modelFactorListElement.show();
    this.modelChartElement.show();
    this.modelSummaryElement.show();
    this.fitModelButton.style.display = '';
    console.log(model);
}

REmblemController.prototype.onChangeFactor = function(factor, subfactor){
    Shiny.onInputChange('change_factor', JSON.stringify({'factor_name': factor, 'sub_factor_name': subfactor.name, 'factor': [subfactor]}));
    this.lastFactorChanged = factor;
    console.log(subfactor);
    console.log(this.model);
}

REmblemController.prototype.onFitModelClicked = function(){
    Shiny.onInputChange('fit_model', Math.random());
    remblemController.fitModelSpinner.style.display = '';
    remblemController.fitModelButton.disabled = true;
}

REmblemController.prototype.onFitResponse = function(success){
    this.fitModelSpinner.style.display = 'none';
    this.fitModelButton.disabled = false;
    if(success){
        console.log('on fit');
        Shiny.onInputChange('request_chart', JSON.stringify({'chart_variable': this.lastFactorChanged, 'r': Math.random()}));
        this.requestModelSummary();
    }else{
        console.log('on fit failed');
    }
}

REmblemController.prototype.onRequestChartClicked = function(variable){
    Shiny.onInputChange('request_chart', JSON.stringify({'chart_variable': variable, 'r': Math.random()}));
    this.lastChartVariableRequest = variable;
}

REmblemController.prototype.onRequestChartResponse = function(chartData){
    console.log(chartData);
    var chartDataObj = {
		'levels': [],
		'observed': [],
		'fitted': [],
		'predictor': [],
        'lower': [],
        'upper': [],
		'volume': []
	};
	for(var i = 0; i < chartData.length; i++){
		chartDataObj['levels'][i] = chartData[i]['levels'];
		chartDataObj['observed'][i] = chartData[i]['observed'];
		chartDataObj['fitted'][i] = chartData[i]['fitted'];
		chartDataObj['predictor'][i] = chartData[i]['predictor'];
        chartDataObj['lower'][i] = chartData[i]['lower'];
        chartDataObj['upper'][i] = chartData[i]['upper'];
		chartDataObj['volume'][i] = chartData[i]['volume'];
	}
    this.modelChartElement.setChartData(this.lastChartVariableRequest, chartDataObj);
}

REmblemController.prototype.onCreateNewGroupClicked = function(factor){
    var mapping = [];
    for(var i in factor.levels){
        mapping.push([factor.levels[i], 0]);
    }
    console.log(mapping);
    this.editGroupingElement.factor = factor.name;
    this.editGroupingElement.factor_name = ModelUtils.createUniqueFactorName(this.model, factor.name);
    this.editGroupingElement.setData(mapping);
    this.editGroupingElement.show();
}

REmblemController.prototype.onSaveFactorClicked = function(factor, subFactorName, mapping, type){
    console.log(factor);
    console.log(subFactorName);
    console.log(mapping);

    this.model[factor].factors.push({'in_model': true, 'mapping': mapping, 'name': subFactorName, 'type': type});
    this.modelFactorListElement.setModel(this.model);

    Shiny.onInputChange('change_factor', JSON.stringify({'factor_name': factor, 'sub_factor_name': subFactorName,
            'factor': [{'in_model': true, 'mapping': mapping, 'name': subFactorName, 'type': type}]}));
}

REmblemController.prototype.onDownloadModelDescClicked = function(){
    this.requestModelDesc();
}

REmblemController.prototype.requestModelDesc = function(){
    Shiny.onInputChange('request_model_desc', Math.random());
}

REmblemController.prototype.onRequestModelDescResponse = function(modelDescription){
    console.log(modelDescription);

    var a = document.createElement('a');
    a.href = 'data:attachment/json,' +  encodeURIComponent(JSON.stringify(modelDescription, null, 4));
    a.target = '_blank';
    a.download = 'model_description.json';

    document.body.appendChild(a);
    a.click();
}

REmblemController.prototype.onDownloadModelClicked = function(){
    this.requestModel();
}

REmblemController.prototype.requestModel = function(){
    Shiny.onInputChange('request_model', Math.random());
}

REmblemController.prototype.onRequestModelResponse = function(model){
    // console.log(model);

    var blob = new Blob([atob(model)], {'type': 'text/plain'});

    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); //'data:attachment/plain,' +  encodeURIComponent(model);
    a.target = '_blank';
    a.download = 'model.txt';

    document.body.appendChild(a);
    a.click();
}

REmblemController.prototype.onRequestModelSummaryClicked = function(){
    this.requestModelSummary();
}

REmblemController.prototype.requestModelSummary = function(){
    Shiny.onInputChange('request_model_summary', Math.random());
}

REmblemController.prototype.onRequestModelSummaryResponse = function(modelSummary){
    console.log(atob(modelSummary));

    this.modelSummaryElement.summary = atob(modelSummary);
}
