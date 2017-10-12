factor_summary <- function(model, model_desc, factor, factor_levels){
    factor_levels <- data.frame(levels = factor_levels)
    factor_levels$predictor <- 1
    factor_levels$lower <- 1
    factor_levels$upper <- 1
    
    conf <- confint(model)
    colnames(conf) <- c('Lower', 'Upper')
    
    in_sub_factors <- !(factor %in% names(model_desc))
    
    if(in_sub_factors){
        for(factor_name in names(model_desc)){
            if(factor_name != "model_details"){
                next
            }
            
            # Loop through each of the subfactors looking for the subfactor to summarise by
            for(sub_factor_index in 1:nrow(model_desc[[factor_name]]$factors)){
                
                # Check that this is the sub_factor being searched for and that it is in the model
                if(model_desc[[factor_name]]$factors$name[[sub_factor_index]] == factor && model_desc[[factor_name]]$factors$in_model[[sub_factor_index]]){
                    # This is not the subfactor you are looking for (or it's not in the model)
                    next
                }
                
                # Calculate the predictor (inverse of the link function) for each factor level and store it
                for(level_index in 1:length(factor_levels)){
                    if(paste("factor(", factor, ")", factor_levels$levels[level_index], sep="") %in% names(model$coefficients)){
                        factor_levels$predictor[level_index] <- factor_levels$predictor[level_index] * 1 / (1 + exp(model$coefficients[[paste("factor(", factor, ")", factor_levels$levels[level_index], sep="")]]))
                        
                        factor_levels$lower[[level_index]] <- factor_levels$lower[level_index] * 1 / (1 + exp(-conf$Lower[[paste("factor(", sub_factor_name, ")", level_name, sep="")]]))
                        factor_levels$upper[[level_index]] <- factor_levels$upper[level_index] * 1 / (1 + exp(-conf$Upper[[paste("factor(", sub_factor_name, ")", level_name, sep="")]]))
                    }
                }
            }
        }
    }else{
        factor_name <- factor
        
        
        for(sub_factor_index in 1:nrow(model_desc[[factor_name]]$factors)){
            if(sub_factor_name <- model_desc[[factor_name]]$factors$type[[sub_factor_index]] != "simple"){
                sub_factor_name <- model_desc[[factor_name]]$factors$name[[sub_factor_index]]
            }else{
                sub_factor_name <- factor_name
            }
            
            if(model_desc[[factor_name]]$factors$in_model[[sub_factor_index]]){
                for(level_index in 1:nrow(factor_levels)){
                    if(model_desc[[factor_name]]$factors$type[[sub_factor_index]] != "simple"){
                        level_name <- apply_mapping(factor_levels$levels[level_index], model_desc[[factor_name]]$factors$mapping[[sub_factor_index]])
                    }else{
                        level_name <- factor_levels$levels[level_index]
                    }

                    if(model_desc[[factor_name]]$factors$type[[sub_factor_index]] != "variate" && paste("factor(", sub_factor_name, ")", level_name, sep="") %in% names(model$coefficients)){
                        factor_levels$predictor[[level_index]] <- factor_levels$predictor[level_index] * 1 / (1 + exp(-model$coefficients[[paste("factor(", sub_factor_name, ")", level_name, sep="")]]))
                        
                        factor_levels$lower[[level_index]] <- factor_levels$lower[level_index] * 1 / (1 + exp(-conf[[paste("factor(", sub_factor_name, ")", level_name, sep=""), 'Lower']]))
                        factor_levels$upper[[level_index]] <- factor_levels$upper[level_index] * 1 / (1 + exp(-conf[[paste("factor(", sub_factor_name, ")", level_name, sep=""), 'Upper']]))
                        
                    }else if(model_desc[[factor_name]]$factors$type[[sub_factor_index]] == "variate"){
                        for(degree in 1:model_desc[[factor_name]]$factors$order[[sub_factor_index]]){
                            # print(get_int_term(sub_factor_name, degree))
                            factor_levels$predictor[[level_index]] <- factor_levels$predictor[level_index] * 1 / (1 + exp(-model$coefficients[[get_int_term(sub_factor_name, degree)]] * level_name ^ degree))
                        }
                    }
                }
            }
        }
    }
    
    return(factor_levels)
}


# 
# data1 <- read.csv("C:/Users/howard/Google Drive/Projects/R/REmblem/train.csv")
# 
# s <- readLines("C:/Users/howard/Google Drive/Projects/R/REmblem/model.json")
# obj <- jsonlite::fromJSON(s)
# 
# #data1[["Age1"]] <- sapply(data1[["Age"]], apply_mapping, mapping=obj$Age$factors$mapping[[2]])
# 
# data1 <- apply_all_model_mappings(data1, obj)
# 
# r = aggregate(Survived ~ Pclass, data=data1, FUN=function(x){c(mean = mean(x), n = length(x))})
# r = aggregate(Survived ~ Pclass, data=data1, mean)
# 
# #m <- glm("Survived ~ factor(Pclass) + factor(Age1) + Age + I(Age * Age)", data = data1, family = binomial(link=logit))
# 
# m <- glm(create_model_formula(obj), data = data1, family = binomial(link=logit))
# 
# age <- factor_summary(m, obj, "Age", levels(as.factor(data1$Age)))
# pclass <- factor_summary(m, obj, "Pclass", levels(as.factor(data1$Pclass)))