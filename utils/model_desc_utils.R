update_model <- function(model, change_desc){
    factor_name <- change_desc$factor_name
    
    if(change_desc$factor$type == 'simple'){
        simple_factor_index <- get_index_of_simple_factor(model[[factor_name]]$factors)
        
        model[[factor_name]]$factors$in_model[simple_factor_index] = change_desc$factor$in_model
    }else{
        sub_factor_name <- change_desc$sub_factor_name
        
        factor_index <- get_index_of_factor_by_name(sub_factor_name, model[[factor_name]]$factors)
        
        if(factor_index == -1){
            factor_index <- nrow(model[[factor_name]]$factors) + 1
            
            model[[factor_name]]$factors <- rbind(model[[factor_name]]$factors, change_desc$factor)
        }else{
            model[[factor_name]]$factors$name[factor_index] = change_desc$factor$name
            model[[factor_name]]$factors$in_model[factor_index] = change_desc$factor$in_model
            model[[factor_name]]$factors$mapping[[factor_index]] = change_desc$factor$mapping
        }
    }
    return(model)
}

create_model_from_data <- function(dataset, data, modelled_variable, distribution, link){
    result = list("model_details" = list("dataset" = dataset, "modelled_variable" = modelled_variable, "distribution" = distribution, "link" = link))
    for(factor_name in names(data)){
        if(factor_name != modelled_variable){
            j <- jsonlite::fromJSON("[{\"type\": \"simple\", \"name\": \"\", \"in_model\": false, \"mapping\": [[0, 0]]}]")
            
            f <- list(levels = levels(as.factor(data[[factor_name]])), factors = j)
            if(length(f$levels) < 200 && length(f$levels) < nrow(data)){
                result[[factor_name]] <- f
            }
        }
    }
    return(result)
}

get_int_term <- function(factor_name, order){
    if(order == 1){
        return(factor_name)
    }
    return(paste("I(", paste(rep.int(factor_name, order), collapse =" * "), ")", sep=""))
}

create_model_formula <- function(model){
    var_list = list()
    print(model)
    for(factor_name in names(model)){
        if(factor_name != "model_details"){

            for(i in 1:nrow(model[[factor_name]]$factors)){
                if(model[[factor_name]]$factors$in_model[i]){

                    if(model[[factor_name]]$factors$type[i] == "simple"){
                        var_list[length(var_list) + 1] = paste('factor(', factor_name, ")", sep="")
                    } else if(model[[factor_name]]$factors$type[i] == "grouped"){
                        var_list[length(var_list) + 1] = paste('factor(', model[[factor_name]]$factors$name[i], ")", sep="")
                    }else{
                        for(degree in 1:model[[factor_name]]$factors$order[[i]]){
                            var_list[length(var_list) + 1] = get_int_term(model[[factor_name]]$factors$name[[i]], degree)
                        }
                    }
                }
            }
        }
    }
    
    if(length(var_list) == 0){
        return(NULL)
    }
    
    return(paste(model$model_details$modelled_variable, ' ~ ', paste(var_list, collapse=" + ")))
}

get_index_of_simple_factor <- function(factors){
    for(i in 1:nrow(factors)){
        if(!is.na(factors$type[i]) && factors$type[i] == 'simple'){
            return(i)
        }
    }
}

get_index_of_factor_by_name <- function(factor_name, factors){
    if(length(factors) == 0){
        return(-1)
    }
    for(i in 1:nrow(factors)){
        print(factors$name[i])
        print(factor_name)
        if(!is.null(factors$name[i]) && factors$name[i] == factor_name){
            return(i)
        }
    }
    return(-1)
}

apply_mapping <- function(a, mapping){
    if(is.na(a)){
        return(a)
    }
    for(i in 1:nrow(mapping)){
        if(mapping[i, 1] == a){
            return(mapping[i, 2])
        }
    }
}

apply_all_model_mappings <- function(data, model){
    for(factor_name in names(model)){
        if(factor_name != "modelled_variable"){
            if(length(model[[factor_name]]$factors) > 0){
                for(i in 1:nrow(model[[factor_name]]$factors)){
                    if(model[[factor_name]]$factors$type[[i]] != 'simple'){
                        data[[model[[factor_name]]$factors$name[[i]]]] <- sapply(data[[factor_name]], apply_mapping, mapping=model[[factor_name]]$factors$mapping[[i]])
                    }
                }
            }
        }
    }
    return(data)
}