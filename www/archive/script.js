function loadModels(modelList){
	console.log(modelList);
	document.querySelector('load-model-card').models = modelList;
}

function loadDatasets(datasetList){
	console.log(datasetList);
	document.querySelector('load-model-card').datasets = datasetList;
}

function loadingData(){
	document.getElementById('overlay').style.display = 'block';
}

function finishedLoadingData(modelVariables){
	document.getElementById('overlay').style.display = 'none';
	console.log(modelVariables);
	document.querySelector('select-model-variable').model_variables = modelVariables;

	document.querySelector('load-model-card').style.display = 'none';
	document.querySelector('select-model-variable').style.display = '';

	// document.getElementById('loaddatapage').style.display = 'none';
	// document.getElementById('modeldefpage').style.display = '';
	// document.getElementById('modellingpage').style.display = 'none';
}

function finishedModelDef(){
	document.getElementById('overlay').style.display = 'none';
	// document.getElementById('loaddatapage').style.display = 'none';
	// document.getElementById('modeldefpage').style.display = 'none';
	// document.getElementById('modellingpage').style.display = '';
}

function loadModel(s){
	console.log(s);
	var factorList = new FactorList(s);
	document.querySelector('select-model-variable').style.display = 'none';
	document.querySelector('#sidebar').appendChild(factorList.getDom());
	CollapsibleLists.apply();
}

function loadChartData(chartData){
	console.log(chartData);
	var chartDataObj = {
		'levels': [],
		'observed': [],
		'fitted': [],
		'predictor': [],
		'volume': []
	};
	for(var i = 0; i < chartData.length; i++){
		chartDataObj['levels'][i] = chartData[i]['levels'];
		chartDataObj['observed'][i] = chartData[i]['observed'];
		chartDataObj['fitted'][i] = chartData[i]['fitted'];
		chartDataObj['predictor'][i] = chartData[i]['predictor'];
		chartDataObj['volume'][i] = chartData[i]['volume'];
	}
	console.log(chartDataObj);
	document.querySelector('model-chart').set_chart_data(chartDataObj);
}

function modelContainsFactor(model, factor_name){
	for(n in model){
		if(n == 'modelled_variable'){
			continue;
		}
		if(n == factor_name){
			return true;
		}
		for(i in model[n].factors){
			if(model[n].factors[i].name == factor_name){
				return true;
			}
		}
	}
	return false;
}
