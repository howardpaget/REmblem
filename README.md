# REmblem
REmblem is a tool that fits generalised linear models (GLMs) to data and displays the model visually. The [Shiny package](https://shiny.rstudio.com/) is used to set up a server that responses to requests from the accompanying web app (found in the www directory).

This project is primarily intended as a demo project to illustrate how Shiny, ShinyJS, and ShinyFiles can be used to build reasonably complex stats based web apps. 

## UI

Shiny offers 2 ways to create the UI either in R using a hierarchy of input and output elements e.g. fluidPage( textOutput(...), ...) or using HTML and Javascript to build a regular webpage. REmblem uses the later to create its UI as it offers complete freedom to integrate all of the great HTML/Javascript libraries available such as [Polymer](https://www.polymer-project.org/), [Chart.js](http://www.chartjs.org/), [Hanssontable](https://github.com/handsontable/handsontable), etc.

The screenshot below shows the REmblem UI being used to build a model to predict the likelihood of survival of the sinking of the Titanic ([Kaggle Titanic tutorial](https://www.kaggle.com/c/titanic)).

The sidebar on the left lists all of the factors in the model such as age, class, etc and allows them to be added to the model. Grouped factors can be created using the "+ Group" button e.g. Age1 is Age grouped into the levels "Baby", "Child", "Teen", "Young Adult", "Adult", and "Old".

The central panel shows the chart of the selected factor, in this case sex sadly men where massively more likely to die in the disaster. There are lines for the predictor, confidence intervals, fitted average, observed average, and volume. Lines can be hidden by toggling them in the legend.

The bottom panel shows the output from the glm function (the coefficients, error, and significance for each factor level).

The toolbar at the top provides the fit model button which runs the glm function and updates the model summary in the bottom panel. The menu in the toolbar provides options to download the model as a JSON file or serialised R object for later use in REmblem or R.

![](https://github.com/hejp89/REmblem/blob/master/Screenshot.png?raw=true)


