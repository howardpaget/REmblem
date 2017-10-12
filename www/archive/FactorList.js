var FactorList = function(model){
    this.dom = null;
    this.model = model;
    this.init(model)
}

FactorList.prototype.init = function(model) {
        console.log(model);

        this.dom = document.createElement('ul');
        this.dom.className = "collapsibleList";

        for(factor_name in model){
            var factor = new Factor(factor_name, model[factor_name].levels, model[factor_name].factors, model)
            this.dom.appendChild(factor.getDom());
        }
}

FactorList.prototype.getDom = function(){
    return this.dom;
}

/*
    for(factor_name in model){
        var heading = document.createElement('li');
        heading.innerText = factor_name;

        var sub_factor_list = document.createElement('ul');
        for(sub_factor in model[factor_name].factors){
            var sub_factor_item = document.createElement('li');

            var checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = model[factor_name].factors[sub_factor].in_model;
            sub_factor_item.appendChild(checkbox);

            var span = document.createElement('span');
            if(model[factor_name].factors[sub_factor].type == 'simple'){
                span.innerText = 'Simple';
            }else{
                span.innerText = model[factor_name].factors[sub_factor].name;
            }
            sub_factor_item.appendChild(span);

            sub_factor_list.appendChild(sub_factor_item);
        }

        heading.appendChild(sub_factor_list)
        this.dom.appendChild(heading);
    }
*/
