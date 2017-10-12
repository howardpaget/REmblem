/* shinyjs can only run some js by passing a string to the web page that is evaled e.g. runjs('loadedSomeStuff(...)').
   The functions here simply map the the reponse from the shiny server to REmblemController. */

function onLoginResponse(loggedIn){
    remblemController.onLoginResponse(loggedIn);
}

function onListModelResponse(models){
    remblemController.onListModelResponse(models);
}

function onListDatasetsResponse(datasets){
    remblemController.onListDatasetsResponse(datasets);
}

function onListDataVariablesResponse(variableList){
    remblemController.onListDataVariablesResponse(variableList);
}

function onListDataVariablesResponse(variableList){
    remblemController.onListDataVariablesResponse(variableList);
}

function onSetDatasetResponse(dataset){
    remblemController.onSetDatasetResponse(dataset);
}

function onSelectModelVariableResponse(model){
    remblemController.onSelectModelVariableResponse(model);
}

function onLoadModelResponse(model){
    remblemController.onLoadModelResponse(model);
}

function onRequestChartResponse(chartData){
    remblemController.onRequestChartResponse(chartData);
}

function onFitResponse(fitSuccess){
    remblemController.onFitResponse(fitSuccess);
}

function onRequestModelDescResponse(modelDescription){
    remblemController.onRequestModelDescResponse(modelDescription);
}

function onRequestModelResponse(model){
    remblemController.onRequestModelResponse(model);
}

function onRequestModelSummaryResponse(modelSummary){
    remblemController.onRequestModelSummaryResponse(modelSummary);
}
