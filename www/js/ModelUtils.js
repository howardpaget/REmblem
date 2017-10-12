var ModelUtils = {
    'modelContainsFactor': function(model, factorName){
        for(var i in model){
            if(i == 'model_details'){
                continue;
            }
            if(i == factorName){
                return true;
            }
            for(var j in model[i].factors){
                if(model[i].factors[j].name == factorName){
                    return true;
                }
            }
        }
        return false;
    },
    'createUniqueFactorName': function(model, factorName){
        var i = 1;
        while(ModelUtils.modelContainsFactor(model, factorName + '' + i)){
            i++;
        }
        return factorName + '' + i;
    }
}
