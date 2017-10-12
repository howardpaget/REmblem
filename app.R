## This script sets up a shiny server that responses to requests from the webapp client with can be found in the /www directory.
##
## The 3 main functions of the script are:
##
## 1. Create/load a model.
## 2. Iteratively edit and fit the model using the glm function.
## 3. Export the model either for later use or evaluation.


library(httr)
library(shiny)
library(shinyjs)
library(shinyFiles)
library(jsonlite)
library(xml2)
library(base64enc)
library(readr)

source("utils/model_desc_utils.R")
source("utils/factor_summary.R")

server <- shinyServer(function(input, output, session) {
    values <- reactiveValues(data = NULL, model = NULL, modeldescription = NULL, list_of_models = NULL, list_of_objects = NULL, bucket = NULL)
    vols <- c("Working Directory"=".", getVolumes()())
    
    shinyFileChoose(input, 'csvfiles', root=vols, filetypes=c('', 'csv'))
    shinyFileChoose(input, 'jsonfiles', root=vols, filetypes=c('', 'json'))

    # Shiny files - CSV data file
    observeEvent(input$csvfiles, {
        inFile <- parseFilePaths(roots=vols, input$csvfiles)
        csvfile <- levels(inFile$datapath)[1]
        
        runjs(paste('onSetDatasetResponse("', csvfile, '");'))
    })

    # Shiny files - JSON model file
    observeEvent(input$jsonfiles, {
        inFile <- parseFilePaths(roots=vols, input$jsonfiles)
        json <- read_file(levels(inFile$datapath)[1])
        model_desc <- jsonlite::fromJSON(json)

        if(!is.null(model_desc$dataset) && file.exists(model_desc$dataset)){
            values$data <- na.omit(read.csv(model_desc$dataset))
            values$modeldescription <- create_model_from_data(model_desc$dataset, values$data, "", model_desc$distribution, model_desc$link)
            runjs(paste('onListDataVariablesResponse(', jsonlite::toJSON(names(values$data)), ');'))
        } else {
            print(paste0("Dataset '", model_desc$dataset, "' doesn't exist"))
            runjs(paste('onListDataVariablesResponse(null);'))
        }
    })
    
    # Create model
    observeEvent(input$create_model, {
        model_desc <- jsonlite::fromJSON(input$create_model)
        
        values$data <- na.omit(read.csv(model_desc$dataset))
        values$modeldescription <- create_model_from_data(model_desc$dataset, values$data, "", model_desc$distribution, model_desc$link)
        
        runjs(paste('onListDataVariablesResponse(', jsonlite::toJSON(names(values$data)), ');'))
    })
    
    # Load model
    observeEvent(input$load_model, {
        model_location <- jsonlite::fromJSON(input$load_model)
        
        values$modeldescription <- jsonlite::fromJSON(rawToChar(get_object(paste0(values$bucket, '/models/', model_location$model), "shiny-bucket")))
        
        values$data <- na.omit(read.csv(text = rawToChar(get_object(values$modeldescription$model_details$dataset, "shiny-bucket"))))

        runjs(paste('onLoadModelResponse(', jsonlite::toJSON(values$modeldescription), ');'))
    })
    
    # Select model response variable
    observeEvent(input$select_model_variable, {
        model_variable <- jsonlite::fromJSON(input$select_model_variable)
        
        values$modeldescription <- create_model_from_data(values$modeldescription$model_details$dataset, values$data, model_variable$variable, values$modeldescription$model_details$distribution, values$modeldescription$model_details$link)

        runjs(paste('onSelectModelVariableResponse(', jsonlite::toJSON(values$modeldescription), ');'))
    })
    
    # Factoor changed e.g. grouping edited
    observeEvent(input$change_factor, {
        print("Changed factor")
        print(input$change_factor)
        
        j <- jsonlite::fromJSON(input$change_factor)
        
        if(!is.null(j$sub_factor_name)){
            values$data[[j$sub_factor_name]] <- sapply(values$data[[j$factor_name]], apply_mapping, mapping=j$factor$mapping[[1]])
        }
        
        values$modeldescription <- update_model(values$modeldescription, j)
    })
    
    # Fit model
    observeEvent(input$fit_model, {
        model_formula <- create_model_formula(values$modeldescription)
        
        if(!is.null(model_formula)){
            values$model <- glm(model_formula, data = values$data, family = binomial(link=logit))
            values$data$fitted <- values$model$fitted
            runjs(paste('onFitResponse(true);'))
        }else{
            runjs(paste('onFitResponse(false);'))
        }
    })
    
    # Request chart data
    observeEvent(input$request_chart, {
        j <- jsonlite::fromJSON(input$request_chart)
        
        model_variable <- values$modeldescription$model_details$modelled_variable[1]
        chart_variable <- j$chart_variable
        
        if(!is.null(values$data) && !is.null(chart_variable) && chart_variable %in% names(values$data) && 'fitted' %in% names(values$data)){
            
            r = aggregate(as.formula(paste("cbind(", model_variable, ", fitted) ~", chart_variable)), data=values$data, mean)
            
            curve <- factor_summary(values$model, values$modeldescription, chart_variable, levels(as.factor(r[[chart_variable]])))
            colnames(curve) <- c(chart_variable, 'predictor', 'lower', 'upper') 
            
            r2 = aggregate(as.formula(paste(model_variable, "~", chart_variable)), data=values$data, length)
            
            
            r$levels <- r[[chart_variable]]
            r$observed <- r[[model_variable]]
            r <- merge(x=r, y=curve, by=chart_variable)
            r$volume <- r2[[model_variable]]

            runjs(paste('onRequestChartResponse(', jsonlite::toJSON(r), ');'))
        }
    })
    
    # Request the model description as a JSON string
    observeEvent(input$request_model_desc, {
        runjs(paste('onRequestModelDescResponse(', jsonlite::toJSON(values$modeldescription), ');'))
    })
    
    
    # Request the model as a JSON string
    observeEvent(input$request_model, {
        runjs(paste('onRequestModelResponse("', base64encode(charToRaw(rawToChar(serialize(values$model, NULL, TRUE)))), '");', sep=""))
    })
    
    # Request the model summary
    observeEvent(input$request_model_summary, {
        summary_string <- paste(capture.output(summary(values$model)), collapse="\n")
        anova_string <- paste(capture.output(anova(values$model)), collapse="\n")
        
        runjs(paste('onRequestModelSummaryResponse("', base64encode(charToRaw(paste(summary_string, anova_string, sep="\n\n"))), '");', sep=""))
    }) 
})

# Run the application
shinyApp(server = server)
